"use strict";

import { $, $$, el, bindCalc, readField, toNum, money, money2, moneyShort, years, pmt } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { attachRateHint } from "../rate-hint.js";
import { stackedArea, breakdown, dataTable } from "../charts.js";

initToolPage("mortgage-lab");

/* ---- home-purchase mode: price/down auto-fill the loan amount, and
   property tax + insurance + HOA add on top as escrow ---- */
function chipVal(name) {
  const c = document.querySelector(`input[name="${name}"]:checked`);
  return c ? c.value : "no";
}
function buyOn() { return chipVal("buyhome") === "yes"; }
function syncLoanFromPrice() {
  if (!buyOn()) return;
  const price = readField($("#price"));
  const down = readField($("#down"));
  $("#amount").value = String(Math.round(price * (1 - down / 100)));
}
for (const r of $$('input[name="buyhome"]')) {
  r.addEventListener("change", () => {
    const on = buyOn();
    $("#buy-fields").hidden = !on;
    $("#breakdown-block").hidden = !on;
    $("#stat-loanamt").hidden = !on;
    $("#stat-totalcost").hidden = !on;
    $("#amount-help").hidden = on;
    if (on) syncLoanFromPrice();
    if (typeof recompute === "function") recompute();
  });
}
for (const id of ["price", "down"]) {
  $("#" + id).addEventListener("input", () => { syncLoanFromPrice(); if (typeof recompute === "function") recompute(); });
}

for (const r of $$('input[name="hascompare"]')) {
  r.addEventListener("change", () => {
    $("#compare-fields").hidden = chipVal("hascompare") !== "yes";
    if (typeof recompute === "function") recompute();
  });
}

/* ================= scenario events (user-built timeline) ================= */

let nextId = 1;
const events = []; // {id, type, el, inputs:{...}}

