/**
 * Blitz-Karten Flashcard Game
 * Uses true/false and single-MCQ questions from module quiz files.
 */

import { QUIZ_BASE_PATH, state } from "../state.js";
import { escapeHtml, shuffleArray } from "../utils.js";
import { MODULES } from "../modules.js";

const GAME_MODULES = ["001", "002", "003", "004", "005", "006"];
const LIFETIME_KEY = "bk_lifetime_stats_v1";

let bk = null;
let _container = null;
let _onBack = null;

function loadLifetimeStats() {
  try {
    const raw = localStorage.getItem(LIFETIME_KEY);
    if (!raw) return { sessions: 0, known: 0, repeat: 0 };
    const parsed = JSON.parse(raw);
    return {
      sessions: Number(parsed.sessions) || 0,
      known: Number(parsed.known) || 0,
      repeat: Number(parsed.repeat) || 0,
    };
  } catch {
    return { sessions: 0, known: 0, repeat: 0 };
  }
}

function saveLifetimeStats(stats) {
  try {
    localStorage.setItem(LIFETIME_KEY, JSON.stringify(stats));
  } catch {
    // Ignore write failures (private mode / storage disabled)
  }
}

function freshState() {
  return {
    allCards: [],
    deck: [],
    repeatCards: [],
    actionHistory: [],
    currentIndex: 0,
    isFlipped: false,
    streak: 0,
    maxStreak: 0,
    known: 0,
    repeatCount: 0,
    phase: "loading", // loading | setup | playing | done
    filterModule: "all",
    filterDifficulty: "all",
    sessionSize: "all",
    timerMode: false,
    timerSeconds: 5,
    timerRemaining: 5,
    timerInterval: null,
    resultsSaved: false,
    lifetime: loadLifetimeStats(),
  };
}

export async function launchBlitzkarten(container, onBack) {
  _container = container;
  _onBack = onBack;
  bk = freshState();

  container.innerHTML = renderLoading();

  for (const mid of GAME_MODULES) {
    const data = await fetchQuiz(mid);
    if (data) bk.allCards.push(...buildCards(data, mid));
  }

  bk.phase = "setup";
  render();

  container.addEventListener("click", handleClick);
  container.addEventListener("change", handleChange);
  container.addEventListener("keydown", handleKeydown);
}

export function cleanupBlitzkarten() {
  stopTimer();
  if (_container) {
    _container.removeEventListener("click", handleClick);
    _container.removeEventListener("change", handleChange);
    _container.removeEventListener("keydown", handleKeydown);
  }
  bk = null;
  _container = null;
  _onBack = null;
}

async function fetchQuiz(moduleId) {
  if (state.quizCache[moduleId]) return state.quizCache[moduleId];
  try {
    const res = await fetch(`${QUIZ_BASE_PATH}/${moduleId}.quiz.json`);
    if (!res.ok) return null;
    const data = await res.json();
    state.quizCache[moduleId] = data;
    return data;
  } catch {
    return null;
  }
}

function buildCards(quizData, moduleId) {
  const cards = [];
  const modEntry = MODULES.find((m) => m[0] === moduleId);
  const moduleName = modEntry ? modEntry[1] : moduleId;

  for (const q of quizData.true_false || []) {
    cards.push({
      id: `${moduleId}-${q.id}`,
      type: "tf",
      front: `<div class="bk-question">${escapeHtml(q.statement)}</div>`,
      backAnswer: q.answer === "true" ? "Wahr" : "Falsch",
      explanation: renderExpl(q.explanation || ""),
      module: moduleId,
      moduleName,
      concept: q.concept || "",
      difficulty: q.difficulty || "medium",
    });
  }

  for (const q of quizData.mcq || []) {
    if (q.type !== "single") continue;
    const correctIdx = typeof q.answer === "number" ? q.answer : 0;
    const optionsHtml = (q.options || [])
      .map((o, i) => {
        const letter = String.fromCharCode(65 + i);
        return `<div class="bk-opt">`
          + `<span class="bk-opt-letter">${letter}</span>`
          + `<span class="bk-opt-text">${escapeHtml(o)}</span>`
          + `</div>`;
      })
      .join("");
    const correctText = q.options?.[correctIdx] ?? "";
    const correctLetter = String.fromCharCode(65 + correctIdx);

    cards.push({
      id: `${moduleId}-${q.id}`,
      type: "mcq",
      front: `<div class="bk-question">${escapeHtml(q.question)}</div><div class="bk-opts">${optionsHtml}</div>`,
      backAnswer: `${correctLetter}) ${escapeHtml(correctText)}`,
      explanation: renderExpl(q.explanation || ""),
      module: moduleId,
      moduleName,
      concept: q.concept || "",
      difficulty: q.difficulty || "medium",
    });
  }

  return cards;
}

