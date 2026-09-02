/* Quiet Zeros charts — hand-rolled SVG, no libraries.
   Rules baked in: one axis, thin marks, recessive hairline grid, legend for
   2+ series with direct labels, crosshair tooltip on hover, tabular figures,
   2px surface gaps between stacked fills. Colors come from CSS custom
   properties so light/dark stay validated. All text lands via textContent. */
"use strict";

import { el, svgEl, moneyShort } from "./core.js";

const registry = new Map(); // container -> render fn, so theme flips re-render

function seriesColor(i) {
  const styles = getComputedStyle(document.documentElement);
  return styles.getPropertyValue(`--s${i + 1}`).trim() || "#888";
}

document.addEventListener("qz:theme", () => {
  for (const render of registry.values()) render();
});

// re-render on resize so SVG text stays at a readable size on any screen
let resizeTimer = 0;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { for (const render of registry.values()) render(); }, 150);
});

function niceTicks(max, count = 4) {
  if (max <= 0) return [0, 1];
  const step = Math.pow(10, Math.floor(Math.log10(max / count)));
  const err = max / count / step;
  const mult = err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
  const s = mult * step;
  const ticks = [];
  for (let v = 0; v <= max + s * 0.001; v += s) ticks.push(v);
  return ticks;
}

/**
 * Stacked area chart over time (or plain lines with stacked:false).
 * cfg: { xLabel, series: [{ name, values }], xs: [labels], fmt, stacked }
 */
