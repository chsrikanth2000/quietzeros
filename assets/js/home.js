/* Home page — renders the tool index from the registry. */
"use strict";

import { $, el, initChrome } from "./core.js";
import { TOOLS, CATEGORIES } from "./registry.js";

initChrome();

const host = $("#tool-index");
if (host) {
  let n = 0;
  for (const cat of CATEGORIES) {
    host.append(el("div", { class: "section-head" },
      el("h2", {}, cat),
    ));
    const list = el("div", { class: "tool-index" });
    for (const t of TOOLS.filter((t) => t.cat === cat)) {
      n++;
      list.append(el("a", { class: "tool-row", href: `tools/${t.slug}.html` },
        el("span", { class: "idx" }, String(n).padStart(2, "0")),
        el("span", {},
          el("span", { class: "name" }, t.name),
          el("span", { class: "desc" }, t.desc)),
        el("span", { class: "go", "aria-hidden": "true" }, "Open →")));
    }
    host.append(list);
  }
}
