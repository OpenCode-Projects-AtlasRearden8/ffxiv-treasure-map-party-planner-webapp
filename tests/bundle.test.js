import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const els = {};
function elementStub(id) {
  return {
    id,
    value: "",
    innerHTML: "",
    textContent: "",
    appendChild() {},
    addEventListener() {},
    classList: { add() {}, remove() {} },
  };
}

test("single-file bundle runs standalone under a bare DOM", async () => {
  const html = await readFile(
    new URL("../dist/ffxiv-treasure-map-party-planner-single-file.html", import.meta.url),
    "utf8"
  );
  assert.ok(!html.includes('type="module"'), "bundle must not rely on ES modules");
  assert.ok(html.includes("<style>") && html.includes(".tab-btn"), "styles must be inlined");

  const script = html.match(/<script>\n([\s\S]*)<\/script>/)[1];

  const memory = {};
  const ctx = {
    console,
    crypto: globalThis.crypto,
    document: {
      getElementById: (id) => (els[id] ??= elementStub(id)),
      querySelectorAll: () => [],
      addEventListener() {},
      createElement: (tag) => elementStub(tag),
    },
    alert() {},
    confirm() {
      return false;
    },
    localStorage: {
      getItem: (k) => (k in memory ? memory[k] : null),
      setItem: (k, v) => {
        memory[k] = v;
      },
      removeItem: (k) => {
        delete memory[k];
      },
    },
  };
  vm.createContext(ctx);
  vm.runInContext(script, ctx, { filename: "bundle.html" });

  assert.ok(els["needs-summary"].innerHTML.includes("Loot needs split"), "party render must have run");
  assert.ok(els["ward-result"].innerHTML.includes("Tick players"), "ward render must have run");
  assert.equal(memory["ffxiv-tmpp.v1"], undefined, "fresh boot writes nothing");
});
