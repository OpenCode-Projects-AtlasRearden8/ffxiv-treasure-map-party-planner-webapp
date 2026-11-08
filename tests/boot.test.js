import test from "node:test";
import assert from "node:assert/strict";

function elementStub() {
  return {
    value: "",
    innerHTML: "",
    textContent: "",
    appendChild() {},
    addEventListener() {},
    classList: { add() {}, remove() {} },
  };
}

function installDom() {
  globalThis.document = {
    getElementById: () => elementStub(),
    querySelectorAll: () => [],
    addEventListener() {},
    createElement: () => elementStub(),
  };
  globalThis.alert = () => {};
  globalThis.confirm = () => false;
  const memory = { data: null };
  globalThis.localStorage = {
    getItem: (k) => (k in memory ? memory[k] : null),
    setItem: (k, v) => {
      memory[k] = v;
    },
    removeItem: (k) => {
      delete memory[k];
    },
  };
}

test("app.js boots headlessly and renders a full house", async () => {
  installDom();
  const app = await import("../js/app.js");
  assert.ok(app, "module loaded");
  const stored = globalThis.localStorage.getItem("ffxiv-tmpp.v1");
  assert.equal(stored, null, "a fresh boot should not have written anything yet");
});
