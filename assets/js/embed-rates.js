/* Embeddable rates badge — fetches this week's PMMS numbers from our worker. */
"use strict";

(async () => {
  try {
    const r = await fetch("https://qz-comments.chsrikanth2000.workers.dev/rates");
    const d = await r.json();
    if (!d.latest) throw new Error();
    document.getElementById("e30").textContent = d.latest.r30.toFixed(2) + "%";
    document.getElementById("e15").textContent = d.latest.r15.toFixed(2) + "%";
    document.getElementById("edate").textContent =
      "Week of " + new Date(d.latest.date30 + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    document.getElementById("edate").textContent = "quietzeros.com/tools/mortgage-lab";
  }
})();
