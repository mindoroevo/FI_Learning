/**
 * FIAE Speichersystem
 * ───────────────────
 * • AES-GCM 256-bit Verschlüsselung (Web Crypto API)
 * • Geräteschlüssel in localStorage, Datei über File System Access API
 * • Echtzeit-Autosave (Debounce 800 ms) + localStorage-Fallback
 * • XP-System, Levels, Erfolge, Lesezeichen
 * • Vollständige Modal-UI (Profil / Lesezeichen / Erfolge / Statistiken / Einstellungen)
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const DEVICE_KEY_LS  = "fiae_device_key_v1";
const LS_BACKUP_KEY  = "fiae_save_backup_v1";
const SAVE_HEADER    = "FIAE_SAVE_V1\n";
const AUTOSAVE_MS    = 800;

// ─── State ────────────────────────────────────────────────────────────────────

let _cryptoKey   = null;   // CryptoKey object
let _fileHandle  = null;   // FileSystemFileHandle | null
let _data        = null;   // Current save data
let _dirty       = false;
let _saveTimer   = null;
let _onUpdate    = [];     // Callbacks fired when data changes
let _saveBtn     = null;   // topbar button reference

// ─── XP / Level ───────────────────────────────────────────────────────────────

const LEVELS = [
  { min:    0, name: "Neuling",        icon: "🌱" },
  { min:  100, name: "Lernender",      icon: "📖" },
  { min:  300, name: "Entdecker",      icon: "🔍" },
  { min:  600, name: "Praktiker",      icon: "⚙️" },
  { min: 1000, name: "Fortgeschr.",    icon: "💡" },
  { min: 1600, name: "Experte",        icon: "🎯" },
  { min: 2500, name: "Spezialist",     icon: "🏅" },
  { min: 3600, name: "Profi",          icon: "🚀" },
  { min: 5000, name: "Meister",        icon: "🧠" },
  { min: 7000, name: "Großmeister",    icon: "🏆" },
];

function getLevel(xp) {
  let lvl = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.min) lvl = l; else break; }
  const idx  = LEVELS.indexOf(lvl);
  const next = LEVELS[idx + 1];
  const pct  = next
    ? Math.round(((xp - lvl.min) / (next.min - lvl.min)) * 100)
    : 100;
  return { ...lvl, index: idx + 1, xp, pct, nextMin: next?.min ?? lvl.min, nextName: next?.name ?? "MAX" };
}

// ─── Achievements ─────────────────────────────────────────────────────────────

const ACH = [
  { id: "save_created",   icon: "💾", name: "Datei gesichert",      desc: "Eine Speicherdatei erstellt",                     xp: 20  },
  { id: "quiz_first",     icon: "🧠", name: "Erste Antwort",         desc: "Eine Quiz-Frage beantwortet",                    xp: 5   },
  { id: "quiz_10",        icon: "📚", name: "Im Lernfluss",          desc: "10 Quiz-Fragen beantwortet",                     xp: 15  },
  { id: "quiz_50",        icon: "💡", name: "Wissenshungrig",        desc: "50 Fragen beantwortet",                          xp: 30  },
  { id: "quiz_100",       icon: "🎓", name: "Fleißiger Schüler",     desc: "100 Quiz-Fragen beantwortet",                    xp: 50  },
  { id: "quiz_streak5",   icon: "🔥", name: "Heiße Serie",           desc: "5 richtige Antworten in Folge (Quiz)",            xp: 20  },
  { id: "quiz_streak10",  icon: "⚡", name: "Energie pur",           desc: "10 richtige Antworten in Folge (Quiz)",           xp: 40  },
  { id: "quiz_perfect",   icon: "🌟", name: "Makellos",              desc: "Modul-Quiz ohne Fehler abgeschlossen",            xp: 50  },
  { id: "subnetz_first",  icon: "🌐", name: "Netz-Neuling",          desc: "Erste Subnetz-Runde gespielt",                   xp: 10  },
  { id: "subnetz_ace",    icon: "🗺️",  name: "Subnetz-Ass",          desc: "90 %+ in einer Subnetz-Runde",                   xp: 35  },
  { id: "binary_first",   icon: "🔢", name: "Binär-Einsteiger",      desc: "Erste Binär-Runde gespielt",                     xp: 10  },
  { id: "binary_ace",     icon: "💻", name: "Bit-Meister",           desc: "90 %+ in einer Binär-Runde",                     xp: 35  },
  { id: "blitz_first",    icon: "⚡", name: "Blitz-Starter",         desc: "Erste Blitzkarten-Session",                      xp: 10  },
  { id: "bookmark_1",     icon: "📌", name: "Lesezeichen gesetzt",   desc: "Erstes Modul als Lesezeichen markiert",           xp: 5   },
  { id: "bookmark_3",     icon: "🗂️",  name: "Strukturiert",         desc: "3 Module als Lesezeichen markiert",               xp: 15  },
  { id: "all_games",      icon: "🌈", name: "Allrounder",            desc: "Alle drei Spiele mindestens einmal gespielt",     xp: 40  },
  { id: "xp_500",         icon: "🥈", name: "Silber-Rang",           desc: "500 XP angesammelt",                             xp: 0   },
  { id: "xp_2000",        icon: "🥇", name: "Gold-Rang",             desc: "2000 XP angesammelt",                            xp: 0   },
  { id: "xp_5000",        icon: "💎", name: "Diamant-Rang",          desc: "5000 XP angesammelt",                            xp: 0   },
];

function achById(id) { return ACH.find(a => a.id === id); }

// ─── Data ─────────────────────────────────────────────────────────────────────

function freshData() {
  return {
    version:   1,
    created:   new Date().toISOString(),
    profile:   { name: "Lernender", avatar: "🎓", xp: 0 },
    bookmarks: [],
    achievements: {},
    stats: {
      quiz:      { answered: 0, correct: 0, streak: 0, maxStreak: 0, byModule: {} },
      subnetz:   { games: 0, correct: 0, wrong: 0, bestStreak: 0, bestPct: 0 },
      binary:    { games: 0, correct: 0, wrong: 0, bestStreak: 0, bestPct: 0 },
      blitzkarten: { sessions: 0 },
    },
  };
}

// ─── Crypto ───────────────────────────────────────────────────────────────────

async function loadOrCreateCryptoKey() {
  const stored = localStorage.getItem(DEVICE_KEY_LS);
  if (stored) {
    try {
      const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
      return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
    } catch { /* fallthrough: generate new key */ }
  }
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const raw = await crypto.subtle.exportKey("raw", key);
  localStorage.setItem(DEVICE_KEY_LS, btoa(String.fromCharCode(...new Uint8Array(raw))));
  return key;
}

