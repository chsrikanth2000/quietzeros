"use strict";

import { $, bindCalc, readField, num2 } from "../core.js";
import { initToolPage } from "../toolpage.js";

initToolPage("percentage");

function compute() {
  const p1x = readField($("#p1x")), p1y = readField($("#p1y"));
  const p2x = readField($("#p2x")), p2y = readField($("#p2y"));
  const p3a = readField($("#p3a")), p3b = readField($("#p3b"));

  $("#r-p1").textContent = num2((p1y * p1x) / 100);
  $("#r-p2").textContent = p2y !== 0 ? `${num2((p2x / p2y) * 100)}%` : "undefined";

  if (p3a !== 0) {
    const change = ((p3b - p3a) / Math.abs(p3a)) * 100;
    const dir = change > 0 ? "increase" : change < 0 ? "decrease" : "no change";
    $("#r-p3").textContent = `${num2(Math.abs(change))}% ${dir === "no change" ? "" : dir}`.trim();
    $("#r-interpret").textContent =
      change === 0
        ? ""
        : `Note the asymmetry: ${p3a} → ${p3b} is a ${num2(Math.abs(change))}% ${dir}, but going back from ` +
          `${p3b} → ${p3a} would be a ${num2(Math.abs(((p3a - p3b) / Math.abs(p3b || 1)) * 100))}% ` +
          `${change > 0 ? "decrease" : "increase"}.`;
  } else {
    $("#r-p3").textContent = "undefined";
    $("#r-interpret").textContent = "Percent change from zero is undefined — any nonzero result is infinitely many percent away.";
  }
}

bindCalc($("#calc"), compute);
