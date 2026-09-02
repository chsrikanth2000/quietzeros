"use strict";

import { $, bindCalc, readField, money2 } from "../core.js";
import { initToolPage } from "../toolpage.js";

initToolPage("tip-split");

function compute() {
  const bill = readField($("#bill"));
  const tipPct = readField($("#tip"));
  const people = Math.max(1, Math.round(readField($("#people"))));

  const tip = bill * (tipPct / 100);
  const total = bill + tip;
  // Round each share UP to the cent so the group never underpays.
  const each = Math.ceil((total / people) * 100) / 100;
  const tipEach = Math.ceil((tip / people) * 100) / 100;

  $("#r-hero").textContent = money2(each);
  $("#r-tip").textContent = money2(tip);
  $("#r-total").textContent = money2(total);
  $("#r-tipeach").textContent = money2(tipEach);

  const overpay = each * people - total;
  $("#r-note").textContent =
    people > 1 && overpay > 0.001
      ? `Shares are rounded up, so the table pays ${money2(overpay)} over the exact total — the server won't mind.`
      : "";
}

bindCalc($("#calc"), compute);
