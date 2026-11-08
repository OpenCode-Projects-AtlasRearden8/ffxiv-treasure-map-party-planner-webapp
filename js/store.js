const STORAGE_KEY = "ffxiv-tmpp.v1";

const NEEDS = ["gil", "kindred", "either"];
const NEED_LABELS = { "Gil hunter": "gil", "Kindred hunter": "kindred", "Either / flexible": "either" };

const NEED_LABELS_REVERSE = { gil: "Gil hunter", kindred: "Kindred hunter", either: "Either / flexible" };

function defaultState() {
  return {
    version: 1,
    members: [],
    maps: [],
    rolls: [],
    rules: [],
    ward: { candidateCount: 8, picksPerMember: null, result: [] },
  };
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function isValidId(value) {
  return typeof value === "string" && value.length > 0;
}

function validNeed(value) {
  if (typeof value !== "string") return "either";
  if (NEEDS.includes(value)) return value;
  return NEED_LABELS[value] || "either";
}

function normalizeMember(raw, ids) {
  if (!raw || typeof raw !== "object") return null;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name) return null;
  return {
    id: isValidId(raw.id) ? raw.id : makeId(),
    name,
    need: validNeed(raw.need),
  };
}

function normalizeMap(raw) {
  if (!raw || typeof raw !== "object") return null;
  const tier = typeof raw.tier === "string" ? raw.tier.trim() : "";
  return {
    id: isValidId(raw.id) ? raw.id : makeId(),
    tier: tier || "Unknown",
    zone: typeof raw.zone === "string" ? raw.zone.trim() : "",
    found: typeof raw.found === "string" && raw.found ? raw.found : "",
    opened: Boolean(raw.opened),
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

function normalizeRoll(raw) {
  if (!raw || typeof raw !== "object") return null;
  const item = typeof raw.item === "string" ? raw.item.trim() : "";
  const caster = typeof raw.caster === "string" ? raw.caster.trim() : "";
  const value = Number(raw.value);
  return {
    id: isValidId(raw.id) ? raw.id : makeId(),
    mapId: isValidId(raw.mapId) ? raw.mapId : null,
    item: item || "Uncontested item",
    caster,
    value: Number.isFinite(value) ? value : 0,
    tippedBy: isValidId(raw.tippedBy) ? raw.tippedBy : null,
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

function normalizeRule(raw) {
  if (!raw || typeof raw !== "object") return null;
  const text = typeof raw.text === "string" ? raw.text.trim() : "";
  if (!text) return null;
  return {
    id: isValidId(raw.id) ? raw.id : makeId(),
    text,
    active: raw.active !== false,
  };
}

function normalizeWard(raw) {
  if (!raw || typeof raw !== "object") return defaultState().ward;
  const candidateCount = Number(raw.candidateCount);
  const result = Array.isArray(raw.result)
    ? raw.result.filter((s) => s && isValidId(s.member)).map((s) => ({
        slot: Number.isFinite(Number(s.slot)) ? Number(s.slot) : 0,
        member: s.member,
      }))
    : [];
  return {
    candidateCount: Number.isFinite(candidateCount) ? Math.max(1, Math.floor(candidateCount)) : 8,
    picksPerMember: raw.picksPerMember == null ? null : Number(raw.picksPerMember) || null,
    result,
  };
}

function normalizeState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;
  return {
    version: 1,
    members: Array.isArray(raw.members)
      ? raw.members.map((m) => normalizeMember(m)).filter(Boolean)
      : [],
    maps: Array.isArray(raw.maps) ? raw.maps.map(normalizeMap).filter(Boolean) : [],
    rolls: Array.isArray(raw.rolls) ? raw.rolls.map(normalizeRoll).filter(Boolean) : [],
    rules: Array.isArray(raw.rules) ? raw.rules.map(normalizeRule).filter(Boolean) : [],
    ward: normalizeWard(raw.ward),
  };
}

function safeStorage() {
  try {
    if (typeof localStorage !== "undefined" && localStorage) return localStorage;
  } catch {
    return null;
  }
  return null;
}

function loadState() {
  const store = safeStorage();
  if (!store) return defaultState();
  try {
    const raw = JSON.parse(store.getItem(STORAGE_KEY) || "null");
    return normalizeState(raw);
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  const store = safeStorage();
  if (!store) return false;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
    return true;
  } catch {
    return false;
  }
}

function clearState() {
  const store = safeStorage();
  if (!store) return;
  try {
    store.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}

function importState(jsonText) {
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: "That does not look like a JSON export." };
  }
  return { ok: true, state: normalizeState(parsed) };
}

function exportState(state) {
  return JSON.stringify(normalizeState(state), null, 2);
}

export {
  STORAGE_KEY,
  NEEDS,
  NEED_LABELS,
  NEED_LABELS_REVERSE,
  defaultState,
  makeId,
  normalizeState,
  loadState,
  saveState,
  clearState,
  importState,
  exportState,
};
