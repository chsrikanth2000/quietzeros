"use strict";

import { $, $$, el, bindCalc, readField, money } from "../core.js";
import { initToolPage } from "../toolpage.js";
import { breakdown } from "../charts.js";
import { STATES } from "../data/tax-2026.js";

initToolPage("move-cost");

/* Per-home-size defaults: shipment weight (full-service pricing), DIY truck
 * sizing factor, packing-service cost, estimated belongings value, hired-
 * loader flat fee (hybrid mode), and local (<=100mi) job cost/hours. Sources:
 * ConsumerAffairs/MoveBuddha/HireAHelper/Move.org mover & truck-rental
 * surveys, MoveAdvisor packing-cost survey (Sept 2026, see prose sources). */
const SIZE = {
  1: { label: "Studio / 1BR", weight: 3000, diyFactor: 0.9, diyLocal: 140, packing: 450, belongings: 15000, loadHelp: 250, localHours: 4 },
  2: { label: "2BR", weight: 5500, diyFactor: 1.0, diyLocal: 160, packing: 750, belongings: 30000, loadHelp: 350, localHours: 6 },
  3: { label: "3BR", weight: 7500, diyFactor: 1.3, diyLocal: 170, packing: 1350, belongings: 45000, loadHelp: 500, localHours: 8 },
  4: { label: "4BR+", weight: 10000, diyFactor: 1.7, diyLocal: 175, packing: 2650, belongings: 60000, loadHelp: 700, localHours: 10 },
};
const LOCAL_HOURLY_RATE = 140; // 2-mover crew, industry average
const LONG_HAUL_DIY_RATE = 1.60; // $/mile, U-Haul-style one-way long-distance average
const FULL_SERVICE_RATE_PER_1000LB_PER_MI = 0.60; // mid of $0.50-0.70/1000lb-mile
const STORAGE_RATE = { "10x10": 120, "10x20": 220 };
const STORAGE_ADMIN_FEE = 20;
const LODGING_NIGHTLY = 155;
const PET_RATE = { ground: 800, air: 650, cabin: 150 };
const PET_HEALTH_CERT = 100;
const ADDRESS_MISC_FLAT = 100;

function chipValue(name) {
  const c = document.querySelector(`input[name="${name}"]:checked`);
  return c ? c.value : "no";
}
function wireChips(name, subfieldsId) {
  const update = () => {
    const v = chipValue(name);
    const sub = subfieldsId ? $("#" + subfieldsId) : null;
    if (sub) sub.hidden = v !== "yes";
  };
  for (const r of $$(`input[name="${name}"]`)) r.addEventListener("change", update);
  update();
}
wireChips("insurance", "insurance-fields");
wireChips("storage", "storage-fields");
wireChips("haspet", "pet-fields");
wireChips("hasreimb", "reimb-fields");

function updateGapUI() {
  const v = chipValue("gap");
  $("#lodging-fields").hidden = v !== "lodging";
  $("#overlap-fields").hidden = v !== "overlap";
}
for (const r of $$('input[name="gap"]')) r.addEventListener("change", updateGapUI);
updateGapUI();

const fromSel = $("#fromstate"), toSel = $("#tostate");
for (const [code, s] of Object.entries(STATES).sort((a, b) => a[1].name.localeCompare(b[1].name))) {
  fromSel.append(el("option", { value: code }, s.name));
  toSel.append(el("option", { value: code }, s.name));
}
fromSel.value = "CA";
toSel.value = "TX";
fromSel.addEventListener("change", () => { if (typeof run === "function") run(); });
toSel.addEventListener("change", () => { if (typeof run === "function") run(); });

