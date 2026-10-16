import assert from "node:assert/strict";
import { test } from "node:test";
import { generateOrderNumber } from "../src/utils/order-number.js";

test("génère une référence unique au format CMD-AAAAMMJJ-XXXXXX", () => {
  const date = new Date("2026-10-16T09:00:00.000Z");
  const first = generateOrderNumber(date);
  const second = generateOrderNumber(date);

  assert.match(first, /^CMD-20261016-[A-F0-9]{6}$/);
  assert.match(second, /^CMD-20261016-[A-F0-9]{6}$/);
  assert.notEqual(first, second);
});
