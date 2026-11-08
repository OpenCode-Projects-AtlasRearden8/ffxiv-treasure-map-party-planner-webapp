import test from "node:test";
import assert from "node:assert/strict";
import { defaultState, normalizeState, importState, exportState, makeId } from "../js/store.js";

test("defaultState has empty collections and a sane ward", () => {
  const s = defaultState();
  assert.equal(s.version, 1);
  assert.deepEqual(s.members, []);
  assert.deepEqual(s.maps, []);
  assert.deepEqual(s.rolls, []);
  assert.deepEqual(s.rules, []);
  assert.equal(s.ward.candidateCount, 8);
  assert.deepEqual(s.ward.result, []);
});

test("normalizeState coerces need labels into raw values", () => {
  const s = normalizeState({
    members: [
      { name: " Raya ", need: "Gil hunter" },
      { name: "Pipin", need: "Kindred hunter" },
      { name: "Tataru", need: "Either / flexible" },
      { name: "BadRow", need: "something weird" },
    ],
  });
  assert.equal(s.members[0].name, "Raya");
  assert.equal(s.members[0].need, "gil");
  assert.equal(s.members[1].need, "kindred");
  assert.equal(s.members[2].need, "either");
  assert.equal(s.members[3].need, "either");
});

test("normalizeState drops nameless members and repairs ids", () => {
  const s = normalizeState({
    members: [{ name: "Raya" }, { need: "gil" }],
    rules: [{ text: "Party pays for mega potions." }, { text: "" }],
  });
  assert.equal(s.members.length, 1);
  assert.match(s.members[0].id, /^id-|^[0-9a-f-]{20,}$/);
  assert.equal(s.rules.length, 1);
});

test("normalizeState sanitizes rolls and maps", () => {
  const s = normalizeState({
    maps: [{ tier: "Timeworn Zonureskin Map", zone: " Highlanders " }],
    rolls: [{ item: "Glam", caster: "Raya", value: "842", tippedBy: "garbage" }],
  });
  assert.equal(s.maps.length, 1);
  assert.equal(s.maps[0].opened, false);
  assert.equal(s.rolls.length, 1);
  assert.equal(s.rolls[0].value, 842);
});

test("importState rejects broken JSON and accepts a round trip", () => {
  const bad = importState("{nope");
  assert.equal(bad.ok, false);

  const s = normalizeState({ members: [{ name: "Raya", need: "gil" }] });
  const json = exportState(s);
  const back = importState(json);
  assert.equal(back.ok, true);
  assert.deepEqual(back.state, s);
});

test("normalizeState swallows non-objects", () => {
  assert.deepEqual(normalizeState(null), defaultState());
  assert.deepEqual(normalizeState("nope"), defaultState());
});

test("makeId has a usable fallback when crypto is missing", () => {
  assert.equal(typeof makeId(), "string");
  assert.ok(makeId().length > 5);
});