async function encryptData(obj) {
  const iv       = crypto.getRandomValues(new Uint8Array(12));
  const encoded  = new TextEncoder().encode(JSON.stringify(obj));
  const cipher   = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, _cryptoKey, encoded);
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(cipher), iv.length);
  return btoa(String.fromCharCode(...combined));
}

async function decryptPayload(b64) {
  const combined = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const plain    = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: combined.slice(0, 12) },
    _cryptoKey,
    combined.slice(12)
  );
  return JSON.parse(new TextDecoder().decode(plain));
}

// ─── File I/O ─────────────────────────────────────────────────────────────────

const FS_SUPPORTED = "showSaveFilePicker" in window;

async function writeToHandle() {
  if (!_fileHandle || !_cryptoKey) return;
  try {
    const payload = SAVE_HEADER + await encryptData(_data);
    const writable = await _fileHandle.createWritable();
    await writable.write(payload);
    await writable.close();
    updateSaveBtnDot(true);
  } catch (e) {
    console.warn("[FIAE Save] Schreibfehler:", e);
  }
}

async function readFromHandle(handle) {
  const file    = await handle.getFile();
  const text    = await file.text();
  if (!text.startsWith(SAVE_HEADER)) throw new Error("Kein FIAE-Speicherformat");
  const payload = text.slice(SAVE_HEADER.length);
  return decryptPayload(payload);
}

/** Opens a save-file picker and creates a new encrypted file */
async function createNewFile() {
  if (!FS_SUPPORTED) { return downloadFallback(); }
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: "fiae_lernstand.fiae",
      types: [{ description: "FIAE-Speicherdatei", accept: { "application/octet-stream": [".fiae"] } }],
    });
    _fileHandle = handle;
    await writeToHandle();
    return true;
  } catch (e) {
    if (e.name !== "AbortError") console.warn("[FIAE Save] Fehler beim Erstellen:", e);
    return false;
  }
}

/** Opens a file picker and loads an existing encrypted file */
async function loadExistingFile() {
  if (!FS_SUPPORTED) { return uploadFallback(); }
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: "FIAE-Speicherdatei", accept: { "application/octet-stream": [".fiae"] } }],
      multiple: false,
    });
    const loaded = await readFromHandle(handle);
    _data       = { ...freshData(), ...loaded };
    _fileHandle = handle;
    persistLS();
    updateSaveBtnDot(true);
    return true;
  } catch (e) {
    if (e.name !== "AbortError") console.warn("[FIAE Save] Fehler beim Laden:", e);
    return false;
  }
}

