/* Banking & card offers — compiled from issuers' published terms and
   Bankrate/NerdWallet roundups. UPDATE MONTHLY: verify each rate on the
   institution's own page, then bump asOf. Entries that could not be
   re-verified were excluded (data integrity first).
   `aff`: paste your affiliate URL here once enrolled (Impact/CJ/Sovrn/etc.);
   until then the plain institution URL is used. Ranking is by the numbers. */
"use strict";

export const OFFERS_META = {
  asOf: "September 1, 2026",
  sources: [
    "https://www.bankrate.com/banking/savings/best-high-yield-interests-savings-accounts/",
    "https://www.bankrate.com/banking/checking/best-checking-accounts/",
    "https://www.bankrate.com/credit-cards/cash-back/best-cash-back-cards/",
  ],
};

export const HYSA = [
  { bank: "Axos ONE", apy: 4.21, min: 0, url: "https://www.axosbank.com", aff: null,
    notes: "Checking + savings bundle. The top rate needs $1,500+/month in direct deposits and a $1,500 average balance; otherwise it drops to a 1.00% base." },
  { bank: "Pibank", apy: 4.10, min: 0, url: "https://www.pibank.com", aff: null,
    notes: "No fees, no minimums, no hoops — the rate applies to every dollar." },
  { bank: "CIT Bank Platinum Savings", apy: 4.10, min: 5000, url: "https://www.cit.com/cit-bank/bank/savings", aff: null,
    notes: "Top rate requires a $5,000+ balance ($100 to open); smaller balances earn much less." },
  { bank: "Vio Bank Cornerstone", apy: 3.99, min: 100, url: "https://www.viobank.com", aff: null,
    notes: "Full-balance APY. Choose e-statements to avoid the paper fee." },
  { bank: "Bread Savings", apy: 3.95, min: 100, url: "https://www.breadfinancial.com", aff: null,
    notes: "No monthly maintenance fee; straightforward online savings." },
  { bank: "Openbank by Santander", apy: 3.80, min: 500, url: "https://www.openbank.us", aff: null,
    notes: "Big-bank backing with a near-top rate; $500 minimum to open." },
];

export const CHECKING = [
  { bank: "SoFi Checking & Savings", url: "https://www.sofi.com/banking", aff: null,
    notes: "No monthly fee, paycheck up to 2 days early, 0.50% APY on checking, Allpoint ATMs.",
    bonus: "$50–$300 tiered by direct-deposit amount (through Dec 31, 2026)" },
  { bank: "Chime", url: "https://www.chime.com", aff: null,
    notes: "No fees or minimums, early direct deposit, 47,000+ fee-free ATMs, SpotMe overdraft cushion. Fintech with FDIC-insured partner banks.",
    bonus: "Up to $350 with qualifying direct deposit" },
  { bank: "Capital One 360 Checking", url: "https://www.capitalone.com/bank/checking-accounts/online-checking-account/", aff: null,
    notes: "No fee, no minimums, early direct deposit, 70,000+ fee-free ATMs, 0.10% APY.",
    bonus: null },
  { bank: "Ally Spending Account", url: "https://www.ally.com/bank/interest-checking-account/", aff: null,
    notes: "No fee, early direct deposit, up to $10 per cycle in out-of-network ATM rebates.",
    bonus: null },
  { bank: "Alliant High-Rate Checking", url: "https://www.alliantcreditunion.org/bank/high-rate-checking", aff: null,
    notes: "Credit union (NCUA-insured): up to $20/month ATM rebates, 0.25% APY with e-statements and a monthly deposit.",
    bonus: null },
];

/* Card reward structures. Categories: groceries, dining, gas, online,
   travel, streaming, everything (the base rate).
   rotating: honest model of 5%-rotating cards — the boosted rate applies to
   spending pooled across common rotating categories, up to the annual cap.
   matchFirstYear: Discover doubles all cash back earned in year one. */
