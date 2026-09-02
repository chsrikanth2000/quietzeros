/* Live-rate hint for mortgage-rate inputs: shows this week's Freddie Mac
   average under the field, expands an inline history chart on demand (no tab
   switch), and one-click applies the rate. Data comes from our own worker. */
"use strict";

import { $, el } from "./core.js";
import { stackedArea } from "./charts.js";

const API = "https://qz-comments.chsrikanth2000.workers.dev/rates";
let cache = null;
async function rates() {
  if (cache) return cache;
  const r = await fetch(API);
  cache = await r.json();
  if (!cache.latest) throw new Error("unavailable");
  return cache;
}

/** Attach under the given rate input. kind: "30" | "15". */
export function attachRateHint(inputId, kind = "30") {
  const input = $("#" + inputId);
  if (!input) return;
  const field = input.closest(".field");
  if (!field) return;

  rates().then((d) => {
    const cur = kind === "15" ? d.latest.r15 : d.latest.r30;
    const label = kind === "15" ? "15-yr" : "30-yr";

    const useBtn = el("button", { class: "btn-ghost", type: "button" }, `use ${cur.toFixed(2)}%`);
    const chartBtn = el("button", { class: "btn-ghost", type: "button", "aria-expanded": "false" }, "history");
    const hint = el("p", { class: "rate-hint" },
      `This week's ${label} average: `,
      el("strong", {}, `${cur.toFixed(2)}%`),
      " · ", useBtn, " · ", chartBtn,
      el("span", { class: "q-note" }, " (Freddie Mac)"));
    const panel = el("div", { class: "rate-panel", hidden: "" },
      el("p", { class: "chart-title" }, `${label} fixed, monthly averages since ${kind === "15" ? "1991" : "1971"}`),
      el("div", { class: "chart" }));
    field.append(hint, panel);

    useBtn.addEventListener("click", () => {
      input.value = String(cur);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    let drawn = false;
    chartBtn.addEventListener("click", () => {
      const open = !panel.hidden;
      panel.hidden = open;
      chartBtn.setAttribute("aria-expanded", String(!open));
      if (!open && !drawn) {
        drawn = true;
        const series = kind === "15" ? d.monthly15 : d.monthly30;
        stackedArea(panel.querySelector(".chart"), {
          ariaLabel: `${label} mortgage rate history`,
          xs: series.map(([ym]) => ym.slice(0, 4)),
          stacked: false,
          fmt: (v) => `${Math.round(v)}%`,
          fmtTip: (v) => `${Number(v).toFixed(2)}%`,
          series: [{ name: `${label} fixed`, values: series.map(([, v]) => v) }],
        });
      }
    });
  }).catch(() => { /* offline: the plain input stands */ });
}
