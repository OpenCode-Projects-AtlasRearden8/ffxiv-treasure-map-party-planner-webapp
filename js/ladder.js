function needsSummary(members) {
  const summary = { gil: [], kindred: [], either: [] };
  for (const m of members) {
    summary[m.need].push(m.name);
  }
  return summary;
}

function winsByMember(members, rolls) {
  const counts = {};
  for (const m of members) counts[m.id] = { wins: 0, biggestTip: null };
  for (const r of rolls) {
    if (!r.tippedBy || !(r.caster in counts)) continue;
    counts[r.caster].wins += 1;
    const v = Number(r.value) || 0;
    if (counts[r.caster].biggestTip === null || v > counts[r.caster].biggestTip) {
      counts[r.caster].biggestTip = v;
    }
  }
  return counts;
}

function buildLadder(members, rolls) {
  const counts = winsByMember(members, rolls);
  return members
    .map((m) => ({
      id: m.id,
      name: m.name,
      need: m.need,
      wins: counts[m.id]?.wins ?? 0,
      biggestTip: counts[m.id]?.biggestTip ?? null,
    }))
    .sort((a, b) => a.wins - b.wins || a.name.localeCompare(b.name))
    .map((entry, i) => ({ ...entry, priority: i + 1 }));
}

function tipWinner(rolls, rollId) {
  const roll = rolls.find((r) => r.id === rollId);
  if (!roll) return { ok: false, error: "Roll not found." };
  if (!roll.caster) return { ok: false, error: "Log who cast the roll first." };
  const sameItem = (r) =>
    r.id !== rollId && !r.tippedBy && r.item.trim().toLowerCase() === roll.item.trim().toLowerCase();
  const higher = rolls.find((r) => sameItem(r) && Number(r.value) > Number(roll.value));
  if (higher) {
    return {
      ok: false,
      error: `A higher untipped roll for that item exists (${higher.value} by ${higher.caster}).`,
    };
  }
  return { ok: true, rolls: rolls.map((r) => (r.id === rollId ? { ...r, tippedBy: r.id } : r)) };
}

function untipRoll(rolls, rollId) {
  return rolls.map((r) => (r.id === rollId ? { ...r, tippedBy: null } : r));
}

export { needsSummary, winsByMember, buildLadder, tipWinner, untipRoll };
