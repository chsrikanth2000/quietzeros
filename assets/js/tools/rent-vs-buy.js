"use strict";

import { $, bindCalc, readField, money, moneyShort, pmt } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { attachRateHint } from "../rate-hint.js";
import { stackedArea, dataTable } from "../charts.js";

initToolPage("rent-vs-buy");

const SELL_COST = 0.06, BUY_CLOSING = 0.03, PMI_RATE = 0.008;

function compute() {
  const price = readField($("#price"));
  const downPct = readField($("#down")) / 100;
  const rate = readField($("#rate"));
  const propTax = readField($("#proptax")) / 100;
  const maint = readField($("#maint")) / 100;
  const appre = readField($("#appre")) / 100;
  const rent0 = readField($("#rent"));
  const rentGrow = readField($("#rentgrow")) / 100;
  const invest = readField($("#invest")) / 100 / 12;
  const horizon = Math.round(readField($("#horizon")));

  const down = price * downPct;
  const loan = price - down;
  const mortPay = pmt(loan, rate, 360);
  const i = rate / 100 / 12;

  let bal = loan, value = price, rent = rent0;
  let rentPort = down + price * BUY_CLOSING; // what the renter invests instead
  let ownPort = 0;                            // owner invests months they're cheaper
  const xs = ["Now"], ownNW = [], rentNW = [];
  ownNW.push(value * (1 - SELL_COST) - bal - price * BUY_CLOSING + 0); // day-0 mark
  rentNW.push(rentPort - price * BUY_CLOSING + price * BUY_CLOSING);   // = invested funds
  rentNW[0] = rentPort;

  const rows = [];
  let cross = null;
  for (let m = 1; m <= horizon * 12; m++) {
    const interest = bal * i;
    const principal = Math.min(mortPay - interest, bal);
    bal = Math.max(0, bal - principal);
    const pmi = bal / value > 0.8 ? (loan * PMI_RATE) / 12 : 0;
    const ownCost = mortPay + (value * propTax) / 12 + (value * maint) / 12 + pmi;
    const rentCost = rent;
    const diff = ownCost - rentCost;
    rentPort = rentPort * (1 + invest) + Math.max(0, diff);
    ownPort = ownPort * (1 + invest) + Math.max(0, -diff);
    value *= Math.pow(1 + appre, 1 / 12);
    if (m % 12 === 0) {
      rent *= 1 + rentGrow;
      const own = value * (1 - SELL_COST) - bal + ownPort;
      const rnw = rentPort;
      xs.push(`Yr ${m / 12}`);
      ownNW.push(own); rentNW.push(rnw);
      rows.push({ y: m / 12, own, rnw });
      if (cross === null && own >= rnw) cross = m / 12;
    }
  }

  const ownEnd = ownNW[ownNW.length - 1], rentEnd = rentNW[rentNW.length - 1];
  const lead = ownEnd - rentEnd;
  $("#r-hero").textContent = (lead >= 0 ? "" : "−") + money(Math.abs(lead)) + (lead >= 0 ? " ahead" : " behind");
  $("#r-own").textContent = money(ownEnd);
  $("#r-rentnw").textContent = money(rentEnd);
  $("#r-cross").textContent = cross === null ? `beyond ${horizon} yrs` : cross === 1 ? "year 1" : `year ${cross}`;

  $("#r-interpret").replaceChildren(
    `Counting the invested ${money(down + price * BUY_CLOSING)} the renter keeps working, plus maintenance, ` +
    `property tax${downPct < 0.2 ? ", PMI" : ""} and a 6% sale cost, `,
    Object.assign(document.createElement("strong"), {
      textContent: lead >= 0
        ? `buying wins by ${money(lead)} after ${horizon} years`
        : `renting wins by ${money(-lead)} after ${horizon} years`,
    }),
    cross === null
      ? ` — and buying never catches up inside your stay.`
      : ` — the paths cross in year ${cross}; stay shorter than that and renting was the better trade.`
  );

  stackedArea($("#chart-rvb"), {
    ariaLabel: "Net worth over time, owner versus renter",
    xs, stacked: false, fmt: moneyShort, fmtTip: money,
    series: [
      { name: "Owner", values: ownNW },
      { name: "Renter", values: rentNW },
    ],
  });

  dataTable($("#sched-table"), rows, [
    { h: "Year", get: (r) => r.y },
    { h: "Owner net worth", get: (r) => r.own, fmt: money },
    { h: "Renter net worth", get: (r) => r.rnw, fmt: money },
  ]);
}

bindCalc($("#calc"), compute);
attachRateHint("rate", "30");