const TYPE_META = {
  extra:  { title: "One-time payment" },
  recur:  { title: "Recurring extra" },
  recast: { title: "Recast" },
  refi:   { title: "Refinance" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function ymSelects(id, ym, yearFrom, yearTo) {
  const [y0, m0] = ym.split("-").map(Number);
  const mo = el("select", { id: id + "_m", "aria-label": "Month" },
    ...MONTHS.map((m, i) => el("option", i + 1 === m0 ? { value: String(i + 1), selected: "" } : { value: String(i + 1) }, m)));
  const yr = el("select", { id: id + "_y", "aria-label": "Year" });
  for (let y = yearFrom; y <= yearTo; y++) {
    yr.append(el("option", y === y0 ? { value: String(y), selected: "" } : { value: String(y) }, String(y)));
  }
  return el("div", { class: "ym-pair" },
    el("div", { class: "input-wrap" }, mo),
    el("div", { class: "input-wrap" }, yr));
}
function readYM(id) {
  const m = $("#" + id + "_m"), y = $("#" + id + "_y");
  if (!m || !y) return null;
  return `${y.value}-${String(m.value).padStart(2, "0")}`;
}
/** Set a month/year select pair from a "YYYY-MM" string, clamping to the
    year select's available range. */
function setYMField(prefix, ym) {
  if (typeof ym !== "string" || !/^\d{4}-\d{2}$/.test(ym)) return;
  const [y, mo] = ym.split("-");
  const me = $(`#${prefix}_m`), ye = $(`#${prefix}_y`);
  if (me) me.value = String(Number(mo));
  if (ye && [...ye.options].some((o) => o.value === String(Number(y)))) ye.value = String(Number(y));
}
function monthField(id, label, value) {
  const now = new Date().getFullYear();
  return el("div", { class: "field" },
    el("label", { for: id + "_m" }, label),
    ymSelects(id, value, now - 1, now + 41));
}
function numField(id, label, value, opts = {}) {
  const wrap = el("div", { class: "input-wrap" });
  if (opts.prefix) wrap.append(el("span", { class: "affix" }, opts.prefix));
  wrap.append(el("input", { id, type: "number", inputmode: "decimal", value: String(value),
    min: String(opts.min ?? 0), max: String(opts.max ?? 100000000), step: String(opts.step ?? 1) }));
  if (opts.suffix) wrap.append(el("span", { class: "affix" }, opts.suffix));
  return el("div", { class: "field" }, el("label", { for: id }, label), wrap);
}
function selField(id, label, options, selected) {
  return el("div", { class: "field" },
    el("label", { for: id }, label),
    el("div", { class: "input-wrap" },
      el("select", { id }, ...options.map(([v, t]) =>
        el("option", v === selected ? { value: v, selected: "" } : { value: v }, t)))));
}

function defaultWhen(offsetMonths) {
  const [y, m] = (readYM("start") || "2026-10").split("-").map(Number);
  const d = new Date(y, m - 1 + offsetMonths, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function addEvent(type) {
  const id = nextId++;
  const p = (name) => `ev${id}-${name}`;
  let fields;
  if (type === "extra") {
    fields = [numField(p("amt"), "Amount", 10000, { prefix: "$", step: 500 }),
              monthField(p("when"), "Paid in", defaultWhen(10))];
  } else if (type === "recur") {
    fields = [numField(p("amt"), "Amount", 200, { prefix: "$", step: 25 }),
              selField(p("freq"), "Every", [["1", "month"], ["12", "year"]], "1"),
              monthField(p("when"), "Starting", defaultWhen(1))];
  } else if (type === "recast") {
    fields = [numField(p("amt"), "Lump sum", 25000, { prefix: "$", step: 1000 }),
              monthField(p("when"), "Recast in", defaultWhen(24))];
  } else {
    fields = [numField(p("rate"), "New rate %", 5.5, { step: 0.125, max: 25 }),
              selField(p("term"), "New term", [["30", "30 yrs"], ["20", "20 yrs"], ["15", "15 yrs"]], "30"),
              numField(p("closing"), "Closing costs", 6000, { prefix: "$", step: 250 }),
              selField(p("rollin"), "Costs paid", [["no", "upfront"], ["yes", "rolled in"]], "no"),
              monthField(p("when"), "Refinance in", defaultWhen(36))];
  }
  const row = el("div", { class: "ev-row", dataset: { type } },
    el("div", { class: "ev-head" },
      el("span", { class: "ev-title" }, TYPE_META[type].title),
      el("button", { class: "ev-del", type: "button", onclick: () => removeEvent(id) }, "remove")),
    el("div", { class: "ev-fields" }, ...fields),
    type === "recast" ? el("p", { class: "ev-note" }, "Lenders usually want a $5,000+ lump and charge a ~$250 fee (not modeled). Payment drops; payoff date keeps.") : null,
  );
  events.push({ id, type, el: row });
  $("#ev-list").append(row);
  recompute();
}
function removeEvent(id) {
  const idx = events.findIndex((e) => e.id === id);
  if (idx >= 0) { events[idx].el.remove(); events.splice(idx, 1); recompute(); }
}
for (const b of $$("[data-add]")) b.addEventListener("click", () => addEvent(b.dataset.add));

/** Current term selection in years, honoring the "custom / already have this
 * loan" option (years + months remaining) alongside the 15/20/30 presets. */
function currentTermYears() {
  const v = $("#term").value;
  if (v === "custom") return readField($("#termyears")) + readField($("#termmonths")) / 12;
  return Number(v) || 30;
}
$("#term").addEventListener("change", () => {
  $("#term-custom-fields").hidden = $("#term").value !== "custom";
  if (typeof recompute === "function") recompute();
});
for (const id of ["termyears", "termmonths"]) {
  $("#" + id).addEventListener("input", () => { if (typeof recompute === "function") recompute(); });
}

$("#add-biweekly").addEventListener("click", () => {
  const payment = pmt(readField($("#amount")), readField($("#rate")), Math.round(currentTermYears() * 12));
  addEvent("recur");
  const newId = events[events.length - 1].id;
  $(`#ev${newId}-amt`).value = String(Math.round(payment / 12));
  $(`#ev${newId}-freq`).value = "1";
  recompute();
});

$("#start-picker").append(...ymSelects("start", "2026-10", 1990, new Date().getFullYear() + 2).children);

/* ================= simulation ================= */

function startYM() {
  const [y, m] = (readYM("start") || "2026-10").split("-").map(Number);
  return { y, m };
}
function whenToMonthIndex(ym) {
  if (!ym) return 1;
  const s = startYM();
  const [y, m] = ym.split("-").map(Number);
  return Math.max(1, (y - s.y) * 12 + (m - s.m) + 1);
}
function monthIndexToLabel(mi) {
  const s = startYM();
  const d = new Date(s.y, s.m - 1 + mi - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
function monthIndexToYM(mi) {
  const s = startYM();
  const d = new Date(s.y, s.m - 1 + mi - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function readEvents() {
  return events.map((e) => {
    const g = (name) => $(`#ev${e.id}-${name}`);
    const v = (name, fb = 0) => (g(name) ? toNum(g(name).value, fb) : fb);
    const when = whenToMonthIndex(readYM(`ev${e.id}-when`) || defaultWhen(1));
    if (e.type === "extra") return { type: "extra", when, amt: v("amt") };
    if (e.type === "recur") return { type: "recur", when, amt: v("amt"), freq: Math.round(v("freq", 1)) || 1 };
    if (e.type === "recast") return { type: "recast", when, amt: v("amt") };
    return { type: "refi", when, rate: v("rate", 5.5), term: Math.round(v("term", 30)),
             closing: v("closing"), rollin: g("rollin") && g("rollin").value === "yes" };
  });
}

/** The Lab engine: one loan, arbitrary stacked events. */
function simulate(amount, ratePct, termYears, evs) {
  let bal = amount, rate = ratePct / 100 / 12;
  let maturity = termYears * 12;             // month index of final scheduled payment
  let payment = pmt(amount, ratePct, maturity);
  let totalInterest = 0, outOfPocket = 0, m = 0;
  const balances = [bal];
  const outPath = [0];       // cumulative out-of-pocket by month (for break-even comparisons)
  const paymentPath = [];    // required payment in effect during month m (index m-1)
  const interestPath = [0];  // cumulative interest paid by month (for the amortization table + interest-saved chart)
  const cap = 1200;
  while (bal > 0.005 && m < cap) {
    m++;
    // refinance & recast restructure the loan at the start of the month
    for (const e of evs) {
      if (e.when !== m) continue;
      if (e.type === "refi") {
        if (e.rollin) bal += e.closing; else outOfPocket += e.closing;
        rate = e.rate / 100 / 12;
        maturity = m - 1 + e.term * 12;
        payment = pmt(bal, e.rate, e.term * 12);
      }
    }
    paymentPath.push(payment);
    const interest = bal * rate;
    totalInterest += interest;
    interestPath.push(totalInterest);
    let pay = Math.min(payment, bal + interest);
    for (const e of evs) {
      if (e.type === "extra" && e.when === m) pay += e.amt;
      if (e.type === "recur" && m >= e.when && (m - e.when) % e.freq === 0) pay += e.amt;
      if (e.type === "recast" && e.when === m) pay += e.amt;
    }
    pay = Math.min(pay, bal + interest);
    outOfPocket += pay;
    outPath.push(outOfPocket);
    bal = Math.max(0, bal + interest - pay);
    for (const e of evs) {
      if (e.type === "recast" && e.when === m && maturity > m) {
        payment = pmt(bal, rate * 1200, maturity - m); // re-amortize over remaining schedule
      }
    }
    balances.push(bal);
    if (payment <= bal * rate && bal > 0.005) {           // guard: payment no longer amortizes
      const future = evs.some((e) => e.when > m && (e.type === "extra" || e.type === "recast"));
      if (!future) return null;
    }
  }
  if (bal > 0.005) return null;
  return { months: m, totalInterest, outOfPocket, balances, outPath, paymentPath, interestPath, payment };
}
/** Cumulative out-of-pocket at month m, holding flat after payoff. */
function cumAt(sim, m) { return sim.outPath[Math.min(m, sim.outPath.length - 1)]; }

/* ================= HELOC ================= */

function simulateHeloc(amount, ratePct, ioYears, repayYears) {
  const i = ratePct / 100 / 12;
  let bal = amount, totalInterest = 0;
  const balances = [bal];
  const ioM = Math.round(ioYears * 12), repM = Math.round(repayYears * 12);
  for (let m = 1; m <= ioM; m++) { totalInterest += bal * i; balances.push(bal); }
  const p = pmt(bal, ratePct, repM);
  for (let m = 1; m <= repM && bal > 0.005; m++) {
    const int = bal * i; totalInterest += int;
    bal = Math.max(0, bal + int - p); balances.push(bal);
  }
  return { totalInterest, balances, payment: p };
}

/* ================= compute & render ================= */

function compute() {
  const amount = readField($("#amount"));
  const ratePct = readField($("#rate"));
  const termYears = currentTermYears();
  const invReturn = readField($("#invreturn"));
  const evs = readEvents();

  const base = simulate(amount, ratePct, termYears, []);
  const plan = simulate(amount, ratePct, termYears, evs);
  if (!base) return;
  if (!plan) {
    $("#r-hero").textContent = "never";
    $("#r-interpret").textContent = "With this combination the balance stops falling — a refinance payment below the interest, most likely. Adjust an event.";
    return;
  }

  $("#r-hero").textContent = monthIndexToLabel(plan.months);
  $("#r-saved").textContent = money(base.totalInterest - plan.totalInterest);
  $("#r-sooner").textContent = years((base.months - plan.months) / 12);
  $("#r-interest").textContent = money(plan.totalInterest);

  // home-purchase mode: escrow on top of principal & interest
  const buy = buyOn();
  let taxM = 0, insM = 0, hoaM = 0;
  if (buy) {
    taxM = readField($("#ptax")) / 12;
    insM = readField($("#hins")) / 12;
    hoaM = readField($("#hoafee"));
  }
  const escrow = taxM + insM + hoaM;
  $("#r-pay").textContent = money2(plan.payment + escrow);

  $("#stat-loanamt").hidden = !buy;
  $("#stat-totalcost").hidden = !buy;
  if (buy) {
    $("#r-loanamt").textContent = money(amount);
    $("#r-totalcost").textContent = money(amount + plan.totalInterest);
    breakdown($("#chart-breakdown"), {
      ariaLabel: "Monthly payment breakdown",
      fmt: money2,
      items: [
        { name: "Principal & interest", value: plan.payment },
        { name: "Property tax", value: taxM },
        { name: "Insurance", value: insM },
        { name: "HOA", value: hoaM },
      ],
    });
  }

  $("#r-interpret").replaceChildren(
    evs.length === 0
      ? `Minimum payments retire the loan in ${monthIndexToLabel(base.months)}. Stack events on the left — every one recomputes the whole timeline.`
      : `This ${evs.length}-move plan finishes `,
    evs.length === 0 ? "" : Object.assign(document.createElement("strong"), {
      textContent: `${years((base.months - plan.months) / 12)} sooner`,
    }),
    evs.length === 0 ? "" : ` than minimum payments and saves ${money(base.totalInterest - plan.totalInterest)} in interest.`,
    buy ? ` Full payment right now, taxes and insurance included: ${money2(plan.payment + escrow)}/mo.` : ""
  );

  // balance chart (+ household debt when HELOC on)
  const helocOn = document.querySelector('input[name="heloc"]:checked').value === "yes";
  let heloc = null;
  if (helocOn) heloc = simulateHeloc(readField($("#hamount")), readField($("#hrate")), readField($("#hio")), readField($("#hrepay")));

  const span = Math.max(base.months, plan.months, heloc ? heloc.balances.length - 1 : 0);
  // sample resolution adapts to the horizon: a loan with only a few months or
  // years left would otherwise collapse to 0-1 yearly points and render blank
  const step = span <= 24 ? 3 : span <= 96 ? 6 : 12;
  const xs = [], sPlan = [], sBase = [], sHouse = [], sPlanInt = [], sBaseInt = [];
  const pushPoint = (mi) => {
    xs.push(mi === 0 ? "Now" : (step === 12 ? monthIndexToLabel(mi).slice(-4) : monthIndexToLabel(mi)));
    const pb = plan.balances[Math.min(mi, plan.balances.length - 1)];
    sPlan.push(pb);
    sBase.push(base.balances[Math.min(mi, base.balances.length - 1)]);
    if (heloc) sHouse.push(pb + heloc.balances[Math.min(mi, heloc.balances.length - 1)]);
    if (evs.length && !heloc) {
      sPlanInt.push(plan.interestPath[Math.min(mi, plan.interestPath.length - 1)]);
      sBaseInt.push(base.interestPath[Math.min(mi, base.interestPath.length - 1)]);
    }
  };
  for (let mi = 0; mi <= span; mi += step) pushPoint(mi);
  if (span % step !== 0) pushPoint(span); // always land exactly on the payoff month
  const showInterest = evs.length > 0 && !heloc;
  const series = [
    { name: "Your plan (balance)", values: sPlan },
    { name: "Minimum only (balance)", values: sBase },
  ];
  if (heloc) series.push({ name: "Plan + HELOC", values: sHouse });
  if (showInterest) {
    series.push({ name: "Your plan (interest paid)", values: sPlanInt });
    series.push({ name: "Minimum only (interest paid)", values: sBaseInt });
  }
  stackedArea($("#chart-balance"), {
    ariaLabel: "Balance and interest paid over time", xs, stacked: false, fmt: moneyShort, fmtTip: money, series,
  });
  $("#balance-note").textContent = showInterest
    ? `The interest lines keep climbing after "Your plan" is paid off (${monthIndexToLabel(plan.months)}) because "Minimum only" keeps accruing interest until its own payoff (${monthIndexToLabel(base.months)}) — you're not still paying anything after ${monthIndexToLabel(plan.months)}, that's what you avoided.`
    : "";

  // per-event marginal attribution: re-run with each event removed
  const impact = $("#impact");
  impact.replaceChildren();
  evs.forEach((e, idx) => {
    const without = simulate(amount, ratePct, termYears, evs.filter((_, j) => j !== idx));
    const saved = without ? (without.totalInterest - plan.totalInterest) : NaN;
    const monthsCut = without ? without.months - plan.months : NaN;
    let label = {
      extra: `${money(e.amt)} one-time in ${monthIndexToLabel(e.when)}`,
      recur: `${money(e.amt)} extra every ${e.freq === 12 ? "year" : "month"} from ${monthIndexToLabel(e.when)}`,
      recast: `Recast with ${money(e.amt)} in ${monthIndexToLabel(e.when)}`,
      refi: `Refinance to ${e.rate}% / ${e.term} yrs in ${monthIndexToLabel(e.when)}`,
    }[e.type];

    if (e.type === "refi" && without) {
      // break-even: first month the refinance's cumulative cost drops below staying put
      let be = null;
      const span = Math.max(plan.months, without.months, e.when);
      for (let mm = e.when; mm <= span; mm++) {
        if (cumAt(plan, mm) < cumAt(without, mm)) { be = mm; break; }
      }
      label += be ? ` — breaks even ${monthIndexToLabel(be)}` : " — never breaks even in this plan";
    }
    const emiNote = Number.isFinite(monthsCut) && monthsCut !== 0
      ? ` — ${Math.abs(monthsCut)} ${monthsCut > 0 ? "fewer" : "more"} payment${Math.abs(monthsCut) === 1 ? "" : "s"}`
      : "";
    impact.append(el("div", { class: "impact-row" },
      el("span", {}, label),
      el("span", { class: "n" + (Number.isFinite(saved) && saved < 0 ? " bad" : "") },
        Number.isFinite(saved) ? `${saved >= 0 ? "saves" : "costs"} ${money(Math.abs(saved))}${emiNote}` : "—")));

    // quick-add: keep paying the OLD amount instead of pocketing the lower one
    if (e.type === "refi") {
      const oldPay = e.when >= 2 ? plan.paymentPath[e.when - 2] : pmt(amount, ratePct, termYears * 12);
      const newPay = plan.paymentPath[e.when - 1];
      if (newPay < oldPay - 1 && !events.some((ev2) => ev2.type === "recur" && whenToMonthIndex(readYM(`ev${ev2.id}-when`) || defaultWhen(1)) === e.when)) {
        const diff = oldPay - newPay;
        impact.append(el("p", { class: "q-note" },
          `💡 This refinance drops the payment by ${money2(diff)}. Keep paying your old amount instead and the freed-up rate cut goes straight to payoff: `,
          el("button", {
            class: "btn-ghost", type: "button",
            onclick: () => {
              addEvent("recur");
              const newId = events[events.length - 1].id;
              $(`#ev${newId}-amt`).value = String(Math.round(diff));
              setYMField(`ev${newId}-when`, monthIndexToYM(e.when));
              recompute();
            },
          }, `add a ${money(diff)}/mo recurring extra starting ${monthIndexToLabel(e.when)}`)));
      }
    }
  });
  if (heloc) {
    impact.append(el("div", { class: "impact-row" },
      el("span", {}, `HELOC (${money(readField($("#hamount")))} at ${readField($("#hrate"))}%)`),
      el("span", { class: "n bad" }, `costs ${money(heloc.totalInterest)} interest`)));
  }
  if (!evs.length && !heloc) {
    impact.append(el("p", { class: "q-note" }, "Add events above — each one shows its true marginal savings, given everything else in the plan."));
  }

  // compare two extra-payment amounts, each measured on its own against minimum payments
  const compareBlock = $("#compare-block"), compareList = $("#compare-list");
  compareBlock.hidden = chipVal("hascompare") !== "yes";
  if (!compareBlock.hidden) {
    compareList.replaceChildren();
    const freq = document.querySelector('input[name="cmpfreq"]:checked').value;
    const mkEvents = (amt) => freq === "once" ? [{ type: "extra", when: 1, amt }] : [{ type: "recur", when: 1, amt, freq: 1 }];
    for (const [id, label] of [["cmpA", "Amount A"], ["cmpB", "Amount B"]]) {
      const amt = readField($("#" + id));
      const sim = amt > 0 ? simulate(amount, ratePct, termYears, mkEvents(amt)) : base;
      if (!sim) {
        compareList.append(el("div", { class: "impact-row" }, el("span", {}, `${label}: ${money(amt)}`), el("span", { class: "n bad" }, "never pays off")));
        continue;
      }
      const interestSaved = base.totalInterest - sim.totalInterest;
      const monthsCut = base.months - sim.months;
      compareList.append(el("div", { class: "impact-row" },
        el("span", {}, `${label}: ${money(amt)}${freq === "once" ? " one-time" : "/mo"} — payoff ${monthIndexToLabel(sim.months)}`),
        el("span", { class: "n" + (interestSaved < 0 ? " bad" : "") },
          `${interestSaved >= 0 ? "saves" : "costs"} ${money(Math.abs(interestSaved))} — ${Math.abs(monthsCut)} ${monthsCut >= 0 ? "fewer" : "more"} payment${Math.abs(monthsCut) === 1 ? "" : "s"}`)));
    }
  }

  // prepay vs invest, apples to apples at the baseline horizon
  const svp = $("#svp");
  const extraMonthly = evs.filter((e) => e.type === "recur" && e.freq === 1).reduce((a, e) => a + e.amt, 0);
  if (extraMonthly > 0) {
    const r = invReturn / 100 / 12;
    const grow = (pmtAmt, months) => (r === 0 ? pmtAmt * months : pmtAmt * ((Math.pow(1 + r, months) - 1) / r));
    // path A: prepay (your plan), then invest freed payment+extra until baseline payoff
    const freed = plan.payment + extraMonthly;
    const investAfter = grow(freed, Math.max(0, base.months - plan.months));
    // path B: minimum payments, invest the extra the whole time
    const investAll = grow(extraMonthly, base.months);
    const diff = investAfter - investAll;
    svp.replaceChildren(el("div", { class: "verdict" },
      el("p", {}, `Same ${money(extraMonthly)}/month, two uses, measured at the same date (${monthIndexToLabel(base.months)}):`),
      el("p", {}, `· Prepay, then invest the freed-up payment: `, el("strong", {}, money(investAfter)), ` — plus a guaranteed ${ratePct}% "return" while prepaying.`),
      el("p", {}, `· Invest it all along at ${invReturn}%: `, el("strong", {}, money(investAll)), ` — if the market cooperates.`),
      el("p", {}, diff >= 0
        ? `On these numbers, prepaying ends ${money(diff)} ahead — and its return is contractual, not hoped for.`
        : `On these numbers, investing ends ${money(-diff)} ahead — the classic trade when the expected return beats your rate of ${ratePct}%. The mortgage's return is guaranteed; the market's is not.`),
      el("p", { class: "q-note" }, el("a", { href: `retirement.html?monthly=${Math.round(extraMonthly)}` },
        `See what ${money(extraMonthly)}/month grows into by retirement →`))));
  } else {
    svp.replaceChildren(el("p", { class: "q-note" }, "Add a monthly recurring extra to compare prepaying it against investing it."));
  }

  if (events.length || document.querySelector('input[name="heloc"]:checked').value === "yes") {
    history.replaceState(null, "", location.pathname + "#s=" + encodeState());
  }

  // yearly amortization table: payment, principal and interest paid that year, ending balance
  const rows = [];
  const at = (arr, mi) => arr[Math.min(mi, arr.length - 1)];
  for (let y = 1; y * 12 <= plan.months + 11; y++) {
    const mi0 = (y - 1) * 12, mi1 = Math.min(y * 12, plan.months);
    rows.push({
      when: monthIndexToLabel(mi1),
      payment: at(plan.outPath, mi1) - at(plan.outPath, mi0),
      principal: at(plan.balances, mi0) - at(plan.balances, mi1),
      interest: at(plan.interestPath, mi1) - at(plan.interestPath, mi0),
      bal: at(plan.balances, mi1),
    });
  }
  dataTable($("#sched-table"), rows, [
    { h: "Date", get: (r) => r.when },
    { h: "Payment", get: (r) => r.payment, fmt: money },
    { h: "Principal", get: (r) => r.principal, fmt: money },
    { h: "Interest", get: (r) => r.interest, fmt: money },
    { h: "Balance", get: (r) => r.bal, fmt: money },
  ]);
}

/* ============ share: the whole plan lives in the URL fragment ============ */
/* The fragment never leaves the browser (servers don't receive #...), so a
   shared link carries the scenario without the site ever seeing it. */

function encodeState() {
  const st = {
    a: readField($("#amount")), r: readField($("#rate")), t: currentTermYears(),
    s: readYM("start"), iv: readField($("#invreturn")),
    b: buyOn() ? [readField($("#price")), readField($("#down")), readField($("#ptax")),
                  readField($("#hins")), readField($("#hoafee"))] : null,
    h: document.querySelector('input[name="heloc"]:checked').value === "yes"
      ? [readField($("#hamount")), readField($("#hrate")), readField($("#hio")), readField($("#hrepay"))] : null,
    e: events.map((e) => {
      const g = (n) => $(`#ev${e.id}-${n}`);
      const val = (n) => (g(n) ? g(n).value : null);
      return [e.type, readYM(`ev${e.id}-when`), val("amt"), val("freq"), val("rate"), val("term"), val("closing"), val("rollin")];
    }),
  };
  return btoa(JSON.stringify(st)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function restoreState() {
  const m = location.hash.match(/^#s=([A-Za-z0-9_-]+)$/);
  if (!m) return;
  let st;
  try { st = JSON.parse(atob(m[1].replace(/-/g, "+").replace(/_/g, "/"))); } catch { return; }
  const setNum = (id, v) => { const n = Number(v); if (Number.isFinite(n)) $(id).value = String(n); };
  const setYM = setYMField;
  setNum("#amount", st.a); setNum("#rate", st.r); setNum("#invreturn", st.iv);
  const tYears = Number(st.t);
  if (Number.isFinite(tYears)) {
    if ([15, 20, 30].includes(tYears)) {
      $("#term").value = String(tYears);
      $("#term-custom-fields").hidden = true;
    } else if (tYears > 0) {
      $("#term").value = "custom";
      $("#term-custom-fields").hidden = false;
      const y = Math.floor(tYears);
      $("#termyears").value = String(y);
      $("#termmonths").value = String(Math.round((tYears - y) * 12));
    }
  }
  setYM("start", st.s);
  if (Array.isArray(st.b)) {
    document.querySelector('input[name="buyhome"][value="yes"]').checked = true;
    $("#buy-fields").hidden = false;
    $("#breakdown-block").hidden = false;
    $("#amount-help").hidden = true;
    setNum("#price", st.b[0]); setNum("#down", st.b[1]); setNum("#ptax", st.b[2]);
    setNum("#hins", st.b[3]); setNum("#hoafee", st.b[4]);
  }
  if (Array.isArray(st.h)) {
    document.querySelector('input[name="heloc"][value="yes"]').checked = true;
    $("#heloc-fields").hidden = false;
    setNum("#hamount", st.h[0]); setNum("#hrate", st.h[1]); setNum("#hio", st.h[2]); setNum("#hrepay", st.h[3]);
  }
  for (const row of (Array.isArray(st.e) ? st.e.slice(0, 20) : [])) {
    const [type, when, amt, freq, rate, term, closing, rollin] = row;
    if (!TYPE_META[type]) continue;
    addEvent(type);
    const id = events[events.length - 1].id;
    setYM(`ev${id}-when`, when);
    const g = (n) => $(`#ev${id}-${n}`);
    if (g("amt") && amt != null) setNum(`#ev${id}-amt`, amt);
    if (g("freq") && (freq === "1" || freq === "12")) g("freq").value = freq;
    if (g("rate") && rate != null) setNum(`#ev${id}-rate`, rate);
    if (g("term") && ["15", "20", "30"].includes(String(term))) g("term").value = String(term);
    if (g("closing") && closing != null) setNum(`#ev${id}-closing`, closing);
    if (g("rollin") && (rollin === "yes" || rollin === "no")) g("rollin").value = rollin;
  }
}

let recompute = () => {};
restoreState();
recompute = bindCalc($("#calc"), compute);
attachRateHint("rate", "30");

$("#share-btn").addEventListener("click", async () => {
  const url = location.origin + location.pathname + "#s=" + encodeState();
  history.replaceState(null, "", url);
  const status = $("#share-status");
  try {
    await navigator.clipboard.writeText(url);
    status.textContent = "Link copied — it carries the whole plan, and only the person you send it to sees it.";
  } catch {
    status.textContent = "Copy this address bar URL — it now carries the whole plan.";
  }
});

// print: open the schedule so the report is complete, then print
$("#print-btn").addEventListener("click", () => {
  for (const d of $$("details")) d.setAttribute("open", "");
  window.print();
});
window.addEventListener("beforeprint", () => {
  for (const d of $$("details")) d.setAttribute("open", "");
});
