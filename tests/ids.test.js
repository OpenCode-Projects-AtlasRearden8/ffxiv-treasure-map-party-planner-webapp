import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("every element id used by app.js exists in index.html", async () => {
  const app = await readFile(new URL("../js/app.js", import.meta.url), "utf8");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  const used = new Set();
  for (const m of app.matchAll(/\$\("([^"]+)"\)/g)) used.add(m[1]);
  for (const m of app.matchAll(/getElementById\("([^"]+)"\)/g)) used.add(m[1]);
  used.add("tab-party");

  assert.ok(used.size > 10, "sanity: app should reference real ids");
  for (const id of used) {
    assert.ok(html.includes(`id="${id}"`), `#id="${id}" is referenced in app.js but missing from index.html`);
  }
});

test("index.html loads the stylesheet and the app module", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /href="css\/styles.css"/);
  assert.match(html, /src="js\/app\.js"/);
  assert.match(html, /type="module"/);
});
