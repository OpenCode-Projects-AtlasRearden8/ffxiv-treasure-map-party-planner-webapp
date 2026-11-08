import { readFile, writeFile, mkdir } from "node:fs/promises";

const MODULE_ORDER = ["js/store.js", "js/maps.js", "js/rules.js", "js/wards.js", "js/ladder.js", "js/app.js"];

function stripModuleSyntax(src) {
  return src
    .replace(/^import\s*(\{[\s\S]*?\}|\w+)?\s*from\s*["'][^"']+["'];\n?/gm, "")
    .replace(/^export\s*(\{[\s\S]*?\})?;\n?/gm, "")
    .replace(/^export\s+(default\s+)?/gm, "");
}

async function build() {
  await mkdir("dist", { recursive: true });
  const html = await readFile("index.html", "utf8");
  const css = await readFile("css/styles.css", "utf8");

  let script = "";
  for (const file of MODULE_ORDER) {
    const src = await readFile(file, "utf8");
    script += stripModuleSyntax(src) + "\n";
  }

  const bundled = html.replace(
    /<link rel="stylesheet" href="css\/styles.css" \/>/,
    `<style>\n${css}\n</style>`
  );
  const out = bundled.replace(
    /<script type="module" src="js\/app\.js"><\/script>/,
    `<script>\n${script}</script>`
  );

  if (/<script type="module"|href="css/.test(out)) {
    throw new Error("Bundling failed: module or stylesheet references still present");
  }
  await writeFile("dist/ffxiv-treasure-map-party-planner-single-file.html", out);
  console.log("Wrote dist/ffxiv-treasure-map-party-planner-single-file.html");
}

build();
