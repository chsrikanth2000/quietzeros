"use strict";

import { $, bindCalc, readField, money, moneyShort } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { stackedArea, dataTable } from "../charts.js";

initToolPage("sequence-risk");

/** One fixed multiset of returns (avg ± spread), run in a given order. */
function returnSet(avg, vol, n) {
  const rs = [];
  for (let i = 0; i < n; i++) rs.push(avg + vol * ((2 * i) / (n - 1) - 1) * 1.5);
  return rs; // ascending; arithmetic mean = avg exactly
}
function run(nest, spend, returns) {
  let bal = nest;
  const path = [bal];
  for (const r of returns) {
    bal = Math.max(0, (bal - spend) * (1 + r / 100));
    path.push(bal);
  }
  return path;
}

function compute() {
  const nest = readField($("#nest"));
  const spend = readField($("#spend"));
  const avg = readField($("#avg"));
  const vol = readField($("#vol"));
  const yrs = Math.round(readField($("#yrs")));

  const base = returnSet(avg, vol, yrs);
  const bad = run(nest, spend, base);                    // worst years first
  const good = run(nest, spend, [...base].reverse());    // best years first
  // neutral: zigzag low/high pairing — same multiset, no early streaks
  const zig = [];
  for (let i = 0; i < Math.ceil(yrs / 2); i++) {
    zig.push(base[yrs - 1 - i]);
    if (i !== yrs - 1 - i) zig.push(base[i]);
  }
  const flat = run(nest, spend, zig);

  const endBad = bad[bad.length - 1], endGood = good[good.length - 1], endFlat = flat[flat.length - 1];
  $("#r-hero").textContent = money(endGood - endBad);
  $("#r-bad").textContent = endBad > 0 ? money(endBad) : "ran out";
  $("#r-flat").textContent = endFlat > 0 ? money(endFlat) : "ran out";
  $("#r-good").textContent = money(endGood);

  const failYear = bad.findIndex((b) => b <= 0);
  $("#r-interpret").replaceChildren(
    `Identical returns averaging ${avg}%, identical ${money(spend)} withdrawals — only the order differs. `,
    Object.assign(document.createElement("strong"), {
      textContent: failYear > 0
        ? `With the bad years first, the money runs out in year ${failYear}.`
        : `The ordering alone moves the ending by ${money(endGood - endBad)}.`,
    }),
    ` Without withdrawals all three paths would end identically — withdrawals are what make sequence a risk.`
  );

  const xs = [];
  for (let y = 0; y <= yrs; y++) xs.push(y === 0 ? "Now" : `Yr ${y}`);
  stackedArea($("#chart-seq"), {
    ariaLabel: "Portfolio balance under three return orderings",
    xs, stacked: false, fmt: moneyShort, fmtTip: money,
    series: [
      { name: "Boom first", values: good },
      { name: "No streaks", values: flat },
      { name: "Crash first", values: bad },
    ],
  });

  const rows = [];
  for (let y = 1; y <= yrs; y++) rows.push({ y, b: bad[y], f: flat[y], g: good[y] });
  dataTable($("#sched-table"), rows, [
    { h: "Year", get: (r) => r.y },
    { h: "Crash first", get: (r) => r.b, fmt: money },
    { h: "No streaks", get: (r) => r.f, fmt: money },
    { h: "Boom first", get: (r) => r.g, fmt: money },
  ]);
}

bindCalc($("#calc"), compute);