/** Fallback: trigger download of encrypted file */
async function downloadFallback() {
  const payload  = SAVE_HEADER + await encryptData(_data);
  const blob     = new Blob([payload], { type: "text/plain;charset=utf-8" });
  const a        = document.createElement("a");
  a.href         = URL.createObjectURL(blob);
  a.download     = "fiae_lernstand.fiae";
  a.click();
  URL.revokeObjectURL(a.href);
  return true;
}

/** Fallback: read uploaded file */
function uploadFallback() {
  return new Promise(resolve => {
    const inp       = document.createElement("input");
    inp.type        = "file";
    inp.accept      = ".fiae,.txt";
    inp.onchange    = async () => {
      const file = inp.files?.[0];
      if (!file) return resolve(false);
      try {
        const text = await file.text();
        if (!text.startsWith(SAVE_HEADER)) { showToast("❌ Keine gültige FIAE-Datei", "error"); return resolve(false); }
        const loaded = await decryptPayload(text.slice(SAVE_HEADER.length));
        _data = { ...freshData(), ...loaded };
        persistLS();
        resolve(true);
      } catch (e) { showToast("❌ Fehler beim Laden – falsches Gerät oder beschädigte Datei", "error"); resolve(false); }
    };
    inp.click();
  });
}

// ─── Persistence ──────────────────────────────────────────────────────────────

function persistLS() {
  try { localStorage.setItem(LS_BACKUP_KEY, JSON.stringify(_data)); } catch(_) {}
}

function loadFromLS() {
  try {
    const raw = localStorage.getItem(LS_BACKUP_KEY);
    if (raw) { const obj = JSON.parse(raw); return { ...freshData(), ...obj }; }
  } catch(_) {}
  return null;
}

function scheduleSave() {
  _dirty = true;
  persistLS();           // immediate LS backup
  _onUpdate.forEach(fn => fn(_data));
  if (_saveTimer) clearTimeout(_saveTimer);
  if (_fileHandle) _saveTimer = setTimeout(writeToHandle, AUTOSAVE_MS);
}

// ─── Achievements + XP ────────────────────────────────────────────────────────

function unlock(id) {
  if (_data.achievements[id]) return;
  const def = achById(id);
  if (!def) return;
  _data.achievements[id] = { date: new Date().toISOString() };
  if (def.xp) addXP(def.xp, false);
  scheduleSave();
  showAchievementToast(def);
}

function addXP(amount, andSave = true) {
  _data.profile.xp = (_data.profile.xp || 0) + amount;
  if (andSave) scheduleSave();
  checkXPAchievements();
}

function checkXPAchievements() {
  const xp = _data.profile.xp || 0;
  if (xp >= 500)  unlock("xp_500");
  if (xp >= 2000) unlock("xp_2000");
  if (xp >= 5000) unlock("xp_5000");
}

