/* Shared chrome for tool pages: theme toggle, related-tool chips,
   and the Excel-download chip when the registry lists one. */
"use strict";

import { $, el, initChrome } from "./core.js";
import { TOOLS } from "./registry.js";
import { initComments } from "./comments.js";

export function initToolPage(slug) {
  initChrome();
  const me = TOOLS.find((t) => t.slug === slug);
  initComments(slug);

  const rel = $("#related-tools");
  if (rel) {
    const others = TOOLS.filter((t) => t.slug !== slug && (!me || t.cat === me.cat));
    const pool = others.length >= 2 ? others : TOOLS.filter((t) => t.slug !== slug);
    rel.append(...pool.slice(0, 4).map((t) => el("li", {}, el("a", { href: `${t.slug}.html` }, t.name))));
  }

  const dl = $("#excel-chip");
  if (dl && me && me.excel) {
    dl.append(
      el("a", { class: "dl-btn", href: `../downloads/${me.excel}`, download: "" },
        `⇩ Download the Excel version (${me.excel})`)
    );
  }
}
