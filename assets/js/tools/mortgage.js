"use strict";

import { $, bindCalc, readField, money, money2, moneyShort, pmt, amortize } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { attachRateHint } from "../rate-hint.js";
import { stackedArea, breakdown, dataTable } from "../charts.js";

initToolPage("mortgage");

const form = $("#calc");

function compute() {
  const price = readField($("#price"));
  const downPct = readField($("#down"));
  const rate = readField($("#rate"));
  const term = readField($("#term")) || 30;
  const taxY = readField($("#tax"));
  const insY = readField($("#ins"));
  const hoaM = readField($("#hoa"));

  const loan = price * (1 - downPct / 100);
  const months = term * 12;
  const pi = pmt(loan, rate, months);
  const taxM = taxY / 12, insM = insY / 12;
  const total = pi + taxM + insM + hoaM;
  const sched = amortize(loan, rate, months);

  $("#r-total").textContent = money2(total);
  $("#r-loan").textContent = money(loan);
  $("#r-interest").textContent = money(sched.totalInterest);
  $("#r-cost").textContent = money(loan + sched.totalInterest);

  const share = total > 0 ? Math.round((pi / total) * 100) : 0;
  $("#r-interpret").replaceChildren(
    `Principal & interest is ${money2(pi)} — `,
    Object.assign(document.createElement("strong"), { textContent: `${share}% of the payment` }),
    `. Over ${term} years you'd pay ${money(sched.totalInterest)} in interest on a ${money(loan)} loan.`
  );

  breakdown($("#chart-breakdown"), {
    ariaLabel: "Monthly payment breakdown",
    fmt: money2,
    items: [
      { name: "Principal & interest", value: pi },
      { name: "Property tax", value: taxM },
      { name: "Insurance", value: insM },
      { name: "HOA", value: hoaM },
    ],
  });

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

  dataTable($("#amort-table"), sched.rows, [
    { h: "Year", get: (r) => r.year },
    { h: "Principal paid", get: (r) => r.principal, fmt: money },
    { h: "Interest paid", get: (r) => r.interest, fmt: money },
    { h: "Remaining balance", get: (r) => r.balance, fmt: money },
  ]);
}

bindCalc(form, compute);
attachRateHint("rate", "30");