function checkAchievements() {
  const s = _data.stats;
  // Quiz
  if (s.quiz.answered >= 1)   unlock("quiz_first");
  if (s.quiz.answered >= 10)  unlock("quiz_10");
  if (s.quiz.answered >= 50)  unlock("quiz_50");
  if (s.quiz.answered >= 100) unlock("quiz_100");
  if (s.quiz.maxStreak >= 5)  unlock("quiz_streak5");
  if (s.quiz.maxStreak >= 10) unlock("quiz_streak10");
  // Games
  if (s.subnetz.games >= 1)  unlock("subnetz_first");
  if (s.binary.games >= 1)   unlock("binary_first");
  if (s.blitzkarten.sessions >= 1) unlock("blitz_first");
  // Allrounder
  if (s.subnetz.games >= 1 && s.binary.games >= 1 && s.blitzkarten.sessions >= 1) unlock("all_games");
  // Bookmarks
  if (_data.bookmarks.length >= 1) unlock("bookmark_1");
  if (_data.bookmarks.length >= 3) unlock("bookmark_3");
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getSaveData()   { return _data; }
export function isFileActive()  { return !!_fileHandle || !FS_SUPPORTED; }
export function isActive()      { return !!_data; }

export function recordQuizAnswer(correct, moduleId) {
  if (!_data) return;
  const q = _data.stats.quiz;
  q.answered++;
  if (correct) {
    q.correct++;
    q.streak = (q.streak || 0) + 1;
    if (q.streak > (q.maxStreak || 0)) q.maxStreak = q.streak;
    addXP(5, false);
  } else {
    q.streak = 0;
    addXP(1, false);
  }
  if (moduleId) {
    if (!q.byModule[moduleId]) q.byModule[moduleId] = { answered: 0, correct: 0 };
    q.byModule[moduleId].answered++;
    if (correct) q.byModule[moduleId].correct++;
  }
  checkAchievements();
  scheduleSave();
}

export function recordGameEnd(game, stats) {
  if (!_data) return;
  const g = _data.stats[game];
  if (!g) return;
  const answered = (stats.correct || 0) + (stats.wrong || 0);
  const pct = answered ? Math.round(stats.correct / answered * 100) : 0;
  g.games  = (g.games  || 0) + 1;
  g.correct = (g.correct || 0) + (stats.correct || 0);
  g.wrong   = (g.wrong   || 0) + (stats.wrong   || 0);
  if ((stats.maxStreak || 0) > (g.bestStreak || 0)) g.bestStreak = stats.maxStreak;
  if (pct > (g.bestPct || 0)) {
    g.bestPct = pct;
    if (pct >= 90) unlock(game + "_ace");
  }
  if (game === "blitzkarten") g.sessions = g.games;
  addXP(10, false);
  checkAchievements();
  scheduleSave();
}

export function toggleBookmark(moduleId) {
  if (!_data) return false;
  const idx = _data.bookmarks.indexOf(moduleId);
  if (idx >= 0) _data.bookmarks.splice(idx, 1);
  else           _data.bookmarks.push(moduleId);
  checkAchievements();
  scheduleSave();
  return idx < 0; // true = added
}

export function hasBookmark(moduleId) {
  return _data?.bookmarks?.includes(moduleId) ?? false;
}

export function updateProfile(changes) {
  if (!_data) return;
  Object.assign(_data.profile, changes);
  scheduleSave();
}

export function onDataUpdate(fn) { _onUpdate.push(fn); }

// ─── Init ──────────────────────────────────────────────────────────────────────

export async function initSaveSystem() {
  _cryptoKey = await loadOrCreateCryptoKey();

  // Try to restore from LS backup
  const lsData = loadFromLS();
  if (lsData) {
    _data = lsData;
  } else {
    _data = freshData();
    unlock("first_start");
  }

  // Setup button reference
  _saveBtn = document.getElementById("saveBtn");
  if (_saveBtn) {
    _saveBtn.addEventListener("click", openSaveManager);
    updateSaveBtnDot(!!_fileHandle);
  }

  // Listen for game events
  document.addEventListener("fiae:quizAnswer", e => {
    recordQuizAnswer(e.detail.correct, e.detail.moduleId);
  });
  document.addEventListener("fiae:gameEnd", e => {
    recordGameEnd(e.detail.game, e.detail.stats);
  });

  // Page unload: final write
  window.addEventListener("beforeunload", () => {
    if (_dirty && _fileHandle) writeToHandle();
    persistLS();
  });

  // Subtle "first-session" nudge after 3 s  
  if (!loadFromLS() || !_data.achievements["save_created"]) {
    setTimeout(() => showSaveNudge(), 3000);
  }
}

function showSaveNudge() {
  if (document.getElementById("saveNudge")) return;
  const div = document.createElement("div");
  div.id = "saveNudge";
  div.className = "save-nudge";
  div.innerHTML = `
    <span>💾 Lernstand sichern?</span>
    <button class="nudge-yes" id="nudgeYes">Datei erstellen</button>
    <button class="nudge-later" id="nudgeLater">Später</button>`;
  document.body.appendChild(div);
  document.getElementById("nudgeYes")?.addEventListener("click", async () => {
    div.remove();
    openSaveManager("settings");
  });
  document.getElementById("nudgeLater")?.addEventListener("click", () => div.remove());
  setTimeout(() => div.remove(), 12000);
}

function updateSaveBtnDot(active) {
  if (!_saveBtn) return;
  _saveBtn.classList.toggle("save-btn-active", active);
  _saveBtn.title = active ? "Speicherprofil (aktiv)" : "Speicherprofil";
}

// ─── Modal ────────────────────────────────────────────────────────────────────

let _activeTab = "profile";

export function openSaveManager(tab = "profile") {
  _activeTab = tab;
  let modal = document.getElementById("saveModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "saveModal";
    modal.className = "sm-overlay";
    document.body.appendChild(modal);
  }
  modal.innerHTML = buildModal();
  modal.classList.remove("hidden");
  bindModalEvents(modal);
}

function buildModal() {
  const d    = _data;
  const lvl  = getLevel(d.profile.xp || 0);
  const tabs = [
    { id: "profile",      icon: "👤", label: "Profil"       },
    { id: "bookmarks",    icon: "📌", label: "Lesezeichen"  },
    { id: "achievements", icon: "🏆", label: "Erfolge"       },
    { id: "stats",        icon: "📊", label: "Statistiken"  },
    { id: "settings",     icon: "⚙️",  label: "Einstellungen"},
  ];
  return `
  <div class="sm-box">
    <div class="sm-header">
      <div class="sm-header-left">
        <span class="sm-avatar">${d.profile.avatar}</span>
        <div>
          <div class="sm-username">${escH(d.profile.name)}</div>
          <div class="sm-level-tag">${lvl.icon} Level ${lvl.index} · ${lvl.name}</div>
        </div>
      </div>
      <button class="sm-close" id="smClose" type="button" aria-label="Schließen">✕</button>
    </div>
    <nav class="sm-tabs">
      ${tabs.map(t => `<button class="sm-tab ${_activeTab === t.id ? "active" : ""}" data-tab="${t.id}" type="button">
        <span>${t.icon}</span><span class="sm-tab-lbl">${t.label}</span>
      </button>`).join("")}
    </nav>
    <div class="sm-body" id="smBody">
      ${renderTab(_activeTab)}
    </div>
  </div>`;
}

function renderTab(tab) {
  switch (tab) {
    case "profile":      return renderProfile();
    case "bookmarks":    return renderBookmarks();
    case "achievements": return renderAchievements();
    case "stats":        return renderStats();
    case "settings":     return renderSettings();
    default:             return "";
  }
}

// ── Profile Tab ──────────────────────────────────────────────────────────────

const AVATARS = ["🎓","🧠","💻","⚙️","🔧","🌐","📡","🔐","🚀","🦾","🤖","⚡","🏆","🎯","🔥","💎"];

function renderProfile() {
  const d   = _data;
  const lvl = getLevel(d.profile.xp || 0);
  const ach = ACH.filter(a => d.achievements[a.id]);
  const tot = d.stats.quiz.answered + d.stats.subnetz.games +
              d.stats.binary.games + d.stats.blitzkarten.sessions;

  return `
  <div class="sm-profile-wrap">
    <div class="sm-xp-bar-wrap">
      <div class="sm-xp-bar">
        <div class="sm-xp-fill" style="width:${lvl.pct}%"></div>
      </div>
      <div class="sm-xp-label">
        <span><strong>${d.profile.xp || 0}</strong> XP</span>
        <span>${lvl.pct}% → ${lvl.nextName} (${lvl.nextMin} XP)</span>
      </div>
    </div>

    <div class="sm-profile-form">
      <div class="sm-form-row">
        <label class="sm-form-label">Name</label>
        <input class="sm-input" id="smNameInput" type="text" maxlength="24"
          value="${escH(d.profile.name)}" placeholder="Dein Name" />
      </div>
      <div class="sm-form-row">
        <label class="sm-form-label">Avatar</label>
        <div class="sm-avatar-grid" id="smAvatarGrid">
          ${AVATARS.map(av => `<button class="sm-av-btn ${d.profile.avatar === av ? "active" : ""}"
            data-av="${av}" type="button">${av}</button>`).join("")}
        </div>
      </div>
    </div>

    <div class="sm-quick-stats">
      <div class="sm-qs-item"><span class="sm-qs-num">${tot}</span><span class="sm-qs-lbl">Aktivitäten</span></div>
      <div class="sm-qs-item"><span class="sm-qs-num">${d.stats.quiz.correct}</span><span class="sm-qs-lbl">Richtige Antworten</span></div>
      <div class="sm-qs-item"><span class="sm-qs-num">${d.stats.quiz.maxStreak || 0}</span><span class="sm-qs-lbl">Quiz-Beststreak</span></div>
      <div class="sm-qs-item"><span class="sm-qs-num">${ach.length}</span><span class="sm-qs-lbl">Erfolge</span></div>
    </div>

    ${ach.length ? `<div class="sm-recent-ach">
      <h4>Neueste Erfolge</h4>
      <div class="sm-ach-strip">
        ${ach.slice(-5).reverse().map(a => `<div class="sm-ach-chip unlocked" title="${escH(a.desc)}">${a.icon} ${escH(a.name)}</div>`).join("")}
      </div>
    </div>` : ""}
  </div>`;
}

// ── Bookmarks Tab ─────────────────────────────────────────────────────────────

function renderBookmarks() {
  const bm = _data.bookmarks;
  if (!bm.length) return `
    <div class="sm-empty">
      <div class="sm-empty-icon">📌</div>
      <p>Noch keine Lesezeichen.</p>
      <p class="sm-empty-hint">Öffne ein Modul und tippe auf das <strong>📌</strong>-Symbol neben dem Titel, um es zu markieren.</p>
    </div>`;
  return `
  <div class="sm-bm-list">
    ${bm.map(id => `
      <div class="sm-bm-item">
        <button class="sm-bm-go" data-modid="${escH(id)}" type="button">
          <span class="sm-bm-icon">📌</span>
          <span class="sm-bm-label">Modul ${escH(id)}</span>
          <span class="sm-bm-arrow">→</span>
        </button>
        <button class="sm-bm-del" data-bmid="${escH(id)}" type="button" title="Entfernen">✕</button>
      </div>`).join("")}
  </div>`;
}

// ── Achievements Tab ──────────────────────────────────────────────────────────

function renderAchievements() {
  const d   = _data;
  const total   = ACH.length;
  const unlocked = ACH.filter(a => d.achievements[a.id]).length;
  return `
  <div class="sm-ach-wrap">
    <div class="sm-ach-progress">
      <div class="sm-ach-prog-bar">
        <div class="sm-ach-prog-fill" style="width:${Math.round(unlocked/total*100)}%"></div>
      </div>
      <span>${unlocked} / ${total} freigeschaltet</span>
    </div>
    <div class="sm-ach-grid">
      ${ACH.map(a => {
        const won = !!d.achievements[a.id];
        const date = won ? new Date(d.achievements[a.id].date).toLocaleDateString("de-DE") : null;
        return `<div class="sm-ach-card ${won ? "unlocked" : "locked"}">
          <div class="sm-ach-icon">${won ? a.icon : "🔒"}</div>
          <div class="sm-ach-info">
            <div class="sm-ach-name">${won ? escH(a.name) : "???"}</div>
            <div class="sm-ach-desc">${won ? escH(a.desc) : escH(a.desc)}</div>
            ${won ? `<div class="sm-ach-date">✅ ${date}</div>` : ""}
            ${a.xp ? `<div class="sm-ach-xp">+${a.xp} XP</div>` : ""}
          </div>
        </div>`;
      }).join("")}
    </div>
  </div>`;
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────

function renderStats() {
  const s  = _data.stats;
  const qTot = s.quiz.answered;
  const qPct = qTot ? Math.round(s.quiz.correct / qTot * 100) : 0;
  const snTot = (s.subnetz.correct || 0) + (s.subnetz.wrong || 0);
  const snPct = snTot ? Math.round((s.subnetz.correct || 0) / snTot * 100) : 0;
  const biTot = (s.binary.correct || 0) + (s.binary.wrong || 0);
  const biPct = biTot ? Math.round((s.binary.correct || 0) / biTot * 100) : 0;

  const byMod = Object.entries(s.quiz.byModule || {}).sort((a,b) => b[1].answered - a[1].answered);

  return `
  <div class="sm-stats-wrap">
    <div class="sm-stats-section">
      <h3>🧠 Quiz</h3>
      <div class="sm-stats-row">
        <div class="sm-stat-cell"><div class="sm-sc-num">${qTot}</div><div class="sm-sc-lbl">Beantwortet</div></div>
        <div class="sm-stat-cell"><div class="sm-sc-num">${s.quiz.correct}</div><div class="sm-sc-lbl">Richtig</div></div>
        <div class="sm-stat-cell good"><div class="sm-sc-num">${qPct}%</div><div class="sm-sc-lbl">Genauigkeit</div></div>
        <div class="sm-stat-cell accent"><div class="sm-sc-num">${s.quiz.maxStreak || 0}</div><div class="sm-sc-lbl">Max. Streak</div></div>
      </div>
      ${byMod.length ? `<div class="sm-mod-breakdown">
        <div class="sm-mbd-title">Top-Module</div>
        ${byMod.slice(0,5).map(([id, ms]) => {
          const pct = ms.answered ? Math.round(ms.correct/ms.answered*100) : 0;
          return `<div class="sm-mbd-row">
            <span class="sm-mbd-id">Modul ${escH(id)}</span>
            <div class="sm-mbd-bar-wrap"><div class="sm-mbd-bar" style="width:${pct}%"></div></div>
            <span class="sm-mbd-pct">${pct}%</span>
          </div>`;
        }).join("")}
      </div>` : ""}
    </div>

    <div class="sm-stats-section">
      <h3>🌐 Subnetz-Trainer</h3>
      <div class="sm-stats-row">
        <div class="sm-stat-cell"><div class="sm-sc-num">${s.subnetz.games}</div><div class="sm-sc-lbl">Runden</div></div>
        <div class="sm-stat-cell good"><div class="sm-sc-num">${snPct}%</div><div class="sm-sc-lbl">Gesamt</div></div>
        <div class="sm-stat-cell accent"><div class="sm-sc-num">${s.subnetz.bestPct}%</div><div class="sm-sc-lbl">Best Score</div></div>
        <div class="sm-stat-cell"><div class="sm-sc-num">${s.subnetz.bestStreak}</div><div class="sm-sc-lbl">Best Streak</div></div>
      </div>
    </div>

    <div class="sm-stats-section">
      <h3>🔢 Binär-Trainer</h3>
      <div class="sm-stats-row">
        <div class="sm-stat-cell"><div class="sm-sc-num">${s.binary.games}</div><div class="sm-sc-lbl">Runden</div></div>
        <div class="sm-stat-cell good"><div class="sm-sc-num">${biPct}%</div><div class="sm-sc-lbl">Gesamt</div></div>
        <div class="sm-stat-cell accent"><div class="sm-sc-num">${s.binary.bestPct}%</div><div class="sm-sc-lbl">Best Score</div></div>
        <div class="sm-stat-cell"><div class="sm-sc-num">${s.binary.bestStreak}</div><div class="sm-sc-lbl">Best Streak</div></div>
      </div>
    </div>

    <div class="sm-stats-section">
      <h3>⚡ Blitz-Karten</h3>
      <div class="sm-stats-row">
        <div class="sm-stat-cell"><div class="sm-sc-num">${s.blitzkarten.sessions}</div><div class="sm-sc-lbl">Sessions</div></div>
      </div>
    </div>
  </div>`;
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

function renderSettings() {
  const keyB64 = localStorage.getItem(DEVICE_KEY_LS) || "";
  const short  = keyB64 ? keyB64.slice(0, 8) + "…" + keyB64.slice(-8) : "–";
  const hasFile = !!_fileHandle;
  const hasFSAPI = FS_SUPPORTED;

  return `
  <div class="sm-settings-wrap">
    <div class="sm-settings-card">
      <h3>💾 Speicherdatei</h3>
      <p class="sm-settings-desc">
        Deine Fortschritte werden automatisch in einer verschlüsselten Datei gesichert.
        ${hasFile ? "✅ Datei aktiv – Autosave läuft." : "⚠️ Keine Datei aktiv. Daten werden nur im Browser gespeichert."}
      </p>
      ${!hasFSAPI ? `<p class="sm-settings-warn">ℹ️ Dein Browser unterstützt keine direkte Datei-API. Du kannst die Datei manuell herunterladen und wieder hochladen.</p>` : ""}
      <div class="sm-btn-row">
        <button class="sm-action-btn sm-btn-primary" id="smCreateFile" type="button">
          ${hasFile ? "🔄 Neue Datei erstellen" : "✨ Speicherdatei erstellen"}
        </button>
        <button class="sm-action-btn" id="smLoadFile" type="button">
          📂 Datei laden
        </button>
        ${hasFile ? `<button class="sm-action-btn" id="smForceExport" type="button">
          ⬇️ Kopie herunterladen
        </button>` : ""}
      </div>
    </div>

    <div class="sm-settings-card">
      <h3>🔑 Geräteschlüssel</h3>
      <p class="sm-settings-desc">
        Dieser Schlüssel ist gerätespezifisch. Nur mit diesem Schlüssel kann die Datei gelesen werden.
        Möchtest du auf einem anderen Gerät weitermachen, exportiere den Schlüssel.
      </p>
      <div class="sm-key-display">
        <code class="sm-key-code" id="smKeyCode">${escH(short)}</code>
        <button class="sm-icon-btn" id="smCopyKey" type="button" title="Schlüssel kopieren">📋</button>
        <button class="sm-icon-btn" id="smToggleKey" type="button" title="Schlüssel anzeigen">👁️</button>
      </div>
      <button class="sm-action-btn sm-btn-danger" id="smImportKey" type="button">🔄 Schlüssel importieren</button>
    </div>

    <div class="sm-settings-card sm-danger-zone">
      <h3>⚠️ Daten</h3>
      <p class="sm-settings-desc">Lernstand zurücksetzen – alle Statistiken und Erfolge werden gelöscht.</p>
      <button class="sm-action-btn sm-btn-danger" id="smReset" type="button">🗑️ Lernstand zurücksetzen</button>
    </div>

    <div class="sm-legal-links">
      <a href="./datenschutz.html" target="_blank" rel="noopener noreferrer">🔐 Datenschutz</a>
      <span class="sm-legal-sep">·</span>
      <a href="https://mindoroevo.github.io/mindoro_imp/impressum.html" target="_blank" rel="noopener noreferrer">📄 Impressum</a>
      <span class="sm-legal-sep">·</span>
      <a href="./agb.html" target="_blank" rel="noopener noreferrer">📜 AGB</a>
    </div>
  </div>`;
}

// ─── Modal Event Binding ──────────────────────────────────────────────────────

function bindModalEvents(modal) {
  // Close button
  modal.querySelector("#smClose")?.addEventListener("click", () => closeModal(modal));
  // Close on backdrop
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(modal); });

  // Tab switching
  modal.querySelectorAll(".sm-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      _activeTab = btn.dataset.tab;
      modal.querySelectorAll(".sm-tab").forEach(b => b.classList.toggle("active", b === btn));
      modal.querySelector("#smBody").innerHTML = renderTab(_activeTab);
      bindTabEvents(modal);
    });
  });

  bindTabEvents(modal);
}

