# Blog drafts — awaiting your review

Posts live in `/blog/`. Drafts carry `<meta name="robots" content="noindex">`, are
NOT in sitemap.xml, and are not linked anywhere on the site — search engines and
visitors can't find them, but you can open them directly to review.

## Pending approval

1. **The same $50,000, three different mortgages**
   Preview: https://quietzeros.com/blog/same-50k-three-outcomes.html
   Angle: extra-payment vs recast vs refinance with exact Lab-computed numbers
   ($186,608 vs $58,699 saved; the year-2 vs year-20 timing effect). Links: Mortgage Lab, refinance calculator.

2. **What actually changed between your 2025 and 2026 taxes**
   Preview: https://quietzeros.com/blog/2025-vs-2026-taxes.html
   Angle: the seven concrete deltas with exact figures and "who it touches" —
   drives the calculator's new 2025/2026 toggle. Links: take-home tool.

## To approve a post (tell Claude, or do by hand)

1. Remove the `<meta name="robots" content="noindex">` line (and the DRAFT comment).
2. Add its URL to `sitemap.xml`.
3. Add it to `blog/index.html`'s list (and add blog/index.html itself to the
   sitemap + footer nav when the first post goes live).
4. Deploy.

## Editorial rules (what keeps this from being AI slop)

- Every post must contain numbers computed by our own tools, reproducible by the reader.
- Every claim carries its source (IRS rev. proc., issuer terms, Lab simulation).
- Each post links at least one calculator with a reason to click, never "check out our tool!"
- No generic advice that exists on a thousand other sites; if it doesn't need our
  data or tools to write, we don't publish it.
