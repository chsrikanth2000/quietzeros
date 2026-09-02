"use strict";

import { $, bindCalc, readField, money, num2 } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { breakdown, dataTable } from "../charts.js";

initToolPage("backdoor-roth");

function compute() {
  const pretax = readField($("#pretax"));
  const basis = readField($("#basis"));
  const convert = Math.min(readField($("#convert")), pretax + basis || 1);
  const marg = readField($("#marg")) / 100;

  const pot = pretax + basis;
  const taxablePct = pot > 0 ? pretax / pot : 0;
  const taxableAmt = convert * taxablePct;
  const freeAmt = convert - taxableAmt;
  const tax = taxableAmt * marg;
  const basisLeft = basis - freeAmt;

  $("#r-hero").textContent = `${num2(taxablePct * 100)}%`;
  $("#r-tax").textContent = money(tax);
  $("#r-free").textContent = money(freeAmt);
  $("#r-left").textContent = money(Math.max(0, basisLeft));

  $("#r-interpret").replaceChildren(
    pretax === 0
      ? `Clean backdoor: with no pre-tax IRA money, the conversion is essentially tax-free — this is the textbook case.`
      : `Because ${money(pretax)} of pre-tax money sits in your IRAs, `,
    pretax === 0 ? "" : Object.assign(document.createElement("strong"), {
      textContent: `${num2(taxablePct * 100)}% of every converted dollar is taxable`,
    }),
    pretax === 0 ? "" : ` — this conversion costs ${money(tax)}. Roll the pre-tax money into your 401(k) first and the same conversion costs roughly $0, saving ${money(tax)}.`
  );

  breakdown($("#chart-prorata"), {
    ariaLabel: "Taxable versus tax-free share of the conversion",
    fmt: money,
    items: [
      { name: "Tax-free (your basis)", value: freeAmt, color: "var(--s1)" },
      { name: "Taxable (pro-rata)", value: taxableAmt, color: "var(--s3)" },
    ],
  });

  dataTable($("#sched-table"), [
    { k: "All pre-tax IRA money (Dec 31)", v: money(pretax) },
    { k: "After-tax basis added", v: money(basis) },
    { k: "Total IRA pot", v: money(pot) },
    { k: "Pre-tax share of the pot", v: `${num2(taxablePct * 100)}%` },
    { k: `Converting ${money(convert)} → taxable`, v: money(taxableAmt) },
    { k: `Tax at your ${num2(marg * 100)}% rate`, v: money(tax) },
    { k: "If pre-tax rolled into a 401(k) first", v: pretax > 0 ? `tax ≈ $0 (saves ${money(tax)})` : "already clean" },
  ], [
    { h: "Step", get: (r) => r.k },
    { h: "Amount", get: (r) => r.v },
  ]);
}

bindCalc($("#calc"), compute);