function compute() {
  const bd = SIZE[chipValue("bedrooms") || "1"];
  const distance = readField($("#distance"));
  const mode = chipValue("mode");
  const local = distance <= 100;

  let transport = 0;
  if (mode === "diy") {
    transport = local ? bd.diyLocal : LONG_HAUL_DIY_RATE * distance * bd.diyFactor;
  } else if (mode === "full") {
    transport = local ? bd.localHours * LOCAL_HOURLY_RATE : bd.weight * (FULL_SERVICE_RATE_PER_1000LB_PER_MI / 1000) * distance;
  } else {
    transport = (local ? bd.diyLocal : LONG_HAUL_DIY_RATE * distance * bd.diyFactor) + bd.loadHelp;
  }

  const packing = chipValue("packing") === "yes" ? bd.packing : 0;
  const insuranceOn = chipValue("insurance") === "yes";
  const belongings = insuranceOn ? readField($("#belongings")) : 0;
  const insurance = insuranceOn ? belongings * 0.015 : 0;

  const storageOn = chipValue("storage") === "yes";
  const storageMonths = storageOn ? readField($("#storagemonths")) : 0;
  const storageSize = chipValue("storagesize") || "10x10";
  const storage = storageOn && storageMonths > 0 ? storageMonths * STORAGE_RATE[storageSize] + STORAGE_ADMIN_FEE : 0;

  const gap = chipValue("gap");
  let lodging = 0;
  if (gap === "lodging") lodging = readField($("#lodgingnights")) * LODGING_NIGHTLY;
  else if (gap === "overlap") lodging = readField($("#overlapweeks")) * (readField($("#oldhousing")) / 4.33);

  const utilities = readField($("#utilities"));
  const vehicleReReg = readField($("#vehicles")) * readField($("#vehiclefee"));

  const petOn = chipValue("haspet") === "yes";
  let pets = 0;
  if (petOn) {
    const count = readField($("#petcount"));
    const perPet = PET_RATE[chipValue("petmode")] + PET_HEALTH_CERT;
    pets = count * perPet;
  }

  const reimbOn = chipValue("hasreimb") === "yes";
  let netReimb = 0, reimbAmount = 0;
  if (reimbOn) {
    reimbAmount = readField($("#reimb"));
    const grossedUp = chipValue("grossup") === "yes";
    const margRate = readField($("#margrate")) / 100;
    netReimb = grossedUp ? reimbAmount : reimbAmount * (1 - margRate);
  }
  $("#marg-field").hidden = !reimbOn || chipValue("grossup") === "yes";

  const total = transport + packing + insurance + storage + lodging + utilities
    + vehicleReReg + pets + ADDRESS_MISC_FLAT - netReimb;

  /* ---- render ---- */
  $("#r-hero").textContent = money(Math.max(0, total));

  const bits = [
    `Moving a ${bd.label.toLowerCase()} home ${distance} miles ${mode === "diy" ? "yourself" : mode === "full" ? "with full-service movers" : "with a rented truck and hired loaders"} runs about `,
    Object.assign(document.createElement("strong"), { textContent: money(transport) }),
    ` before anything else.`,
  ];
  if (reimbOn && reimbAmount > 0) {
    bits.push(` Your ${money(reimbAmount)} employer payment is worth ${money(netReimb)} after tax`,
      chipValue("grossup") === "yes" ? " (grossed up, so none of it is lost to tax)." : `, at your ${$("#margrate").value}% marginal rate.`);
    if (total < 0) bits.push(` That covers everything above with about ${money(-total)} left over.`);
  }
  $("#r-interpret").replaceChildren(...bits);

  const items = [
    { name: mode === "full" ? "Movers" : "Truck rental", value: transport },
  ];
  if (packing > 0) items.push({ name: "Packing service", value: packing });
  if (insurance > 0) items.push({ name: "Insurance / valuation", value: insurance });
  if (storage > 0) items.push({ name: "Storage", value: storage });
  if (lodging > 0) items.push({ name: gap === "overlap" ? "Overlapping housing" : "Temporary lodging", value: lodging });
  items.push({ name: "Utility deposits", value: utilities });
  if (vehicleReReg > 0) items.push({ name: "Vehicle re-registration", value: vehicleReReg });
  if (pets > 0) items.push({ name: "Pet relocation", value: pets });
  items.push({ name: "Address change & misc.", value: ADDRESS_MISC_FLAT });

  breakdown($("#chart-breakdown"), {
    ariaLabel: "Where the move budget goes",
    fmt: money,
    items,
  });

  const from = STATES[fromSel.value]?.name || fromSel.value;
  const to = STATES[toSel.value]?.name || toSel.value;
  const link = `take-home-pay.html?state=${toSel.value}&state2=${fromSel.value}`;
  $("#chain-note").replaceChildren(
    `The ${money(Math.max(0, total))} above happens once. Moving from ${from} to ${to} also changes your income, property and sales tax `,
    Object.assign(document.createElement("strong"), { textContent: "every year after" }),
    " — that's a separate, ongoing number. ",
    el("a", { href: link }, `See that comparison in the Take-Home Pay tool →`),
  );
}

const run = bindCalc($("#calc"), compute);
