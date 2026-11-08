function realId(x) {
  return x !== null && x !== undefined && String(x).trim() !== "";
}

function dealSerpentine(memberIds, totalSlots) {
  const ids = memberIds.filter(realId);
  const n = ids.length;
  if (!n) return [];
  const total = Math.max(0, Math.floor(Number(totalSlots) || 0));
  const slots = [];
  for (let s = 0; s < total; s++) {
    const row = Math.floor(s / n);
    const col = s % n;
    const idx = row % 2 === 0 ? col : n - 1 - col;
    slots.push({ slot: s + 1, memberId: ids[idx] });
  }
  return slots;
}

function shuffleOrder(ids, rng = Math.random) {
  const out = ids.filter(realId);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function describeSerpentine(memberNames, totalSlots) {
  const ids = memberNames.map((_, i) => i);
  return dealSerpentine(ids, totalSlots).map(
    (s) => `Zone ${s.slot}: ${memberNames[s.memberId]}`
  );
}

export { dealSerpentine, shuffleOrder, describeSerpentine };