function renderExpl(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

function getFilteredCards() {
  return bk.allCards.filter((c) => {
    if (bk.filterModule !== "all" && c.module !== bk.filterModule) return false;
    if (bk.filterDifficulty !== "all" && c.difficulty !== bk.filterDifficulty) return false;
    return true;
  });
}

function getSessionCards() {
  const cards = getFilteredCards();
  if (bk.sessionSize === "all") return cards;
  const limit = parseInt(bk.sessionSize, 10);
  if (!Number.isFinite(limit) || limit <= 0) return cards;
  return shuffleArray([...cards]).slice(0, Math.min(limit, cards.length));
}

function pushUndoSnapshot() {
  bk.actionHistory.push({
    deck: [...bk.deck],
    repeatCards: [...bk.repeatCards],
    currentIndex: bk.currentIndex,
    isFlipped: bk.isFlipped,
    streak: bk.streak,
    maxStreak: bk.maxStreak,
    known: bk.known,
    repeatCount: bk.repeatCount,
  });
  if (bk.actionHistory.length > 20) bk.actionHistory.shift();
}

function startSession(cards) {
  stopTimer();
  bk.deck = shuffleArray([...cards]);
  bk.repeatCards = [];
  bk.actionHistory = [];
  bk.currentIndex = 0;
  bk.isFlipped = false;
  bk.streak = 0;
  bk.maxStreak = 0;
  bk.known = 0;
  bk.repeatCount = 0;
  bk.resultsSaved = false;
  bk.phase = "playing";

  render();
  if (bk.timerMode) startTimer();
}

function flipCard() {
  if (bk.phase !== "playing" || bk.isFlipped) return;
  bk.isFlipped = true;
  stopTimer();
  render();
}

function markKnown() {
  if (!bk.deck[bk.currentIndex]) return;
  pushUndoSnapshot();
  bk.known += 1;
  bk.streak += 1;
  if (bk.streak > bk.maxStreak) bk.maxStreak = bk.streak;
  nextCard();
}

function requeueCard(card) {
  const minOffset = 2;
  const maxOffset = 4;
  const offset = Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;
  const insertAt = Math.min(bk.deck.length, bk.currentIndex + offset);
  bk.deck.splice(insertAt, 0, card);
}

function markRepeat() {
  const card = bk.deck[bk.currentIndex];
  if (!card) return;

  pushUndoSnapshot();
  bk.repeatCards.push(card);
  requeueCard(card);
  bk.repeatCount += 1;
  bk.streak = 0;
  nextCard();
}

function undoLastAction() {
  const snapshot = bk.actionHistory.pop();
  if (!snapshot || bk.phase !== "playing") return;

  stopTimer();
  bk.deck = snapshot.deck;
  bk.repeatCards = snapshot.repeatCards;
  bk.currentIndex = snapshot.currentIndex;
  bk.isFlipped = true;
  bk.streak = snapshot.streak;
  bk.maxStreak = snapshot.maxStreak;
  bk.known = snapshot.known;
  bk.repeatCount = snapshot.repeatCount;

  render();
}

function persistSessionResults() {
  if (bk.resultsSaved) return;
  bk.resultsSaved = true;
  bk.lifetime.sessions += 1;
  bk.lifetime.known += bk.known;
  bk.lifetime.repeat += bk.repeatCount;
  saveLifetimeStats(bk.lifetime);
  document.dispatchEvent(new CustomEvent("fiae:gameEnd", { detail: { game: "blitzkarten", stats: { correct: bk.known, wrong: bk.repeatCount, maxStreak: 0 } } }));
}

function nextCard() {
  bk.currentIndex += 1;
  stopTimer();

  if (bk.currentIndex >= bk.deck.length) {
    persistSessionResults();
    bk.phase = "done";
    render();
    return;
  }

  bk.isFlipped = false;
  render();
  if (bk.timerMode) startTimer();
}

function startTimer() {
  stopTimer();
  bk.timerRemaining = bk.timerSeconds;

  bk.timerInterval = setInterval(() => {
    bk.timerRemaining = Math.max(0, bk.timerRemaining - 1);

    const fill = _container?.querySelector(".bk-timer-fill");
    const text = _container?.querySelector(".bk-timer-text");
    const pct = (bk.timerRemaining / bk.timerSeconds) * 100;

    if (fill) {
      fill.style.width = `${pct}%`;
      if (bk.timerRemaining <= 2) fill.style.background = "#e74c3c";
      else if (bk.timerRemaining <= 3) fill.style.background = "#f39c12";
      else fill.style.background = "";
    }

    if (text) text.textContent = `${bk.timerRemaining}s`;

    if (bk.timerRemaining <= 0) {
      flipCard();
    }
  }, 1000);
}

function stopTimer() {
  if (bk?.timerInterval) {
    clearInterval(bk.timerInterval);
    bk.timerInterval = null;
  }
}

function accuracyPercent() {
  const seen = bk.known + bk.repeatCount;
  if (seen === 0) return 0;
  return Math.round((bk.known / seen) * 100);
}

function handleClick(e) {
  if (!bk || !_container) return;

  const t = e.target;
  const closest = (sel) => t.closest(sel);

  if (t.dataset.bkModule !== undefined) {
    bk.filterModule = t.dataset.bkModule;
    render();
    return;
  }

  if (t.dataset.bkDiff !== undefined) {
    bk.filterDifficulty = t.dataset.bkDiff;
    render();
    return;
  }

  if (t.dataset.bkSeconds !== undefined) {
    bk.timerSeconds = parseInt(t.dataset.bkSeconds, 10);
    render();
    return;
  }

  if (t.dataset.bkSize !== undefined) {
    bk.sessionSize = t.dataset.bkSize;
    render();
    return;
  }

  if (t.id === "bkStart") {
    const cards = getSessionCards();
    if (cards.length > 0) startSession(cards);
    return;
  }

  if (t.id === "bkFlip" || closest("#bkCard")) {
    if (!bk.isFlipped) flipCard();
    return;
  }

  if (t.id === "bkKnown") {
    markKnown();
    return;
  }

  if (t.id === "bkRepeat") {
    markRepeat();
    return;
  }

  if (t.id === "bkUndo") {
    undoLastAction();
    return;
  }

  if (t.id === "bkQuit") {
    stopTimer();
    bk.phase = "setup";
    render();
    return;
  }

  if (t.id === "bkRepeatSession") {
    startSession(bk.repeatCards);
    return;
  }

  if (t.id === "bkNewSession") {
    bk.phase = "setup";
    render();
    return;
  }

  if (t.id === "bkBackBtn" || t.id === "bkBackBtn2") {
    stopTimer();
    cleanupBlitzkarten();
    if (_onBack) _onBack();
  }
}

function handleChange(e) {
  if (!bk) return;
  if (e.target.id === "bkTimerToggle") {
    bk.timerMode = e.target.checked;
    render();
  }
}

function handleKeydown(e) {
  if (!bk || bk.phase !== "playing") return;

  if ((e.key === " " || e.key === "Enter") && !bk.isFlipped) {
    e.preventDefault();
    flipCard();
    return;
  }

  if (e.key.toLowerCase() === "u") {
    e.preventDefault();
    undoLastAction();
    return;
  }

  if (!bk.isFlipped) return;

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "k") markKnown();
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "r") markRepeat();
}

