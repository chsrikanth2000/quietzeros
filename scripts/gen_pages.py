#!/usr/bin/env python3
"""Generate /tools/*.html from one shared shell.

To add a new tool: append a dict to TOOLS below, run this script, add a
module in assets/js/tools/<slug>.js, and register it in assets/js/registry.js.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

SHELL = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' https://challenges.cloudflare.com https://pagead2.googlesyndication.com https://ep2.adtrafficquality.google https://fundingchoicesmessages.google.com https://www.googletagservices.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://qz-comments.chsrikanth2000.workers.dev https://challenges.cloudflare.com https://pagead2.googlesyndication.com https://ep1.adtrafficquality.google https://csi.gstatic.com https://fundingchoicesmessages.google.com; frame-src https://challenges.cloudflare.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google https://www.google.com https://fundingchoicesmessages.google.com; base-uri 'none'; form-action 'none'">
  <title>__TITLE__ — Quiet Zeros</title>
  <meta name="description" content="__DESC__">
  <link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../assets/css/main.css">
  <script src="../assets/js/theme.js"></script>
  <link rel="canonical" href="https://quietzeros.com/tools/__SLUG__">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Quiet Zeros">
  <meta property="og:title" content="__TITLE__">
  <meta property="og:description" content="__DESC__">
  <meta property="og:url" content="https://quietzeros.com/tools/__SLUG__">
  <meta property="og:image" content="https://quietzeros.com/assets/img/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#12523a">
  <link rel="preload" href="../assets/fonts/fraunces-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../assets/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"__TITLE__","url":"https://quietzeros.com/tools/__SLUG__","description":"__DESC__","applicationCategory":"FinanceApplication","operatingSystem":"Any","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}</script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5224815108212174" crossorigin="anonymous"></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header">
    <div class="wrap">
      <a class="wordmark" href="../index.html" aria-label="Quiet Zeros home">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.6"/><ellipse cx="12" cy="12" rx="4.6" ry="6.4" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        Quiet Zeros
      </a>
      <nav class="site-nav" aria-label="Site">
        <a href="../index.html">Calculators</a>
        <a href="../downloads.html">Excel templates</a>
        <a href="../about.html">About</a>
        <button class="theme-toggle" type="button" aria-label="Toggle dark mode">
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        </button>
      </nav>
    </div>
  </header>

  <main id="main" class="wrap">
    <div class="tool-head">
      <p class="crumbs"><a href="../index.html">Calculators</a> / __CAT__</p>
      <h1>__H1__</h1>
      <p class="lede">__LEDE__</p>
    </div>

    <form class="calc" id="calc" autocomplete="off" novalidate>
      <div class="calc-inputs">
__FORM__
        <div class="calc-actions"><button class="btn-ghost" type="reset" data-reset>Reset to defaults</button></div>
      </div>

      <div class="calc-results">
__RESULTS__
        <p id="excel-chip"></p>
      </div>
    </form>

    <aside class="ad-slot" aria-label="Advertisement">
      <span class="ad-tag">Advertisement</span>
      <span class="ad-body">Ad space. A small number of ads like this keep Quiet Zeros free — <a href="../about.html#ads">here's how that works</a>.</span>
    </aside>

    <article class="prose">
__PROSE__
    </article>

    <section class="related">
      <h2>Related tools</h2>
      <ul class="related-list" id="related-tools"></ul>
    </section>
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <div class="cols">
        <p class="disclosure"><strong>Free, and honest about why.</strong> Quiet Zeros is supported by a small number of clearly labeled ads — never inside a calculator, never disguised as content. Your numbers stay on your device.</p>
        <nav aria-label="Footer">
          <a href="../index.html">Calculators</a>
          <a href="../downloads.html">Excel templates</a>
          <a href="../best-accounts.html">Accounts &amp; cards</a>
          <a href="../about.html">About</a>
          <a href="../privacy.html">Privacy</a>
          <a href="../terms.html">Terms</a>
        </nav>
      </div>
      <p class="fineprint">© <span data-year>2026</span> Quiet Zeros. Estimates for planning only — not financial, tax or legal advice, and no substitute for a qualified financial planner or CPA.</p>
    </div>
  </footer>

  <script type="module" src="../assets/js/tools/__SLUG__.js"></script>
</body>
</html>
"""


def field(fid, label, *, prefix=None, suffix=None, value="0", fmin="0", fmax="100",
          step="1", help_=None, err=None, slider=None):
    pre = f'<span class="affix">{prefix}</span>' if prefix else ""
    suf = f'<span class="affix">{suffix}</span>' if suffix else ""
    h = f'\n          <p class="help">{help_}</p>' if help_ else ""
    e = f'\n          <p class="err">{err}</p>' if err else ""
    s = ""
    if slider:
        s = (f'\n          <input type="range" data-pair="{fid}" min="{slider[0]}" '
             f'max="{slider[1]}" step="{slider[2]}" value="{value}" aria-label="{label} slider">')
    return f"""        <div class="field">
          <label for="{fid}">{label}</label>
          <div class="input-wrap">{pre}<input id="{fid}" type="number" inputmode="decimal" value="{value}" min="{fmin}" max="{fmax}" step="{step}">{suf}</div>{s}{h}{e}
        </div>"""


HERO = """        <div class="hero-figure">
          <p class="label">__LABEL__</p>
          <p class="value" id="r-hero" aria-live="polite">—</p>
        </div>
        <p class="interpret" id="r-interpret"></p>"""


def hero(label):
    return HERO.replace("__LABEL__", label)


STAT_INFO = {'Per month': 'Yearly take-home divided by 12 — what actually lands across a month of paychecks after taxes and your savings contributions.', 'Per biweekly paycheck': 'Take-home divided by 26 — most US employers pay every two weeks, so this is the number to compare against your pay stub.', 'Effective tax rate': 'Total tax divided by gross income: the share of every dollar you earn that goes to taxes. This — not your bracket — is what you actually pay.', 'Marginal rate (fed + state)': 'The tax on your NEXT dollar, federal plus state. This is the rate a raise, a bonus, or a new deduction actually works against.', 'Loan amount': 'Home price minus your down payment — the only part that accrues interest.', 'Total interest': "Every dollar you pay beyond what you borrowed, summed over the loan's whole life.", 'Total cost of loan': 'Principal plus lifetime interest — the true price of the purchase if you hold the loan to the end.', 'Total paid': "Principal plus all interest — everything that leaves your pocket over the loan's life.", 'Payments': 'The number of monthly payments until the balance reaches zero.', 'Interest paid': 'Total interest under your payment plan, from today until the balance hits zero.', 'Interest saved': 'Lifetime interest with your extras versus without them — money that stays yours.', 'Paid off sooner by': 'How much earlier the debt dies compared to the regular payment alone.', 'Interest saved vs. minimum': 'Lifetime interest under your plan versus making only the required payments — the headline value of every move you stacked.', 'Sooner by': 'How much earlier the balance hits zero than the original schedule.', 'Interest with this plan': "All the interest you'd still pay following this plan to the end.", 'Total interest (plan)': "All the interest you'd still pay following this plan to the end.", 'Monthly payment now': 'Your current required payment. Recasts and refinances in your plan change this number at the month they happen.', 'New payment': 'The required monthly payment on the new loan — including closing costs if you chose to roll them in.', 'Break-even': 'The month your total costs with the refinance drop below staying put. Sell or refinance again before this point and the move lost money.', 'Lifetime difference': "Everything paid staying put versus refinancing, over each loan's full life. Term resets are why a lower payment can still cost more in total.", 'Keep old payment → paid off in': 'Refinance to the lower rate but keep paying your OLD amount: the entire rate cut attacks principal, and this is how fast the loan dies.', 'You contributed': 'The sum of your starting amount and every monthly deposit — the money that came from you.', 'Growth earned': 'What compounding added on top of your deposits — the money your money made.', 'Multiple of contributions': 'Final balance divided by what you put in. 2.0× means growth matched your deposits dollar for dollar.', "You'll contribute": "Every dollar you'll deposit between now and retirement, including any employer match you entered.", 'Sustainable monthly draw': 'The 4% rule: withdraw 4% of the nest egg in year one, then adjust for inflation — a pace that has survived most historical 30-year retirements.', "Total you'll deposit": 'The monthly amount times the number of months — your part of reaching the goal.', 'Interest earned': "The gap between your deposits and the goal — the part the account's interest covers for you.", 'Months': 'Deposits remaining until the target date.', 'Tip amount': 'The bill times your chosen percentage.', 'Total with tip': 'Bill plus tip — what the table owes altogether.', 'Tip per person': 'The tip share each person covers, rounded up to the cent.'}

