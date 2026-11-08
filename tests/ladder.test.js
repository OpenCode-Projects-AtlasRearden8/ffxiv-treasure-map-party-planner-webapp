import test from "node:test";
import assert from "node:assert/strict";
import { needsSummary, buildLadder, tipWinner, untipRoll } from "../js/ladder.js";

const members = [
  { id: "a", name: "Aline", need: "gil" },
  { id: "b", name: "Byrht", need: "kindred" },
  { id: "c", name: "Cach", need: "either" },
];

const roll = (id, item, caster, value, tippedBy = null) => ({ id, item, caster, value, tippedBy });

test("needsSummary groups players by loot need", () => {
  const sum = needsSummary(members);
  assert.deepEqual(sum.gil, ["Aline"]);
  assert.deepEqual(sum.kindred, ["Byrht"]);
  assert.deepEqual(sum.either, ["Cach"]);
});

test("buildLadder puts fewest wins first, alphabetical within ties", () => {
  const rolls = [
    roll("1", "Coat", "a", 900, "1"),
    roll("2", "Coat", "b", 950, "2"),
    roll("3", "Hat", "a", 800, "3"),
    roll("4", "Hat", "c", 700),
  ];
  const ladder = buildLadder(members, rolls);
  assert.deepEqual(
    ladder.map((l) => l.name),
    ["Cach", "Byrht", "Aline"]
  );
  assert.equal(ladder[0].wins, 0);
  assert.equal(ladder[1].wins, 1);
  assert.equal(ladder[2].wins, 2);
});

test("lobby ladder with no rolls is alphabetical", () => {
  const ladder = buildLadder(members, []);
  assert.deepEqual(
    ladder.map((l) => l.name),
    ["Aline", "Byrht", "Cach"]
  );
  assert.deepEqual(
    ladder.map((l) => l.priority),
    [1, 2, 3]
  );
});

test("tipWinner marks the roll as the tip", () => {
  const rolls = [roll("1", "Ring", "a", 720)];
  const res = tipWinner(rolls, "1");
  assert.equal(res.ok, true);
  assert.equal(res.rolls[0].tippedBy, "1");
});

test("tipWinner refuses a roll that did not win its own item", () => {
  const rolls = [roll("1", "Ring", "a", 720), roll("2", "Ring", "b", 933)];
  const res = tipWinner(rolls, "1");
  assert.equal(res.ok, false);
  assert.match(res.error, /higher/);
});

test("tipWinner allows ties across different items", () => {
  const rolls = [roll("1", "Ring", "a", 720), roll("2", "Necklace", "b", 720)];
  const res = tipWinner(rolls, "1");
  assert.equal(res.ok, true);
  const res2 = tipWinner(res.rolls, "2");
  assert.equal(res2.ok, true);
});

test("tipWinner refuses unknown rolls and caster-less rolls", () => {
  assert.equal(tipWinner(rolls1(), "nope").ok, false);
  function rolls1() {
    return [roll("1", "Ring", "", 42)];
  }
  assert.match(tipWinner([roll("1", "Ring", "", 42)], "1").error, /Log who cast/);
});

test("untipRoll clears a tip without touching others", () => {
  const rolls = [roll("1", "Ring", "a", 720, "1"), roll("2", "Necklace", "b", 55, "2")];
  const after = untipRoll(rolls, "1");
  assert.equal(after[0].tippedBy, null);
  assert.equal(after[1].tippedBy, "2");
});