function bindTabEvents(modal) {
  const g = id => modal.querySelector(`#${id}`);

  // Profile tab
  const nameInput = g("smNameInput");
  if (nameInput) {
    nameInput.addEventListener("input", () => {
      updateProfile({ name: nameInput.value || "Lernender" });
    });
  }
  modal.querySelectorAll("[data-av]").forEach(btn => {
    btn.addEventListener("click", () => {
      modal.querySelectorAll("[data-av]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateProfile({ avatar: btn.dataset.av });
      modal.querySelector(".sm-avatar").textContent = btn.dataset.av;
    });
  });

  // Bookmarks tab
  modal.querySelectorAll("[data-modid]").forEach(btn => {
    btn.addEventListener("click", () => {
      closeModal(modal);
      // Navigate to module
      const modId = btn.dataset.modid;
      document.dispatchEvent(new CustomEvent("fiae:navigateMod", { detail: { id: modId } }));
    });
  });
  modal.querySelectorAll("[data-bmid]").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleBookmark(btn.dataset.bmid);
      g("smBody").innerHTML = renderTab("bookmarks");
      bindTabEvents(modal);
    });
  });

  // Settings tab
  g("smCreateFile")?.addEventListener("click", async () => {
    const ok = await createNewFile();
    if (ok) {
      unlock("save_created");
      showToast("✅ Speicherdatei erstellt! Autosave aktiv.", "success");
      updateSaveBtnDot(true);
      g("smBody").innerHTML = renderTab("settings");
      bindTabEvents(modal);
    }
  });
  g("smLoadFile")?.addEventListener("click", async () => {
    const ok = await loadExistingFile();
    if (ok) {
      showToast("✅ Datei geladen!", "success");
      updateSaveBtnDot(true);
      modal.innerHTML = buildModal();
      bindModalEvents(modal);
    }
  });
  g("smForceExport")?.addEventListener("click", downloadFallback);
  g("smCopyKey")?.addEventListener("click", () => {
    const k = localStorage.getItem(DEVICE_KEY_LS) || "";
    navigator.clipboard?.writeText(k).then(() => showToast("📋 Schlüssel kopiert", "success"))
      .catch(() => showToast("❌ Kopieren fehlgeschlagen", "error"));
  });
  g("smToggleKey")?.addEventListener("click", () => {
    const code = g("smKeyCode");
    if (!code) return;
    const full = localStorage.getItem(DEVICE_KEY_LS) || "–";
    code.textContent = code.dataset.full ? (code.dataset.full = "", full.slice(0,8)+"…"+full.slice(-8)) : (code.dataset.full = "1", full);
  });
  g("smImportKey")?.addEventListener("click", async () => {
    const key = window.prompt("Schlüssel (Base64) einfügen:");
    if (!key) return;
    try {
      const raw = Uint8Array.from(atob(key.trim()), c => c.charCodeAt(0));
      _cryptoKey = await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
      localStorage.setItem(DEVICE_KEY_LS, key.trim());
      showToast("✅ Schlüssel importiert", "success");
    } catch { showToast("❌ Ungültiger Schlüssel", "error"); }
  });
  g("smReset")?.addEventListener("click", () => {
    if (!confirm("Wirklich alles zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.")) return;
    _data = freshData();
    _fileHandle = null;
    localStorage.removeItem(LS_BACKUP_KEY);
    updateSaveBtnDot(false);
    showToast("🗑️ Lernstand zurückgesetzt", "info");
    modal.innerHTML = buildModal();
    bindModalEvents(modal);
  });
}

function closeModal(modal) {
  modal.classList.add("hidden");
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(msg, type = "info") {
  const t = document.createElement("div");
  t.className = `save-toast save-toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 3000);
}

function showAchievementToast(def) {
  const t = document.createElement("div");
  t.className = "save-toast save-toast-ach";
  t.innerHTML = `<span class="sat-icon">${def.icon}</span><div><strong>Erfolg freigeschaltet!</strong><br>${def.name}</div>`;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 500); }, 4000);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function escH(s) {
  return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