export function stackedArea(container, cfg) {
  const render = () => {
    container.replaceChildren();
    // size the viewBox to the actual container so text renders ~1:1 (legible on phones)
    const W = Math.max(320, Math.min(640, container.clientWidth || 640));
    const narrow = W < 460;
    const H = narrow ? 260 : 300;
    const padL = narrow ? 46 : 54, padR = narrow ? 14 : 84, padT = 14, padB = 30;
    const iw = W - padL - padR, ih = H - padT - padB;
    const n = cfg.xs.length;
    if (n < 2) return;
    const fmt = cfg.fmt || moneyShort;
    const stacked = cfg.stacked !== false;

    // stacked totals per x
    const tops = cfg.xs.map((_, xi) =>
      stacked
        ? cfg.series.reduce((a, s) => a + s.values[xi], 0)
        : Math.max(...cfg.series.map((s) => s.values[xi]))
    );
    const yMax = Math.max(...tops) * 1.04 || 1;
    const x = (xi) => padL + (xi / (n - 1)) * iw;
    const y = (v) => padT + ih - (v / yMax) * ih;

    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": cfg.ariaLabel || "Chart" });

    // grid + y ticks
    for (const t of niceTicks(yMax, narrow ? 3 : 4)) {
      svg.append(
        svgEl("line", { class: "gridline", x1: padL, x2: padL + iw, y1: y(t), y2: y(t) }),
        svgEl("text", { class: "tick", x: padL - 8, y: y(t) + 4, "text-anchor": "end" }, fmt(t))
      );
    }
    // x ticks: first, a few middles, last — skip middles that would crowd the last
    const xtickIdx = new Set([0, n - 1]);
    const stepi = Math.max(1, Math.round((n - 1) / (narrow ? 3 : 4)));
    for (let xi = stepi; xi <= n - 1 - Math.max(1, Math.ceil(stepi * 0.6)); xi += stepi) xtickIdx.add(xi);
    for (const xi of xtickIdx) {
      svg.append(svgEl("text", { class: "tick", x: x(xi), y: padT + ih + 20, "text-anchor": "middle" }, cfg.xs[xi]));
    }
    svg.append(svgEl("line", { class: "axisline", x1: padL, x2: padL + iw, y1: padT + ih, y2: padT + ih }));

    // areas / lines (bottom-up so gaps read correctly)
    let cum = new Array(n).fill(0);
    const endLabels = [];
    cfg.series.forEach((s, si) => {
      const color = seriesColor(si);
      const lower = cum.slice();
      const upper = stacked ? cum.map((c, xi) => c + s.values[xi]) : s.values.slice();
      if (stacked) cum = upper;

      if (stacked) {
        let d = `M ${x(0)} ${y(upper[0])}`;
        for (let xi = 1; xi < n; xi++) d += ` L ${x(xi)} ${y(upper[xi])}`;
        for (let xi = n - 1; xi >= 0; xi--) d += ` L ${x(xi)} ${y(lower[xi])}`;
        svg.append(svgEl("path", { d: d + " Z", fill: color, "fill-opacity": "0.82", stroke: "var(--card)", "stroke-width": "2" }));
      }
      let dl = `M ${x(0)} ${y(upper[0])}`;
      for (let xi = 1; xi < n; xi++) dl += ` L ${x(xi)} ${y(upper[xi])}`;
      svg.append(svgEl("path", { d: dl, fill: "none", stroke: color, "stroke-width": "2", "stroke-linejoin": "round" }));

      endLabels.push({ name: s.name, color, y: y(upper[n - 1]) + 4 });
    });

    // direct labels at line ends, pushed apart so they never collide
    // (narrow charts drop them — no room; the legend carries identity there)
    if (narrow) endLabels.length = 0;
    endLabels.sort((a, b) => a.y - b.y);
    for (let li = 1; li < endLabels.length; li++) {
      if (endLabels[li].y - endLabels[li - 1].y < 15) endLabels[li].y = endLabels[li - 1].y + 15;
    }
    const overflow = endLabels.length ? endLabels[endLabels.length - 1].y - (padT + ih - 2) : 0;
    for (const lb of endLabels) {
      svg.append(svgEl("text", { class: "direct-label", x: x(n - 1) + 7, y: lb.y - Math.max(0, overflow), fill: lb.color }, lb.name));
    }

    container.append(svg);

    // legend with swatches — only when there are series to tell apart
    if (cfg.series.length > 1) {
      container.append(el("div", { class: "legend" },
        ...cfg.series.map((s, si) => el("span", { class: "li" },
          el("span", { class: "swatch", style: { background: seriesColor(si) } }), s.name))));
    }

    // hover layer: crosshair + tooltip
    const tip = el("div", { class: "viz-tip", role: "status" });
    container.append(tip);
    const cross = svgEl("line", { class: "axisline", y1: padT, y2: padT + ih, visibility: "hidden" });
    svg.append(cross);

    svg.addEventListener("pointermove", (ev) => {
      const r = svg.getBoundingClientRect();
      const px = ((ev.clientX - r.left) / r.width) * W;
      if (px < padL || px > padL + iw) { tip.style.opacity = 0; cross.setAttribute("visibility", "hidden"); return; }
      const xi = Math.round(((px - padL) / iw) * (n - 1));
      cross.setAttribute("x1", x(xi)); cross.setAttribute("x2", x(xi));
      cross.setAttribute("visibility", "visible");
      tip.replaceChildren(el("div", { class: "t-head" }, cfg.xs[xi]),
        ...cfg.series.map((s, si) => el("div", { class: "t-row" },
          el("span", { class: "swatch", style: { background: seriesColor(si) } }),
          el("span", {}, s.name),
          el("span", { class: "n" }, (cfg.fmtTip || fmt)(s.values[xi]))
        )));
      const cw = container.getBoundingClientRect();
      const tx = ((x(xi) / W) * cw.width);
      tip.style.left = `${Math.min(cw.width - 170, Math.max(0, tx + 12))}px`;
      tip.style.top = "8px";
      tip.style.opacity = 1;
    });
    svg.addEventListener("pointerleave", () => { tip.style.opacity = 0; cross.setAttribute("visibility", "hidden"); });
  };
  registry.set(container, render);
  render();
}

/**
 * Single horizontal stacked breakdown bar with legend values.
 * cfg: { items: [{ name, value }], fmt }
 */
