/* Tool registry — the single place a new tool gets announced.
   Add an entry here + a page in /tools + a module in /assets/js/tools,
   and the home index, related-tools chips, and search pick it up. */
"use strict";

export const TOOLS = [
  {
    slug: "take-home-pay",
    name: "Take-home pay & income tax",
    desc: "Federal, state and local taxes for 2026 in plain questions — see what you keep of every dollar.",
    cat: "Income & taxes",
  },
  {
    slug: "real-hourly-wage",
    name: "Real hourly wage",
    desc: "Side-hustle revenue minus materials, miles, fees and both taxes, divided by ALL your hours.",
    cat: "Income & taxes",
  },
  {
    slug: "rsu-withholding",
    name: "RSU withholding shortfall",
    desc: "Employers withhold 22% on vests; your real rate is higher. Estimate the April surprise.",
    cat: "Income & taxes",
  },
  {
    slug: "mortgage-lab",
    name: "Mortgage Lab",
    desc: "Full mortgage payment (with taxes, insurance, HOA) plus extra payments, a recast, a refinance and a HELOC on one timeline — see what each move is worth.",
    cat: "Home & loans",
    excel: "mortgage-amortization.xlsx",
  },
  {
    slug: "refinance",
    name: "Refinance calculator",
    desc: "Break-even on closing costs, honest lifetime difference, and the keep-your-old-payment trick.",
    cat: "Home & loans",
  },
  {
    slug: "rent-vs-buy",
    name: "Rent vs. buy, honestly",
    desc: "Down-payment opportunity cost, PMI, maintenance and selling costs all counted - with the crossover year.",
    cat: "Home & loans",
    excel: "rent-vs-buy.xlsx",
  },
  {
    slug: "avalanche-snowball",
    name: "Debt Payoff Lab",
    desc: "Avalanche, snowball, or focus one loan - per-loan extras, windfalls, and real payoff dates for every debt.",
    cat: "Home & loans",
    excel: "multi-debt-payoff.xlsx",
  },
  {
    slug: "loan",
    name: "Loan calculator",
    desc: "Auto, personal or student loans: payment, total interest, and payoff schedule.",
    cat: "Home & loans",
    excel: "loan-amortization.xlsx",
  },
  {
    slug: "compound-interest",
    name: "Compound interest",
    desc: "Watch a balance grow from contributions and compounding, year by year.",
    cat: "Saving & investing",
    excel: "compound-interest.xlsx",
  },
  {
    slug: "savings-goal",
    name: "Savings goal",
    desc: "How much to set aside each month to hit a target by a date.",
    cat: "Saving & investing",
    excel: "savings-goal-planner.xlsx",
  },
  {
    slug: "rental-vs-sp500",
    name: "Rental property vs. S&P 500",
    desc: "Every cost and every tax break, both sides - depreciation, passive-loss limits, vacancy, capital gains - to see which actually wins.",
    cat: "Saving & investing",
    excel: "rental-vs-sp500.xlsx",
  },
  {
    slug: "sequence-risk",
    name: "Sequence-of-returns risk",
    desc: "Same average return, three orderings - why retiring into a crash devastates a portfolio.",
    cat: "Saving & investing",
    excel: "sequence-risk.xlsx",
  },
  {
    slug: "roth-conversion",
    name: "Roth conversion planner",
    desc: "Multi-year conversions that fill your tax bracket exactly, with real 2026 brackets.",
    cat: "Saving & investing",
    excel: "roth-conversion-planner.xlsx",
  },
  {
    slug: "backdoor-roth",
    name: "Backdoor Roth pro-rata",
    desc: "What the pro-rata rule really taxes on your conversion - and the 401(k) escape hatch.",
    cat: "Saving & investing",
  },
  {
    slug: "social-security-breakeven",
    name: "Social Security breakeven",
    desc: "Claim at 62, 67 or 70 - the cumulative crossover ages that surprise everyone.",
    cat: "Saving & investing",
  },
  {
    slug: "retirement",
    name: "Retirement projection",
    desc: "Project a nest egg from today's balance and contributions, then a safe monthly draw.",
    cat: "Saving & investing",
  },
  {
    slug: "cash-back",
    name: "Cash-back optimizer",
    desc: "Enter your monthly spending and see which credit card actually earns the most per year.",
    cat: "Banking & cards",
  },
  {
    slug: "percentage",
    name: "Percentage calculator",
    desc: "Percent of a number, percent change, and “X is what % of Y” — instantly.",
    cat: "Everyday",
  },
  {
    slug: "tip-split",
    name: "Tip & bill split",
    desc: "Tip, total and per-person share without the dinner-table math.",
    cat: "Everyday",
  },
];

export const CATEGORIES = [...new Set(TOOLS.map((t) => t.cat))];
