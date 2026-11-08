# STATUS.md — FFXIV Treasure Map Party Planner

## What was built

A fully offline, single-page static web app (plain HTML/CSS/JS ES modules) for planning Final Fantasy XIV treasure map parties. No build step to develop, no dependencies, no account, no network calls, no scraping. A single-file bundle (styles + logic inlined) is generated under `dist/` so the app can also run by simply double-clicking a file.

Seven tabs:

1. **Party** — roster with each player's loot need (Gil / Kindred / Either), plus a live "loot needs split" summary so the party can wave off supplies and loot by need.
2. **Map Log** — log found maps, with the full standard list of Timeworn map tiers (ARR through Dawntrail) and an era hint per tier; mark maps opened when the portal is used.
3. **Rolls & Tipping** — a roll ledger for contested items; mark which roll actually tipped (won) the item. Active house rules are shown as a reminder right on this tab.
4. **Loot-Split Ladder** — fair-priority ladder computed live from the roll ledger (fewest tipped wins first, alphabetical tiebreak).
5. **Ward Zones** — deals ward/pick slots in a serpentine rotation so the deal is clean: nobody double-picks and nobody gets skipped.
6. **House Rules** — the fun extra: players type in their own party rules; active rules are honored with reminders on the Rolls tab. Silly-rule suggestion button included.
7. **Data** — export/import the whole planner as JSON, or clear saved data. All local.

## How to run

- Easiest, zero setup: open `dist/ffxiv-treasure-map-party-planner-single-file.html` (double-click works, everything inlined).
- Development mode: serve the folder — `python3 -m http.server 8080` (or `npm start`) → http://localhost:8080.
- Rebuild the single-file bundle: `npm run build`.

## Tests

`npm test` runs Node's built-in test runner against the pure logic modules (storage normalization, ladder building, tip prevention, serpentine dealing, house-rule validation, era classification) plus integration checks: a headless-boot smoke test of `app.js`, a virtual-machine execution of the single-file bundle, and an id-consistency check tying `app.js` to `index.html`.

## Verification results

- `npm run build` works: regenerates `dist/ffxiv-treasure-map-party-planner-single-file.html` (verified: no `type="module"` or external stylesheet references remain).
- `npm test`: **31/31 passing** (0 failures, 0 skipped). Iterated and fixed until green (fixed: `filter(Boolean)` eating numeric id 0 in serpentine dealing; a name-vs-id key mismatch in ladder building; an invalid partially-rewritten `catch` block; a wrong alphabetical expectation in a test).
- Syntax checks (`node --check`) pass for every module.
- Local server smoke test: all 8 assets (`/`, `css/styles.css`, 6 `js/*.js` modules) serve **HTTP 200**.
- Headless boot test renders the full page through a DOM stub with `localStorage` emulation and confirms no state is written on a fresh boot.
- Bundle smoke test executes the inlined script inside a `vm` context and asserts the party and ward renders actually ran.

## Repository state (task protocol)

- Git initialized in this folder with one plain commit (existing git identity only, no co-author trailers). No pushes, no remotes, nothing published.
- `LICENSE` (MIT): copyright line is exactly `Copyright (c) 2026 Asdale Dynamics, LLC`.
- `README.md` credits Asdale Dynamics, LLC.
- No secrets, API keys, or personal data in any file; no dependencies (`package.json` has only `type` and scripts).

## Known gaps

- No automated browser-UI tests (click-throughs) — only logic tests, headless boot/bundle smoke tests, and an id-consistency check. Interactions were verified by code review rather than a real browser session here.
- ES-module pages only work over http; opening the unbundled `index.html` via `file://` is blocked by browsers (that is exactly what the prebuilt single-file bundle is for).
- Roll leads shifting after a player leaves: ledger rows keep a dangling caster id and display as a raw id rather than "(left the party)" (wards display does handle departures).
- Ladder tiebreak is alphabetical; some parties prefer a "longest time since win" tiebreak — deliberately deferred so rules stay explainable and typed-in house rules govern edge cases.
- No print/export-to-sheet view; data export is JSON only.
- Single shared storage namespace — one browser/profile = one party's data (considered a feature: local-first, no accounts).