function render() {
  if (!_container || !bk) return;
  if (bk.phase === "loading") {
    _container.innerHTML = renderLoading();
    return;
  }
  if (bk.phase === "setup") {
    _container.innerHTML = renderSetup();
    return;
  }
  if (bk.phase === "playing") {
    _container.innerHTML = renderPlaying();
    return;
  }
  if (bk.phase === "done") {
    _container.innerHTML = renderDone();
  }
}

function renderLoading() {
  return `<div class="bk-wrap"><div class="bk-loading">Lade Karten aus allen Modulen...</div></div>`;
}

function renderSetup() {
  const sessionCards = getSessionCards();
  const tfCount = bk.allCards.filter((c) => c.type === "tf").length;
  const mcqCount = bk.allCards.filter((c) => c.type === "mcq").length;

  const modulePills = ["all", ...GAME_MODULES]
    .map((mid) => {
      const active = bk.filterModule === mid;
      const label = mid === "all" ? "Alle" : mid;
      const count = mid === "all"
        ? bk.allCards.length
        : bk.allCards.filter((c) => c.module === mid).length;
      const name = mid === "all"
        ? "Alle Module"
        : MODULES.find((m) => m[0] === mid)?.[1] ?? mid;
      return `<button class="bk-pill${active ? " active" : ""}" data-bk-module="${mid}" title="${escapeHtml(name)}">${escapeHtml(label)} <small>(${count})</small></button>`;
    })
    .join("");

  const diffPills = [
    ["all", "Alle"],
    ["easy", "Leicht"],
    ["medium", "Mittel"],
    ["hard", "Schwer"],
  ]
    .map(([d, label]) => {
      const active = bk.filterDifficulty === d;
      const count = d === "all"
        ? bk.allCards.length
        : bk.allCards.filter((c) => c.difficulty === d).length;
      return `<button class="bk-pill${active ? " active" : ""}" data-bk-diff="${d}">${label} <small>(${count})</small></button>`;
    })
    .join("");

  const sizePills = [
    ["all", "Alle Karten"],
    ["20", "20 Karten"],
    ["40", "40 Karten"],
  ]
    .map(([size, label]) => `<button class="bk-pill${bk.sessionSize === size ? " active" : ""}" data-bk-size="${size}">${label}</button>`)
    .join("");

  const secPills = [5, 8, 10]
    .map((s) => `<button class="bk-pill${bk.timerSeconds === s ? " active" : ""}" data-bk-seconds="${s}">${s}s</button>`)
    .join("");

  const lifetimeAttempts = bk.lifetime.known + bk.lifetime.repeat;
  const lifetimePct = lifetimeAttempts > 0
    ? Math.round((bk.lifetime.known / lifetimeAttempts) * 100)
    : 0;

  return `
    <div class="bk-wrap bk-setup">
      <div class="bk-page-header">
        <button class="bk-back-link" id="bkBackBtn">Zurueck</button>
        <div>
          <h2 class="bk-title">Blitz-Karten</h2>
          <p class="bk-subtitle">${bk.allCards.length} Karten aus 6 Modulen | ${tfCount} Wahr/Falsch | ${mcqCount} Multiple Choice</p>
        </div>
      </div>

      <div class="bk-lifetime-row">
        <span><strong>${bk.lifetime.sessions}</strong> Sessions</span>
        <span><strong>${bk.lifetime.known}</strong> gewusst</span>
        <span><strong>${bk.lifetime.repeat}</strong> wiederholt</span>
        <span>Trefferquote: <strong>${lifetimePct}%</strong></span>
      </div>

      <div class="bk-config-card">
        <div class="bk-config-section">
          <h3>Modul</h3>
          <div class="bk-pills">${modulePills}</div>
        </div>

        <div class="bk-config-section">
          <h3>Schwierigkeitsgrad</h3>
          <div class="bk-pills">${diffPills}</div>
        </div>

        <div class="bk-config-section">
          <h3>Lernumfang</h3>
          <div class="bk-pills">${sizePills}</div>
        </div>

        <div class="bk-config-section">
          <h3>Timer-Modus</h3>
          <label class="bk-toggle-label">
            <input type="checkbox" id="bkTimerToggle"${bk.timerMode ? " checked" : ""}>
            <span class="bk-toggle-track"><span class="bk-toggle-thumb"></span></span>
            <span>Automatisch aufdecken nach</span>
          </label>
          ${bk.timerMode ? `<div class="bk-pills bk-pills-sm">${secPills}</div>` : ""}
        </div>

        <div class="bk-start-area">
          <div class="bk-count-preview">
            <span class="bk-count-num">${sessionCards.length}</span>
            <span class="bk-count-label">Karten in dieser Session</span>
          </div>
          <button class="bk-start-btn" id="bkStart"${sessionCards.length === 0 ? " disabled" : ""}>
            Lernen starten
          </button>
        </div>
      </div>

      <div class="bk-help-row">
        <span>Tastatur: <kbd>Space</kbd> aufdecken | <kbd>&rarr;</kbd> gewusst | <kbd>&larr;</kbd> nochmal | <kbd>U</kbd> rueckgaengig</span>
      </div>
    </div>`;
}

