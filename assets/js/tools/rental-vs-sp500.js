"use strict";

import { $, bindCalc, readField, money, moneyShort, pmt, amortize } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { attachRateHint } from "../rate-hint.js";
import { stackedArea, dataTable } from "../charts.js";
import { RENTAL } from "../data/tax-2026.js";

initToolPage("rental-vs-sp500");

const DEPR_YEARS = 27.5;

/** Passive-loss allowance, same rule the tax tool uses. */
function lossAllowance(otherIncome) {
  return Math.max(0, Math.min(RENTAL.lossAllowanceMax,
    RENTAL.lossAllowanceMax - 0.5 * Math.max(0, otherIncome - RENTAL.phaseStart)));
}

function compute() {
  const price = readField($("#price"));
  const downPct = readField($("#down")) / 100;
  const rate = readField($("#rate"));
  const term = Math.round(readField($("#term")));
  const closingPct = readField($("#closing")) / 100;
  const rehab = readField($("#rehab"));
  const rent0 = readField($("#rent"));
  const vacancy = readField($("#vacancy")) / 100;
  const rentGrow = readField($("#rentgrow")) / 100;
  const proptaxPct = readField($("#proptax")) / 100;
  const insPct = readField($("#insurance")) / 100;
  const maintPct = readField($("#maint")) / 100;
  const mgmtPct = readField($("#mgmt")) / 100;
  const hoaM = readField($("#hoa"));
  const appre = readField($("#appre")) / 100;
  const buildingPct = readField($("#building")) / 100;
  const sellPct = readField($("#sellcost")) / 100;
  const hold = Math.min(Math.round(readField($("#hold"))), term);
  const otherIncome = readField($("#otherinc"));
  const marg = readField($("#marg")) / 100;
  const ltcg = readField($("#ltcg")) / 100;
  const spReturn = readField($("#spreturn")) / 100;

  const loan = price * (1 - downPct);
  const upfront = price * downPct + price * closingPct + rehab;
  const buildingBasis = price * buildingPct;
  const deprPerYear = DEPR_YEARS > 0 ? buildingBasis / DEPR_YEARS : 0;
  const allowance = lossAllowance(otherIncome);

  const sched = amortize(loan, rate, term * 12);
  const rows = sched.rows; // yearly {year, principal, interest, balance}

  let value = price;
  let cumDeprTaken = 0;
  let contributedExtra = 0; // extra cash beyond upfront, in bad years
  let sideAccountFV = 0, sideAccountBasis = 0; // reinvested positive cash flow
  let extraContribFV = 0; // negative-cashflow contributions, carried to the S&P side too
  const yearRows = [];
  let totalCashFlowAfterTax = 0;

  for (let y = 1; y <= hold; y++) {
    const rentAnnual = rent0 * 12 * Math.pow(1 + rentGrow, y - 1);
    const effRent = rentAnnual * (1 - vacancy);
    const propTax = value * proptaxPct;
    const ins = value * insPct;
    const maint = value * maintPct;
    const mgmt = effRent * mgmtPct;
    const hoaAnnual = hoaM * 12;
    const opEx = propTax + ins + maint + mgmt + hoaAnnual;
    const noi = effRent - opEx;

    const r = rows[y - 1] || { principal: 0, interest: 0, balance: 0 };
    const debtService = r.principal + r.interest;
    const cashFlowBT = noi - debtService;

    const deprThisYear = cumDeprTaken < buildingBasis ? Math.min(deprPerYear, buildingBasis - cumDeprTaken) : 0;
    cumDeprTaken += deprThisYear;
    const taxableRental = noi - r.interest - deprThisYear;

    let taxEffect;
    if (taxableRental >= 0) {
      taxEffect = -taxableRental * marg; // tax owed
    } else {
      const allowedLoss = Math.min(-taxableRental, allowance);
      taxEffect = allowedLoss * marg; // tax saved (shield)
    }
    const cashFlowAT = cashFlowBT + taxEffect;
    totalCashFlowAfterTax += cashFlowAT;

    if (cashFlowAT < 0) {
      const need = -cashFlowAT;
      contributedExtra += need;
      extraContribFV += need * Math.pow(1 + spReturn, hold - y);
    } else if (cashFlowAT > 0) {
      sideAccountFV += cashFlowAT * Math.pow(1 + spReturn, hold - y);
      sideAccountBasis += cashFlowAT;
    }

    yearRows.push({ year: y, cashFlowAT, deprThisYear, taxableRental, balance: r.balance, value, interestPaid: r.interest });
    value *= (1 + appre);
  }

  // --- property terminal wealth ---
  const saleValue = price * Math.pow(1 + appre, hold);
  const sellingCosts = saleValue * sellPct;
  const loanBalance = hold >= rows.length ? 0 : rows[hold - 1].balance;
  const adjustedBasis = price - cumDeprTaken;
  const gain = saleValue - sellingCosts - adjustedBasis;
  const recaptureBase = Math.max(0, Math.min(gain, cumDeprTaken));
  const remainGain = Math.max(0, gain - recaptureBase);
  const saleTax = gain > 0 ? recaptureBase * 0.25 + remainGain * ltcg : 0;
  const netSaleProceeds = saleValue - sellingCosts - loanBalance - saleTax;

  const sideGain = Math.max(0, sideAccountFV - sideAccountBasis);
  const sideTax = sideGain * ltcg;
  const propertyWealth = netSaleProceeds + sideAccountFV - sideTax;

  // --- S&P 500 terminal wealth (identical capital calls) ---
  const spBase = upfront * Math.pow(1 + spReturn, hold);
  const spGross = spBase + extraContribFV;
  const totalContributed = upfront + contributedExtra;
  const spGain = Math.max(0, spGross - totalContributed);
  const spTax = spGain * ltcg;
  const spWealth = spGross - spTax;

  const diff = propertyWealth - spWealth;
  $("#r-hero").textContent = (diff >= 0 ? "" : "−") + money(Math.abs(diff)) + (diff >= 0 ? " ahead" : " behind");
  $("#r-prop").textContent = money(propertyWealth);
  $("#r-sp").textContent = money(spWealth);
  $("#r-invested").textContent = money(totalContributed);
  $("#r-cashflow").textContent = money(totalCashFlowAfterTax / hold) + "/yr";

  $("#r-interpret").replaceChildren(
    `Starting with ${money(upfront)}, over ${hold} years the rental ends at ${money(propertyWealth)} after tax and sale; the same cash in the S&P 500 ends at ${money(spWealth)}. `,
    Object.assign(document.createElement("strong"), {
      textContent: diff >= 0 ? `The rental wins by ${money(diff)}.` : `The index fund wins by ${money(-diff)}.`,
    }),
    ` ${cumDeprTaken > 0 ? `Depreciation sheltered ${money(cumDeprTaken)} of income along the way.` : ""}`
  );

  // chart: property equity (+ cash saved so far) vs. the S&P running series,
  // both walking the identical capital-call timeline as compute() above
  const xs = ["Now"], sProp = [upfront], sSp = [upfront];
  let runningSide = 0;
  const contribTimeline = [{ amt: upfront, atYear: 0 }];
  for (let y = 1; y <= hold; y++) {
    const yr = yearRows[y - 1];
    if (yr.cashFlowAT < 0) contribTimeline.push({ amt: -yr.cashFlowAT, atYear: y });
    else runningSide += yr.cashFlowAT;
    const equityNow = yr.value * (1 - sellPct) - yr.balance;
    xs.push(`Yr ${y}`);
    sProp.push(equityNow + runningSide);
    let spNow = 0;
    for (const c of contribTimeline) if (c.atYear <= y) spNow += c.amt * Math.pow(1 + spReturn, y - c.atYear);
    sSp.push(spNow);
  }

  stackedArea($("#chart-compare"), {
    ariaLabel: "Terminal wealth over time, rental versus S&P 500",
    xs, stacked: false, fmt: moneyShort, fmtTip: money,
    series: [
      { name: "Rental", values: sProp },
      { name: "S&P 500", values: sSp },
    ],
  });

  // impact breakdown
  const impact = $("#impact");
  const leverageEffect = (saleValue - price) - (upfront - price * downPct); // appreciation on borrowed money, roughly
  impact.replaceChildren();
  const row = (label, val) => impact.append(
    (() => {
      const d = document.createElement("div"); d.className = "impact-row";
      const s1 = document.createElement("span"); s1.textContent = label;
      const s2 = document.createElement("span"); s2.className = "n" + (val < 0 ? " bad" : "");
      s2.textContent = (val >= 0 ? "+" : "−") + money(Math.abs(val));
      d.append(s1, s2);
      return d;
    })()
  );
  row("Appreciation on the leveraged asset", saleValue - price);
  row("Depreciation tax shield claimed", cumDeprTaken * marg);
  row("Depreciation recapture tax at sale", -recaptureBase * 0.25);
  row("Selling costs", -sellingCosts);
  const interestDuringHold = yearRows.reduce((a, r) => a + r.interestPaid, 0);
  row("Mortgage interest paid (during hold)", -interestDuringHold);
  row("Net cash flow collected after tax (all years)", totalCashFlowAfterTax);

  // yearly table
  dataTable($("#sched-table"), yearRows, [
    { h: "Year", get: (r) => r.year },
    { h: "Cash flow after tax", get: (r) => r.cashFlowAT, fmt: money },
    { h: "Depreciation claimed", get: (r) => r.deprThisYear, fmt: money },
    { h: "Taxable rental income", get: (r) => r.taxableRental, fmt: money },
    { h: "Loan balance", get: (r) => r.balance, fmt: money },
  ]);
}

bindCalc($("#calc"), compute);
attachRateHint("rate", "30");
