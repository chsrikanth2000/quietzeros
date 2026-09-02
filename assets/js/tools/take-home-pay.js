"use strict";

import { $, $$, el, bindCalc, readField, money, money2, pct } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { breakdown, dataTable } from "../charts.js";
import { META, FED, FED2025, ITEMIZED, RENTAL, QBI2025, STATES, NYC, SAVE } from "../data/tax-2026.js";
import { STATE_TAXES, STATE_TAXES_META } from "../data/state-taxes.js";
import { RECIPROCITY, YONKERS, MD_NONRESIDENT_RATE, MD_COUNTIES, MO_CITIES, DE_WILMINGTON_RATE, CO_OPT } from "../data/local-taxes.js";

let paData = null; // lazy-loaded: ~170KB, only fetched if PA is actually selected
async function ensurePAData() {
  if (!paData) paData = (await import("../data/local-tax-pa.js")).PA_EIT;
  return paData;
}
let ohData = null;
async function ensureOHData() {
  if (!ohData) ohData = (await import("../data/local-tax-oh.js")).OH_MUNI;
  return ohData;
}

initToolPage("take-home-pay");

/* ---- one-time UI setup ---- */

const stateSel = $("#state");
for (const [code, s] of Object.entries(STATES).sort((a, b) => a[1].name.localeCompare(b[1].name))) {
  stateSel.append(el("option", { value: code }, s.name));
}
stateSel.value = "TX";
const state2Sel = $("#state2");
state2Sel.append(el("option", { value: "" }, "No comparison"));
for (const [code, st2] of Object.entries(STATES).sort((a, b) => a[1].name.localeCompare(b[1].name))) {
  state2Sel.append(el("option", { value: code }, st2.name));
}
state2Sel.addEventListener("change", () => { $("#move-extras").hidden = !state2Sel.value; });

const workStateSel = $("#workstate");
for (const [code, ws] of Object.entries(STATES).sort((a, b) => a[1].name.localeCompare(b[1].name))) {
  workStateSel.append(el("option", { value: code }, ws.name));
}
workStateSel.value = "TX";
workStateSel.addEventListener("change", () => { if (typeof run === "function") run(); });

const mdCountySel = $("#mdcounty");
for (const name of Object.keys(MD_COUNTIES)) mdCountySel.append(el("option", { value: name }, name));
mdCountySel.addEventListener("change", () => { if (typeof run === "function") run(); });

const paCountySel = $("#pacounty");
const paMuniSel = $("#pamuni");
function populatePACounties() {
  if (paCountySel.options.length || !paData) return;
  const counties = [...new Set(paData.flatMap((r) => r[1].split("/")))].sort();
  for (const c of counties) paCountySel.append(el("option", { value: c }, c));
  populatePAMunis();
}
function populatePAMunis() {
  paMuniSel.replaceChildren();
  if (!paData) return;
  const county = paCountySel.value;
  const rows = paData.filter((r) => r[1].split("/").includes(county))
    .sort((a, b) => a[2].localeCompare(b[2]) || a[3].localeCompare(b[3]));
  for (const [psd, , muni, sd, res] of rows) {
    paMuniSel.append(el("option", { value: psd }, `${muni} / ${sd} — ${res}%`));
  }
}
paCountySel.addEventListener("change", () => { populatePAMunis(); if (typeof run === "function") run(); });
paMuniSel.addEventListener("change", () => { if (typeof run === "function") run(); });

const ohMuniSel = $("#ohmuni");
function populateOHMunis() {
  if (ohMuniSel.options.length || !ohData) return;
  for (const [name] of ohData) ohMuniSel.append(el("option", { value: name }, name));
}
ohMuniSel.addEventListener("change", () => { if (typeof run === "function") run(); });

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
wireChips("nylocal", null);
wireChips("mocity", null);
wireChips("dewilm", null);
wireChips("cocity", null);
wireChips("hasworkstate", "workstate-fields");
wireChips("hastips", "tips-fields");
wireChips("hasloans", "loan-fields");
wireChips("hasgive", "give-fields");
wireChips("hasrental", "rental-fields");
wireChips("hasrsu", "rsu-fields");
wireChips("rentalqbi", null);
wireChips("ded529", null);
wireChips("hasaccts", "accts-fields");

