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
    slug: "mortgage",
    name: "Mortgage calculator",
    desc: "Monthly payment with taxes, insurance and HOA — plus the full amortization picture.",
    cat: "Home & loans",
    excel: "mortgage-amortization.xlsx",
  },
  {
    slug: "loan",
    name: "Loan calculator",
    desc: "Auto, personal or student loans: payment, total interest, and payoff schedule.",
    cat: "Home & loans",
    excel: "loan-amortization.xlsx",
  },
  {
    slug: "debt-payoff",
    name: "Debt payoff",
    desc: "See how extra monthly payments shorten a debt and how much interest they save.",
    cat: "Home & loans",
    excel: "debt-payoff-planner.xlsx",
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
