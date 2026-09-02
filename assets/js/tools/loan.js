"use strict";

import { $, bindCalc, readField, money, money2, moneyShort, num, amortize } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { stackedArea, breakdown, dataTable } from "../charts.js";

initToolPage("loan");

function compute() {
  const amount = readField($("#amount"));
  const rate = readField($("#rate"));
  const termYears = readField($("#term"));
  const months = Math.max(1, Math.round(termYears * 12));

  const sched = amortize(amount, rate, months);

  $("#r-hero").textContent = money2(sched.payment);
  $("#r-interest").textContent = money(sched.totalInterest);
  $("#r-total").textContent = money(amount + sched.totalInterest);
  $("#r-count").textContent = num(months);

  const pctOver = amount > 0 ? Math.round((sched.totalInterest / amount) * 100) : 0;
  $("#r-interpret").replaceChildren(
    `Borrowing ${money(amount)} at ${rate}% for ${termYears} years costs `,
    Object.assign(document.createElement("strong"), { textContent: money(sched.totalInterest) }),
    ` in interest — ${pctOver}% on top of what you borrowed.`
  );

  breakdown($("#chart-breakdown"), {
    ariaLabel: "Total repayment breakdown",
    fmt: money,
    items: [
      { name: "Principal", value: amount },
      { name: "Interest", value: sched.totalInterest },
    ],
  });

  if (sched.rows.length >= 2) {
    stackedArea($("#chart-amort"), {
      ariaLabel: "Principal versus interest paid per year",
      xs: sched.rows.map((r) => `Yr ${r.year}`),
      fmt: moneyShort,
      fmtTip: money,
      series: [
        { name: "Principal", values: sched.rows.map((r) => r.principal) },
        { name: "Interest", values: sched.rows.map((r) => r.interest) },
      ],
    });
  } else {
    $("#chart-amort").replaceChildren();
  }

  dataTable($("#sched-table"), sched.rows, [
    { h: "Year", get: (r) => r.year },
    { h: "Principal paid", get: (r) => r.principal, fmt: money },
    { h: "Interest paid", get: (r) => r.interest, fmt: money },
    { h: "Remaining balance", get: (r) => r.balance, fmt: money },
  ]);
}

bindCalc($("#calc"), compute);
