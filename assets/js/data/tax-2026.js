/* US tax dataset — TAX YEAR 2026.
   Compiled 2026-09-01 from:
   - IRS Rev. Proc. 2025-32 (federal inflation adjustments, post-OBBBA)
   - SSA 2026 wage base announcement
   - Tax Foundation, "State Individual Income Tax Rates and Brackets, 2026"
   This file is data only — refresh it once a year; nothing else changes.
   Bracket format: [ratePercent, incomeWhereRateStarts]. Statuses: single, mfj, mfs, hoh. */
"use strict";

export const META = {
  taxYear: 2026,
  compiled: "September 2026",
  sources: [
    { name: "IRS Rev. Proc. 2025-32 — 2026 federal inflation adjustments", url: "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf" },
    { name: "IRS newsroom — 2026 tax year adjustments", url: "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill" },
    { name: "SSA — 2026 Social Security wage base", url: "https://www.ssa.gov/oact/cola/cbb.html" },
    { name: "Tax Foundation — state income tax rates & brackets, 2026", url: "https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/" },
  ],
};

export const FED = {
  brackets: {
    single: [[10, 0], [12, 12400], [22, 50400], [24, 105700], [32, 201775], [35, 256225], [37, 640600]],
    mfj:    [[10, 0], [12, 24800], [22, 100800], [24, 211400], [32, 403550], [35, 512450], [37, 768700]],
    mfs:    [[10, 0], [12, 12400], [22, 50400], [24, 105700], [32, 201775], [35, 256225], [37, 384350]],
    hoh:    [[10, 0], [12, 17700], [22, 67450], [24, 105700], [32, 201775], [35, 256200], [37, 640600]],
  },
  standardDeduction: { single: 16100, mfj: 32200, mfs: 16100, hoh: 24150 },
  extra65: { married: 1650, unmarried: 2050 }, // per condition (65+ / blind)
  seniorBonus: { amount: 6000, phaseoutStart: { single: 75000, mfs: 75000, hoh: 75000, mfj: 150000 }, phaseoutRate: 0.06 },
  ltcg: {
    zeroMax:    { single: 49450, mfj: 98900, mfs: 49450, hoh: 66200 },
    fifteenMax: { single: 545500, mfj: 613700, mfs: 306850, hoh: 579600 },
  },
  fica: {
    ssWageBase: 184500, ssRate: 6.2, medicareRate: 1.45,
    addlMedicareRate: 0.9,
    addlMedicareThreshold: { single: 200000, hoh: 200000, mfj: 250000, mfs: 125000 },
  },
  se: { factor: 0.9235, ssRate: 12.4, medicareRate: 2.9 },
  ctc: { perChild: 2200, phaseoutStart: { mfj: 400000, single: 200000, mfs: 200000, hoh: 200000 }, per1000: 50 },
  niit: { rate: 3.8, threshold: { single: 200000, hoh: 200000, mfj: 250000, mfs: 125000 } },
};

/* States: t = "n" none | "f" flat | "g" graduated | "s" special.
   b = single-filer brackets. m = "same" | "double" (MFJ thresholds ~2x) | "approx-double".
   Applied to federal AGI as an approximation (state deductions/credits not modeled). */
