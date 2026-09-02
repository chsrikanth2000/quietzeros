"use strict";

import { $, initChrome } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { stackedArea, dataTable } from "../charts.js";

initToolPage("mortgage-rates");

const API = "https://qz-comments.chsrikanth2000.workers.dev/rates";
const fmtPct = (v) => `${Number(v).toFixed(v >= 10 ? 1 : 2)}%`;
const fmtDate = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

(async () => {
  let d;
  try {
    const r = await fetch(API);
    d = await r.json();
    if (!d.latest) throw new Error("unavailable");
  } catch {
    $("#r-interpret").textContent =
      "The rate feed is unreachable right now — Freddie Mac publishes every Thursday; try again shortly.";
    return;
  }
  const L = d.latest;

  $("#r-date").textContent = fmtDate(L.date30);
  $("#r-hero").textContent = fmtPct(L.r30);
  $("#r-15").textContent = fmtPct(L.r15);

  const wk = L.r30 - L.prev30;
  $("#r-wk").textContent = (wk >= 0 ? "+" : "−") + Math.abs(wk).toFixed(2) + " pts";
  const yr = L.yearAgo30 != null ? L.r30 - L.yearAgo30 : null;
  $("#r-yr").textContent = yr == null ? "—" : (yr >= 0 ? "+" : "−") + Math.abs(yr).toFixed(2) + " pts";

  const peak = d.monthly30.reduce((a, p) => (p[1] > a[1] ? p : a));
  const low = d.monthly30.reduce((a, p) => (p[1] < a[1] ? p : a));
  $("#r-max").textContent = `${fmtPct(peak[1])} (${peak[0].slice(0, 4)})`;

  $("#r-interpret").replaceChildren(
    `A ${fmtPct(L.r30)} 30-year sits `,
    Object.assign(document.createElement("strong"), {
      textContent: yr != null && Math.abs(yr) >= 0.05
        ? `${Math.abs(yr).toFixed(2)} points ${yr > 0 ? "above" : "below"} a year ago`
        : "almost exactly where it was a year ago",
    }),
    ` — and for scale, the survey's record low was ${fmtPct(low[1])} (${low[0].slice(0, 4)}), the record high ${fmtPct(peak[1])} (${peak[0].slice(0, 4)}).`
  );

  stackedArea($("#chart-history"), {
    ariaLabel: "30-year mortgage rate history since 1971",
    xs: d.monthly30.map(([ym]) => ym.slice(0, 4)),
    stacked: false,
    fmt: (v) => `${Math.round(v)}%`,
    fmtTip: fmtPct,
    series: [{ name: "30-year fixed", values: d.monthly30.map(([, v]) => v) }],
  });

  const rows = d.recent30.map(([date, r30], i) => ({
    date, r30, r15: d.recent15[i] ? d.recent15[i][1] : null,
  })).reverse();
  dataTable($("#recent-table"), rows, [
    { h: "Week of", get: (r) => fmtDate(r.date) },
    { h: "30-year", get: (r) => r.r30, fmt: fmtPct },
    { h: "15-year", get: (r) => (r.r15 == null ? "—" : fmtPct(r.r15)) },
  ]);

  $("#r-source").textContent =
    `Source: ${d.source}. Latest survey: ${fmtDate(L.date30)}. Fetched from Freddie Mac by our server; nothing about you is sent anywhere.`;
})();
