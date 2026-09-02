"use strict";

import { $, $$, el, bindCalc, readField, money, money2, pct } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { breakdown, dataTable } from "../charts.js";
import { META, FED, FED2025, ITEMIZED, RENTAL, QBI2025, STATES, NYC, SAVE } from "../data/tax-2026.js";

initToolPage("take-home-pay");

/* ---- one-time UI setup ---- */

const stateSel = $("#state");
for (const [code, s] of Object.entries(STATES).sort((a, b) => a[1].name.localeCompare(b[1].name))) {
  stateSel.append(el("option", { value: code }, s.name));
}
stateSel.value = "TX";

$("#sources-list").append(...META.sources.map((s) =>
  el("li", {}, el("a", { href: s.url, rel: "noopener" }, s.name))));

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
wireChips("hasrental", "rental-fields");
wireChips("rentalqbi", null);
wireChips("ded529", null);

function updateSpouseUI() {
  const mfj = chipValue("status") === "mfj";
  $("#k401s-field").hidden = !mfj;
  $("#iras-field").hidden = !mfj;
}
for (const rdo of $$('input[name="status"]')) rdo.addEventListener("change", updateSpouseUI);
updateSpouseUI();

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
function scaleBrackets(brackets, k) { return brackets.map(([r, s]) => [r, s * k]); }
function stateBrackets(st, status) {
  if (st.t === "f") return [[st.r, 0]];
  if (st.t !== "g") return [[0, 0]];
  const doubled = st.m === "double" || st.m === "approx-double";
  return status === "mfj" && doubled ? scaleBrackets(st.b, 2) : st.b;
}

function gatherInputs() {
  const inv = chipValue("hasinv") === "yes";
  const hasTips = chipValue("hastips") === "yes";
  const hasLoans = chipValue("hasloans") === "yes";
  const hasRental = chipValue("hasrental") === "yes";
  return {
    year: Number(chipValue("taxyear")) || 2026,
    status: chipValue("status"),
    wages: readField($("#wages")),
    k401: readField($("#k401")), k401s: readField($("#k401s")),
    ira: readField($("#ira")), iras: readField($("#iras")),
    hsa: readField($("#hsa")), plan529: readField($("#plan529")),
    covered: chipValue("covered") === "yes",
    ded529: chipValue("ded529") === "yes",
    se: chipValue("hasse") === "yes" ? readField($("#se")) : 0,
    interest: inv ? readField($("#interest")) : 0,
    qdiv: inv ? readField($("#qdiv")) : 0,
    odiv: inv ? readField($("#odiv")) : 0,
    ltg: inv ? readField($("#ltg")) : 0,
    stg: inv ? readField($("#stg")) : 0,
    other: readField($("#other")),
    rents: hasRental ? readField($("#rents")) : 0,
    rexp: hasRental ? readField($("#rexp")) : 0,
    rbasis: hasRental ? readField($("#rbasis")) : 0,
    sehealth: chipValue("hasse") === "yes" ? readField($("#sehealth")) : 0,
    sep: chipValue("hasse") === "yes" ? readField($("#sep")) : 0,
    rentalQBI: hasRental && chipValue("rentalqbi") === "yes",
    kids: Math.round(readField($("#kids"))),
    senior: chipValue("senior") === "yes",
    itemizing: chipValue("itemize") === "yes",
    mortint: readField($("#mortint")), proptax: readField($("#proptax")),
    statepaid: readField($("#statepaid")), medical: readField($("#medical")),
    otheritem: readField($("#otheritem")),
    tips: hasTips ? Math.min(readField($("#tips")), readField($("#wages"))) : 0,
    ot: hasTips ? readField($("#ot")) : 0,
    slint: hasLoans ? readField($("#slint")) : 0,
    carint: hasLoans ? readField($("#carint")) : 0,
    give: chipValue("hasgive") === "yes" ? readField($("#give")) : 0,
  };
}