export const STATES = {
  AL: { name: "Alabama", t: "g", b: [[2, 0], [4, 500], [5, 3000]], m: "double" },
  AK: { name: "Alaska", t: "n" },
  AZ: { name: "Arizona", t: "f", r: 2.5 },
  AR: { name: "Arkansas", t: "g", b: [[2, 0], [3.9, 4600]], m: "same" },
  CA: { name: "California", t: "g", b: [[1, 0], [2, 11079], [4, 26264], [6, 41452], [8, 57542], [9.3, 72724], [10.3, 371479], [11.3, 445771], [12.3, 742953], [13.3, 1000000]], m: "double", note: "California also charges 1.1% SDI on all wages (not modeled)." },
  CO: { name: "Colorado", t: "f", r: 4.4 },
  CT: { name: "Connecticut", t: "g", b: [[2, 0], [4.5, 10000], [5.5, 50000], [6, 100000], [6.5, 200000], [6.9, 250000], [6.99, 500000]], m: "double" },
  DC: { name: "District of Columbia", t: "g", b: [[4, 0], [6, 10000], [6.5, 40000], [8.5, 60000], [9.25, 250000], [9.75, 500000], [10.75, 1000000]], m: "same" },
  DE: { name: "Delaware", t: "g", b: [[0, 0], [2.2, 2000], [3.9, 5000], [4.8, 10000], [5.2, 20000], [5.55, 25000], [6.6, 60000]], m: "same" },
  FL: { name: "Florida", t: "n" },
  GA: { name: "Georgia", t: "f", r: 5.19 },
  HI: { name: "Hawaii", t: "g", b: [[1.4, 0], [3.2, 9600], [5.5, 14400], [6.4, 19200], [6.8, 24000], [7.2, 36000], [7.6, 48000], [7.9, 125000], [8.25, 175000], [9, 225000], [10, 275000], [11, 325000]], m: "double" },
  IA: { name: "Iowa", t: "f", r: 3.8 },
  ID: { name: "Idaho", t: "f", r: 5.3 },
  IL: { name: "Illinois", t: "f", r: 4.95 },
  IN: { name: "Indiana", t: "f", r: 2.95, local: { label: "County income tax", def: 1.5, hint: "Every Indiana county adds 0.5–3%; Indianapolis (Marion Co.) is about 2.02%." } },
  KS: { name: "Kansas", t: "g", b: [[5.2, 0], [5.58, 23000]], m: "double" },
  KY: { name: "Kentucky", t: "f", r: 3.5 },
  LA: { name: "Louisiana", t: "f", r: 3.0 },
  MA: { name: "Massachusetts", t: "g", b: [[5, 0], [9, 1083150]], m: "same" },
  MD: { name: "Maryland", t: "g", b: [[2, 0], [3, 1000], [4, 2000], [4.75, 3000], [5, 100000], [5.25, 125000], [5.5, 150000], [5.75, 250000], [6.25, 500000], [6.5, 1000000]], m: "approx-double", local: { label: "County income tax", def: 3.2, hint: "Maryland counties charge 2.25–3.3%; most large counties sit near 3.0–3.2%." } },
  ME: { name: "Maine", t: "g", b: [[5.8, 0], [6.75, 27399], [7.15, 64849]], m: "double" },
  MI: { name: "Michigan", t: "f", r: 4.25, local: { label: "City income tax", def: 0, hint: "Detroit residents pay 2.4%; most other Michigan cities with a tax charge 1%." } },
  MN: { name: "Minnesota", t: "g", b: [[5.35, 0], [6.8, 33310], [7.85, 109430], [9.85, 203150]], m: "approx-double" },
  MO: { name: "Missouri", t: "g", b: [[0, 0], [2, 1348], [2.5, 2696], [3, 4044], [3.5, 5392], [4, 6740], [4.5, 8088], [4.7, 9436]], m: "same", local: { label: "City earnings tax", def: 0, hint: "St. Louis and Kansas City charge 1% on residents." } },
  MS: { name: "Mississippi", t: "g", b: [[0, 0], [4, 10000]], m: "same" },
  MT: { name: "Montana", t: "g", b: [[4.7, 0], [5.65, 47500]], m: "double" },
  NC: { name: "North Carolina", t: "f", r: 3.99 },
  ND: { name: "North Dakota", t: "g", b: [[0, 0], [1.95, 48475], [2.5, 244825]], m: "approx-double" },
  NE: { name: "Nebraska", t: "g", b: [[2.46, 0], [3.51, 4130], [4.55, 24760]], m: "double" },
  NH: { name: "New Hampshire", t: "n", note: "The interest & dividends tax was fully repealed in 2025." },
  NJ: { name: "New Jersey", t: "g", b: [[1.4, 0], [1.75, 20000], [3.5, 35000], [5.525, 40000], [6.37, 75000], [8.97, 500000], [10.75, 1000000]], m: "approx-double" },
  NM: { name: "New Mexico", t: "g", b: [[1.5, 0], [3.2, 5500], [4.3, 16500], [4.7, 33500], [4.9, 66500], [5.9, 210000]], m: "approx-double" },
  NV: { name: "Nevada", t: "n" },
  NY: { name: "New York", t: "g", b: [[3.9, 0], [4.4, 8500], [5.15, 11700], [5.4, 13900], [5.9, 80650], [6.85, 215400], [9.65, 1077550], [10.3, 5000000], [10.9, 25000000]], m: "approx-double", nyc: true },
  OH: { name: "Ohio", t: "g", b: [[0, 0], [2.75, 26050]], m: "same", local: { label: "Municipal income tax", def: 2.0, hint: "Most Ohio cities charge 1–2.5% (Columbus and Cleveland: 2.5%)." } },
  OK: { name: "Oklahoma", t: "g", b: [[0, 0], [2.5, 3750], [3.5, 4900], [4.5, 7200]], m: "double" },
  OR: { name: "Oregon", t: "g", b: [[4.75, 0], [6.75, 4550], [8.75, 11400], [9.9, 125000]], m: "double" },
  PA: { name: "Pennsylvania", t: "f", r: 3.07, local: { label: "Local earned income tax", def: 1.0, hint: "Nearly every PA municipality adds ~1%; Philadelphia's wage tax is about 3.74%." } },
  RI: { name: "Rhode Island", t: "g", b: [[3.75, 0], [4.75, 82050], [5.99, 186450]], m: "same" },
  SC: { name: "South Carolina", t: "g", b: [[0, 0], [3, 3640], [6, 18230]], m: "same" },
  SD: { name: "South Dakota", t: "n" },
  TN: { name: "Tennessee", t: "n" },
  TX: { name: "Texas", t: "n" },
  UT: { name: "Utah", t: "f", r: 4.5 },
  VA: { name: "Virginia", t: "g", b: [[2, 0], [3, 3000], [5, 5000], [5.75, 17000]], m: "same" },
  VT: { name: "Vermont", t: "g", b: [[3.35, 0], [6.6, 49400], [7.6, 119700], [8.75, 249700]], m: "approx-double" },
  WA: { name: "Washington", t: "n", note: "No wage income tax. A 7% excise applies to long-term capital gains above a ~$278k deduction (not modeled)." },
  WI: { name: "Wisconsin", t: "g", b: [[3.5, 0], [4.4, 15110], [5.3, 51950], [7.65, 332720]], m: "approx-double" },
  WV: { name: "West Virginia", t: "g", b: [[2.22, 0], [2.96, 10000], [3.33, 25000], [4.44, 40000], [4.82, 60000]], m: "same" },
  WY: { name: "Wyoming", t: "n" },
};

