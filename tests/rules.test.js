import test from "node:test";
import assert from "node:assert/strict";
import { TARMAP_TIERS, classifyZones } from "../js/maps.js";
import { RULE_PROMPTS, ruleReminder, validateRule } from "../js/rules.js";

test("tier list covers every era without duplicates", () => {
  assert.ok(TARMAP_TIERS.length >= 13);
  assert.ok(TARMAP_TIERS.includes("Timeworn Zonureskin Map"));
  assert.ok(TARMAP_TIERS.includes("Timeworn Leather Map"));
  assert.equal(new Set(TARMAP_TIERS).size, TARMAP_TIERS.length);
});

test("classifyZones buckets each tier to its expansion era", () => {
  assert.equal(classifyZones("Timeworn Leather Map"), "A Realm Reborn zones");
  assert.equal(classifyZones("Timeworn Dragonskin Map"), "Heavensward zones");
  assert.equal(classifyZones("Timeworn Gazelleskin Map"), "Stormblood zones");
  assert.equal(classifyZones("Timeworn Skybuilders' Map"), "Shadowbringers zones");
  assert.equal(classifyZones("Timeworn Zonureskin Map"), "Endwalker zones");
  assert.equal(classifyZones("Timeworn Ophiotauroskin Map"), "Dawntrail zones");
  assert.equal(classifyZones("Mystery Frontlines Cache"), "Custom / other");
});

test("validateRule enforces sensible house rules", () => {
  assert.equal(validateRule("").ok, false);
  assert.equal(validateRule("hi").ok, false);
  assert.equal(validateRule("n".repeat(281)).ok, false);
  const ok = validateRule("  Winner demo: pass 5000 gil to the vault.  ");
  assert.equal(ok.ok, true);
  assert.equal(ok.text, "Winner demo: pass 5000 gil to the vault.");
});

test("ruleReminder prefixes only active rules", () => {
  const rules = [
    { text: "Vault fortnightly.", active: true },
    { text: "Raiding after midnight is banned.", active: false },
  ];
  assert.deepEqual(ruleReminder(rules), ["House rule: Vault fortnightly."]);
});

test("suggested prompt list is non-empty and honest", () => {
  assert.ok(RULE_PROMPTS.length >= 5);
  RULE_PROMPTS.forEach((p) => assert.ok(p.length > 10 && p.length < 200));
});
