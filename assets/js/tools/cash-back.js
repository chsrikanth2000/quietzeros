"use strict";

import { $, bindCalc, readField, money, num2 } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { rankedBars, dataTable } from "../charts.js";
import { OFFERS_META, CARDS } from "../data/offers.js";

initToolPage("cash-back");

$("#asof-note").textContent =
  `Reward structures compiled ${OFFERS_META.asOf} from issuers' published terms. ` +
  `Issuers change offers; verify on the issuer's site before applying.`;

const CATS = ["groceries", "dining", "gas", "online", "travel", "streaming", "everything"];

/** Annual value of one card for a monthly spend map. */
function cardValue(card, spend, withBonus) {
  let earned = 0;
  const base = card.rates.everything || 1;
  for (const cat of CATS) {
    if (cat === "everything") continue;
    const annual = spend[cat] * 12;
    const rule = card.rates[cat];
    if (!rule) { earned += annual * (base / 100); continue; }
    const rate = typeof rule === "number" ? rule : rule.rate;
    const cap = typeof rule === "object" && rule.capAnnual ? rule.capAnnual : Infinity;
    const boosted = Math.min(annual, cap);
    earned += boosted * (rate / 100) + Math.max(0, annual - boosted) * (base / 100);
  }
  earned += spend.everything * 12 * (base / 100);
  // rotating 5% cards: the boosted rate covers pooled everyday categories,
  // up to the annual cap; those dollars would otherwise earn the base rate
  if (card.rotating) {
    const poolSpend = card.rotating.pool.reduce((a, c) => a + (card.rates[c] ? 0 : spend[c] * 12), 0);
    const boosted = Math.min(poolSpend, card.rotating.capAnnual);
    earned += boosted * ((card.rotating.rate - base) / 100);
  }
  if (withBonus && card.matchFirstYear) earned *= 2;
  let total = earned - card.annualFee;
  if (withBonus) total += card.bonus || 0;
  return total;
}

function compute() {
  const spend = {};
  for (const cat of CATS) spend[cat] = readField($("#" + cat));
  const withBonus = document.querySelector('input[name="bonus"]:checked').value === "yes";

  const ranked = CARDS
    .map((c) => ({ card: c, value: cardValue(c, spend, withBonus) }))
    .sort((a, b) => b.value - a.value);

  const top = ranked[0];
  const runnerUp = ranked[1];
  const totalSpend = CATS.reduce((a, c) => a + spend[c], 0) * 12;

  $("#r-label").textContent = withBonus ? "Best card, first year" : "Best card for your spending";
  $("#r-hero").textContent = top.card.name;
  const effRate = totalSpend > 0 ? (top.value / totalSpend) * 100 : 0;
  $("#r-interpret").replaceChildren(
    `Worth about `,
    Object.assign(document.createElement("strong"), { textContent: `${money(top.value)} a year` }),
    ` on your ${money(totalSpend)} of annual spending — an effective ${num2(effRate)}% back` +
    (runnerUp ? `, ${money(top.value - runnerUp.value)} ahead of ${runnerUp.card.name}.` : `.`)
  );

  rankedBars($("#chart-rank"), {
    ariaLabel: "Annual cash back by card",
    fmt: money,
    items: ranked.map((r) => ({
      name: r.card.name,
      note: r.card.annualFee > 0 ? `${r.card.headline} · $${r.card.annualFee} fee` : r.card.headline,
      value: Math.max(0, r.value),
    })),
  });

  dataTable($("#rank-table"), ranked, [
    { h: "Card", get: (r) => r.card.name },
    { h: "Structure", get: (r) => r.card.headline },
    { h: "Annual fee", get: (r) => r.card.annualFee, fmt: money },
    { h: "Sign-up bonus", get: (r) => r.card.bonus || 0, fmt: money },
    { h: withBonus ? "First-year value" : "Yearly value", get: (r) => r.value, fmt: money },
  ]);
}

bindCalc($("#calc"), compute);