/** Full federal computation for one tax year's parameter set. */
function calcFederal(year, inp) {
  const F = year === 2026 ? FED : FED2025;
  const IT = ITEMIZED[year];
  const Q = year === 2026 ? SAVE.qbi
    : { ...QBI2025, rate: SAVE.qbi.rate, minDeduction: SAVE.qbi.minDeduction, minQBI: SAVE.qbi.minQBI };
  const st = inp.status;
  const depreciation = inp.rbasis / 27.5;
  inp = { ...inp, rental: inp.rents - inp.rexp - depreciation, depreciation };

  // --- payroll ---
  const ssWages = Math.min(inp.wages, F.fica.ssWageBase);
  const ficaSS = ssWages * F.fica.ssRate / 100;
  const ficaMed = inp.wages * F.fica.medicareRate / 100;
  const seNet = inp.se * F.se.factor;
  const seSSBase = Math.min(seNet, Math.max(0, F.fica.ssWageBase - ssWages));
  const seTax = seSSBase * F.se.ssRate / 100 + seNet * F.se.medicareRate / 100;
  const addlMed = Math.max(0, inp.wages + seNet - F.fica.addlMedicareThreshold[st]) * F.fica.addlMedicareRate / 100;
  const payroll = ficaSS + ficaMed + addlMed + seTax;

  const pretax = inp.k401 + (st === "mfj" ? inp.k401s : 0) + inp.hsa;

  // --- rental: income adds; losses limited by the $25k active-participation allowance ---
  const grossNoRental = inp.wages + inp.se + inp.interest + inp.qdiv + inp.odiv + inp.ltg + inp.stg + inp.other;
  const magiApprox = Math.max(0, grossNoRental - pretax - seTax / 2);
  let rentalAdj = inp.rental, suspendedLoss = 0;
  if (inp.rental < 0) {
    const allow = Math.max(0, Math.min(RENTAL.lossAllowanceMax,
      RENTAL.lossAllowanceMax - 0.5 * Math.max(0, magiApprox - RENTAL.phaseStart)));
    const applied = Math.min(-inp.rental, allow);
    rentalAdj = -applied;
    suspendedLoss = -inp.rental - applied;
  }
  const gross = grossNoRental + inp.rental;

  // --- AGI ---
  // business-owner above-the-line deductions
  const seProfit = Math.max(0, seNet - seTax / 2);
  const seHealthDed = Math.min(inp.sehealth, seProfit);
  const sepDed = Math.min(inp.sep, Math.max(0, seProfit * 0.20));
  let preAGI = Math.max(0, grossNoRental + rentalAdj - pretax - seTax / 2 - seHealthDed - sepDed);
  // traditional IRA deductibility: phased by MAGI when covered by a workplace plan
  const phaseFrac = (magi, range) => (!range ? 1 : magi <= range[0] ? 1 : magi >= range[1] ? 0 : (range[1] - magi) / (range[1] - range[0]));
  const R = SAVE.retirement;
  const youRange = inp.covered ? R.tradIRAPhase.coveredSelf[st] : null;
  const spRange = st === "mfj" ? (inp.covered ? R.tradIRAPhase.spouseCovered : null) : null;
  const iraDed = Math.min(inp.ira, R.ira + R.iraCatchup50) * phaseFrac(preAGI, youRange)
    + (st === "mfj" ? Math.min(inp.iras, R.ira + R.iraCatchup50) * phaseFrac(preAGI, spRange) : 0);
  preAGI = Math.max(0, preAGI - iraDed);
  let slDed = 0;
  if (inp.slint > 0 && st !== "mfs") {
    const [p0, p1] = SAVE.studentLoan.phase[st];
    const frac = preAGI <= p0 ? 1 : preAGI >= p1 ? 0 : (p1 - preAGI) / (p1 - p0);
    slDed = Math.min(inp.slint, SAVE.studentLoan.cap) * frac;
  }
  const agi = Math.max(0, preAGI - slDed);

  // --- OBBBA below-the-line deductions ---
  const linearPhase = (amount, start, per1000) =>
    Math.max(0, amount - Math.ceil(Math.max(0, agi - start) / 1000) * per1000);
  let tipsDed = 0, otDed = 0;
  if (st !== "mfs") {
    tipsDed = linearPhase(Math.min(inp.tips, SAVE.tips.cap), SAVE.tips.phaseStart[st], SAVE.tips.per1000);
    otDed = linearPhase(Math.min(inp.ot, SAVE.overtime.cap[st]), SAVE.overtime.phaseStart[st], SAVE.overtime.per1000);
  }
  const carDed = linearPhase(Math.min(inp.carint, SAVE.carLoan.cap), SAVE.carLoan.phaseStart[st], SAVE.carLoan.per1000);

  // --- standard vs. itemized (computed with caps, floors, phase-outs) ---
  let std = F.standardDeduction[st];
  if (inp.senior) std += st === "mfj" || st === "mfs" ? F.extra65.married : F.extra65.unmarried;
  let seniorBonus = 0;
  if (inp.senior) {
    const over = Math.max(0, agi - F.seniorBonus.phaseoutStart[st]);
    seniorBonus = Math.max(0, F.seniorBonus.amount - over * F.seniorBonus.phaseoutRate);
  }
  let itemsTotal = 0, saltAllowed = 0;
  if (inp.itemizing) {
    const saltCapNow = Math.max(IT.saltFloor, IT.saltCap - IT.saltPhaseRate * Math.max(0, agi - IT.saltPhaseStart));
    saltAllowed = Math.min(inp.proptax + inp.statepaid, saltCapNow);
    const charAllowed = Math.min(Math.max(0, inp.give - IT.charityAGIFloor * agi), IT.charityCashCapAGI * agi);
    const medAllowed = Math.max(0, inp.medical - IT.medicalFloorAGI * agi);
    itemsTotal = inp.mortint + saltAllowed + charAllowed + medAllowed + inp.otheritem;
  }
  const usingStd = std >= itemsTotal;
  const charityDed = usingStd && year === 2026 ? Math.min(inp.give, SAVE.charityNonItemizer.cap[st]) : 0;

  // --- QBI ---
  const qbiBase = Math.max(0, seNet - seTax / 2 - sepDed - seHealthDed) + (inp.rentalQBI && inp.rental > 0 ? inp.rental : 0);
  let qbiDed = 0;
  if (qbiBase >= Q.minQBI) {
    const t0 = Q.threshold[st], t1 = Q.phaseEnd[st];
    const tiPreQBI = Math.max(0, agi - Math.max(std, itemsTotal));
    const frac = tiPreQBI <= t0 ? 1 : tiPreQBI >= t1 ? 0 : (t1 - tiPreQBI) / (t1 - t0);
    qbiDed = Math.max(Q.rate * qbiBase * frac, frac > 0 ? Q.minDeduction : 0);
  }

  const deduction = Math.max(std, itemsTotal) + seniorBonus + tipsDed + otDed + carDed + charityDed + qbiDed;
  const taxable = Math.max(0, agi - deduction);

  // --- ordinary + preferential ladders ---
  const pref = Math.min(taxable, inp.qdiv + inp.ltg);
  const ordTaxable = taxable - pref;
  const ordTax = bracketTax(ordTaxable, F.brackets[st]);
  const z = F.ltcg.zeroMax[st], f15 = F.ltcg.fifteenMax[st];
  const at15 = Math.max(0, Math.min(taxable, f15) - Math.max(ordTaxable, z));
  const at20 = Math.max(0, taxable - Math.max(ordTaxable, f15));
  const prefTax = at15 * 0.15 + at20 * 0.20;

  const invIncome = inp.interest + inp.qdiv + inp.odiv + inp.ltg + inp.stg + Math.max(0, inp.rental);
  const niit = Math.min(invIncome, Math.max(0, agi - F.niit.threshold[st])) * F.niit.rate / 100;

  const ctcFull = inp.kids * F.ctc.perChild;
  const ctcPhase = Math.ceil(Math.max(0, agi - F.ctc.phaseoutStart[st]) / 1000) * F.ctc.per1000;
  const ctc = Math.max(0, ctcFull - ctcPhase);
  const fedTax = Math.max(0, ordTax + prefTax - ctc) + niit;

  return { F, fedTax, payroll, seNet, seTax, agi, gross, taxable, ordTaxable, deduction,
           usingStd, itemsTotal, std, saltAllowed, qbiDed, tipsDed, otDed, carDed,
           seniorBonus, suspendedLoss, niit, pretax, iraDed, depreciation,
           rental: inp.rental, seHealthDed, sepDed,
           marg: marginalRate(ordTaxable, F.brackets[st]) };
}

