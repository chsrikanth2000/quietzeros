"use strict";

import { $, bindCalc, readField, money, moneyShort, num2 } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { stackedArea, dataTable } from "../charts.js";

initToolPage("compound-interest");

/** Yearly snapshots of { contributed, growth } with monthly compounding. */
export function project(initial, monthly, ratePct, yearsN) {
  const i = ratePct / 100 / 12;
  let bal = initial, contributed = initial;
  const rows = [{ year: 0, contributed, growth: 0, balance: bal }];
  for (let m = 1; m <= yearsN * 12; m++) {
    bal = bal * (1 + i) + monthly;
    contributed += monthly;
    if (m % 12 === 0) rows.push({ year: m / 12, contributed, growth: bal - contributed, balance: bal });
  }
  return rows;
}

function compute() {
  const initial = readField($("#initial"));
  const monthly = readField($("#monthly"));
  const rate = readField($("#rate"));
  const yearsN = Math.round(readField($("#years")));

  const rows = project(initial, monthly, rate, yearsN);
  const last = rows[rows.length - 1];

  $(".hero-figure .label").textContent = `Balance after ${yearsN} year${yearsN === 1 ? "" : "s"}`;
  $("#r-hero").textContent = money(last.balance);
  $("#r-contrib").textContent = money(last.contributed);
  $("#r-growth").textContent = money(last.growth);
  $("#r-mult").textContent = last.contributed > 0 ? `${num2(last.balance / last.contributed)}×` : "—";

  const crossover = rows.find((r) => r.growth > r.contributed);
  $("#r-interpret").replaceChildren(
    `Compounding at ${rate}%, growth adds `,
    Object.assign(document.createElement("strong"), { textContent: money(last.growth) }),
    ` on top of the ${money(last.contributed)} you put in`,
    crossover ? `. From year ${crossover.year}, the growth outweighs everything you contributed.` : `.`
  );

  stackedArea($("#chart-growth"), {
    ariaLabel: "Contributions versus growth over time",
    xs: rows.map((r) => (r.year === 0 ? "Now" : `Yr ${r.year}`)),
    fmt: moneyShort,
    fmtTip: money,
    series: [
      { name: "Contributed", values: rows.map((r) => r.contributed) },
      { name: "Growth", values: rows.map((r) => Math.max(0, r.growth)) },
    ],
  });

  dataTable($("#sched-table"), rows.slice(1), [
    { h: "Year", get: (r) => r.year },
    { h: "Contributed", get: (r) => r.contributed, fmt: money },
    { h: "Growth", get: (r) => r.growth, fmt: money },
    { h: "Balance", get: (r) => r.balance, fmt: money },
  ]);
}

bindCalc($("#calc"), compute);
