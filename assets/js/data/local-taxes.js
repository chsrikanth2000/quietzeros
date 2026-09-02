// Interstate reciprocity + smaller local-tax jurisdictions. Retrieved 2026-09-02.
// Sources: Thomson Reuters, TaxSlayer, Intuit ProConnect and TurboTax reciprocity
// summaries (cross-checked, all agree on the same 16-state + DC set and pairings);
// NY DTF Yonkers withholding tables (tax.ny.gov, NYS-50-T-Y); Maryland Comptroller's
// official "2026 Maryland State and Local Income Tax Withholding Information" memo
// (marylandcomptroller.gov, Attachment 1 — the authoritative county-rate table);
// St. Louis Comptroller "U.S. Cities That Levy Earnings Taxes"; city ordinance pages
// for Wilmington DE, Denver/Glendale/Greenwood Village/Sheridan CO. Large, fragmented
// municipal systems (PA, OH) live in their own dedicated data files, not here.

// Reciprocity: if you LIVE in the key state and WORK in one of the listed states,
// you owe income tax only to your resident (live) state, not the work state.
// DC is a special case, not a true bilateral pact: federal law (Home Rule Act)
// bars DC from taxing any nonresident's wages at all, so DC behaves as if it has
// reciprocity with every state, not just MD/VA.
export const RECIPROCITY = {
  IL: ["IA", "KY", "MI", "WI"],
  IN: ["KY", "MI", "OH", "PA", "WI"],
  IA: ["IL"],
  KY: ["IL", "IN", "MI", "OH", "VA", "WV", "WI"],
  MD: ["DC", "PA", "VA", "WV"],
  MI: ["IL", "IN", "KY", "MN", "OH", "WI"],
  MN: ["MI", "ND"],
  MT: ["ND"],
  NJ: ["PA"],
  ND: ["MN", "MT"],
  OH: ["IN", "KY", "MI", "PA", "WV"],
  PA: ["IN", "MD", "NJ", "OH", "VA", "WV"],
  VA: ["DC", "KY", "MD", "PA", "WV"],
  WV: ["KY", "MD", "OH", "PA", "VA"],
  WI: ["IL", "IN", "KY", "MI"],
  DC: ["MD", "VA"],
};
export const DC_TAXES_NO_NONRESIDENTS = true;

// New York City has NO nonresident earnings tax (repealed decades ago) — only
// Yonkers still taxes nonresidents who work there. NYC's own resident tax is
// modeled separately via the NYC bracket table in tax-2026.js.
export const YONKERS = {
  residentSurchargePctOfStateTax: 16.75, // resident surtax = 16.75% of net NY State tax
  nonresidentEarningsRatePct: 0.50, // nonresident tax on Yonkers-source wages
};

// Maryland: county of residence sets the local rate, applied to the same taxable
// income base as MD state tax. Two counties (Anne Arundel, Frederick) use income
// tiers instead of one flat rate; brackets are [ratePct, incomeFloor], same shape
// as the state bracket tables. Nonresidents pay a flat 2.25% "special nonresident
// tax" instead of any county rate.
export const MD_NONRESIDENT_RATE = 2.25;
export const MD_COUNTIES = {
  "Allegany County": 3.20,
  "Anne Arundel County": {
    single: [[2.70, 0], [2.94, 50000], [3.20, 400000]],
    mfj: [[2.70, 0], [2.94, 75000], [3.20, 480000]],
  },
  "Baltimore County": 3.20,
  "Baltimore City": 3.20,
  "Calvert County": 3.20,
  "Caroline County": 3.20,
  "Carroll County": 3.03,
  "Cecil County": 2.74,
  "Charles County": 3.03,
  "Dorchester County": 3.30,
  "Frederick County": {
    single: [[2.25, 0], [2.75, 25000], [2.96, 50000], [3.20, 150000]],
    mfj: [[2.25, 0], [2.75, 25000], [2.96, 100000], [3.20, 250000]],
  },
  "Garrett County": 2.65,
  "Harford County": 3.06,
  "Howard County": 3.20,
  "Kent County": 3.30,
  "Montgomery County": 3.20,
  "Prince George's County": 3.20,
  "Queen Anne's County": 3.20,
  "St. Mary's County": 3.20,
  "Somerset County": 3.20,
  "Talbot County": 2.40,
  "Washington County": 2.95,
  "Wicomico County": 3.20,
  "Worcester County": 2.25,
};

// Missouri: Kansas City and St. Louis both charge a 1% earnings tax on residents
// (and on nonresidents' income earned within city limits).
export const MO_CITIES = {
  "Kansas City": 1.0,
  "St. Louis": 1.0,
};

// Delaware: Wilmington is the only Delaware municipality with its own wage tax.
export const DE_WILMINGTON_RATE = 1.25;

// Colorado occupational privilege tax (OPT): a flat DOLLAR AMOUNT per month
// (not a percentage), owed by the employee once a monthly earnings threshold is
// met. Aurora repealed its OPT effective 2025. Amounts below are the EMPLOYEE's
// share only (employers separately owe their own, smaller, non-withheld portion).
export const CO_OPT = {
  "Denver": { employeeMonthly: 5.75, thresholdMonthly: 500 },
  "Glendale": { employeeMonthly: 5.00, thresholdMonthly: 750 },
  "Greenwood Village": { employeeMonthly: 2.00, thresholdMonthly: 250 },
  "Sheridan": { employeeMonthly: 3.00, thresholdMonthly: 0 },
};