function compute() {
  const inp = gatherInputs();
  const st = STATES[stateSel.value];
  const year = inp.year, otherYear = year === 2026 ? 2025 : 2026;

  const r = calcFederal(year, inp);
  const rOther = calcFederal(otherYear, inp);

  // --- state & local (documented approximation; same table both years) ---
  $("#q529").hidden = inp.plan529 <= 0;
  const sb = stateBrackets(st, inp.status);
  const stateTaxable = Math.max(0, r.agi - (inp.ded529 ? inp.plan529 : 0));
  const stateTax = bracketTax(stateTaxable, sb);
  let localTax = 0;
  if (st.nyc && chipValue("nyc") === "yes") {
    localTax = bracketTax(r.agi, inp.status === "mfj" ? NYC.mfj : NYC.single);
  } else if (st.local && !$("#local-q").hidden) {
    localTax = (inp.wages + r.seNet) * readField($("#localrate")) / 100;
  }

  const savings = r.pretax + inp.ira + (inp.status === "mfj" ? inp.iras : 0) + inp.plan529;
  const totalTax = r.fedTax + stateTax + localTax + r.payroll;
  const takeHome = Math.max(0, r.gross - savings - totalTax);
  const eff = r.gross > 0 ? (totalTax / r.gross) * 100 : 0;
  const marg = r.marg + marginalRate(r.agi, sb);

  /* ---- render ---- */
  $("#r-hero").textContent = money(takeHome);
  $("#r-month").textContent = money(takeHome / 12);
  $("#r-biweek").textContent = money(takeHome / 26);
  $("#r-eff").textContent = pct(eff);
  $("#r-marg").textContent = pct(marg);

  const keepPct = r.gross > 0 ? Math.round((takeHome / r.gross) * 100) : 0;
  const deltaFed = (rOther.fedTax + rOther.payroll) - (r.fedTax + r.payroll);
  const bits = [
    `Of ${money(r.gross)} gross, you keep `,
    Object.assign(document.createElement("strong"), { textContent: `${keepPct} cents of every dollar` }),
    `. Taxes take ${money(totalTax)} — ${money(r.fedTax)} federal, ${money(stateTax + localTax)} state & local, ${money(r.payroll)} payroll.`,
    ` Under ${otherYear} rules the same picture costs `,
    Object.assign(document.createElement("strong"), {
      textContent: deltaFed >= 0 ? `${money(deltaFed)} more` : `${money(-deltaFed)} less`,
    }),
    ` in federal + payroll tax.`,
  ];
  if (!r.usingStd) bits.push(` You're itemizing: ${money(r.itemsTotal)} beats the ${money(r.std)} standard deduction (SALT allowed: ${money(r.saltAllowed)}).`);
  if (r.depreciation > 0) bits.push(` Depreciation contributes a ${money(r.depreciation)} paper deduction, making your rental's taxable result ${money(r.rental)}.`);
  if (r.suspendedLoss > 0) bits.push(` ${money(r.suspendedLoss)} of your rental loss is suspended this year (income phase-out) — it carries forward.`);
  $("#r-interpret").replaceChildren(...bits);

  breakdown($("#chart-breakdown"), {
    ariaLabel: "Where gross income goes",
    fmt: money,
    items: [
      { name: "Take-home", value: takeHome },
      { name: "Federal tax", value: r.fedTax },
      { name: "State & local", value: stateTax + localTax },
      { name: "Payroll taxes", value: r.payroll },
      { name: "Savings contributions", value: savings, color: "var(--ink-3)" },
    ],
  });

  breakdown($("#chart-taxes"), {
    ariaLabel: "Taxes itemized",
    fmt: money,
    items: [
      { name: r.niit > 0 ? "Federal income tax (incl. NIIT)" : "Federal income tax", value: r.fedTax, color: "var(--s2)" },
      { name: st.t === "n" ? "State (none)" : `${st.name} tax`, value: stateTax, color: "var(--s3)" },
      { name: "Local tax", value: localTax, color: "var(--ink-3)" },
      { name: "Social Security & Medicare", value: r.payroll, color: "var(--s4)" },
    ],
  });

  /* ---- savings opportunities ---- */
  const margFrac = marg / 100;
  const cards = [];
  const card = (title, impact, body, opts = {}) => cards.push({ title, impact, body, ...opts });

  const k401Limit = SAVE.retirement.k401 + (inp.senior ? SAVE.retirement.k401Catchup50 : 0);
  const k401Room = Math.max(0, k401Limit - inp.k401);
  if (k401Room > 0 && inp.wages > 0) {
    card("Max your 401(k)", k401Room * margFrac,
      `You have ${money(k401Room)} of unused 2026 contribution room (limit ${money(k401Limit)}${inp.senior ? " incl. catch-up" : ""}). Every dollar in skips your ${pct(marg)} marginal rate.`);
  }
  card("Health savings account (HSA)", (inp.status === "mfj" || inp.kids > 0 ? SAVE.hsa.family : SAVE.hsa.self) * margFrac,
    `With a high-deductible health plan you can shelter ${money(inp.status === "mfj" || inp.kids > 0 ? SAVE.hsa.family : SAVE.hsa.self)} in 2026 — deductible going in, tax-free out for medical costs.`);
  card("Traditional or Roth IRA", (SAVE.retirement.ira + (inp.senior ? SAVE.retirement.iraCatchup50 : 0)) * margFrac,
    `Up to ${money(SAVE.retirement.ira + (inp.senior ? SAVE.retirement.iraCatchup50 : 0))} more in 2026, on top of a workplace plan.`,
    { phase: "Traditional IRA deduction phases out from $81,000 (single) / $129,000 (joint) MAGI when covered by a work plan." });
  if (inp.se > 0) {
    card("SEP or Solo 401(k) — business owners", Math.min(Math.max(0, r.seNet - r.seTax / 2) * 0.2, 20000) * margFrac,
      `Self-employment income unlocks retirement space up to ${money(SAVE.retirement.solo401kSepTotal)} across employer+employee contributions.`);
    if (r.qbiDed > 0) {
      card("QBI deduction — already applied", r.qbiDed * margFrac,
        `We deducted ${money(r.qbiDed)} (20% of qualified business income) automatically.`,
        { phase: `Limits begin above ${money((year === 2026 ? SAVE.qbi : QBI2025).threshold[inp.status])} taxable income.` });
    }
  }
  if (r.rental > 0 && !inp.rentalQBI) {
    card("Rental as a business (QBI)", r.rental * 0.2 * margFrac,
      `If your rental meets the IRS 250-hour safe harbor, 20% of its profit comes off taxable income. Flip the rental-QBI answer to see it applied.`);
  }
  const rothRange = SAVE.retirement.rothPhase[inp.status] || SAVE.retirement.rothPhase.single;
  if (r.agi >= rothRange[1]) {
    card("Backdoor Roth IRA", 0,
      `Your income is past the Roth IRA limit (${money(rothRange[1])}) — but the backdoor is legal and routine: contribute ${money(SAVE.retirement.ira)} to a non-deductible traditional IRA, convert it to Roth. Works for a spouse too. Watch the pro-rata rule if you hold other pre-tax IRA money.`);
  }
  if (r.iraDed < inp.ira + (inp.status === "mfj" ? inp.iras : 0)) {
    card("IRA deduction is phased out", 0,
      `Part of your IRA contribution isn't deductible at this income (workplace-plan phase-out). Consider directing it to Roth (or backdoor Roth) instead — same dollars, better treatment.`);
  }
  if (r.agi <= SAVE.retirement.saversCredit.ceiling[inp.status]) {
    card("Saver's credit", 1000,
      `At your income you qualify for a credit worth 10–50% of up to $2,000 in retirement contributions — dollar for dollar off your tax.`);
  }
  if (inp.kids > 0) {
    card("Dependent care FSA", SAVE.depCareFSA.limit * margFrac,
      `New for 2026: shelter up to ${money(inp.status === "mfs" ? SAVE.depCareFSA.mfs : SAVE.depCareFSA.limit)} of childcare costs pre-tax.`);
  }
  if (inp.tips > 0) {
    card("Tips deduction — already applied", r.tipsDed * margFrac,
      r.tipsDed > 0 ? `We deducted ${money(r.tipsDed)} of your tips (cap $25,000).` : `Your income is past the phase-out for the tips deduction.`,
      { sunset: "Ends after 2028", phase: `Shrinks $100 per $1,000 of income above ${money(SAVE.tips.phaseStart[inp.status] || 150000)}.` });
  }
  if (inp.ot > 0) {
    card("Overtime deduction — already applied", r.otDed * margFrac,
      r.otDed > 0 ? `We deducted ${money(r.otDed)} of overtime premium pay.` : `Your income is past the phase-out for the overtime deduction.`,
      { sunset: "Ends after 2028", phase: `Shrinks $100 per $1,000 of income above ${money(SAVE.overtime.phaseStart[inp.status] || 150000)}.` });
  }
  if (inp.carint > 0) {
    card("Car loan interest — already applied", r.carDed * margFrac,
      r.carDed > 0 ? `We deducted ${money(r.carDed)} of interest (cap $10,000; new US-assembled vehicles).` : `Your income is past the phase-out for the car-loan deduction.`,
      { sunset: "Ends after 2028", phase: `Shrinks $200 per $1,000 of income above ${money(SAVE.carLoan.phaseStart[inp.status])}.` });
  }
  if (inp.give === 0 && r.usingStd) {
    card("Charitable gifts now count without itemizing", SAVE.charityNonItemizer.cap[inp.status] * margFrac,
      `New and permanent from 2026: deduct up to ${money(SAVE.charityNonItemizer.cap[inp.status])} of cash donations even on the standard deduction.`);
  }
  if (inp.senior) {
    card("Senior bonus deduction — already applied", r.seniorBonus * margFrac,
      r.seniorBonus > 0 ? `We deducted ${money(r.seniorBonus)} (the 65+ bonus).` : `Your income is past the senior-bonus phase-out.`,
      { sunset: "Ends after 2028", phase: "Shrinks 6¢ per dollar of income above $75,000 (single) / $150,000 (joint)." });
  }

  $("#save-grid").replaceChildren(...cards
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
  const bs = $("#bracket-summary");
  if (bs) bs.textContent = `How your income fills the ${year} federal brackets`;
  const B = r.F.brackets[inp.status];
  const rows = B.map(([rate, start], i) => {
    const end = i + 1 < B.length ? B[i + 1][1] : Infinity;
    const inBand = Math.max(0, Math.min(r.ordTaxable, end) - start);
    return { rate, range: end === Infinity ? `over ${money(start)}` : `${money(start)} – ${money(end)}`, inBand, tax: inBand * rate / 100 };
  }).filter((row) => row.inBand > 0 || row.rate <= 12);
  dataTable($("#bracket-table"), rows, [
    { h: "Bracket", get: (row) => `${row.rate}%` },
    { h: "Applies to (ordinary income)", get: (row) => row.range },
    { h: "Your income here", get: (row) => row.inBand, fmt: money },
    { h: "Tax from this bracket", get: (row) => row.tax, fmt: money },
  ]);
}

const run = bindCalc($("#calc"), compute);
stateSel.addEventListener("change", run);
