"use strict";

import { $, bindCalc, readField, money, money2, num2 } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { breakdown, dataTable } from "../charts.js";

initToolPage("real-hourly-wage");

function compute() {
  const revenue = readField($("#revenue"));
  const materials = readField($("#materials"));
  const fees = readField($("#fees"));
  const other = readField($("#other"));
  const miles = readField($("#miles"));
  const mileRate = readField($("#milerate")) / 100;
  const marg = readField($("#marg")) / 100;
  const hours = Math.max(1, readField($("#hours")));

  const mileage = miles * mileRate;
  const profit = Math.max(0, revenue - materials - fees - other - mileage);
  const seTax = profit * 0.9235 * 0.153;
  const incTax = Math.max(0, (profit - seTax / 2) * marg);
  const net = profit - seTax - incTax;
  const wage = net / hours;

  $("#r-hero").textContent = money2(wage) + "/hr";
  $("#r-profit").textContent = money(profit);
  $("#r-setax").textContent = money(seTax);
  $("#r-inctax").textContent = money(incTax);
  $("#r-net").textContent = money(net);

  const grossWage = revenue / hours;
  $("#r-interpret").replaceChildren(
    `Revenue says ${money2(grossWage)}/hr. After costs and both taxes, `,
    Object.assign(document.createElement("strong"), { textContent: `${money2(wage)}/hr` }),
    wage < 7.25 && revenue > 0
      ? ` — below the federal minimum wage. Worth doing for love, maybe; for money, the numbers disagree.`
      : ` is what an hour of this actually earns you.`
  );

  breakdown($("#chart-hustle"), {
    ariaLabel: "Where the revenue goes",
    fmt: money,
    items: [
      { name: "Take-home", value: net, color: "var(--s1)" },
      { name: "Costs & mileage", value: materials + fees + other + mileage, color: "var(--s3)" },
      { name: "SE tax", value: seTax, color: "var(--s4)" },
      { name: "Income tax", value: incTax, color: "var(--s2)" },
    ],
  });

  dataTable($("#sched-table"), [
    { k: "Revenue", v: money(revenue) },
    { k: "Materials & supplies", v: "− " + money(materials) },
    { k: "Platform & payment fees", v: "− " + money(fees) },
    { k: "Other costs", v: "− " + money(other) },
    { k: `Mileage (${num2(miles)} mi × ${num2(mileRate * 100)}¢)`, v: "− " + money(mileage) },
    { k: "Profit (Schedule C)", v: money(profit) },
    { k: "Self-employment tax (15.3% of 92.35%)", v: "− " + money(seTax) },
    { k: `Income tax (${num2(marg * 100)}% marginal, after ½ SE deduction)`, v: "− " + money(incTax) },
    { k: "Take-home", v: money(net) },
    { k: `÷ ${num2(hours)} hours`, v: money2(wage) + "/hr" },
  ], [
    { h: "Line", get: (r) => r.k },
    { h: "Monthly", get: (r) => r.v },
  ]);
}

bindCalc($("#calc"), compute);
