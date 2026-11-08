import {
  NEED_LABELS_REVERSE,
  defaultState,
  loadState,
  saveState,
  clearState,
  importState,
  exportState,
} from "./store.js";
import { needsSummary, buildLadder, tipWinner, untipRoll } from "./ladder.js";
import { TARMAP_TIERS, classifyZones } from "./maps.js";
import { dealSerpentine } from "./wards.js";
import { RULE_PROMPTS, ruleReminder, validateRule } from "./rules.js";

const $ = (id) => document.getElementById(id);

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

let state = defaultState();

function persist() {
  if (!saveState(state)) {
    console.warn("Local storage unavailable — this session's data will not survive a reload.");
  }
}

function needLabel(v) {
  return NEED_LABELS_REVERSE[v] || v;
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    $("tab-" + btn.dataset.tab).classList.add("active");
    renderAll();
  });
});

document.getElementById("map-tier").addEventListener("change", (e) => {
  $("map-tier-hint").textContent = classifyZones(e.target.value);
});

$("add-member").addEventListener("click", () => {
  const name = $("member-name").value.trim();
  if (!name) return;
  if (state.members.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
    alert("That player is already in the party list.");
    return;
  }
  state.members = [
    ...state.members,
    {
      id: crypto.randomUUID(),
      name,
      need: $("member-need").value === "Gil hunter" ? "gil" : $("member-need").value === "Kindred hunter" ? "kindred" : "either",
    },
  ];
  $("member-name").value = "";
  persist();
  renderAll();
});

function renderParty() {
  const rows = state.members.map(
    (m) =>
      `<tr><td>${escapeHtml(m.name)}</td><td>${escapeHtml(needLabel(m.need))}</td><td><button class="small" data-del-member="${m.id}">Remove</button></td></tr>`
  ).join("");
  $("party-table").innerHTML = rows
    ? `<table><thead><tr><th>Player</th><th>Loot need</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
    : `<p class="muted">No party members yet. This stays on your device only.</p>`;

  const sum = needsSummary(state.members);
  $("needs-summary").innerHTML =
    `<h3>Loot needs split</h3><p><strong>Gil hunters (${sum.gil.length}):</strong> ${escapeHtml(sum.gil.join(" | ") || "none yet")}</p>` +
    `<p><strong>Kindred hunters (${sum.kindred.length}):</strong> ${escapeHtml(sum.kindred.join(" | ") || "none yet")}</p>` +
    `<p><strong>Flexible (${sum.either.length}):</strong> ${escapeHtml(sum.either.join(" | ") || "none yet")}</p>`;
}

document.addEventListener("click", (e) => {
  const mid = e.target.closest && e.target.closest("[data-del-member]");
  if (mid) {
    state.members = state.members.filter((m) => m.id !== mid.dataset.delMember);
    persist();
    renderAll();
  }
});

$("add-map").addEventListener("click", () => {
  const tier = $("map-tier").value;
  if (!tier) return;
  state.maps = [
    ...state.maps,
    {
      id: crypto.randomUUID(),
      tier,
      zone: $("map-zone").value.trim(),
      foundBy: $("map-found-by").value.trim(),
      foundAt: new Date().toISOString(),
      opened: false,
      notes: "",
    },
  ];
  $("map-zone").value = "";
  $("map-found-by").value = "";
  persist();
  renderAll();
});

function renderMaps() {
  const rows = state.maps
    .map((m) => {
      return `<tr><td>${escapeHtml(m.tier)}</td><td>${escapeHtml(m.zone || "unknown")}</td><td>${escapeHtml(m.foundBy || "party")}</td><td>${new Date(m.foundAt).toLocaleDateString()} ${new Date(m.foundAt).toLocaleTimeString()}</td><td>${m.opened ? "Opened (portal)" : "Unopened"}</td><td><button class="small" data-open-map="${m.id}">${m.opened ? "Mark unopened" : "Mark opened"}</button> <button class="small" data-del-map="${m.id}">Remove</button></td></tr>`;
    })
    .join("");
  $("maps-table").innerHTML = rows
    ? `<table><thead><tr><th>Tier</th><th>Zone</th><th>Found by</th><th>When</th><th>Portal status</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
    : `<p class="muted">No maps logged yet.</p>`;
}

