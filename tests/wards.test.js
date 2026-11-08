import test from "node:test";
import assert from "node:assert/strict";
import { dealSerpentine, shuffleOrder, describeSerpentine } from "../js/wards.js";

test("full serpentine rows bounce back", () => {
  const slots = dealSerpentine(["a", "b", "c"], 6);
  assert.deepEqual(
    slots.map((s) => s.memberId),
    ["a", "b", "c", "c", "b", "a"]
  );
  assert.deepEqual(
    slots.map((s) => s.slot),
    [1, 2, 3, 4, 5, 6]
  );
});

test("partial final row is still evenly spread", () => {
  const slots = dealSerpentine(["a", "b", "c"], 5);
  assert.deepEqual(
    slots.map((s) => s.memberId),
    ["a", "b", "c", "c", "b"]
  );
});

test("more slots than members keeps every member active", () => {
  const slots = dealSerpentine(["a", "b"], 7);
  const counts = {};
  slots.forEach((s) => (counts[s.memberId] = (counts[s.memberId] || 0) + 1));
  assert.deepEqual(counts, { a: 3, b: 4 });
  assert.equal(slots[0].memberId, "a");
  assert.equal(slots[6].memberId, "b");
});

test("single member takes every slot", () => {
  const slots = dealSerpentine(["solo"], 4);
  assert.deepEqual(
    slots.map((s) => s.memberId),
    ["solo", "solo", "solo", "solo"]
  );
});

test("no members or non-positive slots yields nothing", () => {
  assert.deepEqual(dealSerpentine([], 5), []);
  assert.deepEqual(dealSerpentine(["a", "b"], 0), []);
  assert.deepEqual(dealSerpentine(["a", "b"], -3), []);
  assert.deepEqual(dealSerpentine(["  ", "   "], 3), []);
});

test("shuffleOrder is deterministic given a fixed rng", () => {
  const fixed = () => 0.999;
  assert.deepEqual(shuffleOrder([1, 2, 3, 4], fixed), [1, 2, 3, 4]);
  assert.equal(shuffleOrder([], fixed).length, 0);
});

test("describeSerpentine renders names in slot order", () => {
  const lines = describeSerpentine(["Ada", "Bo", "Cy"], 3);
  assert.deepEqual(lines, ["Zone 1: Ada", "Zone 2: Bo", "Zone 3: Cy"]);
});