function renderPlaying() {
  const card = bk.deck[bk.currentIndex];
  if (!card) return "";

  const total = bk.deck.length;
  const done = bk.currentIndex;
  const progress = total > 0 ? (done / total) * 100 : 0;
  const remaining = Math.max(0, total - done);

  const streakHtml = bk.streak >= 5
    ? `<span class="bk-streak bk-streak-hot">Streak ${bk.streak}</span>`
    : bk.streak >= 2
      ? `<span class="bk-streak">Streak ${bk.streak}</span>`
      : `<span class="bk-streak-empty"></span>`;

  const diffLabel = { easy: "Leicht", medium: "Mittel", hard: "Schwer" }[card.difficulty] ?? card.difficulty;
  const typeLabel = card.type === "tf" ? "Wahr/Falsch" : "Multiple Choice";

  const timerHtml = bk.timerMode
    ? `<div class="bk-timer-wrap">
        <div class="bk-timer-bar"><div class="bk-timer-fill" style="width:${(bk.timerRemaining / bk.timerSeconds) * 100}%"></div></div>
        <div class="bk-timer-text">${bk.timerRemaining}s</div>
      </div>`
    : "";

  const liveStats = `
    <div class="bk-live-stats">
      <span><strong>${done}</strong> erledigt</span>
      <span><strong>${remaining}</strong> offen</span>
      <span>Quote: <strong>${accuracyPercent()}%</strong></span>
    </div>`;

  const actionHtml = bk.isFlipped
    ? `<div class="bk-actions">
        <button class="bk-act-btn bk-repeat-btn" id="bkRepeat">
          <span class="bk-btn-label">Nochmal<small>&larr; oder R</small></span>
        </button>
        <button class="bk-act-btn bk-known-btn" id="bkKnown">
          <span class="bk-btn-label">Gewusst<small>&rarr; oder K</small></span>
        </button>
      </div>
      <button class="bk-undo-btn" id="bkUndo"${bk.actionHistory.length === 0 ? " disabled" : ""}>Letzte Antwort rueckgaengig (U)</button>`
    : `<button class="bk-flip-btn" id="bkFlip">
        <span>Aufdecken</span>
        <small>Tippen oder <kbd>Space</kbd></small>
      </button>`;

  return `
    <div class="bk-wrap bk-playing">
      <div class="bk-topbar">
        <button class="bk-icon-btn" id="bkQuit" title="Session beenden">X</button>
        <div class="bk-progress-group">
          <div class="bk-progress-bar"><div class="bk-progress-fill" style="width:${progress}%"></div></div>
          <div class="bk-progress-label">Karte ${bk.currentIndex + 1} / ${total}</div>
        </div>
        <div class="bk-streak-wrap">${streakHtml}</div>
      </div>

      ${timerHtml}
      ${liveStats}

      <div class="bk-card-scene${bk.isFlipped ? " bk-flipped" : ""}" id="bkCard" tabindex="0" role="button" aria-label="Karte aufdecken">
        <div class="bk-card-inner">
          <div class="bk-card-face bk-card-front">
            <div class="bk-card-tags">
              <span class="bk-tag">${escapeHtml(card.moduleName)}</span>
              ${card.concept ? `<span class="bk-tag bk-tag-muted">${escapeHtml(card.concept)}</span>` : ""}
              <span class="bk-tag bk-tag-diff">${escapeHtml(diffLabel)}</span>
              <span class="bk-tag bk-tag-type">${typeLabel}</span>
            </div>
            <div class="bk-card-body">${card.front}</div>
          </div>

          <div class="bk-card-face bk-card-back">
            <div class="bk-back-label">Antwort</div>
            <div class="bk-back-answer">${card.backAnswer}</div>
            <div class="bk-back-divider"></div>
            <div class="bk-back-expl">${card.explanation}</div>
          </div>
        </div>
      </div>

      ${actionHtml}

      <div class="bk-session-stats">
        <span class="bk-stat-good">${bk.known} gewusst</span>
        <span class="bk-stat-sep">|</span>
        <span class="bk-stat-repeat">${bk.repeatCount} nochmal</span>
      </div>
    </div>`;
}

