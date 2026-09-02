/* Quiet Zeros core — shared helpers.
   Security posture: every value read from the DOM is coerced to a finite,
   clamped number before use; every value written to the DOM goes through
   textContent (never markup). No network calls, no eval, no storage beyond
   the theme word. */
"use strict";

export const $ = (sel, root) => (root || document).querySelector(sel);
export const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

/** Create an element with attributes and children — the only way this
    codebase builds DOM. Text is always assigned via createTextNode. */
export function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "dataset") Object.assign(node.dataset, v);
      else if (k === "style" && typeof v === "object") Object.assign(node.style, v); // CSSOM, not a style attribute — works under strict CSP
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, String(v));
    }
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

/** SVG element helper (separate namespace). */
export function svgEl(tag, attrs, ...children) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  for (const c of children.flat()) {
    if (c == null) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

/* ---- Numbers ---- */
export function toNum(v, fallback = 0) {
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const fmtUSD0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtUSD2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtNum0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const fmtNum2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export const money = (n) => fmtUSD0.format(n);
export const money2 = (n) => fmtUSD2.format(n);
export const num = (n) => fmtNum0.format(n);
export const num2 = (n) => fmtNum2.format(n);
export const pct = (n, d = 1) => `${fmtNum2.format(Math.round(n * 10 ** d) / 10 ** d)}%`;
/** Compact money for axis ticks: $1.2M / $450K / $80 */
export function moneyShort(n) {
  const a = Math.abs(n);
  if (a >= 1e6) return `$${num2(n / 1e6)}M`;
  if (a >= 1e3) return `$${fmtNum0.format(Math.round(n / 1e3))}K`;
  return fmtUSD0.format(n);
}
export function years(n) {
  const y = Math.floor(n), m = Math.round((n - y) * 12);
  if (m === 0) return `${y} yr${y === 1 ? "" : "s"}`;
  if (y === 0) return `${m} mo`;
  return `${y} yr ${m} mo`;
}

/* ---- Field reading with validation ---- */
/** Read a numeric input: coerce, clamp to [min,max] from attributes,
    flag the field when the typed value fell outside the allowed range. */
export function readField(input) {
  const min = toNum(input.min, -Infinity);
  const max = toNum(input.max, Infinity);
  const raw = toNum(input.value, NaN);
  const field = input.closest(".field");
  const bad = !Number.isFinite(raw) || raw < min || raw > max;
  if (field) field.classList.toggle("invalid", bad && input.value.trim() !== "");
  if (!Number.isFinite(raw)) return toNum(input.defaultValue, min === -Infinity ? 0 : min);
  return clamp(raw, min, max);
}

/* ---- Live form binding ---- */
/** Recalculate on every input, debounced one frame. Pairs any
    input[type=range][data-pair] with its numeric twin. */
export function bindCalc(form, compute) {
  let raf = 0;
  const run = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { try { compute(); } catch (e) { console.error(e); } });
  };
  for (const r of $$('input[type="range"][data-pair]', form)) {
    const twin = $("#" + r.dataset.pair, form);
    if (!twin) continue;
    r.addEventListener("input", () => { twin.value = r.value; run(); });
    twin.addEventListener("input", () => { r.value = twin.value; });
  }
  form.addEventListener("input", run);
  form.addEventListener("submit", (e) => e.preventDefault());
  const reset = $("[data-reset]", form);
  if (reset) reset.addEventListener("click", () => {
    setTimeout(() => { for (const r of $$('input[type="range"][data-pair]', form)) { const t = $("#" + r.dataset.pair, form); if (t) r.value = t.value; } run(); }, 0);
  });
  run();
  return run;
}

/* ---- Theme toggle ---- */
export function initChrome() {
  const btn = $(".theme-toggle");
  if (btn) btn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("qz-theme", next); } catch (e) { /* fine without storage */ }
    document.dispatchEvent(new CustomEvent("qz:theme"));
  });
  const yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  // printed reports should include collapsed schedules
  window.addEventListener("beforeprint", () => {
    for (const d of document.querySelectorAll("details")) d.setAttribute("open", "");
  });
}

/* ---- Amortization math (shared by several tools) ---- */
/** Fixed-rate payment for principal P, annual rate r%, n monthly payments. */
export function pmt(P, annualRatePct, months) {
  const i = annualRatePct / 100 / 12;
  if (months <= 0) return 0;
  if (i === 0) return P / months;
  return P * (i / (1 - Math.pow(1 + i, -months)));
}

/** Flexible month-by-month loan simulation.
    opts: { extraMonthly, extraYearly (applied every 12th month),
            lumps: [{ month, amount }] (one-time principal payments) }
    Returns { months, totalInterest, balances } — balances[m] = balance after month m. */
export function simulateLoan(balance, annualRatePct, basePayment, opts = {}) {
  const i = annualRatePct / 100 / 12;
  const extraM = opts.extraMonthly || 0;
  const extraY = opts.extraYearly || 0;
  const lumps = opts.lumps || [];
  let bal = balance, m = 0, totalInterest = 0;
  const balances = [balance];
  const cap = 12 * 100;
  if (basePayment + extraM <= balance * i && extraY <= 0 && !lumps.length) return null;
  while (bal > 0.005 && m < cap) {
    m++;
    const interest = bal * i;
    totalInterest += interest;
    let pay = basePayment + extraM;
    if (m % 12 === 0) pay += extraY;
    for (const l of lumps) if (l.month === m) pay += l.amount;
    bal = Math.max(0, bal + interest - pay);
    balances.push(bal);
  }
  if (bal > 0.005) return null; // never pays off within 100 years
  return { months: m, totalInterest, balances };
}

/** Month-by-month schedule; extra = additional principal per month.
    Returns { rows, months, totalInterest } where rows are yearly summaries. */
export function amortize(P, annualRatePct, months, extra = 0) {
  const i = annualRatePct / 100 / 12;
  const base = pmt(P, annualRatePct, months);
  let bal = P, m = 0, totalInterest = 0;
  const rows = [];
  let yInt = 0, yPrin = 0;
  const cap = 12 * 100; // hard iteration cap: 100 years
  while (bal > 0.005 && m < cap) {
    m++;
    const interest = bal * i;
    let principal = base + extra - interest;
    if (principal <= 0 && extra <= 0 && i > 0) { principal = 0.01; } // guard: never loop forever
    if (principal > bal) principal = bal;
    bal -= principal;
    totalInterest += interest;
    yInt += interest; yPrin += principal;
    if (m % 12 === 0 || bal <= 0.005) {
      rows.push({ year: Math.ceil(m / 12), interest: yInt, principal: yPrin, balance: Math.max(0, bal) });
      yInt = 0; yPrin = 0;
    }
  }
  return { rows, months: m, totalInterest, payment: base };
}
