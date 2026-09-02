"use strict";

import { $, bindCalc, readField, money, money2, moneyShort, years, pmt, simulateLoan } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { attachRateHint } from "../rate-hint.js";
import { stackedArea, dataTable } from "../charts.js";

initToolPage("refinance");

function compute() {
  const balance = readField($("#balance"));
  const rate = readField($("#rate"));
  const remYears = readField($("#remyears"));
  const newRate = readField($("#newrate"));
  const newTerm = readField($("#newterm")) || 30;
  const closing = readField($("#closing"));
  const rollin = document.querySelector('input[name="rollin"]:checked').value === "yes";

  const oldPay = pmt(balance, rate, Math.round(remYears * 12));
  const newBalance = balance + (rollin ? closing : 0);
  const newPay = pmt(newBalance, newRate, newTerm * 12);
  const upfront = rollin ? 0 : closing;

  const oldSim = simulateLoan(balance, rate, oldPay, {});
  const newSim = simulateLoan(newBalance, newRate, newPay, {});
  const samePaySim = newPay < oldPay ? simulateLoan(newBalance, newRate, oldPay, {}) : null;
  if (!oldSim || !newSim) { $("#r-hero").textContent = "—"; return; }

  const monthlySave = oldPay - newPay;
  $("#r-hero").textContent = (monthlySave >= 0 ? "−" : "+") + money2(Math.abs(monthlySave)) + "/mo";
  $("#r-newpay").textContent = money2(newPay);

  // break-even: first month cumulative old outflow exceeds cumulative new outflow (+ upfront)
  let be = null, cumOld = 0, cumNew = upfront;
  for (let m = 1; m <= Math.max(oldSim.months, newSim.months); m++) {
    cumOld += m <= oldSim.months ? oldPay : 0;
    cumNew += m <= newSim.months ? newPay : 0;
    if (be === null && cumNew < cumOld) { be = m; break; }
  }
  $("#r-breakeven").textContent = be ? years(be / 12) : "never";

  const totalOld = oldPay * oldSim.months;
  const totalNew = newPay * newSim.months + upfront;
  const lifetime = totalOld - totalNew;
  $("#r-lifetime").textContent = (lifetime >= 0 ? "saves " : "costs ") + money(Math.abs(lifetime));
  $("#r-samepay").textContent = samePaySim ? years(samePaySim.months / 12) : "n/a";

  $("#r-interpret").replaceChildren(
    monthlySave > 0
      ? `The payment drops ${money2(monthlySave)}. You'd claw back the ${money(closing)} of closing costs in `
      : `The new payment is higher — this only makes sense for a shorter term or cash needs. Break-even: `,
    Object.assign(document.createElement("strong"), { textContent: be ? years(be / 12) : "never" }),
    lifetime >= 0
      ? `, and over both loans' lives you come out ${money(lifetime)} ahead.`
      : `. But over the full term it costs ${money(Math.abs(lifetime))} more — the reset clock is doing that; see the keep-old-payment escape below.`
  );

  // cumulative out-the-door cost, sampled yearly
  const span = Math.max(oldSim.months, newSim.months);
  const xs = [], cOld = [], cNew = [];
  for (let y = 0; y * 12 <= span; y++) {
    const m = y * 12;
    xs.push(y === 0 ? "Now" : `Yr ${y}`);
    cOld.push(oldPay * Math.min(m, oldSim.months));
    cNew.push(upfront + newPay * Math.min(m, newSim.months));
  }
  stackedArea($("#chart-cost"), {
    ariaLabel: "Cumulative cost, staying put versus refinancing",
    xs, stacked: false, fmt: moneyShort, fmtTip: money,
    series: [
      { name: "Refinance", values: cNew },
      { name: "Stay put", values: cOld },
    ],
  });

  const rows = [];
  for (let y = 1; y * 12 <= span + 11; y++) {
    rows.push({
      year: y,
      oldBal: oldSim.balances[Math.min(y * 12, oldSim.balances.length - 1)],
      newBal: newSim.balances[Math.min(y * 12, newSim.balances.length - 1)],
    });
  }
  dataTable($("#sched-table"), rows, [
    { h: "Year", get: (r) => r.year },
    { h: "Stay put — balance", get: (r) => r.oldBal, fmt: money },
    { h: "Refinance — balance", get: (r) => r.newBal, fmt: money },
  ]);
}

bindCalc($("#calc"), compute);
attachRateHint("newrate", "30");