export const CARDS = [
  { name: "Wells Fargo Active Cash", issuer: "Wells Fargo", category: "Flat-rate",
    headline: "2% on everything, no caps, no categories to think about.",
    rates: { everything: 2 }, bonus: 100, annualFee: 0,
    url: "https://creditcards.wellsfargo.com/active-cash-credit-card/", aff: null },
  { name: "Citi Double Cash", issuer: "Citi", category: "Flat-rate",
    headline: "2% on everything (1% when you buy, 1% when you pay it off).",
    rates: { everything: 2 }, bonus: 200, annualFee: 0,
    url: "https://www.citi.com/credit-cards/citi-double-cash-credit-card", aff: null },
  { name: "Discover it Cash Back", issuer: "Discover", category: "Rotating 5%",
    headline: "5% in rotating quarterly categories (activation required, $1,500/quarter cap), 1% base — and all first-year cash back is doubled.",
    rates: { everything: 1 }, rotating: { rate: 5, capAnnual: 6000, pool: ["groceries", "gas", "online", "dining"] },
    matchFirstYear: true, bonus: 0, annualFee: 0,
    url: "https://www.discover.com/credit-cards/cash-back/it-card.html", aff: null },
  { name: "Chase Freedom Flex", issuer: "Chase", category: "Rotating 5%",
    headline: "5% rotating quarterly categories ($1,500/quarter cap), 3% dining, 1% base.",
    rates: { everything: 1, dining: 3 }, rotating: { rate: 5, capAnnual: 6000, pool: ["groceries", "gas", "online"] },
    bonus: 200, annualFee: 0,
    url: "https://creditcards.chase.com/cash-back-credit-cards/freedom/flex", aff: null },
  { name: "Amex Blue Cash Preferred", issuer: "American Express", category: "Groceries",
    headline: "6% at US supermarkets (up to $6,000/yr) and on streaming, 3% on gas and transit, 1% base. $95 fee, waived the first year.",
    rates: { everything: 1, groceries: { rate: 6, capAnnual: 6000 }, streaming: 6, gas: 3 },
    bonus: 300, annualFee: 95,
    url: "https://www.americanexpress.com/us/credit-cards/card/blue-cash-preferred/", aff: null },
  { name: "Capital One Savor", issuer: "Capital One", category: "Dining",
    headline: "3% on dining, groceries (excl. superstores), entertainment and streaming, 1% base.",
    rates: { everything: 1, dining: 3, groceries: 3, streaming: 3 }, bonus: 200, annualFee: 0,
    url: "https://www.capitalone.com/credit-cards/savor/", aff: null },
  { name: "PayPal Cashback Mastercard", issuer: "Synchrony", category: "Online shopping",
    headline: "3% on everything paid via PayPal checkout, 1.5% everywhere else.",
    rates: { everything: 1.5, online: 3 }, bonus: 0, annualFee: 0,
    url: "https://www.paypal.com/us/digital-wallet/manage-money/paypal-cashback-mastercard", aff: null },
  { name: "Prime Visa", issuer: "Chase", category: "Online shopping",
    headline: "5% at Amazon and Whole Foods (Prime membership required), 2% on gas, dining and transit, 1% base.",
    rates: { everything: 1, online: 5, gas: 2, dining: 2 }, bonus: 200, annualFee: 0,
    url: "https://creditcards.chase.com/cash-back-credit-cards/amazon-prime-rewards", aff: null },
  { name: "Chase Freedom Unlimited", issuer: "Chase", category: "All-rounder",
    headline: "1.5% on everything, 3% on dining and drugstores, 5% on travel booked through Chase.",
    rates: { everything: 1.5, dining: 3, travel: 5 }, bonus: 200, annualFee: 0,
    url: "https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited", aff: null },
  { name: "BofA Customized Cash", issuer: "Bank of America", category: "Customizable",
    headline: "3% in a category you choose (online shopping is the popular pick), 2% groceries and wholesale clubs — capped at $2,500/quarter combined — 1% base.",
    rates: { everything: 1, online: { rate: 3, capAnnual: 8000 }, groceries: { rate: 2, capAnnual: 2000 } },
    bonus: 200, annualFee: 0,
    url: "https://www.bankofamerica.com/credit-cards/products/cash-back-credit-card/", aff: null },
];
