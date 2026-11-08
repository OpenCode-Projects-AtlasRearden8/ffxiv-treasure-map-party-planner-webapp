# FFXIV Treasure Map Party Planner

A friendly, offline web app for Final Fantasy XIV treasure map parties. Keep it on a laptop or phone near the table:

- **Map Log** — record which maps the party has found and their tier, without scraping anything.
- **Loot Needs (Gil / Kindred)** — note what each player is hunting for so the party can split supplies and loot fairly.
- **Roll Ledger** — log `/random` rolls for contested items and record which roll actually tipped (won) an item.
- **Loot-Split Ladder** — a fair priority ladder computed from your own roll history: fewest wins first, longest wait as tiebreak.
- **Ward Zone Picker** — deal pick slots for zones/wards in a clean serpentine rotation so nobody double-picks.
- **House Rules** — players type in their own game rules; active rules are honored with reminders right where rolls are logged.

No account, no network calls, no scraping. Everything lives in your browser's local storage, with JSON export/import for moving between devices.

Part of the Asdale Dynamics, LLC collection of beginner-friendly, local-first tools.

## How to run

Two options, both fully offline:

1. **No install at all:** double-click `dist/ffxiv-treasure-map-party-planner-single-file.html`. Everything (styles, logic) is bundled into that one file.
2. **The unbundled app:** open `index.html` through a tiny local server (browsers only allow ES-module pages over http):

```bash
python3 -m http.server 8080   # or: npm start
# then open http://localhost:8080
```

To rebuild the single-file bundle after editing the sources: `npm run build`.

## Tests

```bash
npm test
```

This runs the Node built-in test runner (`node --test`) against the app's pure logic modules — no dependencies required.

## Privacy

No secrets, no API keys, no telemetry, no personal data is requested. Party names, map logs, and rolls stay in your browser's `localStorage` until you clear them or export.

## License

MIT — see `LICENSE`. Copyright (c) 2026 Asdale Dynamics, LLC
