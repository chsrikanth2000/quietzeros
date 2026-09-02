/* Anonymous comments — no account, no email, ever.
   Backend: the qz-comments Worker (D1). Bot gate: Cloudflare Turnstile.
   Loaded on tool pages by toolpage.js. */
"use strict";

import { $, el } from "./core.js";

const API = "https://qz-comments.chsrikanth2000.workers.dev";
const SITEKEY = "0x4AAAAAAEkaVxPeNbA4AhCK";

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function initComments(slug) {
  const host = el("section", { class: "comments", "aria-label": "Comments" },
    el("h2", {}, "Comments"),
    el("p", { class: "q-note" },
      "No account, no email — say what you think and it posts as written. A quick Cloudflare bot-check is the only gate."));
  const list = el("div", { class: "c-list" }, el("p", { class: "q-note" }, "Loading…"));

  const nameIn = el("input", { type: "text", maxlength: "40", placeholder: "Name (optional)" });
  const bodyIn = el("textarea", { maxlength: "1200", rows: "3", placeholder: "Spotted a bug? Want a feature? A scenario that surprised you?" });
  const ts = el("div", { class: "cf-turnstile", dataset: { sitekey: SITEKEY, theme: "auto" } });
  const status = el("p", { class: "q-note", role: "status" });
  const btn = el("button", { class: "c-submit", type: "button" }, "Post comment");

  const form = el("div", { class: "c-form" },
    el("div", { class: "input-wrap" }, nameIn),
    el("div", { class: "input-wrap" }, bodyIn),
    ts, btn, status);

  host.append(form, list);
  const related = $(".related");
  if (related) related.before(host); else $("#main").append(host);

  async function load() {
    try {
      const r = await fetch(`${API}/comments?page=${encodeURIComponent(slug)}`);
      const d = await r.json();
      list.replaceChildren(
        ...(d.comments || []).map((c) => el("div", { class: "c-item" },
          el("p", { class: "c-meta" }, c.name || "Anonymous", el("span", {}, ` · ${timeAgo(c.ts)}`)),
          el("p", { class: "c-body" }, c.body))));
      if (!d.comments || !d.comments.length) {
        list.replaceChildren(el("p", { class: "q-note" }, "No comments yet — yours starts it."));
      }
    } catch {
      list.replaceChildren(el("p", { class: "q-note" }, "Comments couldn't load right now."));
    }
  }

  // Turnstile renders declaratively once its script is present
  if (!document.querySelector('script[src^="https://challenges.cloudflare.com"]')) {
    document.head.append(el("script", {
      src: "https://challenges.cloudflare.com/turnstile/v0/api.js", async: "", defer: "",
    }));
  }

  btn.addEventListener("click", async () => {
    const body = bodyIn.value.trim();
    if (body.length < 2) { status.textContent = "Write a little more first."; return; }
    const tokenEl = form.querySelector('[name="cf-turnstile-response"]');
    const token = tokenEl ? tokenEl.value : "";
    if (!token) { status.textContent = "One second — the bot check hasn't finished."; return; }
    btn.disabled = true; status.textContent = "Posting…";
    try {
      const r = await fetch(`${API}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: slug, name: nameIn.value.trim(), body, token }),
      });
      if (r.ok) {
        bodyIn.value = "";
        status.textContent = "Posted. Thanks!";
        if (window.turnstile) window.turnstile.reset();
        await load();
      } else {
        const d = await r.json().catch(() => ({}));
        status.textContent = d.error === "turnstile" ? "Bot check expired — try again." : "Couldn't post. Try again.";
      }
    } catch {
      status.textContent = "Network hiccup — try again.";
    }
    btn.disabled = false;
  });

  load();
}