document.addEventListener("click", (e) => {
  const open = e.target.closest && e.target.closest("[data-open-map]");
  if (open) {
    const map = state.maps.find((m) => m.id === open.dataset.openMap);
    if (map) {
      map.opened = !map.opened;
      persist();
      renderAll();
    }
  }
  const del = e.target.closest && e.target.closest("[data-del-map]");
  if (del) {
    state.maps = state.maps.filter((m) => m.id !== del.dataset.delMap);
    persist();
    renderAll();
  }
});

function memberOptions(selected) {
  return state.members.map((m) => `<option value="${m.id}" ${selected === m.id ? "selected" : ""}>${escapeHtml(m.name)}</option>`).join("");
}

function renderRolls() {
  const sel = $("roll-caster");
  const cur = sel.value;
  sel.innerHTML =
    `<option value="">Choose player...</option>` + memberOptions(cur);
  const byId = {};
  state.members.forEach((m) => (byId[m.id] = m.name));
  const rows = state.rolls
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.item)}</td><td>${escapeHtml(byId[r.caster] || r.caster)}</td><td>${r.value}</td><td>${r.tippedBy ? "Tipped &mdash; this roll won" : "Not tipped yet"}</td><td>${r.tippedBy ? `<button class="small" data-untip="${r.id}">Clear tip</button>` : `<button class="small" data-tip="${r.id}">This roll tipped</button>`}</td></tr>`
    )
    .join("");
  $("rolls-table").innerHTML = rows
    ? `<table><thead><tr><th>Item</th><th>Player</th><th>Roll</th><th>Result</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
    : `<p class="muted">No rolls in the ledger yet.</p>`;
}

$("add-roll").addEventListener("click", () => {
  const caster = $("roll-caster").value;
  const value = Number($("roll-value").value);
  const item = $("roll-item").value.trim();
  if (!caster) {
    alert("Choose which player rolled.");
    return;
  }
  if (!Number.isFinite(value) || value <= 0) {
    alert("Enter the roll value (like the /random result).");
    return;
  }
  if (!item) {
    alert("Type what item this roll is for.");
    return;
  }
  state.rolls = [...state.rolls, { id: crypto.randomUUID(), item, caster, value: Math.floor(value), tippedBy: null, notes: "" }];
  $("roll-value").value = "";
  persist();
  renderAll();
});

document.addEventListener("click", (e) => {
  const tip = e.target.closest && e.target.closest("[data-tip]");
  if (tip) {
    const res = tipWinner(state.rolls, tip.dataset.tip);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    state.rolls = res.rolls;
    persist();
    renderAll();
  }
  const untip = e.target.closest && e.target.closest("[data-untip]");
  if (untip) {
    state.rolls = untipRoll(state.rolls, untip.dataset.untip);
    persist();
    renderAll();
  }
});

function renderLadder() {
  const ladder = buildLadder(state.members, state.rolls);
  const rows = ladder
    .map(
      (l, i) =>
        `<li><strong>${i + 1}.</strong> ${escapeHtml(l.name)} &mdash; ${l.wins} tipped ${l.wins === 1 ? "win" : "wins"}${l.biggestTip !== null ? `, best roll ${l.biggestTip}` : ""} <span class="muted">(${escapeHtml(needLabel(l.need))})</span></li>`
    )
    .join("");
  $("ladder-list").innerHTML = ladder.length
    ? `<ul>${rows}</ul><p class="muted">Fewest wins first: the player at the top gets first pick on the next contested item. After winning, they drift to the bottom naturally as others catch up.</p>`
    : `<p class="muted">The ladder builds itself once you have party members and tips logged.</p>`;
}

const wardPicked = new Set();

function renderWards() {
  const checkboxes = state.members
    .map(
      (m) =>
        `<label class="chk"><input type="checkbox" class="ward-member" value="${m.id}" ${wardPicked.has(m.id) ? "checked" : ""}> ${escapeHtml(m.name)}</label>`
    )
    .join("");
  $("ward-members").innerHTML = checkboxes || `<p class="muted">Add party members on the Party tab first.</p>`;
  $("ward-result").innerHTML = state.ward.result.length
    ? `<ol>${state.ward.result
        .map((s) => `<li>Pick ${s.slot}: ${escapeHtml(byName(s.memberId))}</li>`)
        .join("")}</ol><p class="muted">Serpentine order: back and forth so early zones alternate between the head and tail of the party list.</p>`
    : "<p class=\"muted\">Tick players, set the number of zones, then deal.</p>";
}

