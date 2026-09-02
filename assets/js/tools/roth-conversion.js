"use strict";

import { $, bindCalc, readField, money, moneyShort, years } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { stackedArea, dataTable } from "../charts.js";
import { FED } from "../data/tax-2026.js";

initToolPage("roth-conversion");

function bracketTax(taxable, brackets) {
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const [rate, start] = brackets[i];
    const end = i + 1 < brackets.length ? brackets[i + 1][1] : Infinity;
    if (taxable <= start) break;
    tax += (Math.min(taxable, end) - start) * rate / 100;
  }
  return tax;
}

function compute() {
  const status = document.querySelector('input[name="status"]:checked').value;
  const trad = readField($("#trad"));
  const taxable = readField($("#taxable"));
  const ceilRate = Number($("#ceiling").value);
  const growth = readField($("#growth")) / 100;

  const B = FED.brackets[status];
  const idx = B.findIndex(([r]) => r === ceilRate);
  const top = idx + 1 < B.length ? B[idx + 1][1] : Infinity;

  const space = top - taxable;
  if (space <= 0) {
    $("#r-hero").textContent = "no room";
    $("#r-interpret").textContent =
      `Your income already fills the ${ceilRate}% bracket (its top is ${money(top)}). Pick a higher ceiling, or wait for a lower-income year.`;
    ["#r-annual", "#r-tax", "#r-lump"].forEach((id) => { $(id).textContent = "—"; });
    $("#chart-conv").replaceChildren();
    $("#sched-table").replaceChildren();
    return;
  }

  let bal = trad, totalTax = 0;
  const rows = [], balances = [trad];
  for (let y = 1; y <= 40 && bal > 0.5; y++) {
    const conv = Math.min(space, bal);
    const tax = bracketTax(taxable + conv, B) - bracketTax(taxable, B);
    totalTax += tax;
    bal = (bal - conv) * (1 + growth);
    rows.push({ y, conv, tax, bal });
    balances.push(bal);
  }
  const done = bal <= 0.5;
  const lumpTax = bracketTax(taxable + trad, B) - bracketTax(taxable, B);

  $("#r-hero").textContent = done ? years(rows.length) : "40+ years";
  $("#r-annual").textContent = money(rows[0].conv);
  $("#r-tax").textContent = money(totalTax);
  $("#r-lump").textContent = money(lumpTax);

  $("#r-interpret").replaceChildren(
    done
      ? `Converting ${money(space)} a year keeps every dollar at ${ceilRate}% or below and empties the account in ${rows.length} years, costing `
      : `At this ceiling the balance grows faster than you convert — after 40 years it still isn't empty. Tax so far: `,
    Object.assign(document.createElement("strong"), { textContent: money(totalTax) }),
    done ? ` — versus ${money(lumpTax)} converting everything this year (${money(lumpTax - totalTax)} more, paid at top brackets).`
         : `. Raise the ceiling or accept a partial conversion.`
  );

  const xs = balances.map((_, i) => (i === 0 ? "Now" : `Yr ${i}`));
  stackedArea($("#chart-conv"), {
    ariaLabel: "Traditional balance drawdown",
    xs, stacked: false, fmt: moneyShort, fmtTip: money,
    series: [{ name: "Traditional balance", values: balances }],
  });

  dataTable($("#sched-table"), rows, [
    { h: "Year", get: (r) => r.y },
    { h: "Convert", get: (r) => r.conv, fmt: money },
    { h: "Tax that year", get: (r) => r.tax, fmt: money },
    { h: "Balance left (grown)", get: (r) => r.bal, fmt: money },
  ]);
}

bindCalc($("#calc"), compute);