/* TAX YEAR 2025 federal parameters — Rev. Proc. 2024-40 as amended by OBBBA
   (which retroactively raised the 2025 standard deduction and set the $2,200 CTC).
   Used for the past-vs-present comparison; same structure as FED. */
export const FED2025 = {
  brackets: {
    single: [[10, 0], [12, 11925], [22, 48475], [24, 103350], [32, 197300], [35, 250525], [37, 626350]],
    mfj:    [[10, 0], [12, 23850], [22, 96950], [24, 206700], [32, 394600], [35, 501050], [37, 751600]],
    mfs:    [[10, 0], [12, 11925], [22, 48475], [24, 103350], [32, 197300], [35, 250525], [37, 375800]],
    hoh:    [[10, 0], [12, 17000], [22, 64850], [24, 103350], [32, 197300], [35, 250500], [37, 626350]],
  },
  standardDeduction: { single: 15750, mfj: 31500, mfs: 15750, hoh: 23625 },
  extra65: { married: 1600, unmarried: 2000 },
  seniorBonus: { amount: 6000, phaseoutStart: { single: 75000, mfs: 75000, hoh: 75000, mfj: 150000 }, phaseoutRate: 0.06 },
  ltcg: {
    zeroMax:    { single: 48350, mfj: 96700, mfs: 48350, hoh: 64750 },
    fifteenMax: { single: 533400, mfj: 600050, mfs: 300000, hoh: 566700 },
  },
  fica: {
    ssWageBase: 176100, ssRate: 6.2, medicareRate: 1.45,
    addlMedicareRate: 0.9,
    addlMedicareThreshold: { single: 200000, hoh: 200000, mfj: 250000, mfs: 125000 },
  },
  se: { factor: 0.9235, ssRate: 12.4, medicareRate: 2.9 },
  ctc: { perChild: 2200, phaseoutStart: { mfj: 400000, single: 200000, mfs: 200000, hoh: 200000 }, per1000: 50 },
  niit: { rate: 3.8, threshold: { single: 200000, hoh: 200000, mfj: 250000, mfs: 125000 } },
};