function updateSpouseUI() {
  const mfj = chipValue("status") === "mfj";
  $("#k401s-field").hidden = !mfj;
  $("#iras-field").hidden = !mfj;
}
for (const rdo of $$('input[name="status"]')) rdo.addEventListener("change", updateSpouseUI);
updateSpouseUI();

const DEDICATED_LOCAL = new Set(["MD", "MO", "DE", "PA", "OH"]); // states with their own widget below, not the generic % field
function updateStateUI() {
  const code = stateSel.value;
  const st = STATES[code];
  $("#nyc-q").hidden = code !== "NY";
  $("#md-q").hidden = code !== "MD";
  $("#mo-q").hidden = code !== "MO";
  $("#de-q").hidden = code !== "DE";
  $("#co-q").hidden = code !== "CO";
  $("#pa-q").hidden = code !== "PA";
  $("#oh-q").hidden = code !== "OH";
  if (code === "PA") {
    ensurePAData().then(() => { populatePACounties(); if (typeof run === "function") run(); });
  }
  if (code === "OH") {
    ensureOHData().then(() => { populateOHMunis(); if (typeof run === "function") run(); });
  }
  const lq = $("#local-q");
  if (st.local && !DEDICATED_LOCAL.has(code)) {
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

/* Location-aware default: ask OUR edge (not a third party) which state the
   connection is in, and preselect it — unless the visitor chose first.
   Nothing is stored; the visitor can change it freely. */
let stateTouched = false;
stateSel.addEventListener("change", () => { stateTouched = true; });
(async () => {
  try {
    const ctl = new AbortController();
    setTimeout(() => ctl.abort(), 2500);
    const res = await fetch("https://qz-comments.chsrikanth2000.workers.dev/geo", { signal: ctl.signal });
    const geo = await res.json();
    if (stateTouched || geo.country !== "US" || !STATES[geo.region]) return;
    stateSel.value = geo.region;
    updateStateUI();
    if (geo.region === "NY" && (geo.city === "New York" || geo.city === "Yonkers")) {
      const val = geo.city === "Yonkers" ? "yonkers" : "nyc";
      const opt = document.querySelector(`input[name="nylocal"][value="${val}"]`);
      if (opt) opt.checked = true;
    }
    let county = null;
    if (geo.postalCode && (geo.region === "MD" || geo.region === "PA")) {
      try {
        const { ZIP_COUNTY } = await import("../data/zip-county.js");
        county = ZIP_COUNTY[geo.postalCode] || null;
        if (county && geo.region === "MD") {
          $("#mdcounty").value = county;
        } else if (county && geo.region === "PA") {
          await ensurePAData();
          populatePACounties();
          if ([...$("#pacounty").options].some((o) => o.value === county)) {
            $("#pacounty").value = county;
            populatePAMunis();
          } else county = null;
        }
      } catch { county = null; /* zip lookup is optional; state default still stands */ }
    }
    const countyDisplay = county && geo.region === "PA"
      ? county.split(" ").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ") + " county — pick your municipality below"
      : county;
    const note = el("p", { class: "assume" },
      `Set to ${STATES[geo.region].name}${countyDisplay ? ` (${countyDisplay})` : ""} from your connection's general location — detected by our own server, stored nowhere. Change it anytime.`);
    stateSel.closest(".field").append(note);
    if (typeof run === "function") run();
  } catch { /* offline or blocked: the default state stands */ }
})();

// live summary bar: follows you down the interview once the hero scrolls away
const ssTake = el("span", { class: "ss-main" }, "—");
const ssMonth = el("strong", {}, "—");
const ssEff = el("strong", {}, "—");
const stickyBar = el("div", { class: "sticky-summary", role: "status", "aria-label": "Live estimate" },
  el("span", { class: "ss-label" }, "Take-home"),
  ssTake,
  el("span", { class: "ss-item" }, ssMonth, "/mo"),
  el("span", { class: "ss-item" }, "effective rate ", ssEff));
document.body.append(stickyBar);
const heroEl = $("#r-hero");
new IntersectionObserver((entries) => {
  stickyBar.classList.toggle("show", !entries[0].isIntersecting);
}, { rootMargin: "-60px 0px 0px 0px" }).observe(heroEl);

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

function mdCountyTax(name, taxable, status) {
  const c = MD_COUNTIES[name];
  if (c == null) return 0;
  return typeof c === "number" ? taxable * c / 100 : bracketTax(taxable, status === "mfj" ? c.mfj : c.single);
}

/** Live-state/work-state reciprocity: same-state or no work-state entered leaves
 * stateTax untouched. Reciprocal pair -> only the live state is owed. Otherwise,
 * approximate the standard "credit for tax paid to another jurisdiction" outcome:
 * you end up paying whichever state's rate is higher, not the sum of both. */
function applyReciprocity(liveCode, liveTax, stateTaxable, status) {
  if (chipValue("hasworkstate") !== "yes") return { stateTax: liveTax, note: null };
  const workCode = $("#workstate").value;
  if (!workCode || workCode === liveCode) return { stateTax: liveTax, note: null };
  const liveName = STATES[liveCode].name, workName = STATES[workCode].name;
  const reciprocal = workCode === "DC" || (RECIPROCITY[liveCode] || []).includes(workCode);
  if (reciprocal) {
    return {
      stateTax: liveTax,
      note: ` Because ${liveName} and ${workName} have a reciprocal agreement, you owe income tax only to ${liveName} — ask your employer to stop withholding ${workName} tax with an exemption form.`,
    };
  }
  const workTax = bracketTax(stateTaxable, stateBrackets(STATES[workCode], status));
  const total = Math.max(liveTax, workTax);
  return {
    stateTax: total,
    note: ` ${liveName} and ${workName} don't have a reciprocal agreement, so both states are technically owed tax — but ${liveName} credits what you pay ${workName}, capped at ${liveName}'s own tax on that income. Net effect modeled here: about ${money(total)}, roughly whichever state's rate is higher (this doesn't include any city or county tax ${workName} charges nonresident commuters).`,
  };
}

function gatherInputs() {
  const accts = chipValue("hasaccts") === "yes";
  const inv = chipValue("hasinv") === "yes";
  const hasTips = chipValue("hastips") === "yes";
  const hasLoans = chipValue("hasloans") === "yes";
  const hasRental = chipValue("hasrental") === "yes";
  return {
    year: Number(chipValue("taxyear")) || 2026,
    status: chipValue("status"),
    wages: readField($("#wages")),
    k401: accts ? readField($("#k401")) : 0, k401s: accts ? readField($("#k401s")) : 0,
    ira: accts ? readField($("#ira")) : 0, iras: accts ? readField($("#iras")) : 0,
    hsa: accts ? readField($("#hsa")) : 0, plan529: accts ? readField($("#plan529")) : 0,
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
    rsu: chipValue("hasrsu") === "yes" ? readField($("#rsuval")) : 0,
    rsustatewh: chipValue("hasrsu") === "yes" ? readField($("#rsustatewh")) / 100 : 0,
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
  const wages = inp.wages + inp.rsu; // RSUs are ordinary wage income the moment they vest
  const depreciation = inp.rbasis / 27.5;
  inp = { ...inp, rental: inp.rents - inp.rexp - depreciation, depreciation };

  // --- payroll ---
  const ssWages = Math.min(wages, F.fica.ssWageBase);
  const ficaSS = ssWages * F.fica.ssRate / 100;
  const ficaMed = wages * F.fica.medicareRate / 100;
  const seNet = inp.se * F.se.factor;
  const seSSBase = Math.min(seNet, Math.max(0, F.fica.ssWageBase - ssWages));
  const seTax = seSSBase * F.se.ssRate / 100 + seNet * F.se.medicareRate / 100;
  const addlMed = Math.max(0, wages + seNet - F.fica.addlMedicareThreshold[st]) * F.fica.addlMedicareRate / 100;
  const payroll = ficaSS + ficaMed + addlMed + seTax;

  const pretax = inp.k401 + (st === "mfj" ? inp.k401s : 0) + inp.hsa;

  // --- rental: income adds; losses limited by the $25k active-participation allowance ---
  const grossNoRental = wages + inp.se + inp.interest + inp.qdiv + inp.odiv + inp.ltg + inp.stg + inp.other;
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
  let stateTax = bracketTax(stateTaxable, sb);

  // --- RSU withholding check: real marginal cost of the RSUs (federal + state,
  // holding everything else equal) versus the flat rate employers withhold ---
  const rsuPanel = $("#rsu-panel");
  if (inp.rsu > 0) {
    const rNoRSU = calcFederal(year, { ...inp, rsu: 0 });
    const stateTaxableNoRSU = Math.max(0, rNoRSU.agi - (inp.ded529 ? inp.plan529 : 0));
    const stateTaxNoRSU = bracketTax(stateTaxableNoRSU, sb);
    const fedCaused = r.fedTax - rNoRSU.fedTax;
    const stateCaused = stateTax - stateTaxNoRSU;
    const fedWithheld = Math.min(inp.rsu, 1000000) * 0.22 + Math.max(0, inp.rsu - 1000000) * 0.37;
    const stateWithheld = inp.rsu * inp.rsustatewh;
    const shortfall = (fedCaused - fedWithheld) + (stateCaused - stateWithheld);
    rsuPanel.hidden = false;
    $("#rsu-note").replaceChildren(
      `Your ${money(inp.rsu)} of RSUs actually costs ${money(fedCaused + stateCaused)} in federal + state tax at your real marginal rate, versus ${money(fedWithheld + stateWithheld)} withheld by your employer's flat rate. `,
      Object.assign(document.createElement("strong"), {
        textContent: shortfall > 0
          ? `Set aside about ${money(shortfall)} more before filing.`
          : `You're covered — withholding ran ${money(-shortfall)} ahead of what you'll owe.`,
      })
    );
  } else {
    rsuPanel.hidden = true;
  }
  const code = stateSel.value;
  const wageBase = inp.wages + inp.rsu + r.seNet;
  let localTax = 0;
  if (code === "NY") {
    const nyloc = chipValue("nylocal");
    if (nyloc === "nyc") localTax = bracketTax(r.agi, inp.status === "mfj" ? NYC.mfj : NYC.single);
    else if (nyloc === "yonkers") localTax = stateTax * YONKERS.residentSurchargePctOfStateTax / 100;
  } else if (code === "MD") {
    localTax = mdCountyTax($("#mdcounty").value, stateTaxable, inp.status);
  } else if (code === "MO") {
    const city = chipValue("mocity");
    if (city === "kc") localTax = wageBase * MO_CITIES["Kansas City"] / 100;
    else if (city === "stl") localTax = wageBase * MO_CITIES["St. Louis"] / 100;
  } else if (code === "DE") {
    if (chipValue("dewilm") === "yes") localTax = wageBase * DE_WILMINGTON_RATE / 100;
  } else if (code === "PA" && paData) {
    const row = paData.find((r2) => r2[0] === paMuniSel.value);
    if (row) localTax = wageBase * row[4] / 100;
  } else if (code === "OH" && ohData) {
    const row = ohData.find((r2) => r2[0] === ohMuniSel.value);
    if (row) localTax = wageBase * row[1] / 100;
  } else if (st.local && !$("#local-q").hidden) {
    localTax = wageBase * readField($("#localrate")) / 100;
  }
  if (code === "CO") {
    const opt = CO_OPT[chipValue("cocity")];
    if (opt && wageBase / 12 >= opt.thresholdMonthly) localTax += opt.employeeMonthly * 12;
  }

  const recip = applyReciprocity(code, stateTax, stateTaxable, inp.status);
  stateTax = recip.stateTax;

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
  ssTake.textContent = money(takeHome);
  ssMonth.textContent = money(takeHome / 12);
  ssEff.textContent = pct(eff);

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
  if (recip.note) bits.push(recip.note);
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
  if (k401Room > 0 && (inp.wages + inp.rsu) > 0) {
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

  // --- relocation comparison: income + property + sales, both states ---
  const mv = $("#move-panel");
  const code2 = state2Sel.value;
  if (code2 && code2 !== stateSel.value) {
    const stB = STATES[code2];
    const sbB = stateBrackets(stB, inp.status);
    const stateTaxB = bracketTax(Math.max(0, r.agi - (inp.ded529 ? inp.plan529 : 0)), sbB);
    const localB = stB.local ? (inp.wages + inp.rsu + r.seNet) * stB.local.def / 100 : 0;
    const incomeA = stateTax + localTax, incomeB = stateTaxB + localB;

    const homeval = readField($("#homeval"));
    const spendval = readField($("#spendval"));
    const txA = STATE_TAXES[stateSel.value] || null;
    const txB = STATE_TAXES[code2] || null;
    const propA = txA ? homeval * txA.prop / 100 : null;
    const propB = txB ? homeval * txB.prop / 100 : null;
    const salesA = txA ? spendval * txA.sales / 100 : null;
    const salesB = txB ? spendval * txB.sales / 100 : null;

    mv.hidden = false;
    $("#move-title").textContent = `${STATES[stateSel.value].name} vs. ${stB.name}, on your numbers`;
    const rowEl = (label, a, b) => {
      const diff = b - a;
      return el("div", { class: "impact-row" },
        el("span", {}, `${label}: ${money(a)} → ${money(b)}`),
        el("span", { class: "n" + (diff > 0 ? " bad" : "") },
          diff === 0 ? "same" : `${diff < 0 ? "saves" : "costs"} ${money(Math.abs(diff))}/yr`));
    };
    const rows2 = [rowEl("State & local income tax", incomeA, incomeB)];
    if (propA != null && propB != null && homeval > 0) rows2.push(rowEl(`Property tax on a ${money(homeval)} home`, propA, propB));
    if (salesA != null && salesB != null && spendval > 0) rows2.push(rowEl(`Sales tax on ${money(spendval)} of spending`, salesA, salesB));
    const totalA = incomeA + (propA || 0) + (salesA || 0);
    const totalB = incomeB + (propB || 0) + (salesB || 0);
    const net = totalB - totalA;
    rows2.push(el("div", { class: "impact-row" },
      el("span", {}, el("strong", {}, "All three together")),
      el("span", { class: "n" + (net > 0 ? " bad" : "") },
        el("strong", {}, net === 0 ? "a wash" : `${net < 0 ? "saves" : "costs"} ${money(Math.abs(net))}/yr`))));
    $("#move-list").replaceChildren(...rows2);
    $("#move-note").textContent =
      `Income tax uses this page's full engine on your exact inputs (${stB.local ? `${stB.name}'s typical local rate of ${stB.local.def}% included` : "no local income tax there"}). ` +
      `Property and sales use statewide average effective rates (${STATE_TAXES_META.property}; ${STATE_TAXES_META.sales}) — your county and habits will vary. Not modeled: vehicle taxes, estate taxes, and ${code2 === "WA" ? "Washington's capital-gains excise, " : ""}moving-year part-residency.`;
  } else {
    mv.hidden = true;
  }

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

/* ---- deep-link prefill: lets another tool (e.g. the move-cost calculator) hand
   off context via URL query params, e.g. take-home-pay.html?state=CA&state2=TX
   — nothing is sent anywhere, this only reads the URL the visitor already has. */
(() => {
  const p = new URLSearchParams(location.search);
  const st1 = (p.get("state") || "").toUpperCase(), st2 = (p.get("state2") || "").toUpperCase();
  if (STATES[st1]) { stateSel.value = st1; stateTouched = true; }
  if (STATES[st2]) { state2Sel.value = st2; $("#move-extras").hidden = false; }
  for (const [param, id] of [["wages", "wages"], ["homeval", "homeval"], ["spendval", "spendval"]]) {
    const v = p.get(param);
    if (v && !isNaN(Number(v))) $("#" + id).value = v;
  }
  if (STATES[st1]) updateStateUI();
})();

const run = bindCalc($("#calc"), compute);
stateSel.addEventListener("change", run);
