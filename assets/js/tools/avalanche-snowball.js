"use strict";

import { $, bindCalc, readField, money, moneyShort, years } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { stackedArea, dataTable } from "../charts.js";

initToolPage("avalanche-snowball");

function readDebts() {
  const debts = [];
  for (let n = 1; n <= 5; n++) {
    const bal = readField($(`#d${n}bal`));
    if (bal > 0) debts.push({ name: `Debt ${n}`, bal, apr: readField($(`#d${n}apr`)), min: readField($(`#d${n}min`)) });
  }
  return debts;
}

/** strategy: "av" (highest APR first) or "sb" (smallest balance first). */
function simulate(debtsIn, extra, windfall, windMonth, strategy) {
  const debts = debtsIn.map((d) => ({ ...d, paidOff: null }));
  const budget = debtsIn.reduce((a, d) => a + d.min, 0) + extra;
  let totalInterest = 0, m = 0;
  const totals = [debts.reduce((a, d) => a + d.bal, 0)];
  while (debts.some((d) => d.bal > 0.005) && m < 1200) {
    m++;
    let cash = budget + (m === windMonth ? windfall : 0);
    // accrue interest
    for (const d of debts) if (d.bal > 0) { const int = d.bal * d.apr / 100 / 12; d.bal += int; totalInterest += int; }
    // minimums first
    for (const d of debts) if (d.bal > 0) { const pay = Math.min(d.min, d.bal, cash); d.bal -= pay; cash -= pay; }
    // attack the target, rolling into the next when one dies
    const order = [...debts].filter((d) => d.bal > 0.005)
      .sort((a, b) => (strategy === "av" ? b.apr - a.apr || a.bal - b.bal : a.bal - b.bal || b.apr - a.apr));
    for (const d of order) {
      if (cash <= 0) break;
      const pay = Math.min(cash, d.bal);
      d.bal -= pay; cash -= pay;
    }
    for (const d of debts) if (d.bal <= 0.005 && d.paidOff === null) d.paidOff = m;
    const tot = debts.reduce((a, d) => a + Math.max(0, d.bal), 0);
    totals.push(tot);
    if (m > 2 && totals[m] >= totals[m - 1] && cash <= 0 && m > 24 && totals[m] >= totals[m - 12]) return null;
  }
  if (debts.some((d) => d.bal > 0.005)) return null;
  return { months: m, totalInterest, totals, debts };
}

function compute() {
  const debts = readDebts();
  const extra = readField($("#extra"));
  const windfall = readField($("#windfall"));
  const windMonth = Math.round(readField($("#windmonth")));

  if (!debts.length) {
    $("#r-hero").textContent = "—";
    $("#r-interpret").textContent = "Enter at least one debt with a balance.";
    return;
  }
  const av = simulate(debts, extra, windfall, windMonth, "av");
  const sb = simulate(debts, extra, windfall, windMonth, "sb");
  if (!av || !sb) {
    $("#r-hero").textContent = "never";
    $("#r-interpret").textContent = "The payments don't cover the interest — the balances grow forever. Raise the minimums or the extra.";
    return;
  }

  const saved = sb.totalInterest - av.totalInterest;
  $("#r-hero").textContent = money(saved);
  $("#r-av-time").textContent = years(av.months / 12);
  $("#r-sb-time").textContent = years(sb.months / 12);
  $("#r-av-int").textContent = money(av.totalInterest);
  $("#r-sb-int").textContent = money(sb.totalInterest);

  const firstKillSb = Math.min(...sb.debts.map((d) => d.paidOff));
  const firstKillAv = Math.min(...av.debts.map((d) => d.paidOff));
  $("#r-interpret").replaceChildren(
    `On these debts, avalanche saves `,
    Object.assign(document.createElement("strong"), { textContent: money(saved) }),
    saved < 300
      ? ` — a small edge. Snowball kills its first debt in month ${firstKillSb} (avalanche: month ${firstKillAv}); if that momentum keeps you going, take it guilt-free.`
      : ` and finishes ${av.months === sb.months ? "on the same date" : years(Math.abs(sb.months - av.months) / 12) + (av.months < sb.months ? " sooner" : " later")}. At this gap, let the math choose.`
  );

  const span = Math.max(av.months, sb.months);
  const xs = [], sAv = [], sSb = [];
  const step = span <= 36 ? 3 : 12;
  for (let m = 0; m <= span; m += step) {
    xs.push(m === 0 ? "Now" : step === 12 ? `Yr ${m / 12}` : `Mo ${m}`);
    sAv.push(av.totals[Math.min(m, av.totals.length - 1)]);
    sSb.push(sb.totals[Math.min(m, sb.totals.length - 1)]);
  }
  stackedArea($("#chart-avsb"), {
    ariaLabel: "Total debt over time under both strategies",
    xs, stacked: false, fmt: moneyShort, fmtTip: money,
    series: [
      { name: "Avalanche", values: sAv },
      { name: "Snowball", values: sSb },
    ],
  });

  const rows = debts.map((d, i) => ({
    name: `${d.name} (${d.apr}% · ${money(d.bal)})`,
    av: av.debts[i].paidOff, sb: sb.debts[i].paidOff,
  }));
  dataTable($("#sched-table"), rows, [
    { h: "Debt", get: (r) => r.name },
    { h: "Avalanche: paid off in", get: (r) => `month ${r.av}` },
    { h: "Snowball: paid off in", get: (r) => `month ${r.sb}` },
  ]);
}

bindCalc($("#calc"), compute);