def info_attr(label):
    import html as _h
    t = STAT_INFO.get(label)
    return f' data-info="{_h.escape(t)}"' if t else ""


def stats(*pairs):
    cells = "\n".join(
        f'          <div class="stat"{info_attr(k)}><p class="k">{k}</p><p class="v" id="{i}">—</p></div>'
        for k, i in pairs)
    return f'        <div class="stat-row">\n{cells}\n        </div>'


def chart(cid, title):
    return (f'        <div class="chart-block">\n          <p class="chart-title">{title}</p>\n'
            f'          <div class="chart" id="{cid}"></div>\n        </div>')


def sched(summary="Year-by-year table"):
    return (f'        <details class="sched">\n          <summary>{summary}</summary>\n'
            f'          <div id="sched-table"></div>\n        </details>')


TOOLS = [
    # ------------------------------------------------------------- loan
    dict(
        slug="loan",
        title="Loan calculator",
        desc="Free private loan calculator for auto, personal and student loans: monthly payment, total interest and payoff schedule. Runs entirely in your browser.",
        cat="Home &amp; loans",
        h1="Loan calculator",
        lede="Auto, personal, student — any fixed-rate loan. See the payment, what the interest really adds up to, and the payoff schedule. Nothing you type leaves this page.",
        form="\n".join([
            field("amount", "Loan amount", prefix="$", value="25000", fmin="100", fmax="5000000", step="500",
                  slider=("1000", "200000", "500"), err="Enter an amount between $100 and $5,000,000."),
            field("rate", "Interest rate (APR)", suffix="%", value="7.5", fmin="0", fmax="40", step="0.1",
                  help_="Auto loans often run 5–10%; personal loans 8–20%.",
                  err="Enter a rate between 0 and 40%."),
            field("term", "Term", suffix="years", value="5", fmin="0.5", fmax="40", step="0.5",
                  err="Enter a term between 6 months and 40 years."),
        ]),
        results="\n".join([
            hero("Monthly payment"),
            chart("chart-breakdown", "What you'll pay back, in total"),
            stats(("Total interest", "r-interest"), ("Total paid", "r-total"), ("Payments", "r-count")),
            chart("chart-amort", "Principal vs. interest paid, year by year"),
            sched("Amortization schedule (yearly)"),
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p>Fixed-rate loans use the same amortization formula as a mortgage:</p>
      <p class="formula">M = P × [ i (1 + i)ⁿ ] / [ (1 + i)ⁿ − 1 ] &nbsp;— <code>P</code> is the amount borrowed, <code>i</code> the monthly rate (APR ÷ 12), <code>n</code> the number of payments.</p>
      <p>Every payment is the same size, but its makeup shifts: interest is charged on the remaining balance, so early payments are interest-heavy and the last ones are nearly all principal.</p>
      <h3>Reading the total</h3>
      <p>The stacked bar shows the loan the way lenders rarely present it: the amount you borrowed next to the interest you'll hand over. On a long term, interest can rival the principal — shortening the term or paying extra principal (see the <a href="avalanche-snowball.html">debt payoff tool</a>) are the two levers that shrink it.</p>
      <h3>Notes</h3>
      <p>This assumes a simple amortizing loan with no fees, no compounding tricks, and payments made on time. Origination fees and precomputed-interest loans will differ — check the loan agreement's APR and total-of-payments disclosure.</p>""",
    ),
    # -------------------------------------------------- compound-interest
    dict(
        slug="compound-interest",
        title="Compound interest calculator",
        desc="Watch savings grow from contributions and compounding, year by year, with a full growth chart and table. Private — runs entirely in your browser.",
        cat="Saving &amp; investing",
        h1="Compound interest",
        lede="The eighth wonder, charted: what a starting balance plus steady contributions becomes over time. Nothing you type leaves this page.",
        form="\n".join([
            field("initial", "Starting amount", prefix="$", value="10000", fmin="0", fmax="50000000", step="500",
                  slider=("0", "200000", "500"), err="Enter $0 to $50,000,000."),
            field("monthly", "Monthly contribution", prefix="$", value="250", fmin="0", fmax="1000000", step="25",
                  err="Enter $0 to $1,000,000."),
            field("rate", "Annual return", suffix="%", value="7", fmin="0", fmax="30", step="0.1",
                  help_="The S&amp;P 500 has averaged ~10% before inflation, ~7% after.",
                  err="Enter 0 to 30%."),
            field("years", "Years", suffix="yrs", value="20", fmin="1", fmax="60", step="1",
                  slider=("1", "50", "1"), err="Enter 1 to 60 years."),
        ]),
        results="\n".join([
            hero("Balance after __YEARS__"),
            stats(("You contributed", "r-contrib"), ("Growth earned", "r-growth"), ("Multiple of contributions", "r-mult")),
            chart("chart-growth", "Contributions vs. growth over time"),
            sched(),
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p>Interest compounds monthly: each month the balance earns one-twelfth of the annual return, then your contribution is added.</p>
      <p class="formula">balance<sub>m+1</sub> = balance<sub>m</sub> × (1 + r/12) + contribution</p>
      <p>The chart splits the result into two honest layers: money you put in, and money the money made. Early on, contributions dominate. Given enough years the growth layer overtakes them — that crossover is the whole argument for starting early.</p>
      <h3>Choosing a return</h3>
      <p>Nobody knows future returns. A common planning range for diversified stock portfolios is 5–8% after inflation; savings accounts track prevailing rates. Try a pessimistic and an optimistic number and plan between them.</p>
      <h3>Notes</h3>
      <p>Returns are assumed steady, which real markets never are, and taxes and fees are ignored — both drag on the result. Treat this as a planning envelope, not a forecast.</p>""",
    ),
    # ---------------------------------------------------- savings-goal
    dict(
        slug="savings-goal",
        title="Savings goal calculator",
        desc="How much to set aside each month to reach a savings target by a date, including interest. Private — runs entirely in your browser.",
        cat="Saving &amp; investing",
        h1="Savings goal",
        lede="Name the number and the date; get the monthly amount that hits it. Nothing you type leaves this page.",
        form="\n".join([
            field("goal", "Goal amount", prefix="$", value="20000", fmin="1", fmax="50000000", step="500",
                  slider=("1000", "100000", "500"), err="Enter $1 to $50,000,000."),
            field("current", "Already saved", prefix="$", value="2000", fmin="0", fmax="50000000", step="100",
                  err="Enter $0 to $50,000,000."),
            field("years", "Time to goal", suffix="years", value="3", fmin="0.25", fmax="50", step="0.25",
                  err="Enter 3 months to 50 years."),
            field("rate", "Interest rate (APY)", suffix="%", value="4", fmin="0", fmax="15", step="0.1",
                  help_="High-yield savings accounts have recently paid 3.5–5%.",
                  err="Enter 0 to 15%."),
        ]),
        results="\n".join([
            hero("Set aside each month"),
            stats(("Total you'll deposit", "r-deposits"), ("Interest earned", "r-interest"), ("Months", "r-months")),
            chart("chart-progress", "Projected balance to goal"),
            sched("Balance by year"),
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p>The tool solves the future-value equation for the monthly deposit <code>m</code>:</p>
      <p class="formula">goal = current × (1 + i)ⁿ + m × [ (1 + i)ⁿ − 1 ] / i &nbsp;— <code>i</code> is the monthly rate, <code>n</code> the number of months.</p>
      <p>Your existing savings keep compounding on their own, so the further away the date, the more of the work interest does for you — and the smaller the monthly ask.</p>
      <h3>Notes</h3>
      <p>Assumes a steady APY, deposits at each month's end, and no withdrawals. Savings rates float, so revisit when your bank changes theirs. For goals more than ~10 years out, also glance at the <a href="compound-interest.html">compound interest tool</a> with investment-level returns.</p>""",
    ),
    # ----------------------------------------------------- retirement
    dict(
        slug="retirement",
        title="Retirement calculator",
        desc="Project a retirement nest egg from your current balance and monthly contributions, plus a sustainable monthly income estimate. Private — runs in your browser.",
        cat="Saving &amp; investing",
        h1="Retirement projection",
        lede="Where today's balance and steady contributions land by retirement age — and the monthly income that nest egg could sustain. Nothing you type leaves this page.",
        form="\n".join([
            field("age", "Current age", value="35", fmin="16", fmax="80", step="1",
                  err="Enter an age between 16 and 80."),
            field("retire", "Retirement age", value="65", fmin="30", fmax="85", step="1",
                  err="Enter an age between 30 and 85."),
            field("balance", "Current savings", prefix="$", value="50000", fmin="0", fmax="100000000", step="1000",
                  slider=("0", "1000000", "5000"), err="Enter $0 to $100,000,000."),
            field("monthly", "Monthly contribution", prefix="$", value="500", fmin="0", fmax="1000000", step="50",
                  help_="Include any employer match — it's part of the contribution.",
                  err="Enter $0 to $1,000,000."),
            field("rate", "Annual return", suffix="%", value="7", fmin="0", fmax="30", step="0.1",
                  err="Enter 0 to 30%."),
        ]),
        results="\n".join([
            hero("Projected at retirement"),
            stats(("You'll contribute", "r-contrib"), ("Growth earned", "r-growth"), ("Sustainable monthly draw", "r-income")),
            chart("chart-growth", "Contributions vs. growth to retirement"),
            sched(),
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p>The projection compounds your balance monthly and adds contributions, exactly like the <a href="compound-interest.html">compound interest tool</a>. The "sustainable monthly draw" applies the <strong>4% rule</strong>: withdrawing 4% of the nest egg in year one (then adjusting for inflation) has historically survived 30-year retirements in most market sequences.</p>
      <p class="formula">monthly draw ≈ nest egg × 4% ÷ 12</p>
      <h3>What to watch</h3>
      <p>These are nominal dollars — $1M in 30 years buys far less than $1M today. A quick correction: use a real return (return minus ~2.5–3% inflation) in the return field, and the whole projection reads in today's dollars.</p>
      <h3>Notes</h3>
      <p>Ignores taxes, fees, Social Security and market sequence risk. The 4% rule is a planning heuristic, not a guarantee — many planners now model 3.3–4%.</p>""",
    ),
    # ----------------------------------------------------- percentage
    dict(
        slug="percentage",
        title="Percentage calculator",
        desc="Percent of a number, percent change, and 'X is what percent of Y' — three quick percentage tools in one, running privately in your browser.",
        cat="Everyday",
        h1="Percentage calculator",
        lede="The three percentage questions everyone actually asks, answered as you type. Nothing you enter leaves this page.",
        form="\n".join([
            '        <p class="kicker tight">What is X% of Y?</p>',
            field("p1x", "X (percent)", suffix="%", value="15", fmin="-10000", fmax="10000", step="0.5"),
            field("p1y", "Y (number)", value="240", fmin="-1000000000", fmax="1000000000", step="1"),
            '        <p class="kicker gap">X is what % of Y?</p>',
            field("p2x", "X (part)", value="30", fmin="-1000000000", fmax="1000000000", step="1"),
            field("p2y", "Y (whole)", value="150", fmin="-1000000000", fmax="1000000000", step="1"),
            '        <p class="kicker gap">Change from A to B</p>',
            field("p3a", "A (from)", value="80", fmin="-1000000000", fmax="1000000000", step="1"),
            field("p3b", "B (to)", value="92", fmin="-1000000000", fmax="1000000000", step="1"),
        ]),
        results="\n".join([
            stats(("X% of Y", "r-p1"), ("X as % of Y", "r-p2"), ("Percent change", "r-p3")),
            '        <p class="interpret" id="r-interpret"></p>',
        ]),
        prose="""      <h2>The three formulas</h2>
      <p class="formula">X% of Y = Y × X ÷ 100 &nbsp;·&nbsp; X as a % of Y = X ÷ Y × 100 &nbsp;·&nbsp; change = (B − A) ÷ |A| × 100</p>
      <h3>The classic mix-up</h3>
      <p>Percent change is measured against the <em>starting</em> value. Going 80 → 92 is a 15% increase, but 92 → 80 is a 13% decrease — same gap, different base. And a 50% drop needs a 100% gain to get back to even, which is why "percent up then percent down" traps so many people.</p>""",
    ),
    # ------------------------------------------------------ tip-split
    dict(
        slug="tip-split",
        title="Tip & bill split calculator",
        desc="Work out the tip, the total, and each person's share instantly and privately in your browser.",
        cat="Everyday",
        h1="Tip &amp; bill split",
        lede="Tip, total, and who owes what — before the check gets awkward. Nothing you enter leaves this page.",
        form="\n".join([
            field("bill", "Bill amount", prefix="$", value="86.40", fmin="0", fmax="1000000", step="0.01",
                  err="Enter $0 to $1,000,000."),
            field("tip", "Tip", suffix="%", value="18", fmin="0", fmax="100", step="1",
                  slider=("0", "40", "1"),
                  help_="US sit-down service commonly runs 15–22%."),
            field("people", "Split between", suffix="people", value="2", fmin="1", fmax="50", step="1",
                  err="Enter 1 to 50 people."),
        ]),
        results="\n".join([
            hero("Each person pays"),
            stats(("Tip amount", "r-tip"), ("Total with tip", "r-total"), ("Tip per person", "r-tipeach")),
            '        <p class="interpret" id="r-note"></p>',
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p class="formula">tip = bill × tip% &nbsp;·&nbsp; total = bill + tip &nbsp;·&nbsp; per person = total ÷ people</p>
      <p>Per-person amounts round up to the cent, so the group never comes up short — at worst the server gets a few extra cents.</p>
      <h3>Tip on pre-tax or post-tax?</h3>
      <p>Convention (and most etiquette guides) says the pre-tax subtotal, but tipping on the post-tax total is common and slightly more generous. If you want pre-tax, just type the subtotal as the bill.</p>""",
    ),
]


TOOLS += [
    # ------------------------------------------------------ refinance
    dict(
        slug="refinance",
        title="Refinance calculator",
        desc="Should you refinance? Break-even month on closing costs, new payment, lifetime cost difference, and the keep-your-old-payment shortcut — computed privately in your browser.",
        cat="Home &amp; loans",
        h1="Refinance calculator",
        lede="A lower rate isn't automatically a win — closing costs and a reset clock can eat it. This shows the break-even month and the honest lifetime difference. Nothing you type leaves this page.",
        form="\n".join([
            field("balance", "Current loan balance", prefix="$", value="320000", fmin="1000", fmax="20000000", step="1000",
                  slider=("50000", "1200000", "5000"), err="Enter $1,000 to $20,000,000."),
            field("rate", "Current interest rate", suffix="%", value="6.9", fmin="0.1", fmax="25", step="0.125",
                  err="Enter 0.1 to 25%."),
            field("remyears", "Years left on current loan", suffix="yrs", value="26", fmin="1", fmax="40", step="0.5",
                  err="Enter 1 to 40 years."),
            field("newrate", "New interest rate", suffix="%", value="5.6", fmin="0.1", fmax="25", step="0.125",
                  help_="Refinancing usually starts making sense around 0.75–1% below your current rate.",
                  err="Enter 0.1 to 25%."),
            '''        <div class="field">
          <label for="newterm">New loan term</label>
          <div class="input-wrap">
            <select id="newterm" aria-label="New loan term">
              <option value="30" selected>30 years</option>
              <option value="20">20 years</option>
              <option value="15">15 years</option>
            </select>
          </div>
        </div>''',
            field("closing", "Closing costs", prefix="$", value="6000", fmin="0", fmax="200000", step="250",
                  help_="Typically 2–6% of the loan: origination, appraisal, title, recording.",
                  err="Enter $0 to $200,000."),
            '''        <div class="field">
          <label>Roll closing costs into the new loan?</label>
          <div class="chips" role="radiogroup" aria-label="Roll in closing costs">
            <label><input type="radio" name="rollin" value="no" checked>No — pay upfront</label>
            <label><input type="radio" name="rollin" value="yes">Yes — finance them</label>
          </div>
        </div>''',
        ]),
        results="\n".join([
            hero("Monthly payment change"),
            stats(("New payment", "r-newpay"), ("Break-even", "r-breakeven"), ("Lifetime difference", "r-lifetime"), ("Keep old payment → paid off in", "r-samepay")),
            chart("chart-cost", "Total money out the door — staying put vs. refinancing"),
            sched("Remaining balance by year, old vs. new"),
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p>Both paths are simulated month by month. Staying put means your current payment at your current rate until the balance hits zero. Refinancing means closing costs (upfront, or added to the balance if you roll them in), then the new payment at the new rate.</p>
      <p><strong>Break-even</strong> is the month the refinance's cumulative cost drops below the old loan's — before it, the refinance is behind; after it, every month is savings. If you might sell or move before break-even, refinancing loses money.</p>
      <h3>The term-reset trap, and the escape</h3>
      <p>Refinancing 26 remaining years into a fresh 30-year loan lowers the payment partly by adding four years of payments — the lifetime-difference number accounts for that honestly, which is why a lower payment can still show a negative lifetime result. The escape: refinance to the lower rate but <strong>keep paying your old payment</strong>. The "keep old payment" figure shows how fast the loan dies then — usually years earlier than your current path, with the rate cut doing all the work.</p>
      <h3>Notes</h3>
      <p>Assumes fixed rates and no prepayment penalties. Cash-out refinancing, points, and rate-buydown trade-offs aren't modeled. Tax effects of mortgage interest aren't included — with the standard deduction this high, they rarely change the answer.</p>""",
    ),
]


TOOLS += [
    # ------------------------------------------------ sequence-of-returns
    dict(
        slug="sequence-risk",
        title="Sequence-of-returns risk simulator",
        desc="Why retiring into a crash devastates a portfolio even when the average return is identical - three orderings of the same returns, wildly different endings.",
        cat="Saving &amp; investing",
        h1="Sequence-of-returns risk",
        lede="Average return is a lie of omission: the ORDER of good and bad years decides whether a retirement portfolio survives. Same returns, three different orders. Nothing you type leaves this page.",
        form="\n".join([
            field("nest", "Starting portfolio", prefix="$", value="1000000", fmin="10000", fmax="100000000", step="10000",
                  slider=("100000", "5000000", "50000"), err="Enter $10,000 to $100,000,000."),
            field("spend", "Yearly withdrawal", prefix="$", value="40000", fmin="0", fmax="10000000", step="1000",
                  help_="The classic 4% rule on $1M. Withdrawals are what make sequence matter."),
            field("avg", "Average annual return", suffix="%", value="7", fmin="0", fmax="20", step="0.5"),
            field("vol", "Volatility (typical swing)", suffix="%", value="12", fmin="0", fmax="30", step="1",
                  help_="Diversified stock portfolios historically swing roughly plus/minus 12-15% around their average."),
            field("yrs", "Years in retirement", suffix="yrs", value="30", fmin="5", fmax="50", step="1"),
        ]),
        results="\n".join([
            hero("Gap between best and worst order"),
            stats(("Crash-first ending", "r-bad"), ("Steady ending", "r-flat"), ("Boom-first ending", "r-good")),
            chart("chart-seq", "Same returns, three orders - balance over time"),
            sched("Balance by year, all three orders"),
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p>We build one fixed set of yearly returns whose average matches your number - spread across your volatility - then run the identical set in three orders: worst years first, steady, best years first. Every path earns <em>exactly the same returns overall</em>. The only difference is sequence.</p>
      <p class="formula">balance<sub>y+1</sub> = (balance<sub>y</sub> - withdrawal) x (1 + r<sub>y</sub>)</p>
      <h3>Why order matters once you withdraw</h3>
      <p>Selling shares in a down year converts a temporary loss into a permanent one - those shares are gone before the recovery arrives. Without withdrawals, order is irrelevant (multiplication commutes); with withdrawals, early losses compound against you forever. That is sequence-of-returns risk, and it is why two retirees with identical portfolios and identical average returns can end 30 years apart by millions.</p>
      <h3>What to do about it</h3>
      <p>The standard defenses: hold 1-3 years of spending in cash or bonds so down years aren't sale years; flex withdrawals downward in crashes; or work one more year past a bear market's start. The gap shown above is the price of ignoring it.</p>""",
    ),
    # ------------------------------------------------ roth conversion
    dict(
        slug="roth-conversion",
        title="Roth conversion bracket optimizer",
        desc="Plan multi-year traditional-to-Roth IRA conversions that fill - but never spill over - your chosen tax bracket. With the real 2026 brackets.",
        cat="Saving &amp; investing",
        h1="Roth conversion planner",
        lede="Convert too much in one year and you pay top rates; too little and the balance grows into future taxes. This fills your chosen bracket exactly, year by year, with real 2026 brackets. Nothing you type leaves this page.",
        form="\n".join([
            '''        <div class="field">
          <label>Filing status</label>
          <div class="chips" role="radiogroup" aria-label="Filing status">
            <label><input type="radio" name="status" value="single" checked>Single</label>
            <label><input type="radio" name="status" value="mfj">Married, joint</label>
          </div>
        </div>''',
            field("trad", "Traditional IRA / old 401(k) balance to convert", prefix="$", value="400000", fmin="1000", fmax="100000000", step="5000",
                  slider=("10000", "2000000", "10000"), err="Enter $1,000 to $100,000,000."),
            field("taxable", "Current taxable income (after deductions)", prefix="$", value="60000", fmin="0", fmax="10000000", step="1000",
                  help_="Line 15 on your 1040 - income already using up bracket space each year."),
            '''        <div class="field">
          <label for="ceiling">Fill up to the top of</label>
          <div class="input-wrap">
            <select id="ceiling" aria-label="Bracket ceiling">
              <option value="12">the 12% bracket</option>
              <option value="22" selected>the 22% bracket</option>
              <option value="24">the 24% bracket</option>
              <option value="32">the 32% bracket</option>
            </select>
          </div>
        </div>''',
            field("growth", "Balance grows at", suffix="%", value="6", fmin="0", fmax="15", step="0.5"),
        ]),
        results="\n".join([
            hero("Fully converted in"),
            stats(("Convert in year 1", "r-annual"), ("Total conversion tax", "r-tax"), ("Tax if converted all at once", "r-lump")),
            chart("chart-conv", "Traditional balance drawdown under the plan"),
            sched("Year-by-year conversion schedule"),
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p>Each year the plan converts exactly the space left in your chosen bracket: the bracket's top minus your taxable income. Tax on each conversion is computed with the real 2026 brackets - including any lower brackets a large gap spans - while the unconverted balance keeps growing at your rate.</p>
      <h3>Why spread conversions at all</h3>
      <p>Converting everything at once shoves most of it into the top brackets - the lump-sum figure above shows that penalty on your numbers. Spreading keeps every converted dollar at your chosen rate or below. The trade: the remaining balance keeps growing, so there is more to convert later - which is why the schedule sometimes never finishes at low ceilings.</p>
      <h3>Windows that make conversions golden</h3>
      <p>Early retirement before Social Security and RMDs; any low-income year; a market crash (converting depressed shares moves the whole recovery into the Roth). Watch two side effects: conversions can raise Medicare IRMAA premiums two years later, and each conversion carries its own 5-year clock for penalty-free access under 59 1/2.</p>
      <h3>Notes</h3>
      <p>Assumes constant brackets and other income (2026 rules throughout); state tax on conversions not included - check your rate in the <a href="take-home-pay.html">tax tool</a>.</p>""",
    ),
    # ------------------------------------------------ backdoor pro-rata
    dict(
        slug="backdoor-roth",
        title="Backdoor Roth pro-rata calculator",
        desc="The pro-rata rule decides how much of your backdoor Roth conversion is taxable - the trap for high earners with existing pre-tax IRA money, computed correctly.",
        cat="Saving &amp; investing",
        h1="Backdoor Roth &amp; the pro-rata rule",
        lede="The backdoor Roth is simple - unless you already hold pre-tax IRA money, in which case the IRS taxes every conversion proportionally. Here is exactly what your conversion costs, and the escape hatch. Nothing you type leaves this page.",
        form="\n".join([
            field("pretax", "ALL existing pre-tax IRA money (traditional + SEP + SIMPLE + rollover)", prefix="$", value="95000", fmin="0", fmax="100000000", step="1000",
                  help_="Every IRA in your name counts, across all custodians, as of Dec 31 of the conversion year. Workplace 401(k)s do NOT count.",
                  err="Enter $0 to $100,000,000."),
            field("basis", "Non-deductible (after-tax) contribution this year", prefix="$", value="7500", fmin="0", fmax="100000", step="500",
                  help_="The 2026 IRA limit is $7,500 ($8,600 at 50+)."),
            field("convert", "Amount you will convert to Roth", prefix="$", value="7500", fmin="1", fmax="100000000", step="500"),
            field("marg", "Your marginal tax rate", suffix="%", value="32", fmin="0", fmax="50", step="1",
                  help_="Federal + state, on your next dollar - the <a href=\"take-home-pay.html\">tax tool</a> shows it."),
        ]),
        results="\n".join([
            hero("Taxable share of your conversion"),
            stats(("Tax owed on conversion", "r-tax"), ("Tax-free share", "r-free"), ("Basis left in the IRA", "r-left")),
            chart("chart-prorata", "How the IRS sees every dollar you convert"),
            sched("The arithmetic, step by step"),
        ]),
        prose="""      <h2>How the pro-rata rule works</h2>
      <p>The IRS treats all your IRAs as one pot. When you convert, you cannot choose to convert "just the after-tax part" - every converted dollar carries the pot's overall pre-tax percentage:</p>
      <p class="formula">taxable % = pre-tax money / (pre-tax money + after-tax basis)</p>
      <p>With $95,000 pre-tax and a $7,500 non-deductible contribution, the pot is 92.7% pre-tax - so 92.7% of ANY conversion is taxed as income, exactly as if the backdoor did not exist. Form 8606 does this math at filing time; better to see it now.</p>
      <h3>The escape hatch: the reverse rollover</h3>
      <p>Pre-tax money sitting in a <em>workplace</em> plan does not count in the formula. If your 401(k) accepts roll-ins (most do), move the pre-tax IRA money into it before December 31 - the pot becomes almost pure basis and the conversion becomes almost tax-free. That single move is usually worth thousands.</p>
      <h3>Notes</h3>
      <p>The December 31 balance is what counts - converting in January does not dodge a balance that exists in December. Earnings between contribution and conversion are taxable (convert promptly). Federal treatment; a few states differ slightly.</p>""",
    ),
    # ------------------------------------------------ rent vs buy
    dict(
        slug="rent-vs-buy",
        title="Rent vs. buy - full opportunity cost",
        desc="The rent-vs-buy comparison done honestly: the invested down payment, PMI, maintenance, closing and selling costs all included - with the real crossover year.",
        cat="Home &amp; loans",
        h1="Rent or buy, honestly",
        lede="Most versions rig the answer by ignoring what your down payment could earn invested - or the 6% you will pay to sell. This one counts everything, both directions. Nothing you type leaves this page.",
        form="\n".join([
            field("price", "Home price", prefix="$", value="425000", fmin="10000", fmax="20000000", step="5000",
                  slider=("100000", "1500000", "5000"), err="Enter $10,000 to $20,000,000."),
            field("down", "Down payment", suffix="%", value="20", fmin="0", fmax="100", step="1",
                  help_="Below 20% adds PMI automatically (0.8%/yr until 20% equity)."),
            field("rate", "Mortgage rate", suffix="%", value="6.5", fmin="0.1", fmax="25", step="0.125"),
            field("proptax", "Property tax rate", suffix="%/yr", value="1.1", fmin="0", fmax="4", step="0.05"),
            field("maint", "Maintenance &amp; insurance", suffix="%/yr", value="1.5", fmin="0", fmax="5", step="0.1",
                  help_="The forgotten line: roofs, water heaters, insurance - 1-2% of value yearly is typical."),
            field("appre", "Home appreciation", suffix="%/yr", value="3.5", fmin="-5", fmax="15", step="0.5"),
            field("rent", "Comparable rent today", prefix="$", value="2200", fmin="100", fmax="100000", step="50",
                  slider=("500", "8000", "50")),
            field("rentgrow", "Rent grows at", suffix="%/yr", value="3", fmin="0", fmax="15", step="0.5"),
            field("invest", "Investments would earn", suffix="%/yr", value="7", fmin="0", fmax="20", step="0.5",
                  help_="What the down payment + closing costs + any monthly savings earn if you rent instead."),
            field("horizon", "How long you would stay", suffix="yrs", value="10", fmin="1", fmax="40", step="1"),
        ]),
        results="\n".join([
            hero("After your stay, buying leaves you"),
            stats(("Owner net worth", "r-own"), ("Renter net worth", "r-rentnw"), ("Crossover year", "r-cross")),
            chart("chart-rvb", "Net worth over time - owner vs. renter, everything counted"),
            sched("Year-by-year net worth, both paths"),
        ]),
        prose="""      <h2>What "everything counted" means</h2>
      <p><strong>The owner's side:</strong> mortgage payment, property tax, maintenance and insurance, PMI while equity is under 20%, and 3% closing costs going in - against growing equity and appreciation, minus 6% selling costs whenever you would sell. <strong>The renter's side:</strong> rent, growing yearly - while the down payment, closing costs, and every month the renter's total costs run cheaper than the owner's get invested at your return.</p>
      <p class="formula">owner net worth = home value x (1 - 6%) - loan balance ; renter net worth = invested portfolio</p>
      <h3>Why most calculators flatter buying</h3>
      <p>Three omissions do it: the down payment's investment earnings (on $85,000 at 7%, roughly $6,000 the renter earns every year), maintenance (1-2% of value, invisible until the roof fails), and the 6% exit fee. Include them and short stays usually favor renting - the crossover year above is where that flips for your numbers.</p>
      <h3>Notes</h3>
      <p>Mortgage-interest deductions are ignored - with today's standard deduction most owners do not itemize (the <a href="take-home-pay.html">tax tool</a> checks). Rent stability and the joy of painting a wall are real but unpriceable - this is the money half of the decision.</p>""",
    ),
    # ------------------------------------------------ real hourly wage
    dict(
        slug="real-hourly-wage",
        title="Real hourly wage - side hustle calculator",
        desc="Revenue minus materials, mileage, platform fees, self-employment tax and income tax, divided by ALL your hours - the number side-hustle articles never compute.",
        cat="Income &amp; taxes",
        h1="What your side hustle really pays",
        lede="Revenue is vanity. After materials, miles, fees and both taxes - divided by every hour including the unpaid admin - here is your actual wage. Nothing you type leaves this page.",
        form="\n".join([
            field("revenue", "Monthly revenue", prefix="$", value="1500", fmin="0", fmax="1000000", step="50",
                  slider=("0", "10000", "50")),
            field("materials", "Materials &amp; supplies", prefix="$", value="350", fmin="0", fmax="1000000", step="25",
                  help_="Filament, packaging, parts - everything consumed making what you sold."),
            field("fees", "Platform &amp; payment fees", prefix="$", value="150", fmin="0", fmax="1000000", step="25",
                  help_="Etsy/eBay/Amazon take 6-15%; card processing about 3%."),
            field("other", "Other costs (tools, software, booth fees)", prefix="$", value="50", fmin="0", fmax="1000000", step="25"),
            field("miles", "Miles driven for it", suffix="mi/mo", value="100", fmin="0", fmax="20000", step="10"),
            field("milerate", "IRS mileage rate", suffix="c/mi", value="70", fmin="0", fmax="120", step="0.5",
                  help_="70 cents is the 2025 IRS standard rate - update when the IRS posts the new year."),
            field("marg", "Your marginal income-tax rate", suffix="%", value="22", fmin="0", fmax="50", step="1",
                  help_="Side income stacks on TOP of your day job - the <a href=\"take-home-pay.html\">tax tool</a> shows your rate."),
            field("hours", "ALL hours - making, listing, shipping, admin", suffix="hrs/mo", value="40", fmin="1", fmax="500", step="1"),
        ]),
        results="\n".join([
            hero("Your real hourly wage"),
            stats(("Monthly profit before tax", "r-profit"), ("Self-employment tax", "r-setax"), ("Income tax", "r-inctax"), ("Take-home per month", "r-net")),
            chart("chart-hustle", "Where each month's revenue actually goes"),
            sched("The arithmetic, line by line"),
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p>Profit = revenue - materials - fees - other costs - the mileage deduction (miles x the IRS rate, which also approximates your real vehicle cost). Then both taxes hit: <strong>self-employment tax</strong> at 15.3% of 92.35% of profit - the tax W-2 people never see because employers pay half - and <strong>income tax</strong> at your marginal rate, because side income stacks on top of your salary, not beside it.</p>
      <p class="formula">real wage = (profit - SE tax - income tax) / all hours</p>
      <h3>The two lies side-hustle math usually tells</h3>
      <p>Counting only "making" hours - photography, listings, customer messages, packaging and the post-office run are hours too. And using average instead of marginal tax - your thousandth side-hustle dollar is taxed like your last salary dollar, not your first. Fix both and many hustles pay under minimum wage; the good ones prove themselves.</p>
      <h3>Notes</h3>
      <p>Half the SE tax is deductible against income tax (included). Hobby-loss rules, inventory accounting and state tax are not modeled. If profit clears about $1,000/yr, remember quarterly estimated taxes.</p>""",
    ),
    # ------------------------------------------------ social security
    dict(
        slug="social-security-breakeven",
        title="Social Security claiming-age breakeven",
        desc="Claim at 62, 67 or 70? The cumulative-benefit crossover ages, computed - they surprise almost everyone.",
        cat="Saving &amp; investing",
        h1="When to claim Social Security",
        lede="Claiming at 62 pays 30% less forever; waiting to 70 pays 24% more forever. Which wins depends on one thing - how long you live past the crossover ages this shows. Nothing you type leaves this page.",
        form="\n".join([
            field("fra", "Your monthly benefit at full retirement age (67)", prefix="$", value="2400", fmin="100", fmax="10000", step="50",
                  slider=("500", "5000", "50"),
                  help_="From your statement at ssa.gov/myaccount - takes two minutes to look up."),
            field("horizon", "Show through age", suffix="", value="95", fmin="75", fmax="105", step="1"),
        ]),
        results="\n".join([
            hero("Waiting 67 to 70 pays off at age"),
            stats(("Claim at 62", "r-62"), ("Claim at 67", "r-67"), ("Claim at 70", "r-70"), ("62 vs 67 crossover", "r-cross1")),
            chart("chart-ss", "Cumulative benefits collected, by claiming age"),
            sched("Cumulative totals at each age"),
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p>For anyone born 1960 or later, claiming at 62 pays 70% of your full benefit; 67 pays 100%; 70 pays 124% (delayed credits of 8% per year). The chart accumulates each stream from its start age; where lines cross is the age at which waiting overtakes claiming early.</p>
      <h3>Reading your crossovers</h3>
      <p>The typical pattern: 62-vs-67 crosses in the late 70s, 67-vs-70 in the early 80s. Life expectancy for someone who has already reached 62 is roughly 84 for men and 86 for women - past both crossovers - which is why actuaries usually favor waiting <em>if you can afford to</em>. Claim early when health or family history argues a shorter horizon, when you need the cash, or when a survivor benefit is not in play.</p>
      <h3>What is deliberately left out</h3>
      <p>COLA raises all three streams by the same percentage, so it barely moves the crossovers - these are real (today's) dollars. Not modeled: spousal and survivor strategy (often the strongest reason to delay - the survivor keeps the LARGER benefit), taxes on benefits, the earnings test if you claim while working, and investing early benefits. A financial planner earns their fee on the spousal question.</p>""",
    ),
    # ------------------------------------------------ debt payoff lab
    dict(
        slug="avalanche-snowball",
        title="Debt Payoff Lab - avalanche, snowball, or focus one loan",
        desc="Every debt, every strategy: avalanche, snowball, or minimums-on-everything-but-one. Per-loan extras, windfalls, rolling payments - with per-loan interest and real end dates.",
        cat="Home &amp; loans",
        h1="Debt Payoff Lab",
        lede="Your actual loans, your actual plan: attack the highest rate, the smallest balance, or one loan you just want gone - add a little extra to any of them - and see exactly what each loan costs and when it dies. Nothing you type leaves this page.",
        form="\n".join([
            '''        <div class="field">
          <label>Your loans - add as many as you have</label>
          <div class="ev-add">
            <button type="button" id="add-loan">+ Add a loan</button>
          </div>
          <div class="ev-list" id="loan-list"></div>
        </div>''',
            '''        <div class="field">
          <label>Strategy - where does spare money aim?</label>
          <div class="chips" role="radiogroup" aria-label="Strategy">
            <label><input type="radio" name="strategy" value="av" checked>Avalanche (highest APR)</label>
            <label><input type="radio" name="strategy" value="sb">Snowball (smallest balance)</label>
            <label><input type="radio" name="strategy" value="focus">Focus one loan</label>
          </div>
          <div class="subfields" id="focus-fields" hidden>
            <div class="field">
              <label for="focusdebt">Minimums on everything except</label>
              <div class="input-wrap">
                <select id="focusdebt" aria-label="Focus loan"></select>
              </div>
              <p class="help">All spare money hits this loan. When it dies, the rest continue by avalanche.</p>
            </div>
          </div>
        </div>''',
            '''        <div class="field">
          <label>When a loan is paid off, its payment...</label>
          <div class="chips" role="radiogroup" aria-label="Rollover">
            <label><input type="radio" name="roll" value="yes" checked>rolls into the attack</label>
            <label><input type="radio" name="roll" value="no">goes back in my pocket</label>
          </div>
          <p class="assume">Rolling is the classic method - constant outlay, fastest finish. Pocketing shows how your monthly payment shrinks as loans die.</p>
        </div>''',
            field("extra", "Extra toward debt each month (strategy money)", prefix="$", value="300", fmin="0", fmax="100000", step="25",
                  slider=("0", "2000", "25")),
            '''        <div class="field">
          <label>Expecting a windfall (refund, bonus)?</label>
          <div class="chips" role="radiogroup" aria-label="Windfall">
            <label><input type="radio" name="haswind" value="no" checked>No</label>
            <label><input type="radio" name="haswind" value="yes">Yes</label>
          </div>
          <div class="subfields" id="wind-fields" hidden>''',
            field("windfall", "One-time windfall", prefix="$", value="2000", fmin="0", fmax="1000000", step="250",
                  help_="Applied to the strategy's target in the month below."),
            field("windmonth", "... arriving in month", suffix="", value="6", fmin="1", fmax="120", step="1"),
            '''          </div>
        </div>''',
        ]),
        results="\n".join([
            hero("Debt-free in"),
            stats(("Total interest, your plan", "r-int"), ("Monthly outlay now", "r-paynow"), ("Outlay after first payoff", "r-paylater"), ("Best alternative saves", "r-alt")),
            chart("chart-bal", "Total debt over time - your plan vs. minimums only"),
            chart("chart-outlay", "What you actually pay each month"),
            '''        <div class="chart-block">
          <p class="chart-title">Strategy face-off, same budget</p>
          <div class="impact-list" id="impact"></div>
        </div>''',
            sched("Each loan: interest paid and payoff date"),
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p>Every month, each loan accrues interest at its APR. Minimums are paid first, then each loan's dedicated extra, then the strategy money - avalanche aims it at the highest APR, snowball at the smallest balance, focus at the one loan you chose (falling back to avalanche once it's gone). Windfalls land on the strategy's current target. When a loan dies, its payment either rolls into the attack or returns to your pocket - your choice, and the outlay chart shows the difference.</p>
      <h3>Focus mode - the honest word about it</h3>
      <p>Paying minimums on everything except one loan is emotionally excellent and mathematically fine WHEN the focused loan carries the highest rate - then it IS avalanche. Focusing a low-rate loan (say, clearing a car note for cash-flow room) costs real interest; the face-off list prices that choice so you make it with open eyes.</p>
      <h3>Dedicated extras vs. strategy money</h3>
      <p>A dedicated extra sticks to its loan no matter what - useful for a loan with a co-signer to protect or a promotional rate expiring. Strategy money hunts wherever the strategy points. Most plans work best with everything in strategy money; the option exists because real life has exceptions.</p>
      <h3>Notes</h3>
      <p>Fixed APRs, no new charges, constant minimums. If the budget can't cover interest, the results say so. Payoff dates assume this month is month 1.</p>""",
    ),
    # ------------------------------------------------ RSU withholding
    dict(
        slug="rsu-withholding",
        title="RSU withholding shortfall estimator",
        desc="Employers withhold a flat 22% on vested RSUs - your real rate is usually higher. Estimate the surprise tax bill before the IRS does.",
        cat="Income &amp; taxes",
        h1="RSU withholding shortfall",
        lede="Vested RSUs are taxed like salary, but employers withhold a flat 22% - while your actual marginal rate on that income may be 32-37%. The gap becomes an April surprise. Estimate yours now. Nothing you type leaves this page.",
        form="\n".join([
            '''        <div class="field">
          <label>Filing status</label>
          <div class="chips" role="radiogroup" aria-label="Filing status">
            <label><input type="radio" name="status" value="single" checked>Single</label>
            <label><input type="radio" name="status" value="mfj">Married, joint</label>
          </div>
        </div>''',
            field("salary", "Salary &amp; other ordinary income (before RSUs)", prefix="$", value="180000", fmin="0", fmax="10000000", step="5000",
                  slider=("50000", "800000", "5000")),
            field("rsu", "RSU value vesting this year", prefix="$", value="80000", fmin="0", fmax="20000000", step="2500",
                  help_="Shares x price at each vest. It is W-2 income the moment it vests - whether or not you sell."),
            field("staterate", "State marginal rate", suffix="%", value="5", fmin="0", fmax="14", step="0.5",
                  help_="States under-withhold on RSUs too - the <a href=\"take-home-pay.html\">tax tool</a> shows yours."),
            field("statewh", "State supplemental withholding", suffix="%", value="5", fmin="0", fmax="15", step="0.5"),
        ]),
        results="\n".join([
            hero("Estimated shortfall at filing"),
            stats(("Tax on the RSUs (fed+state)", "r-fedtax"), ("Withheld (fed+state)", "r-withheld"), ("Real marginal rate on RSUs", "r-eff"), ("Set aside per $10k vest", "r-setaside")),
            chart("chart-rsu", "Your RSU dollars: withheld vs. actually owed"),
            sched("The arithmetic"),
        ]),
        prose="""      <h2>Why the shortfall exists</h2>
      <p>The IRS classifies RSU vests as "supplemental wages," withheld at a flat <strong>22%</strong> (37% only on supplemental income past $1M). But the vest stacks on top of your salary - so its real marginal rate is whatever bracket your salary already reached: 24%, 32%, 35%. The calculator computes the actual 2026-bracket tax on your stacked income and subtracts what the flat rate withholds - federal and state.</p>
      <h3>What to do about it</h3>
      <p>Three fixes, in order of ease: sell enough shares at each vest and park the set-aside figure above; file a new W-4 adding extra withholding per paycheck; or pay quarterly estimates. And know the <strong>safe harbor</strong>: pay in at least 110% of last year's total tax (100% if AGI under $150k) and you owe no penalty regardless of the shortfall - the balance is simply due in April.</p>
      <h3>ESPP, while you're here</h3>
      <p>ESPP discounts are also ordinary income and typically have <em>zero</em> withholding - the same trap, smaller dollars. Add your expected discount income to the RSU field for a combined estimate.</p>
      <h3>Notes</h3>
      <p>Uses 2026 federal brackets and the standard deduction; Additional Medicare (0.9% over $200k/$250k) included. Capital gains after the vest are a separate, second tax event - the vest itself is pure ordinary income.</p>""",
    ),
]


TOOLS += [
    # ------------------------------------------------ rental vs S&P 500
    dict(
        slug="rental-vs-sp500",
        title="Rental property vs. the S&amp;P 500",
        desc="Buy a rental property or put the same cash in an index fund? Every cost - vacancy, management, maintenance, selling costs - and every tax effect - depreciation, mortgage interest, passive-loss limits, capital gains - counted on both sides.",
        cat="Saving &amp; investing",
        h1="Rental property, or the S&amp;P 500?",
        lede="Landlords count the rent and forget the roof; index-fund arguments forget that leverage cuts both ways. This prices every cost and every tax break on both sides, at your numbers. Nothing you type leaves this page.",
        form="\n".join([
            field("price", "Property price", prefix="$", value="320000", fmin="10000", fmax="20000000", step="5000",
                  slider=("50000", "1500000", "5000"), err="Enter $10,000 to $20,000,000."),
            field("down", "Down payment", suffix="%", value="25", fmin="0", fmax="100", step="1"),
            field("rate", "Mortgage rate", suffix="%", value="6.5", fmin="0.1", fmax="25", step="0.125"),
            field("term", "Loan term", suffix="yrs", value="30", fmin="5", fmax="40", step="1"),
            field("closing", "Closing costs", suffix="% of price", value="3", fmin="0", fmax="10", step="0.5"),
            field("rehab", "Upfront repairs / rehab", prefix="$", value="8000", fmin="0", fmax="1000000", step="500"),
            field("rent", "Monthly rent (today)", prefix="$", value="2400", fmin="0", fmax="100000", step="50",
                  slider=("200", "10000", "50")),
            field("vacancy", "Vacancy rate", suffix="%", value="6", fmin="0", fmax="50", step="1",
                  help_="Months empty between tenants, averaged - 6-8% is typical."),
            field("rentgrow", "Rent grows at", suffix="%/yr", value="3", fmin="0", fmax="15", step="0.5"),
            field("proptax", "Property tax", suffix="%/yr of value", value="1.2", fmin="0", fmax="4", step="0.05"),
            field("insurance", "Landlord insurance", suffix="%/yr of value", value="0.6", fmin="0", fmax="4", step="0.05"),
            field("maint", "Maintenance &amp; capex reserve", suffix="%/yr of value", value="1.2", fmin="0", fmax="5", step="0.1",
                  help_="Roofs, HVAC, turnover - 1-1.5% of value yearly is the standard landlord reserve."),
            field("mgmt", "Property management", suffix="% of rent", value="8", fmin="0", fmax="20", step="1",
                  help_="Set to 0 if you self-manage - but then your time isn't free either."),
            field("hoa", "HOA dues", prefix="$", value="0", fmin="0", fmax="10000", step="10", suffix="/mo"),
            field("appre", "Home appreciation", suffix="%/yr", value="3.5", fmin="-5", fmax="15", step="0.5"),
            field("building", "Building value (structure, not land)", suffix="% of price", value="80", fmin="0", fmax="100", step="5",
                  help_="Only the structure depreciates. 80% is a common rule of thumb; your tax bill has the real split."),
            field("sellcost", "Selling costs at exit", suffix="%", value="7", fmin="0", fmax="15", step="0.5",
                  help_="Agent commission plus closing costs when you eventually sell."),
            field("hold", "Holding period", suffix="yrs", value="15", fmin="1", fmax="40", step="1"),
            field("otherinc", "Your other income (for the $25k loss-allowance phase-out)", prefix="$", value="120000", fmin="0", fmax="10000000", step="5000",
                  help_="Rental losses offset other income dollar-for-dollar up to $25,000 if you actively manage - phasing out $100k-$150k MAGI."),
            field("marg", "Your marginal tax rate", suffix="%", value="24", fmin="0", fmax="50", step="1"),
            field("ltcg", "Long-term capital gains rate", suffix="%", value="15", fmin="0", fmax="37", step="1"),
            field("spreturn", "S&amp;P 500 expected return", suffix="%/yr", value="8", fmin="0", fmax="20", step="0.5",
                  help_="The alternative: put the same cash in an index fund instead."),
        ]),
        results="\n".join([
            hero("Rental property ends"),
            stats(("Property, after tax &amp; sale", "r-prop"), ("S&amp;P 500, same cash", "r-sp"), ("Total invested", "r-invested"), ("Avg. after-tax cash flow", "r-cashflow")),
            chart("chart-compare", "Terminal wealth over the holding period - property vs. index fund"),
            '''        <div class="chart-block">
          <p class="chart-title">Where the property\u2019s advantage (or disadvantage) comes from</p>
          <div class="impact-list" id="impact"></div>
        </div>''',
            sched("Year by year: cash flow, depreciation, and both balances"),
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p>Both paths start with the identical cash: your down payment, closing costs and rehab money. The property path runs a real landlord's year, every year of the holding period: rent grows and a vacancy discount is applied, then property tax, insurance, maintenance and management costs (each a percentage of the CURRENT home value or rent, so they grow with the property) are subtracted, then the mortgage payment. What's left is cash flow - and it's taxed or sheltered honestly: mortgage interest and straight-line depreciation (structure value ÷ 27.5 years) reduce taxable rental income, and losses offset up to $25,000 of your other income before phasing out between $100,000 and $150,000 of it, exactly like the IRS passive-activity rules. The index-fund path grows the same starting cash at your expected return - and whenever the property needs extra cash in a bad year, the index path gets that same extra contribution too, so neither side is unfairly starved of capital.</p>
      <p class="formula">depreciation/yr = (price &times; building %) &divide; 27.5 &nbsp;&middot;&nbsp; taxable rental income = rent collected &minus; operating costs &minus; mortgage interest &minus; depreciation</p>
      <h3>What happens at the end</h3>
      <p>The property sells at your appreciation rate, minus selling costs and the remaining loan. The gain is split two ways for tax: the depreciation you claimed gets "recaptured" at a flat 25%, and the rest of the gain is taxed at your capital-gains rate - both real IRS rules, not simplifications. Any positive cash flow collected along the way is assumed reinvested in the same index fund (with its own capital-gains tax applied at the end), so a landlord who banks the rent isn't penalized for not having spent it.</p>
      <h3>The honest tilt</h3>
      <p>Real estate wins on leverage (you control a $320,000 asset with a fraction down) and on the depreciation shield; the S&amp;P wins on liquidity, zero maintenance calls, and never needing a new roof at 2am. This tool prices the money; it can't price the phone call from a tenant.</p>
      <h3>Notes</h3>
      <p>Assumes steady occupancy at the stated vacancy rate (not lumpy real turnover), a constant marginal rate, and a sale at the end of the exact holding period. 1031 exchanges (which defer this sale tax entirely) aren't modeled - if you plan to exchange rather than cash out, the property side understates its result.</p>""",
    ),
]


def build():
    outdir = ROOT / "tools"
    outdir.mkdir(exist_ok=True)
    for t in TOOLS:
        html = (SHELL
                .replace("__TITLE__", t["title"])
                .replace("__DESC__", t["desc"])
                .replace("__CAT__", t["cat"])
                .replace("__H1__", t["h1"])
                .replace("__LEDE__", t["lede"])
                .replace("__FORM__", t["form"])
                .replace("__RESULTS__", t["results"])
                .replace("__PROSE__", t["prose"])
                .replace("__SLUG__", t["slug"]))
        (outdir / f"{t['slug']}.html").write_text(html, encoding="utf-8", newline="\n")
        print(f"wrote tools/{t['slug']}.html")


if __name__ == "__main__":
    build()
