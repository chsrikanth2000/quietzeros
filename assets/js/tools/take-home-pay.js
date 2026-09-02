"use strict";

import { $, $$, el, bindCalc, readField, money, money2, pct } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { breakdown, dataTable } from "../charts.js";
import { META, FED, STATES, NYC, SAVE } from "../data/tax-2026.js";

initToolPage("take-home-pay");

/* ---- one-time UI setup ---- */

// state dropdown from the dataset
const stateSel = $("#state");
for (const [code, s] of Object.entries(STATES).sort((a, b) => a[1].name.localeCompare(b[1].name))) {
  stateSel.append(el("option", { value: code }, s.name));
}
stateSel.value = "TX";

// sources panel from the dataset metadata
$("#sources-list").append(...META.sources.map((s) =>
  el("li", {}, el("a", { href: s.url, rel: "noopener" }, s.name))));

// chips: reveal subfields on "yes", show the assumption note on "not sure"
function chipValue(name) {
  const c = document.querySelector(`input[name="${name}"]:checked`);
  return c ? c.value : "no";
}
function wireChips(name, subfieldsId) {
  const update = () => {
    const v = chipValue(name);
    const sub = subfieldsId ? $("#" + subfieldsId) : null;
    if (sub) sub.hidden = v !== "yes";
    const field = document.querySelector(`input[name="${name}"]`).closest(".field");
    const note = field && field.querySelector('.assume[data-when="dk"]');
    if (note) note.hidden = v !== "dk";
  };
  for (const r of $$(`input[name="${name}"]`)) r.addEventListener("change", update);
  update();
}
wireChips("hasse", "se-fields");
wireChips("hasinv", "inv-fields");
wireChips("itemize", "item-fields");
wireChips("nyc", null);
wireChips("hastips", "tips-fields");
wireChips("hasloans", "loan-fields");
wireChips("hasgive", "give-fields");

// state-dependent questions (NYC, county/municipal rates)
function updateStateUI() {
  const st = STATES[stateSel.value];
  $("#nyc-q").hidden = !st.nyc;
  const lq = $("#local-q");
  if (st.local) {
    lq.hidden = false;
    $("#local-label").textContent = st.local.label;
    $("#local-hint").textContent = st.local.hint;
    $("#localrate").value = String(st.local.def);
  } else {
    lq.hidden = true;
  }
  $("#state-note").textContent = st.note || (st.t === "n" ? `${st.name} has no state income tax.` : "");
}
stateSel.addEventListener("change", updateStateUI);
updateStateUI();

/* ---- tax math ---- */

function bracketTax(taxable, brackets) {
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const [rate, start] = brackets[i];
    const end = i + 1 < brackets.length ? brackets[i + 1][1] : Infinity;
    if (taxable <= start) break;
    tax += (Math.min(taxable, end) - start) * rate / 100;
  }
  return tax;
}
function marginalRate(taxable, brackets) {
  let r = brackets[0][0];
  for (const [rate, start] of brackets) if (taxable > start) r = rate;
  return r;
}
function scaleBrackets(brackets, k) {
  return brackets.map(([r, s]) => [r, s * k]);
}
function stateBrackets(st, status) {
  if (st.t === "f") return [[st.r, 0]];
  if (st.t !== "g") return [[0, 0]];
  const doubled = st.m === "double" || st.m === "approx-double";
  return status === "mfj" && doubled ? scaleBrackets(st.b, 2) : st.b;
}

