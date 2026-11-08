const RULE_PROMPTS = [
  "Winner of a portal pendant passes their pendant to the player who whispered the nicest compliment.",
  "If the loot is one of the Kindred glamour pieces, the ladder pauses and dice decide.",
  "Nobody complains about the chest shuffle unless they rolled above 7,000.",
  "Gil-only loot goes to the party vault until everyone has one portal per week.",
  "If someone rolled and instantly left, their rolls are retroactively sealed and re-run.",
  "Whoever typed the map into chat first picks the first ward zone.",
  "The party pays taxes in peiste meat. No exceptions.",
  "Sassy Rule: the person who tipped lowest must announce the next map tier using only the echo voice.",
];

function ruleReminder(rules) {
  const active = rules.filter((r) => r.active && r.text);
  return active.map((r) => `House rule: ${r.text}`);
}

function validateRule(text) {
  if (!text || typeof text !== "string") return { ok: false, error: "Rule text is required." };
  const t = text.trim();
  if (t.length < 6) return { ok: false, error: "Rules need at least 6 characters so people know what they signed up for." };
  if (t.length > 280) return { ok: false, error: "Keep rules under 280 characters - house rules, not law books." };
  return { ok: true, text: t };
}

export { RULE_PROMPTS, ruleReminder, validateRule };
