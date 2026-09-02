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
  <link rel="canonical" href="https://quietzeros.com/tools/__SLUG__.html">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Quiet Zeros">
  <meta property="og:title" content="__TITLE__">
  <meta property="og:description" content="__DESC__">
  <meta property="og:url" content="https://quietzeros.com/tools/__SLUG__.html">
  <meta property="og:image" content="https://quietzeros.com/assets/img/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#12523a">
  <link rel="preload" href="../assets/fonts/fraunces-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../assets/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"__TITLE__","url":"https://quietzeros.com/tools/__SLUG__.html","description":"__DESC__","applicationCategory":"FinanceApplication","operatingSystem":"Any","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}</script>
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
      <p class="fineprint">© <span data-year>2026</span> Quiet Zeros. Results are estimates for planning, not financial advice.</p>
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


def stats(*pairs):
    cells = "\n".join(
        f'          <div class="stat"><p class="k">{k}</p><p class="v" id="{i}">—</p></div>'
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
      <p>The stacked bar shows the loan the way lenders rarely present it: the amount you borrowed next to the interest you'll hand over. On a long term, interest can rival the principal — shortening the term or paying extra principal (see the <a href="debt-payoff.html">debt payoff tool</a>) are the two levers that shrink it.</p>
      <h3>Notes</h3>
      <p>This assumes a simple amortizing loan with no fees, no compounding tricks, and payments made on time. Origination fees and precomputed-interest loans will differ — check the loan agreement's APR and total-of-payments disclosure.</p>""",
    ),
    # ------------------------------------------------------- debt-payoff
    dict(
        slug="debt-payoff",
        title="Debt payoff calculator",
        desc="See how extra monthly payments shorten a credit card or loan and how much interest they save. Private — runs entirely in your browser.",
        cat="Home &amp; loans",
        h1="Debt payoff",
        lede="Point a little extra money at a balance and watch the payoff date move. Nothing you type leaves this page.",
        form="\n".join([
            field("balance", "Current balance", prefix="$", value="8000", fmin="1", fmax="5000000", step="100",
                  slider=("500", "50000", "100"), err="Enter a balance between $1 and $5,000,000."),
            field("rate", "Interest rate (APR)", suffix="%", value="22", fmin="0", fmax="60", step="0.1",
                  help_="Credit cards commonly run 18–28% APR.",
                  err="Enter a rate between 0 and 60%."),
            field("payment", "Monthly payment", prefix="$", value="250", fmin="1", fmax="100000", step="10",
                  err="Enter a payment between $1 and $100,000."),
            field("extra", "Extra per month", prefix="$", value="100", fmin="0", fmax="100000", step="10",
                  help_="Anything above the regular payment goes straight to principal.",
                  err="Enter $0 to $100,000."),
        ]),
        results="\n".join([
            hero("Debt-free in"),
            stats(("Interest paid", "r-interest"), ("Interest saved", "r-saved"), ("Paid off sooner by", "r-sooner")),
            chart("chart-balance", "Balance over time — with and without the extra payment"),
            sched("Balance by year (with extra payment)"),
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p>Each month the balance grows by one month of interest (APR ÷ 12), then shrinks by your payment. The simulation runs month by month until the balance hits zero — once with your regular payment, once with the extra added — and compares the two.</p>
      <p class="formula">new balance = balance × (1 + APR/12) − payment</p>
      <h3>Why small extras work so hard</h3>
      <p>Every extra dollar goes entirely to principal, and principal you remove today stops accruing interest for every remaining month. That's why $100 extra on a 22% card often saves multiples of itself.</p>
      <h3>If the payoff time says "never"</h3>
      <p>A payment smaller than the first month's interest means the balance grows instead of shrinking. The calculator will warn you and show the minimum payment that makes progress.</p>
      <h3>Notes</h3>
      <p>Assumes a fixed APR, no new charges, and no fees. Cards compound daily in practice; monthly compounding is a close, slightly optimistic approximation.</p>""",
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
    # ------------------------------------------------- mortgage-payoff
    dict(
        slug="mortgage-payoff",
        title="Mortgage payoff calculator",
        desc="Model extra monthly payments, yearly bonuses and one-time lump sums on your mortgage — see the payoff date move and the interest saved. Private, in-browser.",
        cat="Home &amp; loans",
        h1="Mortgage payoff planner",
        lede="Point extra money at your mortgage — a monthly amount, a yearly bonus, a lump sum in year three — and watch the payoff date move. Nothing you type leaves this page.",
        form="\n".join([
            field("amount", "Original loan amount", prefix="$", value="380000", fmin="1000", fmax="20000000", step="1000",
                  slider=("50000", "1500000", "5000"), err="Enter $1,000 to $20,000,000."),
            field("rate", "Interest rate (APR)", suffix="%", value="6.5", fmin="0", fmax="25", step="0.125",
                  err="Enter 0 to 25%."),
            '''        <div class="field">
          <label for="term">Loan term</label>
          <div class="input-wrap">
            <select id="term" aria-label="Loan term">
              <option value="30" selected>30 years</option>
              <option value="20">20 years</option>
              <option value="15">15 years</option>
              <option value="10">10 years</option>
            </select>
          </div>
        </div>''',
            field("paid", "Years already paid", suffix="yrs", value="0", fmin="0", fmax="39", step="0.5",
                  help_="Zero for a new loan. We compute today's balance from this.",
                  err="Enter 0 to 39 years."),
            field("extra", "Extra every month", prefix="$", value="200", fmin="0", fmax="100000", step="25",
                  slider=("0", "2000", "25")),
            field("extrayr", "Extra once a year (bonus, tax refund)", prefix="$", value="0", fmin="0", fmax="1000000", step="100"),
            field("lump1", "One-time lump sum", prefix="$", value="0", fmin="0", fmax="10000000", step="500"),
            field("lump1yr", "… paid in year", suffix="yr", value="2", fmin="1", fmax="40", step="1"),
            field("lump2", "Second lump sum", prefix="$", value="0", fmin="0", fmax="10000000", step="500"),
            field("lump2yr", "… paid in year", suffix="yr", value="5", fmin="1", fmax="40", step="1"),
        ]),
        results="\n".join([
            hero("Paid off in"),
            stats(("Interest saved", "r-saved"), ("Sooner by", "r-sooner"), ("Interest with this plan", "r-interest")),
            chart("chart-balance", "Balance over time — your plan vs. minimum payments"),
            '''        <div class="chart-block">
          <p class="chart-title">What different monthly extras would do</p>
          <div id="cmp-table"></div>
        </div>''',
            sched("Balance by year (with your plan)"),
        ]),
        prose="""      <h2>How this is calculated</h2>
      <p>The simulator runs your loan month by month: interest accrues on the balance, your payment lands, and any extras — the monthly amount, the once-a-year bonus, the lump sums in the years you chose — go straight to principal.</p>
      <p class="formula">new balance = balance × (1 + rate/12) − payment − extras due that month</p>
      <h3>Why extras punch above their weight</h3>
      <p>A dollar of principal paid today stops accruing interest for every remaining month of the loan. Early extras are therefore worth far more than late ones — a $10,000 lump sum in year 2 typically saves several times what the same sum saves in year 20.</p>
      <h3>Extra payments or refinance?</h3>
      <p>Extra payments shorten the loan at your current rate; refinancing replaces the rate itself. If rates have dropped meaningfully since you closed, run the <a href="refinance.html">refinance calculator</a> — and note that the two combine well: refinance to a lower rate, keep paying your old payment, and the loan collapses years early.</p>
      <h3>Notes</h3>
      <p>Assumes a fixed rate and no prepayment penalty (rare on US mortgages, but check). Escrowed taxes and insurance continue regardless — this models the loan itself.</p>""",
    ),
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