function compute() {
  const status = chipValue("status");
  const st = STATES[stateSel.value];
  const wages = readField($("#wages"));
  const pretax = Math.min(readField($("#pretax")), wages);
  const se = chipValue("hasse") === "yes" ? readField($("#se")) : 0;
  const inv = chipValue("hasinv") === "yes";
  const interest = inv ? readField($("#interest")) : 0;
  const qdiv = inv ? readField($("#qdiv")) : 0;
  const odiv = inv ? readField($("#odiv")) : 0;
  const ltg = inv ? readField($("#ltg")) : 0;
  const stg = inv ? readField($("#stg")) : 0;
  const other = readField($("#other"));
  const kids = Math.round(readField($("#kids")));
  const senior = chipValue("senior") === "yes";
  const itemized = chipValue("itemize") === "yes" ? readField($("#itemized")) : 0;
  const hasTips = chipValue("hastips") === "yes";
  const tips = hasTips ? Math.min(readField($("#tips")), wages) : 0;
  const ot = hasTips ? readField($("#ot")) : 0;
  const hasLoans = chipValue("hasloans") === "yes";
  const slint = hasLoans ? readField($("#slint")) : 0;
  const carint = hasLoans ? readField($("#carint")) : 0;
  const give = chipValue("hasgive") === "yes" ? readField($("#give")) : 0;

  const F = FED;

  // --- payroll (FICA + SE) ---
  const ssWages = Math.min(wages, F.fica.ssWageBase);
  const ficaSS = ssWages * F.fica.ssRate / 100;
  const ficaMed = wages * F.fica.medicareRate / 100;
  const seNet = se * F.se.factor;
  const seSSBase = Math.min(seNet, Math.max(0, F.fica.ssWageBase - ssWages));
  const seSS = seSSBase * F.se.ssRate / 100;
  const seMed = seNet * F.se.medicareRate / 100;
  const seTax = seSS + seMed;
  const medicareBase = wages + seNet;
  const addlMed = Math.max(0, medicareBase - F.fica.addlMedicareThreshold[status]) * F.fica.addlMedicareRate / 100;
  const payroll = ficaSS + ficaMed + addlMed + seTax;

  // --- AGI (above-the-line adjustments) ---
  const gross = wages + se + interest + qdiv + odiv + ltg + stg + other;
  const preAGI = Math.max(0, gross - pretax - seTax / 2);
  // student loan interest: up to $2,500, phased out by MAGI, MFS ineligible
  let slDed = 0;
  if (slint > 0 && status !== "mfs") {
    const [p0, p1] = SAVE.studentLoan.phase[status];
    const frac = preAGI <= p0 ? 1 : preAGI >= p1 ? 0 : (p1 - preAGI) / (p1 - p0);
    slDed = Math.min(slint, SAVE.studentLoan.cap) * frac;
  }
  const agi = Math.max(0, preAGI - slDed);

  // --- OBBBA below-the-line deductions (2025–2028 unless noted) ---
  const linearPhase = (amount, start, per1000) =>
    Math.max(0, amount - Math.ceil(Math.max(0, agi - start) / 1000) * per1000);
  let tipsDed = 0, otDed = 0, carDed = 0;
  if (status !== "mfs") {
    tipsDed = linearPhase(Math.min(tips, SAVE.tips.cap), SAVE.tips.phaseStart[status], SAVE.tips.per1000);
    otDed = linearPhase(Math.min(ot, SAVE.overtime.cap[status]), SAVE.overtime.phaseStart[status], SAVE.overtime.per1000);
  }
  carDed = linearPhase(Math.min(carint, SAVE.carLoan.cap), SAVE.carLoan.phaseStart[status], SAVE.carLoan.per1000);

  // --- deduction ---
  let std = F.standardDeduction[status];
  if (senior) std += status === "mfj" || status === "mfs" ? F.extra65.married : F.extra65.unmarried;
  let seniorBonus = 0;
  if (senior) {
    const over = Math.max(0, agi - F.seniorBonus.phaseoutStart[status]);
    seniorBonus = Math.max(0, F.seniorBonus.amount - over * F.seniorBonus.phaseoutRate);
  }
  const usingStd = std >= itemized;
  // charitable deduction for non-itemizers (permanent, new for 2026)
  const charityDed = usingStd ? Math.min(give, SAVE.charityNonItemizer.cap[status]) : 0;

  // --- QBI (Section 199A) for business owners ---
  // 20% below the threshold; conservatively phased to zero across the phase-in
  // range (above it the deduction depends on business type and W-2 wages).
  const qbiBase = Math.max(0, seNet - seTax / 2);
  let qbiDed = 0;
  if (qbiBase >= SAVE.qbi.minQBI) {
    const t0 = SAVE.qbi.threshold[status], t1 = SAVE.qbi.phaseEnd[status];
    const tiPreQBI = Math.max(0, agi - Math.max(std, itemized));
    const frac = tiPreQBI <= t0 ? 1 : tiPreQBI >= t1 ? 0 : (t1 - tiPreQBI) / (t1 - t0);
    qbiDed = Math.max(SAVE.qbi.rate * qbiBase * frac, frac > 0 ? SAVE.qbi.minDeduction : 0);
  }

  const deduction = Math.max(std, itemized) + seniorBonus + tipsDed + otDed + carDed + charityDed + qbiDed;
  const taxable = Math.max(0, agi - deduction);

  // --- two ladders: ordinary, then LTCG/qualified stacked on top ---
  const pref = Math.min(taxable, qdiv + ltg);
  const ordTaxable = taxable - pref;
  const ordTax = bracketTax(ordTaxable, F.brackets[status]);
  const z = F.ltcg.zeroMax[status], f15 = F.ltcg.fifteenMax[status];
  const at0 = Math.max(0, Math.min(taxable, z) - ordTaxable);
  const at15 = Math.max(0, Math.min(taxable, f15) - Math.max(ordTaxable, z));
  const at20 = Math.max(0, taxable - Math.max(ordTaxable, f15));
  const prefTax = at15 * 0.15 + at20 * 0.20;

  // --- NIIT ---
  const invIncome = interest + qdiv + odiv + ltg + stg;
  const niit = Math.min(invIncome, Math.max(0, agi - F.niit.threshold[status])) * F.niit.rate / 100;

  // --- CTC ---
  const ctcFull = kids * F.ctc.perChild;
  const ctcPhase = Math.ceil(Math.max(0, agi - F.ctc.phaseoutStart[status]) / 1000) * F.ctc.per1000;
  const ctc = Math.max(0, ctcFull - ctcPhase);
  const fedTax = Math.max(0, ordTax + prefTax - ctc) + niit;

  // --- state & local ---
  const stateTaxable = agi; // documented approximation
  const sb = stateBrackets(st, status);
  const stateTax = bracketTax(stateTaxable, sb);
  let localTax = 0;
  if (st.nyc && chipValue("nyc") === "yes") {
    localTax = bracketTax(stateTaxable, status === "mfj" ? NYC.mfj : NYC.single);
  } else if (st.local && !$("#local-q").hidden) {
    localTax = (wages + seNet) * readField($("#localrate")) / 100;
  }

  const totalTax = fedTax + stateTax + localTax + payroll;
  const takeHome = Math.max(0, gross - pretax - totalTax);
  const eff = gross > 0 ? (totalTax / gross) * 100 : 0;
  const marg = marginalRate(ordTaxable, F.brackets[status]) + marginalRate(stateTaxable, sb);

  /* ---- render ---- */
  $("#r-hero").textContent = money(takeHome);
  $("#r-month").textContent = money(takeHome / 12);
  $("#r-biweek").textContent = money(takeHome / 26);
  $("#r-eff").textContent = pct(eff);
  $("#r-marg").textContent = pct(marg);

  const keepPct = gross > 0 ? Math.round((takeHome / gross) * 100) : 0;
  $("#r-interpret").replaceChildren(
    `Of ${money(gross)} gross, you keep `,
    Object.assign(document.createElement("strong"), { textContent: `${keepPct} cents of every dollar` }),
    `. Taxes take ${money(totalTax)} — ${money(fedTax)} federal, ${money(stateTax + localTax)} state & local, ` +
    `${money(payroll)} payroll` + (pretax > 0 ? ` — and ${money(pretax)} goes to your pre-tax savings.` : `.`)
  );

  breakdown($("#chart-breakdown"), {
    ariaLabel: "Where gross income goes",
    fmt: money,
    items: [
      { name: "Take-home", value: takeHome },
      { name: "Federal tax", value: fedTax },
      { name: "State & local", value: stateTax + localTax },
      { name: "Payroll taxes", value: payroll },
      { name: "Pre-tax savings", value: pretax, color: "var(--ink-3)" },
    ],
  });

  // same hue per entity as the chart above: federal=s2, state=s3, payroll=s4
  breakdown($("#chart-taxes"), {
    ariaLabel: "Taxes itemized",
    fmt: money,
    items: [
      { name: niit > 0 ? "Federal income tax (incl. NIIT)" : "Federal income tax", value: fedTax, color: "var(--s2)" },
      { name: st.t === "n" ? "State (none)" : `${st.name} tax`, value: stateTax, color: "var(--s3)" },
      { name: "Local tax", value: localTax, color: "var(--ink-3)" },
      { name: "Social Security & Medicare", value: payroll, color: "var(--s4)" },
    ],
  });

  // --- savings opportunities panel ---
  const margFrac = marg / 100;
  const cards = [];
  const card = (title, impact, body, opts = {}) => cards.push({ title, impact, body, ...opts });

  const k401Limit = SAVE.retirement.k401 + (senior ? SAVE.retirement.k401Catchup50 : 0);
  const k401Room = Math.max(0, k401Limit - pretax);
  if (k401Room > 0 && wages > 0) {
    card("Max your 401(k)", k401Room * margFrac,
      `You have ${money(k401Room)} of unused 2026 contribution room (limit ${money(k401Limit)}${senior ? " incl. catch-up" : ""}). Every dollar in skips your ${pct(marg)} marginal rate.`);
  }
  card("Health savings account (HSA)", (status === "mfj" || kids > 0 ? SAVE.hsa.family : SAVE.hsa.self) * margFrac,
    `With a high-deductible health plan you can shelter ${money(status === "mfj" || kids > 0 ? SAVE.hsa.family : SAVE.hsa.self)} in 2026 — deductible going in, tax-free out for medical costs. The only triple-tax-free account.`);
  card("Traditional or Roth IRA", (SAVE.retirement.ira + (senior ? SAVE.retirement.iraCatchup50 : 0)) * margFrac,
    `Up to ${money(SAVE.retirement.ira + (senior ? SAVE.retirement.iraCatchup50 : 0))} more in 2026, on top of a workplace plan. Deductibility phases out at higher incomes if you're covered at work.`,
    { phase: "Traditional IRA deduction phases out from $81,000 (single) / $129,000 (joint) MAGI when covered by a work plan." });
  if (se > 0) {
    card("SEP or Solo 401(k) — business owners", Math.min(qbiBase * 0.2, 20000) * margFrac,
      `Self-employment income unlocks retirement space up to ${money(SAVE.retirement.solo401kSepTotal)} across employer+employee contributions — far beyond the W-2 limit.`);
    if (qbiDed > 0) {
      card("QBI deduction — already applied", qbiDed * margFrac,
        `We deducted ${money(qbiDed)} (20% of qualified business income) automatically. Keep taxable income under ${money(SAVE.qbi.threshold[status])} to preserve it in full.`,
        { phase: `Limits begin above ${money(SAVE.qbi.threshold[status])} taxable income.` });
    }
  }
  if (agi <= SAVE.retirement.saversCredit.ceiling[status]) {
    card("Saver's credit", 1000,
      `At your income you qualify for a credit worth 10–50% of up to $2,000 in retirement contributions — a credit, not a deduction, so it cuts tax dollar for dollar.`);
  }
  if (kids > 0) {
    card("Dependent care FSA", SAVE.depCareFSA.limit * margFrac,
      `New for 2026: shelter up to ${money(status === "mfs" ? SAVE.depCareFSA.mfs : SAVE.depCareFSA.limit)} of childcare costs pre-tax (raised from $5,000).`);
  }
  if (tips > 0) {
    card("Tips deduction — already applied", tipsDed * margFrac,
      tipsDed > 0 ? `We deducted ${money(tipsDed)} of your tips (cap $25,000).` : `Your income is past the phase-out, so none of the tip deduction remains.`,
      { sunset: "Ends after 2028", phase: `Shrinks $100 per $1,000 of income above ${money(SAVE.tips.phaseStart[status] || 150000)}.` });
  }
  if (ot > 0) {
    card("Overtime deduction — already applied", otDed * margFrac,
      otDed > 0 ? `We deducted ${money(otDed)} of overtime premium pay.` : `Your income is past the phase-out, so none of the overtime deduction remains.`,
      { sunset: "Ends after 2028", phase: `Shrinks $100 per $1,000 of income above ${money(SAVE.overtime.phaseStart[status] || 150000)}.` });
  }
  if (carint > 0) {
    card("Car loan interest — already applied", carDed * margFrac,
      carDed > 0 ? `We deducted ${money(carDed)} of interest (cap $10,000; new US-assembled vehicles).` : `Your income is past the phase-out for the car-loan deduction.`,
      { sunset: "Ends after 2028", phase: `Shrinks $200 per $1,000 of income above ${money(SAVE.carLoan.phaseStart[status])}.` });
  }
  if (give === 0 && usingStd) {
    card("Charitable gifts now count without itemizing", SAVE.charityNonItemizer.cap[status] * margFrac,
      `New and permanent from 2026: deduct up to ${money(SAVE.charityNonItemizer.cap[status])} of cash donations even on the standard deduction.`);
  }
  if (senior) {
    card("Senior bonus deduction — already applied", seniorBonus * margFrac,
      seniorBonus > 0 ? `We deducted ${money(seniorBonus)} (the 65+ bonus).` : `Your income is past the senior-bonus phase-out ($75,000 / $150,000).`,
      { sunset: "Ends after 2028", phase: "Shrinks 6¢ per dollar of income above $75,000 (single) / $150,000 (joint)." });
  }

  const grid = $("#save-grid");
  grid.replaceChildren(...cards
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 8)
    .map((c) => el("div", { class: "save-card" },
      el("h3", {}, c.title),
      el("p", { class: "impact" }, c.impact > 0 ? `≈ ${money(c.impact)}/yr` : "—"),
      el("p", {}, c.body),
      c.phase ? el("p", { class: "phase" }, c.phase) : null,
      c.sunset ? el("p", { class: "sunset" }, c.sunset) : null,
    )));

  // bracket-fill table
  const B = F.brackets[status];
  const rows = B.map(([rate, start], i) => {
    const end = i + 1 < B.length ? B[i + 1][1] : Infinity;
    const inBand = Math.max(0, Math.min(ordTaxable, end) - start);
    return { rate, range: end === Infinity ? `over ${money(start)}` : `${money(start)} – ${money(end)}`, inBand, tax: inBand * rate / 100 };
  }).filter((r) => r.inBand > 0 || r.rate <= 12);
  dataTable($("#bracket-table"), rows, [
    { h: "Bracket", get: (r) => `${r.rate}%` },
    { h: "Applies to (ordinary income)", get: (r) => r.range },
    { h: "Your income here", get: (r) => r.inBand, fmt: money },
    { h: "Tax from this bracket", get: (r) => r.tax, fmt: money },
  ]);
}

const run = bindCalc($("#calc"), compute);
stateSel.addEventListener("change", run);