function renderDone() {
  const total = bk.deck.length;
  const pct = total > 0 ? Math.round((bk.known / total) * 100) : 0;
  const msg = pct >= 90
    ? "Ausgezeichnet!"
    : pct >= 70
      ? "Gute Arbeit, weiter so."
      : pct >= 50
        ? "Solide Basis. Wiederholen hilft jetzt stark."
        : "Dranbleiben. Kurze Sessions bringen Momentum.";

  return `
    <div class="bk-wrap bk-done">
      <h2 class="bk-done-title">Session abgeschlossen</h2>
      <p class="bk-done-msg">${msg}</p>

      <div class="bk-result-grid">
        <div class="bk-result-box good">
          <div class="bk-result-num">${bk.known}</div>
          <div class="bk-result-lbl">Gewusst</div>
        </div>
        <div class="bk-result-box bad">
          <div class="bk-result-num">${bk.repeatCount}</div>
          <div class="bk-result-lbl">Wiederholen</div>
        </div>
        <div class="bk-result-box streak">
          <div class="bk-result-num">${bk.maxStreak}</div>
          <div class="bk-result-lbl">Max Streak</div>
        </div>
      </div>

      <div class="bk-score-bar-wrap">
        <div class="bk-score-bar">
          <div class="bk-score-fill" style="width:${pct}%"></div>
        </div>
        <div class="bk-score-pct">${pct}% gewusst</div>
      </div>

      <div class="bk-done-actions">
        ${bk.repeatCards.length > 0
          ? `<button class="bk-start-btn" id="bkRepeatSession">Nur Wiederhol-Karten (${bk.repeatCards.length})</button>`
          : `<p class="bk-perfect">Alle Karten gewusst</p>`}
        <button class="bk-start-btn bk-secondary" id="bkNewSession">Neue Session</button>
        <button class="bk-back-link" id="bkBackBtn2">Zurueck zur App</button>
      </div>
    </div>`;
}
