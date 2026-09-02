/* Per-state property & sales tax rates — for the relocation comparison.
   prop:  mean effective property tax on owner-occupied housing, % of home
          value (Tax Foundation "Property Taxes by State and County, 2026";
          data year 2024, Census ACS).
   sales: combined state + population-weighted average local sales tax, %
          (Tax Foundation "State and Local Sales Tax Rates, Midyear 2026",
          rates as of July 1, 2026). Refresh yearly with the tax dataset. */
"use strict";

export const STATE_TAXES_META = {
  property: "Tax Foundation 2026 edition, 2024 Census data",
  sales: "Tax Foundation midyear-2026 combined state+local rates",
};

export const STATE_TAXES = {
  AL: { prop: 0.37, sales: 9.46 }, AK: { prop: 0.94, sales: 1.82 },
  AZ: { prop: 0.48, sales: 8.54 }, AR: { prop: 0.56, sales: 9.48 },
  CA: { prop: 0.70, sales: 9.03 }, CO: { prop: 0.50, sales: 7.89 },
  CT: { prop: 1.54, sales: 6.35 }, DE: { prop: 0.54, sales: 0.00 },
  DC: { prop: 0.60, sales: 6.00 }, FL: { prop: 0.78, sales: 6.98 },
  GA: { prop: 0.79, sales: 7.56 }, HI: { prop: 0.29, sales: 4.50 },
  ID: { prop: 0.50, sales: 6.03 }, IL: { prop: 1.88, sales: 8.98 },
  IN: { prop: 0.76, sales: 7.00 }, IA: { prop: 1.33, sales: 6.94 },
  KS: { prop: 1.21, sales: 8.71 }, KY: { prop: 0.74, sales: 6.00 },
  LA: { prop: 0.55, sales: 10.13 }, ME: { prop: 0.98, sales: 5.50 },
  MD: { prop: 0.92, sales: 6.00 }, MA: { prop: 1.00, sales: 6.25 },
  MI: { prop: 1.19, sales: 6.00 }, MN: { prop: 1.00, sales: 8.14 },
  MS: { prop: 0.58, sales: 7.06 }, MO: { prop: 0.89, sales: 8.44 },
  MT: { prop: 0.61, sales: 0.00 }, NE: { prop: 1.44, sales: 6.98 },
  NV: { prop: 0.50, sales: 8.24 }, NH: { prop: 1.50, sales: 0.00 },
  NJ: { prop: 1.88, sales: 6.60 }, NM: { prop: 0.63, sales: 7.68 },
  NY: { prop: 1.30, sales: 8.54 }, NC: { prop: 0.66, sales: 7.10 },
  ND: { prop: 0.92, sales: 7.09 }, OH: { prop: 1.36, sales: 7.29 },
  OK: { prop: 0.79, sales: 9.06 }, OR: { prop: 0.81, sales: 0.00 },
  PA: { prop: 1.26, sales: 6.34 }, RI: { prop: 1.12, sales: 7.00 },
  SC: { prop: 0.49, sales: 7.49 }, SD: { prop: 1.00, sales: 6.11 },
  TN: { prop: 0.52, sales: 9.61 }, TX: { prop: 1.40, sales: 8.20 },
  UT: { prop: 0.48, sales: 7.42 }, VT: { prop: 1.51, sales: 6.43 },
  VA: { prop: 0.78, sales: 5.77 }, WA: { prop: 0.75, sales: 9.57 },
  WV: { prop: 0.51, sales: 6.60 }, WI: { prop: 1.32, sales: 5.72 },
  WY: { prop: 0.53, sales: 5.39 },
};