/* Itemized-deduction machinery (per year where it differs). */
export const ITEMIZED = {
  2026: { saltCap: 40400, saltPhaseStart: 505000, saltFloor: 10000, saltPhaseRate: 0.30,
          charityAGIFloor: 0.005, charityCashCapAGI: 0.60, medicalFloorAGI: 0.075 },
  2025: { saltCap: 40000, saltPhaseStart: 500000, saltFloor: 10000, saltPhaseRate: 0.30,
          charityAGIFloor: 0, charityCashCapAGI: 0.60, medicalFloorAGI: 0.075 },
};

/* Rental (Schedule E): the active-participation loss allowance. */
export const RENTAL = { lossAllowanceMax: 25000, phaseStart: 100000, phaseEnd: 150000 };

/* QBI thresholds for 2025 (2026 lives in SAVE.qbi). */
export const QBI2025 = { threshold: { single: 197300, hoh: 197300, mfs: 197300, mfj: 394600 },
                         phaseEnd: { single: 272300, hoh: 272300, mfs: 272300, mfj: 544600 } };

/* Savings provisions for 2026 — IRS Notice 2025-67 (retirement),
   Rev. Proc. 2025-19 (HSA), OBBBA P.L. 119-21 (new deductions; caps not indexed).
   sunset: last tax year the provision exists (null = permanent). */
export const SAVE = {
  tips: { cap: 25000, phaseStart: { single: 150000, hoh: 150000, mfj: 300000 }, per1000: 100, sunset: 2028, mfsIneligible: true },
  overtime: { cap: { single: 12500, hoh: 12500, mfj: 25000 }, phaseStart: { single: 150000, hoh: 150000, mfj: 300000 }, per1000: 100, sunset: 2028, mfsIneligible: true },
  carLoan: { cap: 10000, phaseStart: { single: 100000, hoh: 100000, mfs: 100000, mfj: 200000 }, per1000: 200, sunset: 2028 },
  charityNonItemizer: { cap: { single: 1000, hoh: 1000, mfs: 1000, mfj: 2000 }, sunset: null },
  studentLoan: { cap: 2500, phase: { single: [85000, 100000], hoh: [85000, 100000], mfj: [175000, 205000] }, mfsIneligible: true },
  qbi: { rate: 0.20, threshold: { single: 201750, hoh: 201750, mfs: 201750, mfj: 403500 }, phaseEnd: { single: 276750, hoh: 276750, mfs: 276750, mfj: 553500 }, minDeduction: 400, minQBI: 1000 },
  retirement: {
    k401: 24500, k401Catchup50: 8000, k401Super60to63: 11250,
    ira: 7500, iraCatchup50: 1100,
    solo401kSepTotal: 72000,
    saversCredit: { ceiling: { mfj: 80500, hoh: 60375, single: 40250, mfs: 40250 }, maxContribution: 2000 },
    // Traditional-IRA deductibility MAGI phase-outs (2026)
    tradIRAPhase: {
      coveredSelf: { single: [81000, 91000], hoh: [81000, 91000], mfj: [129000, 149000], mfs: [0, 10000] },
      spouseCovered: [242000, 252000], // you not covered, spouse is (MFJ)
    },
    // Roth-IRA contribution MAGI phase-outs (2026) — past these, the backdoor is the route
    rothPhase: { single: [153000, 168000], hoh: [153000, 168000], mfj: [242000, 252000], mfs: [0, 10000] },
  },
  hsa: { self: 4400, family: 8750, catchup55: 1000 },
  depCareFSA: { limit: 7500, mfs: 3750 },
};

export const NYC = {
  single: [[3.078, 0], [3.762, 12000], [3.819, 25000], [3.876, 50000]],
  mfj:    [[3.078, 0], [3.762, 21600], [3.819, 45000], [3.876, 90000]],
};
