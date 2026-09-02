"use strict";

import { $, bindCalc, readField, money, moneyShort } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { stackedArea, dataTable } from "../charts.js";

initToolPage("social-security-breakeven");

function compute() {
  const fra = readField($("#fra"));
  const horizon = Math.round(readField($("#horizon")));

  const streams = [
    { claim: 62, monthly: fra * 0.70, name: "Claim at 62" },
    { claim: 67, monthly: fra * 1.00, name: "Claim at 67" },
    { claim: 70, monthly: fra * 1.24, name: "Claim at 70" },
  ];
  const xs = [];
  for (let age = 62; age <= horizon; age++) xs.push(String(age));
  for (const s of streams) {
    s.values = xs.map((a) => Math.max(0, (Number(a) - s.claim + 1)) * s.monthly * 12);
  }
  const crossAge = (a, b) => {
    for (let k = 0; k < xs.length; k++) if (b.values[k] > a.values[k]) return Number(xs[k]);
    return null;
  };
  const c6267 = crossAge(streams[0], streams[1]);
  const c6770 = crossAge(streams[1], streams[2]);

  $("#r-hero").textContent = c6770 ? String(c6770) : `after ${horizon}`;
  $("#r-62").textContent = money(streams[0].values[xs.length - 1]);
  $("#r-67").textContent = money(streams[1].values[xs.length - 1]);
  $("#r-70").textContent = money(streams[2].values[xs.length - 1]);
  $("#r-cross1").textContent = c6267 ? `age ${c6267}` : `after ${horizon}`;

  $("#r-interpret").replaceChildren(
    `Live past `,
    Object.assign(document.createElement("strong"), { textContent: c6770 ? `age ${c6770}` : `age ${horizon}` }),
    ` and waiting from 67 to 70 collects more in total — every year beyond adds ${money((streams[2].monthly - streams[1].monthly) * 12)} of extra annual income. ` +
    `Die before ${c6267 ?? horizon} and claiming at 62 was the winning move. Nobody knows their date; that's the whole bet.`
  );

  stackedArea($("#chart-ss"), {
    ariaLabel: "Cumulative Social Security benefits by claiming age",
    xs, stacked: false, fmt: moneyShort, fmtTip: money,
    series: streams.map((s) => ({ name: s.name, values: s.values })),
  });

  const rows = [];
  for (let age = 65; age <= horizon; age += 5) {
    const k = age - 62;
    rows.push({ age, a: streams[0].values[k], b: streams[1].values[k], c: streams[2].values[k] });
  }
  dataTable($("#sched-table"), rows, [
    { h: "By age", get: (r) => r.age },
    { h: "Claimed 62", get: (r) => r.a, fmt: money },
    { h: "Claimed 67", get: (r) => r.b, fmt: money },
    { h: "Claimed 70", get: (r) => r.c, fmt: money },
  ]);
}

bindCalc($("#calc"), compute);
