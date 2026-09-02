"use strict";

import { $, el, bindCalc, readField, money, moneyShort, years, pmt, simulateLoan } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { stackedArea, dataTable } from "../charts.js";

initToolPage("mortgage-payoff");

function compute() {
  const amount = readField($("#amount"));
  const rate = readField($("#rate"));
  const term = readField($("#term")) || 30;
  const paid = Math.min(readField($("#paid")), term - 0.5);
  const extra = readField($("#extra"));
  const extraYr = readField($("#extrayr"));
  const lumps = [];
  const l1 = readField($("#lump1")), l1y = Math.round(readField($("#lump1yr")));
  const l2 = readField($("#lump2")), l2y = Math.round(readField($("#lump2yr")));
  if (l1 > 0) lumps.push({ month: l1y * 12, amount: l1 });
  if (l2 > 0) lumps.push({ month: l2y * 12, amount: l2 });

  const basePayment = pmt(amount, rate, term * 12);
  // balance today, after `paid` years of minimum payments
  const aged = simulateLoan(amount, rate, basePayment, {});
  const paidMonths = Math.min(Math.round(paid * 12), aged ? aged.months - 1 : 0);
  const balance = aged ? aged.balances[paidMonths] : amount;

  const base = simulateLoan(balance, rate, basePayment, {});
  const plan = simulateLoan(balance, rate, basePayment, { extraMonthly: extra, extraYearly: extraYr, lumps });
  if (!base || !plan) { $("#r-hero").textContent = "—"; return; }

  $("#r-hero").textContent = years(plan.months / 12);
  $("#r-saved").textContent = money(base.totalInterest - plan.totalInterest);
  $("#r-sooner").textContent = years((base.months - plan.months) / 12);
  $("#r-interest").textContent = money(plan.totalInterest);

  const hasExtras = extra > 0 || extraYr > 0 || lumps.length > 0;
  $("#r-interpret").replaceChildren(
    hasExtras
      ? `Against the ${money(balance)} you owe today, this plan clears the loan `
      : `With minimum payments only, the remaining ${money(balance)} takes `,
    Object.assign(document.createElement("strong"), {
      textContent: hasExtras ? `${years((base.months - plan.months) / 12)} sooner` : years(base.months / 12),
    }),
    hasExtras
      ? ` and saves ${money(base.totalInterest - plan.totalInterest)} in interest.`
      : ` — add something to any extra field to see the difference.`
  );

  // balance curves, sampled yearly
  const span = base.months;
  const xs = [], sBase = [], sPlan = [];
  for (let y = 0; y * 12 <= span; y++) {
    xs.push(y === 0 ? "Now" : `Yr ${y}`);
    sBase.push(base.balances[Math.min(y * 12, base.balances.length - 1)]);
    sPlan.push(plan.balances[Math.min(y * 12, plan.balances.length - 1)]);
  }
  stackedArea($("#chart-balance"), {
    ariaLabel: "Mortgage balance over time, plan versus minimum",
    xs, stacked: false, fmt: moneyShort, fmtTip: money,
    series: [
      { name: "Your plan", values: sPlan },
      { name: "Minimum only", values: sBase },
    ],
  });

  // what different monthly extras would do (same yearly/lump settings)
  const candidates = [0, 50, 100, 250, 500, 1000].filter((c) => c !== extra);
  candidates.unshift(extra);
  const rows = candidates.map((c) => {
    const s = simulateLoan(balance, rate, basePayment, { extraMonthly: c, extraYearly: extraYr, lumps });
    return s ? { extra: c, time: s.months, interest: s.totalInterest, saved: base.totalInterest - s.totalInterest, you: c === extra } : null;
  }).filter(Boolean).sort((a, b) => a.extra - b.extra);
  dataTable($("#cmp-table"), rows, [
    { h: "Extra/month", get: (r) => (r.you ? `${money(r.extra)} ← yours` : money(r.extra)) },
    { h: "Paid off in", get: (r) => years(r.time / 12) },
    { h: "Total interest", get: (r) => r.interest, fmt: money },
    { h: "Interest saved", get: (r) => r.saved, fmt: money },
  ]);

  const yearRows = [];
  for (let y = 1; y * 12 <= plan.months + 11; y++) {
    yearRows.push({ year: y, bal: plan.balances[Math.min(y * 12, plan.balances.length - 1)] });
  }
  dataTable($("#sched-table"), yearRows, [
    { h: "Year", get: (r) => r.year },
    { h: "Remaining balance", get: (r) => r.bal, fmt: money },
  ]);
}

bindCalc($("#calc"), compute);
