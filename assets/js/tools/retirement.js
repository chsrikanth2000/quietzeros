"use strict";

import { $, el, bindCalc, readField, money, money2, moneyShort } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { stackedArea, dataTable } from "../charts.js";
import { project } from "./compound-interest.js";

initToolPage("retirement");

/* ---- deep-link prefill: lets another tool (e.g. Mortgage Lab's prepay-vs-
   invest comparison) hand off a monthly amount via URL query params. */
(() => {
  const p = new URLSearchParams(location.search);
  for (const [param, id] of [["monthly", "monthly"], ["balance", "balance"]]) {
    const v = p.get(param);
    if (v && !isNaN(Number(v))) $("#" + id).value = v;
  }
})();

function compute() {
  const age = Math.round(readField($("#age")));
  const retireInput = Math.round(readField($("#retire")));
  const retire = Math.max(retireInput, age + 1); // can't retire before next year
  const balance = readField($("#balance"));
  const monthly = readField($("#monthly"));
  const rate = readField($("#rate"));

  const yearsN = retire - age;
  const rows = project(balance, monthly, rate, yearsN);
  const last = rows[rows.length - 1];
  const draw = (last.balance * 0.04) / 12;

  $(".hero-figure .label").textContent = `Projected at age ${retire}`;
  $("#r-hero").textContent = money(last.balance);
  $("#r-contrib").textContent = money(last.contributed);
  $("#r-growth").textContent = money(last.growth);
  $("#r-income").textContent = money2(draw) + "/mo";

  $("#r-interpret").replaceChildren(
    `Over ${yearsN} years, ${money(monthly)}/month at ${rate}% grows to `,
    Object.assign(document.createElement("strong"), { textContent: money(last.balance) }),
    ` — enough to draw roughly ${money(draw)} a month under the 4% rule.`,
    retireInput <= age ? " (Retirement age was raised to at least one year from now.)" : ""
  );

  stackedArea($("#chart-growth"), {
    ariaLabel: "Contributions versus growth until retirement",
    xs: rows.map((r) => `Age ${age + r.year}`),
    fmt: moneyShort,
    fmtTip: money,
    series: [
      { name: "Contributed", values: rows.map((r) => r.contributed) },
      { name: "Growth", values: rows.map((r) => Math.max(0, r.growth)) },
    ],
  });

  dataTable($("#sched-table"), rows.filter((r) => r.year % 5 === 0 || r.year === yearsN).slice(1), [
    { h: "Age", get: (r) => age + r.year },
    { h: "Contributed", get: (r) => r.contributed, fmt: money },
    { h: "Growth", get: (r) => r.growth, fmt: money },
    { h: "Balance", get: (r) => r.balance, fmt: money },
  ]);

  const seqLink = `sequence-risk.html?nest=${Math.round(last.balance)}&age=${retire}&haswork=no`;
  $("#chain-note").replaceChildren(
    `A single average return hides the risk that matters most: `,
    el("strong", {}, "the order returns arrive in"),
    `, once you start withdrawing. `,
    el("a", { href: seqLink }, `See how sequence-of-returns risk could shake up this ${money(last.balance)} →`),
  );
}

bindCalc($("#calc"), compute);
