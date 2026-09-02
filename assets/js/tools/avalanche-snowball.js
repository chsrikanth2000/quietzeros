"use strict";

import { $, $$, el, bindCalc, readField, money, moneyShort, years } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { stackedArea, dataTable } from "../charts.js";

initToolPage("avalanche-snowball");

// reveal the focus-loan picker only in focus mode
function chipValue(name) {
  const c = document.querySelector(`input[name="${name}"]:checked`);
  return c ? c.value : "";
}
for (const r of $$('input[name="strategy"]')) {
  r.addEventListener("change", () => { $("#focus-fields").hidden = chipValue("strategy") !== "focus"; });
}

function readDebts() {
  const debts = [];
  for (let n = 1; n <= 5; n++) {
    const bal = readField($(`#d${n}bal`));
    if (bal > 0) debts.push({
      idx: n - 1, name: `Loan ${n}`, bal,
      apr: readField($(`#d${n}apr`)), min: readField($(`#d${n}min`)), ded: readField($(`#d${n}x`)),
    });
  }
  return debts;
}

/**
 * The lab engine.
 * opts: { strategy: "av"|"sb"|"focus", focusIdx, roll, extra, windfall, windMonth }
 * Returns { months, totalInterest, totals[], outlay[], debts (with paidOff, interest) } or null.
 */
function simulate(debtsIn, opts) {
  const debts = debtsIn.map((d) => ({ ...d, paidOff: null, interest: 0 }));
  let m = 0, totalInterest = 0;
  const totals = [debts.reduce((a, d) => a + d.bal, 0)];
  const outlay = [];
  const order = () => [...debts].filter((d) => d.bal > 0.005).sort((a, b) => {
    if (opts.strategy === "focus") {
      const af = a.idx === opts.focusIdx ? 0 : 1, bf = b.idx === opts.focusIdx ? 0 : 1;
      if (af !== bf) return af - bf;
      return b.apr - a.apr || a.bal - b.bal; // after focus dies: avalanche
    }
    return opts.strategy === "av" ? (b.apr - a.apr || a.bal - b.bal) : (a.bal - b.bal || b.apr - a.apr);
  });

  while (debts.some((d) => d.bal > 0.005) && m < 1200) {
    m++;
    for (const d of debts) if (d.bal > 0.005) {
      const int = d.bal * d.apr / 100 / 12;
      d.bal += int; d.interest += int; totalInterest += int;
    }
    let paid = 0;
    // minimums + dedicated extras: alive loans always; dead loans contribute
    // their (min + dedicated) to spare only when rolling
    let spare = opts.extra + (m === opts.windMonth ? opts.windfall : 0);
    for (const d of debts) {
      if (d.bal > 0.005) {
        const pay = Math.min(d.min + d.ded, d.bal);
        d.bal -= pay; paid += pay;
      } else if (opts.roll) {
        spare += d.min + d.ded;
      }
    }
    for (const d of order()) {
      if (spare <= 0) break;
      const pay = Math.min(spare, d.bal);
      d.bal -= pay; spare -= pay; paid += pay;
    }
    for (const d of debts) if (d.bal <= 0.005 && d.paidOff === null) d.paidOff = m;
    totals.push(debts.reduce((a, d) => a + Math.max(0, d.bal), 0));
    outlay.push(paid);
    if (m > 24 && totals[m] >= totals[m - 12] && totals[m] > 0) return null;
  }
  if (debts.some((d) => d.bal > 0.005)) return null;
  return { months: m, totalInterest, totals, outlay, debts };
}

