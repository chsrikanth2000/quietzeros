"use strict";

import { $, bindCalc, readField, money, money2, moneyShort, num } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { stackedArea, dataTable } from "../charts.js";

initToolPage("savings-goal");

function compute() {
  const goal = readField($("#goal"));
  const current = readField($("#current"));
  const yearsN = readField($("#years"));
  const rate = readField($("#rate"));

  const n = Math.max(1, Math.round(yearsN * 12));
  const i = rate / 100 / 12;
  const growthFactor = Math.pow(1 + i, n);
  const fvCurrent = current * growthFactor;

  let monthly;
  if (fvCurrent >= goal) monthly = 0;
  else if (i === 0) monthly = (goal - fvCurrent) / n;
  else monthly = (goal - fvCurrent) * i / (growthFactor - 1);

  const deposits = monthly * n;
  const interest = Math.max(0, goal - current - deposits);

  $("#r-hero").textContent = money2(monthly);
  $("#r-deposits").textContent = money(deposits);
  $("#r-interest").textContent = money(interest);
  $("#r-months").textContent = num(n);

  $("#r-interpret").replaceChildren(
    monthly === 0
      ? `Good news: what you've already saved reaches ${money(goal)} on its own by then.`
      : `${money2(monthly)} a month for ${num(n)} months, plus `,
    monthly === 0 ? "" : Object.assign(document.createElement("strong"), { textContent: money(interest) + " in interest" }),
    monthly === 0 ? "" : `, takes you from ${money(current)} to ${money(goal)}.`
  );

  // projection rows (monthly balance, sampled yearly-ish)
  const points = [];
  let bal = current;
  points.push({ m: 0, bal });
  for (let m = 1; m <= n; m++) {
    bal = bal * (1 + i) + monthly;
    points.push({ m, bal });
  }
  const step = n <= 24 ? 3 : 12;
  const xs = [], vals = [];
  for (let m = 0; m <= n; m += step) {
    xs.push(m === 0 ? "Now" : (step === 12 ? `Yr ${m / 12}` : `Mo ${m}`));
    vals.push(points[m].bal);
  }
  if (xs[xs.length - 1] !== `Mo ${n}` && n % step !== 0) { xs.push(step === 12 ? `Yr ${(n / 12).toFixed(1)}` : `Mo ${n}`); vals.push(points[n].bal); }

  if (xs.length >= 2) {
    stackedArea($("#chart-progress"), {
      ariaLabel: "Projected savings balance",
      xs, fmt: moneyShort, fmtTip: money,
      series: [{ name: "Balance", values: vals }],
    });
  } else {
    $("#chart-progress").replaceChildren();
  }

  const yearRows = [];
  for (let y = 1; y * 12 <= n; y++) yearRows.push({ year: y, bal: points[y * 12].bal });
  if (n % 12 !== 0) yearRows.push({ year: +(n / 12).toFixed(2), bal: points[n].bal });
  dataTable($("#sched-table"), yearRows, [
    { h: "Year", get: (r) => r.year },
    { h: "Balance", get: (r) => r.bal, fmt: money },
  ]);
}

bindCalc($("#calc"), compute);
