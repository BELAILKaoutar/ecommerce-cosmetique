import assert from "node:assert/strict";
import { test } from "node:test";
import { getDeliveryFee } from "../src/utils/delivery.js";

test("facture 20 DH pour Marrakech, accents et casse ignorés", () => {
  assert.equal(getDeliveryFee("Marrakech"), 20);
  assert.equal(getDeliveryFee("marrakech"), 20);
  assert.equal(getDeliveryFee("  MARRAKECH  "), 20);
});

test("facture 35 DH hors Marrakech", () => {
  assert.equal(getDeliveryFee("Casablanca"), 35);
  assert.equal(getDeliveryFee("Rabat"), 35);
  assert.equal(getDeliveryFee(""), 35);
});