export function breakdown(container, cfg) {
  const render = () => {
    container.replaceChildren();
    const total = cfg.items.reduce((a, it) => a + it.value, 0) || 1;
    const fmt = cfg.fmt || moneyShort;

    const bar = el("div", { class: "bd-bar", role: "img", "aria-label": cfg.ariaLabel || "Breakdown" });
    const tip = el("div", { class: "viz-tip", role: "status" });

    const itemColor = (it, i) => it.color || seriesColor(i);
    cfg.items.forEach((it, i) => {
      if (it.value <= 0) return;
      const seg = el("div", {
        class: "bd-seg",
        style: { flex: String(Math.max(it.value / total, 0.015)), background: itemColor(it, i) },
        tabindex: "0",
        "aria-label": `${it.name}: ${fmt(it.value)}`,
      });
      const show = () => {
        tip.replaceChildren(el("div", { class: "t-row" },
          el("span", { class: "swatch", style: { background: itemColor(it, i) } }),
          el("span", {}, it.name),
          el("span", { class: "n" }, `${fmt(it.value)} · ${Math.round((it.value / total) * 100)}%`)));
        const sr = seg.getBoundingClientRect(), cr = container.getBoundingClientRect();
        tip.style.left = `${Math.min(cr.width - 180, Math.max(0, sr.left - cr.left))}px`;
        tip.style.top = `${sr.top - cr.top - 44}px`;
        tip.style.opacity = 1;
      };
      const hide = () => { tip.style.opacity = 0; };
      seg.addEventListener("pointerenter", show);
      seg.addEventListener("focus", show);
      seg.addEventListener("pointerleave", hide);
      seg.addEventListener("blur", hide);
      bar.append(seg);
    });

    const legend = el("div", { class: "legend" },
      ...cfg.items.filter((it) => it.value > 0).map((it, i) => el("span", { class: "li" },
        el("span", { class: "swatch", style: { background: itemColor(it, cfg.items.indexOf(it)) } }),
        `${it.name} `, el("span", { class: "val" }, fmt(it.value))))
    );
    container.style.position = "relative";
    container.append(bar, legend, tip);
  };
  registry.set(container, render);
  render();
}

/**
 * Ranked horizontal bars with emphasis: the leader gets the accent hue,
 * the rest recede to gray. items: [{ name, value, note? }] (pre-sorted).
 */
export function rankedBars(container, cfg) {
  const render = () => {
    container.replaceChildren();
    const max = Math.max(...cfg.items.map((it) => it.value), 1);
    const fmt = cfg.fmt || moneyShort;
    const list = el("div", { class: "rank-list", role: "img", "aria-label": cfg.ariaLabel || "Ranking" });
    cfg.items.forEach((it, i) => {
      const row = el("div", { class: "rank-row" + (i === 0 ? " lead" : "") },
        el("div", { class: "rank-name" }, it.name, it.note ? el("span", { class: "rank-note" }, it.note) : null),
        el("div", { class: "rank-track" },
          el("div", { class: "rank-bar", style: { width: `${Math.max((it.value / max) * 100, 1.5)}%` } })),
        el("div", { class: "rank-val" }, fmt(it.value)));
      list.append(row);
    });
    container.append(list);
  };
  registry.set(container, render);
  render();
}

/** Data table (the always-available non-color view). columns: [{h, get, fmt}] */
export function dataTable(container, rows, columns) {
  container.replaceChildren();
  const thead = el("thead", {}, el("tr", {}, ...columns.map((c) => el("th", { scope: "col" }, c.h))));
  const tbody = el("tbody", {},
    ...rows.map((r) => el("tr", {}, ...columns.map((c) => el("td", {}, c.fmt ? c.fmt(c.get(r)) : String(c.get(r)))))));
  container.append(el("div", { class: "tbl-wrap" }, el("table", { class: "data" }, thead, tbody)));
}
