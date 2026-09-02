"use strict";

import { $, bindCalc, readField, money, num2 } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { breakdown, dataTable } from "../charts.js";
import { FED } from "../data/tax-2026.js";

initToolPage("rsu-withholding");

function bracketTax(taxable, brackets) {
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const [rate, start] = brackets[i];
    const end = i + 1 < brackets.length ? brackets[i + 1][1] : Infinity;
    if (taxable <= start) break;
    tax += (Math.min(taxable, end) - start) * rate / 100;
  }
  return tax;
}

function compute() {
  const status = document.querySelector('input[name="status"]:checked').value;
  const salary = readField($("#salary"));
  const rsu = readField($("#rsu"));
  const stateRate = readField($("#staterate")) / 100;
  const stateWh = readField($("#statewh")) / 100;

  const B = FED.brackets[status];
  const std = FED.standardDeduction[status];
  const medThresh = FED.fica.addlMedicareThreshold[status];

  const taxBase = bracketTax(Math.max(0, salary - std), B);
  const taxWith = bracketTax(Math.max(0, salary + rsu - std), B);
  const addlMed = (Math.max(0, salary + rsu - medThresh) - Math.max(0, salary - medThresh)) * FED.fica.addlMedicareRate / 100;
  const fedOnRSU = taxWith - taxBase + addlMed;
  const fedWithheld = Math.min(rsu, 1000000) * 0.22 + Math.max(0, rsu - 1000000) * 0.37
    + Math.max(0, Math.min(salary + rsu, medThresh + rsu) - Math.max(salary, medThresh)) * 0; // employer does withhold addl medicare over 200k paid — approximation: exclude
  const stateOnRSU = rsu * stateRate;
  const stateWithheld = rsu * stateWh;

  const owed = fedOnRSU + stateOnRSU;
  const withheld = fedWithheld + stateWithheld;
  const shortfall = owed - withheld;
  const eff = rsu > 0 ? (owed / rsu) * 100 : 0;
  const netAfter = rsu - owed;

  $("#r-hero").textContent = shortfall > 0 ? money(shortfall) : "covered (+" + money(-shortfall) + ")";
  $("#r-fedtax").textContent = money(owed);
  $("#r-withheld").textContent = money(withheld);
  $("#r-eff").textContent = `${num2(eff)}%`;
  $("#r-setaside").textContent = rsu > 0 ? money(Math.max(0, shortfall / rsu) * 10000) : "—";

  $("#r-interpret").replaceChildren(
    `On ${money(rsu)} of vests stacked atop ${money(salary)}, the real tax is ${money(owed)} (${num2(eff)}%) but withholding grabs only ${money(withheld)} — `,
    Object.assign(document.createElement("strong"), {
      textContent: shortfall > 0 ? `${money(shortfall)} lands on your April return` : "you're actually over-withheld",
    }),
    shortfall > 0 ? `. Set aside ${money(Math.max(0, shortfall / rsu) * 10000)} from every $10,000 that vests and April is boring.` : `.`
  );

  breakdown($("#chart-rsu"), {
    ariaLabel: "RSU dollars: withheld, still owed, and kept",
    fmt: money,
    items: [
      { name: "Yours after all tax", value: Math.max(0, netAfter), color: "var(--s1)" },
      { name: "Withheld already", value: withheld, color: "var(--s4)" },
      { name: "Still owed in April", value: Math.max(0, shortfall), color: "var(--s3)" },
    ],
  });

  dataTable($("#sched-table"), [
    { k: "Federal tax on income WITHOUT RSUs", v: money(taxBase) },
    { k: "Federal tax WITH RSUs stacked on top", v: money(taxWith) },
    { k: "Federal tax caused by the RSUs (+0.9% Medicare where it applies)", v: money(fedOnRSU) },
    { k: "Federal supplemental withholding (22% / 37% over $1M)", v: money(fedWithheld) },
    { k: `State tax at ${num2(stateRate * 100)}% vs withheld at ${num2(stateWh * 100)}%`, v: `${money(stateOnRSU)} vs ${money(stateWithheld)}` },
    { k: "Shortfall due at filing", v: money(Math.max(0, shortfall)) },
  ], [
    { h: "Step", get: (r) => r.k },
    { h: "Amount", get: (r) => r.v },
  ]);
}

bindCalc($("#calc"), compute);
