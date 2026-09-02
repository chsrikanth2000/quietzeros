/* Quiet Zeros comments API — anonymous by design.
   Stores: page slug, optional display name, comment text, timestamp.
   No email, no IP retention, no cookies. Turnstile gates submissions.
   Moderation: DELETE /comments/:id with the admin bearer key. */
"use strict";

const ALLOWED_ORIGINS = new Set([
  "https://quietzeros.com",
  "https://www.quietzeros.com",
  "https://quietzeros.pages.dev",
  "http://localhost:8321", // local development preview
]);
const PAGE_RE = /^[a-z0-9-]{1,48}$/;
const MAX_BODY = 1200;
const MAX_NAME = 40;

function cors(origin) {
  const o = ALLOWED_ORIGINS.has(origin) ? origin : "https://quietzeros.com";
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}
const json = (data, status, extra) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const h = cors(origin);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: h });

    // GET /geo — the visitor's region, computed by Cloudflare's edge from the
    // connection itself. Nothing is looked up externally and nothing is stored;
    // the response is the only thing that leaves this function.
    if (url.pathname === "/geo" && request.method === "GET") {
      const cf = request.cf || {};
      return json({
        country: cf.country || null,
        region: cf.regionCode || null,
        city: cf.city || null,
      }, 200, h);
    }

    // GET /rates — Freddie Mac PMMS history, fetched from Freddie Mac at the
    // edge and cached 6 hours. Visitors talk only to this worker.
    if (url.pathname === "/rates" && request.method === "GET") {
      try {
        let r;
        for (let attempt = 0; attempt < 3; attempt++) {
          r = await fetch("https://www.freddiemac.com/pmms/docs/PMMS_history.csv", {
            cf: { cacheTtl: 21600, cacheEverything: true },
            headers: { "User-Agent": "Mozilla/5.0 (compatible; quietzeros.com rates page)" },
          });
          if (r.ok) break;
          await new Promise((res) => setTimeout(res, 400 * (attempt + 1)));
        }
        if (!r.ok) throw new Error(`PMMS HTTP ${r.status}`);
        const m30 = [], m15 = [];
        for (const line of (await r.text()).split("\n").slice(1)) {
          const c = line.split(",");
          if (c.length < 4) continue;
          const dm = c[0].trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (!dm) continue;
          const iso = `${dm[3]}-${dm[1].padStart(2, "0")}-${dm[2].padStart(2, "0")}`;
          const v30 = Number(c[1]), v15 = Number(c[3]);
          if (Number.isFinite(v30) && c[1].trim() !== "") m30.push([iso, v30]);
          if (Number.isFinite(v15) && c[3].trim() !== "") m15.push([iso, v15]);
        }
        if (m30.length < 100) throw new Error("PMMS parse failed");
        const monthly = (rows) => {
          const out = []; const seen = new Set();
          for (const [d, v] of rows) {
            const ym = d.slice(0, 7);
            if (!seen.has(ym)) { seen.add(ym); out.push([ym, v]); }
          }
          return out;
        };
        const yearAgoDate = new Date(new Date(m30[m30.length - 1][0]).getTime() - 360 * 864e5).toISOString().slice(0, 10);
        const yearAgo = [...m30].reverse().find(([d]) => d <= yearAgoDate);
        return json({
          source: "Freddie Mac Primary Mortgage Market Survey",
          latest: {
            date30: m30[m30.length - 1][0], r30: m30[m30.length - 1][1], prev30: m30[m30.length - 2][1],
            yearAgo30: yearAgo ? yearAgo[1] : null,
            date15: m15[m15.length - 1][0], r15: m15[m15.length - 1][1], prev15: m15[m15.length - 2][1],
          },
          recent30: m30.slice(-13), recent15: m15.slice(-13),
          monthly30: monthly(m30), monthly15: monthly(m15),
        }, 200, { ...h, "Cache-Control": "public, max-age=21600" });
      } catch (e) {
        return json({ error: "rates unavailable", detail: String(e && e.message || e) }, 503, h);
      }
    }

    if (url.pathname === "/comments" && request.method === "GET") {
      const page = url.searchParams.get("page") || "";
      if (!PAGE_RE.test(page)) return json({ error: "bad page" }, 400, h);
      const { results } = await env.DB.prepare(
        "SELECT id, name, body, ts FROM comments WHERE page = ?1 AND hidden = 0 ORDER BY ts DESC LIMIT 50"
      ).bind(page).all();
      return json({ comments: results }, 200, h);
    }

    if (url.pathname === "/comments" && request.method === "POST") {
      if (!ALLOWED_ORIGINS.has(origin)) return json({ error: "origin" }, 403, h);
      let b;
      try { b = await request.json(); } catch { return json({ error: "bad json" }, 400, h); }
      const page = String(b.page || "");
      const name = String(b.name || "").trim().slice(0, MAX_NAME);
      const body = String(b.body || "").trim();
      const token = String(b.token || "");
      if (!PAGE_RE.test(page)) return json({ error: "bad page" }, 400, h);
      if (body.length < 2 || body.length > MAX_BODY) return json({ error: "length" }, 400, h);
      if (!token) return json({ error: "turnstile" }, 403, h);

      // verify Turnstile server-side; the visitor's IP is used for the check only, never stored
      const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET,
          response: token,
          remoteip: request.headers.get("CF-Connecting-IP"),
        }),
      });
      const outcome = await verify.json();
      if (!outcome.success) return json({ error: "turnstile" }, 403, h);

      const ts = Date.now();
      await env.DB.prepare(
        "INSERT INTO comments (page, name, body, ts, hidden) VALUES (?1, ?2, ?3, ?4, 0)"
      ).bind(page, name || "Anonymous", body, ts).run();
      return json({ ok: true, comment: { name: name || "Anonymous", body, ts } }, 201, h);
    }

    const del = url.pathname.match(/^\/comments\/(\d+)$/);
    if (del && request.method === "DELETE") {
      const auth = request.headers.get("Authorization") || "";
      if (auth !== `Bearer ${env.ADMIN_KEY}`) return json({ error: "auth" }, 401, h);
      await env.DB.prepare("UPDATE comments SET hidden = 1 WHERE id = ?1").bind(Number(del[1])).run();
      return json({ ok: true }, 200, h);
    }

    return json({ error: "not found" }, 404, h);
  },
};