function byName(id) {
  const m = state.members.find((x) => x.id === id);
  return m ? m.name : "(left the party)";
}

$("ward-generate").addEventListener("click", () => {
  const picked = [...document.querySelectorAll(".ward-member:checked")].map((el) => el.value);
  const count = Math.max(0, Math.floor(Number($("ward-count").value) || 0));
  if (picked.length < 2) {
    alert("Tick at least two party members.");
    return;
  }
  if (count < 1) {
    alert("How many ward zones should be dealt?");
    return;
  }
  const result = dealSerpentine(picked, count).map(({ slot, memberId }) => ({ slot, memberId }));
  state.ward = { ...state.ward, result };
  persist();
  renderWards();
  $("ward-result").innerHTML = result.length
    ? `<ol>${result
        .map((s) => `<li>Pick ${s.slot}: ${escapeHtml(byName(s.memberId))}</li>`)
        .join("")}</ol><p class="muted">Serpentine order: back and forth so early zones alternate between the head and tail of the party list.</p>`
    : "";
});

document.addEventListener("change", (e) => {
  const el = e.target.closest && e.target.closest(".ward-member");
  if (el) {
    if (el.checked) wardPicked.add(el.value);
    else wardPicked.delete(el.value);
  }
});

$("rule-idea").addEventListener("click", () => {
  const el = $("rule-text");
  el.value = RULE_PROMPTS[Math.floor(Math.random() * RULE_PROMPTS.length)] ?? "";
});

$("add-rule").addEventListener("click", () => {
  const check = validateRule($("rule-text").value);
  if (!check.ok) {
    alert(check.error);
    return;
  }
  state.rules = [...state.rules, { id: crypto.randomUUID(), text: check.text, active: true }];
  $("rule-text").value = "";
  persist();
  renderAll();
});

function renderRules() {
  const rows = state.rules
    .map(
      (r) =>
        `<li><label><input type="checkbox" data-rule-toggle="${r.id}" ${r.active ? "checked" : ""}></label> ${escapeHtml(r.text)} <button class="small" data-rule-del="${r.id}">Remove</button></li>`
    )
    .join("");
  $("rules-list").innerHTML = rows
    ? `<ul>${rows}</ul>`
    : `<p class="muted">Type your party's own rules in and the app will honor them with a reminder whenever you log rolls.</p>`;
}

document.addEventListener("click", (e) => {
  const del = e.target.closest && e.target.closest("[data-rule-del]");
  if (del) {
    state.rules = state.rules.filter((r) => r.id !== del.dataset.ruleDel);
    persist();
    renderAll();
  }
});

document.addEventListener("change", (e) => {
  const tog = e.target.closest && e.target.closest("[data-rule-toggle]");
  if (tog) {
    const rule = state.rules.find((r) => r.id === tog.dataset.ruleToggle);
    if (rule) {
      rule.active = tog.checked;
      persist();
      renderAll();
    }
  }
});

$("export-btn").addEventListener("click", () => {
  $("io-area").value = exportState(state);
});

$("import-btn").addEventListener("click", () => {
  const res = importState($("io-area").value);
  if (!res.ok) {
    alert(res.error);
    return;
  }
  state = res.state;
  persist();
  renderAll();
});

$("clear-btn").addEventListener("click", () => {
  if (!confirm("Clear all locally saved planner data? This cannot be undone.")) return;
  clearState();
  state = defaultState();
  renderAll();
});

function renderAll() {
  renderParty();
  renderMaps();
  renderRolls();
  renderLadder();
  renderWards();
  renderRules();
  const reminders = ruleReminder(state.rules);
  const box = $("rules-reminder-rolls");
  box.innerHTML = reminders.length
    ? `<strong>Active house rules:</strong><ul>${reminders.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>`
    : `<p class="muted">No active house rules. Add some on the House Rules tab.</p>`;
}

function init() {
  const tierSel = $("map-tier");
  TARMAP_TIERS.forEach((t) => {
    const opt = document.createElement("option");
    opt.textContent = t;
    tierSel.appendChild(opt);
  });
  state = loadState();
  renderAll();
}

init();
