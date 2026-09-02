"use strict";

import { $, bindCalc, readField, money, moneyShort, years } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { stackedArea, dataTable } from "../charts.js";

initToolPage("debt-payoff");

const CAP_MONTHS = 12 * 60; // stop simulating at 60 years

/** Month-by-month payoff. Returns null if the payment never gains ground. */
function simulate(balance, apr, payment) {
  const i = apr / 100 / 12;
  if (payment <= balance * i) return null;
  let bal = balance, m = 0, interest = 0;
  const monthly = [balance];
  while (bal > 0.005 && m < CAP_MONTHS) {
    m++;
    const int = bal * i;
    interest += int;
    bal = Math.max(0, bal + int - payment);
    monthly.push(bal);
  }
  return { months: m, interest, monthly };
}

function compute() {
  const balance = readField($("#balance"));
  const apr = readField($("#rate"));
  const payment = readField($("#payment"));
  const extra = readField($("#extra"));

  const base = simulate(balance, apr, payment);
  const boosted = simulate(balance, apr, payment + extra);
  const interp = $("#r-interpret") || $("#r-note");

  if (!boosted) {
    const minPay = Math.ceil(balance * (apr / 100 / 12) + 1);
    $("#r-hero").textContent = "Never";
    $("#r-interest").textContent = "—";
    $("#r-saved").textContent = "—";
    $("#r-sooner").textContent = "—";
    $("#chart-balance").replaceChildren();
    $("#sched-table").replaceChildren();
    if (interp) interp.textContent =
      `That payment doesn't cover the interest, so the balance grows every month. ` +
      `You'd need at least ${money(minPay)}/month to make progress.`;
    return;
  }

  $("#r-hero").textContent = years(boosted.months / 12);
  $("#r-interest").textContent = money(boosted.interest);
  if (base && extra > 0) {
    $("#r-saved").textContent = money(base.interest - boosted.interest);
    $("#r-sooner").textContent = years((base.months - boosted.months) / 12);
    if (interp) interp.replaceChildren(
      `An extra ${money(extra)}/month clears the debt `,
      Object.assign(document.createElement("strong"), { textContent: years((base.months - boosted.months) / 12) + " sooner" }),
      ` and saves ${money(base.interest - boosted.interest)} in interest.`
    );
  } else {
    $("#r-saved").textContent = extra > 0 ? money(0) : "—";
    $("#r-sooner").textContent = base ? years(0) : "n/a";
    if (interp) interp.textContent = base
      ? `Paying ${money(payment + extra)}/month, you'll pay ${money(boosted.interest)} in interest before the balance hits zero.`
      : `The regular payment alone never pays this off — the extra ${money(extra)}/month is doing all the work.`;
  }

  // Chart: sample yearly points from both monthly series (lines, not stacked)
  const span = Math.max(boosted.months, base ? base.months : 0);
  const yearsN = Math.ceil(span / 12);
  const xs = [], sBoost = [], sBase = [];
  for (let y = 0; y <= yearsN; y++) {
    const m = Math.min(y * 12, span);
    xs.push(y === 0 ? "Now" : `Yr ${y}`);
    sBoost.push(boosted.monthly[Math.min(m, boosted.monthly.length - 1)]);
    if (base) sBase.push(base.monthly[Math.min(m, base.monthly.length - 1)]);
  }
  const series = [{ name: extra > 0 ? "With extra" : "Balance", values: sBoost }];
  if (base && extra > 0) series.push({ name: "Regular only", values: sBase });

  if (xs.length >= 2) {
    stackedArea($("#chart-balance"), {
      ariaLabel: "Debt balance over time",
      xs, series, stacked: false, fmt: moneyShort, fmtTip: money,
    });
  } else {
    $("#chart-balance").replaceChildren();
  }

  const rows = xs.map((label, idx) => ({
    label, bal: sBoost[idx],
    paid: Math.min((payment + extra) * idx * 12, balance + boosted.interest),
  })).filter((r, idx) => idx > 0);
  dataTable($("#sched-table"), rows, [
    { h: "Point", get: (r) => r.label },
    { h: "Remaining balance", get: (r) => r.bal, fmt: money },
  ]);
}

bindCalc($("#calc"), compute);