function monthLabel(m) {
  const d = new Date();
  d.setMonth(d.getMonth() + m);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function compute() {
  const debts = readDebts();
  if (!debts.length) {
    $("#r-hero").textContent = "—";
    $("#r-interpret").textContent = "Enter at least one loan with a balance.";
    return;
  }
  const base = {
    focusIdx: Number($("#focusdebt").value),
    roll: chipValue("roll") === "yes",
    extra: readField($("#extra")),
    windfall: readField($("#windfall")),
    windMonth: Math.round(readField($("#windmonth"))),
  };
  const strategy = chipValue("strategy");
  const plan = simulate(debts, { ...base, strategy });
  const minsOnly = simulate(debts, { ...base, strategy: "av", extra: 0, windfall: 0,
    roll: true, });
  if (!plan) {
    $("#r-hero").textContent = "never";
    $("#r-interpret").textContent = "This budget doesn't cover the interest — the balances grow forever. Raise a minimum or the extra.";
    return;
  }

  // all three strategies on the identical budget, for the face-off
  const all = {
    av: strategy === "av" ? plan : simulate(debts, { ...base, strategy: "av" }),
    sb: strategy === "sb" ? plan : simulate(debts, { ...base, strategy: "sb" }),
    focus: strategy === "focus" ? plan : simulate(debts, { ...base, strategy: "focus" }),
  };
  const names = { av: "Avalanche", sb: "Snowball", focus: `Focus Loan ${base.focusIdx + 1}` };

  $("#r-hero").textContent = `${years(plan.months / 12)} — ${monthLabel(plan.months)}`;
  $("#r-int").textContent = money(plan.totalInterest);
  $("#r-paynow").textContent = money(plan.outlay[0]);
  const firstKill = Math.min(...plan.debts.map((d) => d.paidOff));
  $("#r-paylater").textContent = money(plan.outlay[Math.min(firstKill, plan.outlay.length - 1)]);

  const others = Object.entries(all).filter(([k, v]) => k !== strategy && v);
  const best = others.reduce((a, b) => (a && a[1].totalInterest <= b[1].totalInterest ? a : b), others[0]);
  const delta = best ? plan.totalInterest - best[1].totalInterest : 0;
  $("#r-alt").textContent = best && delta > 0.5 ? `${money(delta)} (${names[best[0]]})` : "none — yours wins";

  $("#r-interpret").replaceChildren(
    `Paying ${money(plan.outlay[0])}/month with ${names[strategy].toLowerCase()} targeting, you're debt-free `,
    Object.assign(document.createElement("strong"), { textContent: monthLabel(plan.months) }),
    ` having paid ${money(plan.totalInterest)} in interest` +
    (minsOnly && minsOnly.months > plan.months
      ? ` — ${years((minsOnly.months - plan.months) / 12)} sooner and ${money(minsOnly.totalInterest - plan.totalInterest)} cheaper than minimums alone.`
      : `.`) +
    (base.roll ? "" : ` Because freed payments go back to your pocket, your outlay steps down as each loan dies — the second chart shows when.`)
  );

  // chart 1: total balance vs minimums-only
  const span = Math.max(plan.months, minsOnly ? minsOnly.months : 0);
  const step = span <= 36 ? 3 : 12;
  const xs = [], sPlan = [], sMin = [];
  for (let m = 0; m <= span; m += step) {
    xs.push(m === 0 ? "Now" : step === 12 ? `Yr ${m / 12}` : `Mo ${m}`);
    sPlan.push(plan.totals[Math.min(m, plan.totals.length - 1)]);
    if (minsOnly) sMin.push(minsOnly.totals[Math.min(m, minsOnly.totals.length - 1)]);
  }
  const series = [{ name: "Your plan", values: sPlan }];
  if (minsOnly) series.push({ name: "Minimums only", values: sMin });
  stackedArea($("#chart-bal"), {
    ariaLabel: "Total debt over time", xs, stacked: false, fmt: moneyShort, fmtTip: money, series,
  });

  // chart 2: monthly outlay (the payment-changes view)
  const xs2 = [], sOut = [];
  for (let m = 1; m <= plan.months; m += step) {
    xs2.push(step === 12 ? `Yr ${Math.ceil(m / 12)}` : `Mo ${m}`);
    sOut.push(plan.outlay[m - 1]);
  }
  if (xs2.length >= 2) {
    stackedArea($("#chart-outlay"), {
      ariaLabel: "Monthly outlay over time", xs: xs2, stacked: false,
      fmt: moneyShort, fmtTip: money,
      series: [{ name: "Monthly outlay", values: sOut }],
    });
  } else {
    $("#chart-outlay").replaceChildren();
  }

  // strategy face-off
  const impact = $("#impact");
  impact.replaceChildren(...["av", "sb", "focus"].map((k) => {
    const r = all[k];
    return el("div", { class: "impact-row" },
      el("span", {}, (k === strategy ? "▸ " : "") + names[k] + (k === strategy ? " (yours)" : "")),
      el("span", { class: "n" + (r && r.totalInterest > plan.totalInterest + 0.5 ? " bad" : "") },
        r ? `${money(r.totalInterest)} interest · done ${monthLabel(r.months)}` : "never finishes"));
  }));

  // per-loan table
  dataTable($("#sched-table"), plan.debts, [
    { h: "Loan", get: (d) => `${d.name} (${d.apr}%)` },
    { h: "Interest paid", get: (d) => d.interest, fmt: money },
    { h: "Paid off", get: (d) => `month ${d.paidOff} — ${monthLabel(d.paidOff)}` },
  ]);
}

bindCalc($("#calc"), compute);
