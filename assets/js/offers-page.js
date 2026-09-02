/* Best-accounts page — renders the offer tables from the open data file.
   Affiliate links: if an entry has `aff`, that URL is used with
   rel="sponsored noopener" (FTC + SEO correct); otherwise the plain
   institution URL with rel="noopener". Ranking is by the numbers alone. */
"use strict";

import { $, $$, el, initChrome, money } from "./core.js";
import { OFFERS_META, HYSA, CHECKING, CARDS } from "./data/offers.js";

initChrome();

for (const n of $$("[data-asof]")) n.textContent = `Rates checked ${OFFERS_META.asOf}`;

function offerLink(o, label) {
  const url = o.aff || o.url;
  if (!url) return el("span", { class: "q-note" }, label);
  return el("a", {
    class: "dl-btn", href: url,
    rel: o.aff ? "sponsored noopener" : "noopener",
    target: "_blank",
  }, label + " ↗");
}

// High-yield savings: ranked rows, APY leads
$("#hysa-list").append(el("div", { class: "dl-grid" },
  ...HYSA.map((b, i) => el("div", { class: "dl-card" },
    el("h3", {}, `${i + 1}. ${b.bank}`),
    el("p", { class: "impact", style: { color: "var(--brand)", fontSize: "1.4rem", fontWeight: "680", margin: "0" } }, `${b.apy.toFixed(2)}% APY`),
    el("p", {}, b.notes),
    el("p", { class: "meta" }, b.min > 0 ? `Minimum: ${money(b.min)}` : "No minimum"),
    offerLink(b, "View account")))));

// Checking
$("#checking-list").append(el("div", { class: "dl-grid" },
  ...CHECKING.map((b) => el("div", { class: "dl-card" },
    el("h3", {}, b.bank),
    el("p", {}, b.notes),
    el("p", { class: "meta" }, b.bonus ? `Sign-up bonus: ${b.bonus}` : "No current bonus"),
    offerLink(b, "View account")))));

// Cards grouped by their category label
$("#cards-list").append(el("div", { class: "dl-grid" },
  ...CARDS.map((c) => el("div", { class: "dl-card" },
    el("p", { class: "kicker tight" }, c.category),
    el("h3", {}, c.name),
    el("p", {}, c.headline + (c.bonus ? ` Sign-up bonus: ${money(c.bonus)}.` : "")),
    el("p", { class: "meta" }, c.annualFee > 0 ? `Annual fee: ${money(c.annualFee)}` : "No annual fee"),
    offerLink(c, "View card")))));
