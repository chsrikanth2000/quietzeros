"use strict";

import { $, bindCalc, readField, money, moneyShort } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { stackedArea, dataTable } from "../charts.js";

initToolPage("sequence-risk");

function chipVal(name) {
  const c = document.querySelector(`input[name="${name}"]:checked`);
  return c ? c.value : "no";
}
function updateWorkUI() {
  $("#work-fields").hidden = chipVal("haswork") !== "yes";
}
for (const r of document.querySelectorAll('input[name="haswork"]')) r.addEventListener("change", updateWorkUI);
updateWorkUI();

/* ---- deep-link prefill: lets another tool (e.g. the retirement projection)
   hand off its projected balance and retirement age via URL query params —
   nothing is sent anywhere, this only reads the URL the visitor already has. */
(() => {
  const p = new URLSearchParams(location.search);
  for (const [param, id] of [["nest", "nest"], ["age", "age"]]) {
    const v = p.get(param);
    if (v && !isNaN(Number(v))) $("#" + id).value = v;
  }
  const haswork = p.get("haswork");
  if (haswork === "yes" || haswork === "no") {
    const opt = document.querySelector(`input[name="haswork"][value="${haswork}"]`);
    if (opt) { opt.checked = true; updateWorkUI(); }
  }
})();

/** Grows today's portfolio deterministically through the contribution years —
 * a crash while still buying in is a discount, not a disaster, so sequence
 * risk doesn't apply here; it only matters once withdrawals start. */
function projectToRetirement(nest, contribYears, contribAmt, avgReturnPct) {
  let bal = nest;
  for (let i = 0; i < contribYears; i++) bal = bal * (1 + avgReturnPct / 100) + contribAmt;
  return bal;
}

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
  const age = Math.round(readField($("#age")));
  const working = chipVal("haswork") === "yes";
  const contribYears = working ? Math.round(readField($("#workyrs"))) : 0;
  const contribAmt = working ? readField($("#contrib")) : 0;
  const retireAge = age + contribYears;

  const nestAtRetirement = projectToRetirement(nest, contribYears, contribAmt, avg);
  $("#r-atret").textContent = money(nestAtRetirement);

  const base = returnSet(avg, vol, yrs);
  const bad = run(nestAtRetirement, spend, base);                    // worst years first
  const good = run(nestAtRetirement, spend, [...base].reverse());    // best years first
  // neutral: zigzag low/high pairing — same multiset, no early streaks
  const zig = [];
  for (let i = 0; i < Math.ceil(yrs / 2); i++) {
    zig.push(base[yrs - 1 - i]);
    if (i !== yrs - 1 - i) zig.push(base[i]);
  }
  const flat = run(nestAtRetirement, spend, zig);

  const endBad = bad[bad.length - 1], endGood = good[good.length - 1], endFlat = flat[flat.length - 1];
  $("#r-hero").textContent = money(endGood - endBad);
  $("#r-bad").textContent = endBad > 0 ? money(endBad) : "ran out";
  $("#r-flat").textContent = endFlat > 0 ? money(endFlat) : "ran out";
  $("#r-good").textContent = money(endGood);

  const failYear = bad.findIndex((b) => b <= 0);
  $("#r-interpret").replaceChildren(
    working
      ? `Contributing ${money(contribAmt)}/yr for ${contribYears} more years grows today's ${money(nest)} to about ${money(nestAtRetirement)} by age ${retireAge}. From there, identical returns averaging ${avg}%, identical ${money(spend)} withdrawals — only the order differs. `
      : `Identical returns averaging ${avg}%, identical ${money(spend)} withdrawals — only the order differs. `,
    Object.assign(document.createElement("strong"), {
      textContent: failYear > 0
        ? `With the bad years first, the money runs out at age ${retireAge + failYear}.`
        : `The ordering alone moves the ending by ${money(endGood - endBad)}.`,
    }),
    ` Without withdrawals all three paths would end identically — withdrawals are what make sequence a risk.`
  );

  const xs = [];
  for (let y = 0; y <= yrs; y++) xs.push(y === 0 ? `Age ${retireAge}` : `Age ${retireAge + y}`);
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
  for (let y = 1; y <= yrs; y++) rows.push({ age: retireAge + y, b: bad[y], f: flat[y], g: good[y] });
  dataTable($("#sched-table"), rows, [
    { h: "Age", get: (r) => r.age },
    { h: "Crash first", get: (r) => r.b, fmt: money },
    { h: "No streaks", get: (r) => r.f, fmt: money },
    { h: "Boom first", get: (r) => r.g, fmt: money },
  ]);
}

bindCalc($("#calc"), compute);
