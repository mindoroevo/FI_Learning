import { MODULES } from "./modules.js";
import { state, loadQuizData, getAvailableConcepts, getQuizStats } from "./state.js";
import { launchBlitzkarten, cleanupBlitzkarten } from "./games/blitzkarten.js";
import { launchSubnetz, cleanupSubnetz } from "./games/subnetz.js";
import { launchBinary, cleanupBinary } from "./games/binary.js";
import { launchDiagramm, cleanupDiagramm } from "./games/diagramm.js";
import { initSaveSystem, openSaveManager, toggleBookmark, hasBookmark } from "./saveSystem.js";
import { markdownToHtml } from "./markdown.js";
import { inlineMd, escapeAttr, escapeHtml } from "./utils.js";
import { checkAnswer, showSolution } from "./quiz/validation.js";
import { 
  renderMcqSection, 
  renderFillBlankSection, 
  renderMatchSection, 
  renderOrderSection, 
  renderTrueFalseSection, 
  renderCaseLabSection,
  renderMixedSection 
} from "./quiz/sections.js";

const contentEl = document.getElementById("content");
const moduleListEl = document.getElementById("moduleList");
const themeToggleEl = document.getElementById("themeToggle");

// Donation nudge state
let _tabSwitchCount = 0;
const DONATE_NUDGE_KEY = "fiae_donate_nudge_shown";

// Mobile Elements
const mobileBtn = document.getElementById("modulesBtn");
const closeBtn = document.getElementById("closeSidebarBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");

// --- Initialization ---

/**
 * Validates the initial state, sets up event listeners, and loads the first module.
 * This is the entry point for the application logic.
 */
function init() {
  renderModuleList(MODULES);
  registerServiceWorker();
  syncLayoutMetrics();

  // Mobile Menu Logic
  if (mobileBtn) mobileBtn.addEventListener("click", toggleSidebar);
  if (closeBtn) closeBtn.addEventListener("click", closeSidebar);

  // Collapsible games section in sidebar
  document.getElementById("sidebarGamesToggle")?.addEventListener("click", () => {
    const section = document.getElementById("sidebarGames");
    const btn = document.getElementById("sidebarGamesToggle");
    const collapsed = section.classList.toggle("collapsed");
    btn.setAttribute("aria-expanded", String(!collapsed));
  });
  // Main tab bar
  document.getElementById("tabLernen")?.addEventListener("click", () => {
    setActiveTab("lernen");
    trackTabSwitch();
    state.pendingMode = null;
    if (contentEl.querySelector(".module-shell")) {
      switchMode("learn");
    } else {
      const mod = state.currentModuleId || MODULES.find(m => m[3])?.[0] || MODULES[0][0];
      if (window.innerWidth <= 1024) toggleSidebar();
      else loadModule(mod);
    }
  });
  document.getElementById("tabQuiz")?.addEventListener("click", () => {
    setActiveTab("quiz");
    trackTabSwitch();
    state.pendingMode = "quiz";
    if (contentEl.querySelector(".module-shell")) {
      switchMode("quiz");
    } else {
      const mod = state.currentModuleId || MODULES.find(m => m[3])?.[0] || MODULES[0][0];
      if (window.innerWidth <= 1024) toggleSidebar();
      else loadModule(mod);
    }
  });
  document.getElementById("tabSpiele")?.addEventListener("click", () => {
    setActiveTab("spiele");
    showGamesScreen();
  });

  if (overlay) overlay.addEventListener("click", toggleSidebar);
  window.addEventListener("resize", handleViewportChangeDebounced);
  window.addEventListener("orientationchange", () => setTimeout(syncLayoutMetrics, 150));
  document.addEventListener("keydown", handleEscapeClose);

  // Blitz-Karten
  const blitzkartenBtn = document.getElementById("blitzkartenBtn");
  if (blitzkartenBtn) {
    blitzkartenBtn.addEventListener("click", () => {
      closeSidebar();
      document.querySelectorAll(".module-item").forEach(l => l.classList.remove("active"));
      launchBlitzkarten(contentEl, () => { setActiveTab("spiele"); showGamesScreen(); });
    });
  }

  // Subnetz-Trainer
  const subnetzBtn = document.getElementById("subnetzBtn");
  if (subnetzBtn) {
    subnetzBtn.addEventListener("click", () => {
      closeSidebar();
      document.querySelectorAll(".module-item").forEach(l => l.classList.remove("active"));
      launchSubnetz(contentEl, () => { setActiveTab("spiele"); showGamesScreen(); });
    });
  }

  // Binär-Trainer
  const binaryBtn = document.getElementById("binaryBtn");
  if (binaryBtn) {
    binaryBtn.addEventListener("click", () => {
      closeSidebar();
      document.querySelectorAll(".module-item").forEach(l => l.classList.remove("active"));
      launchBinary(contentEl, () => { setActiveTab("spiele"); showGamesScreen(); });
    });
  }

  // Diagramm-Trainer
  const diagrammBtn = document.getElementById("diagrammBtn");
  if (diagrammBtn) {
    diagrammBtn.addEventListener("click", () => {
      closeSidebar();
      document.querySelectorAll(".module-item").forEach(l => l.classList.remove("active"));
      launchDiagramm(contentEl, () => { setActiveTab("spiele"); showGamesScreen(); });
    });
  }

  // Theme Logic
  if (themeToggleEl) {
    themeToggleEl.addEventListener("click", () => {
      const html = document.documentElement;
      const current = html.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      themeToggleEl.textContent = next === "dark" ? "🌙" : "☀️";
    });
  }

  // Delegate clicks for quiz buttons and module switching
  document.body.addEventListener("click", (e) => {
    // Check if a link in the sidebar was clicked (mobile: close sidebar)
    if (e.target.closest(".module-item")) {
      if (window.innerWidth <= 1024) closeSidebar();
    }
    handleGlobalClick(e);
  });

  // Logo → home
  document.querySelector(".topbar h1")?.addEventListener("click", () => {
    setActiveTab("lernen");
    if (contentEl.querySelector(".module-shell")) {
      switchMode("learn");
    } else {
      showWelcomeMessage();
    }
  });

  // Load initial module or show welcome
  const hash = window.location.hash.replace("#", "");
  if (hash && MODULES.find(m => m[0] === hash)) {
    loadModule(hash);
  } else {
    setActiveTab("lernen");
    showWelcomeMessage();
  }

  // Save System
  initSaveSystem();

  // Navigate to module from bookmark
  document.addEventListener("fiae:navigateMod", e => {
    const id = e.detail?.id;
    if (!id) return;
    setActiveTab("lernen");
    loadModule(id);
  });
}

function toggleSidebar() {
  if (!sidebar || !overlay) return;
  const willOpen = !sidebar.classList.contains("open");
  sidebar.classList.toggle("open", willOpen);
  overlay.classList.toggle("open", willOpen);
  document.body.classList.toggle("sidebar-open", willOpen);
  if (mobileBtn) mobileBtn.setAttribute("aria-expanded", String(willOpen));
}

function closeSidebar() {
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
  document.body.classList.remove("sidebar-open");
  if (mobileBtn) mobileBtn.setAttribute("aria-expanded", "false");
}

function handleViewportChange() {
  syncLayoutMetrics();
  if (window.innerWidth > 1024) closeSidebar();
}

// Debounced version – prevents layout thrashing on every resize pixel
let _resizeTimer = null;
function handleViewportChangeDebounced() {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(handleViewportChange, 80);
}

function handleEscapeClose(e) {
  if (e.key === "Escape" && sidebar?.classList.contains("open")) {
    closeSidebar();
  }
}

function syncLayoutMetrics() {
  const topbar = document.querySelector(".topbar");
  let height = topbar ? Math.ceil(topbar.getBoundingClientRect().height) : 58;
  document.documentElement.style.setProperty("--topbar-height", `${height}px`);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const isLocalDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isLocalDev) {
    // In local development, skip SW registration for predictable hot reload behavior.
    return;
  }

  navigator.serviceWorker
    .register("./sw.js")
    .then(() => console.log("Service Worker registered"))
    .catch((err) => console.warn("Service Worker failed", err));
}

/**
 * Renders the sidebar module navigation.
 * Updates the innerHTML of `moduleListEl` with anchor tags for each module.
 * 
 * @param {Array<[string, string]>} modules - Array of tuples [id, title]
 */
function renderModuleList(modules) {
  if (!moduleListEl) return;
  moduleListEl.innerHTML = modules
    .map(([id, title, , ready]) => {
      const activeClass = state.currentModuleId === id ? "active" : "";
      const lockedClass = ready === false ? "locked" : "";
      const lockIcon = ready === false ? '<span class="module-lock" aria-label="In Entwicklung">🔒</span>' : '';
      const bmIcon = hasBookmark(id) ? '<span class="module-bm-dot" title="Lesezeichen">📌</span>' : '';
      return `<a href="#${id}" class="module-item ${activeClass} ${lockedClass}" data-module-id="${id}">
        <small class="module-id">${id}</small>
        <span class="module-title">${escapeHtml(title)}</span>
        ${lockIcon}${bmIcon}
      </a>`;
    })
    .join("");
}

// --- Tab helpers ---

function trackTabSwitch() {
  if (sessionStorage.getItem(DONATE_NUDGE_KEY)) return;
  _tabSwitchCount++;
  if (_tabSwitchCount >= 5) {
    sessionStorage.setItem(DONATE_NUDGE_KEY, "1");
    setTimeout(showDonateNudge, 800);
  }
}

function showDonateNudge() {
  if (document.getElementById("donateNudge")) return;
  const el = document.createElement("div");
  el.id = "donateNudge";
  el.className = "donate-nudge";
  el.innerHTML = `
    <button class="donate-nudge-close" aria-label="Schließen" id="donateNudgeClose">&times;</button>
    <div class="donate-nudge-body">
      <span class="donate-nudge-icon">❤️</span>
      <div>
        <strong>Dir gefällt die App?</strong>
        <p>Sie bleibt kostenlos &amp; wird weiterentwickelt &ndash; über eine kleine Spende würde ich mich sehr freuen!</p>
        <a href="https://www.paypal.com/paypalme/mindoroevo" target="_blank" rel="noopener noreferrer" class="donate-nudge-btn">Jetzt unterstützen</a>
      </div>
    </div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("donate-nudge--visible"));
  const close = () => {
    el.classList.remove("donate-nudge--visible");
    setTimeout(() => el.remove(), 400);
  };
  document.getElementById("donateNudgeClose").addEventListener("click", close);
  setTimeout(close, 10000);
}

function setActiveTab(name) {
  document.querySelectorAll(".mtb-tab").forEach(btn => {
    btn.classList.toggle("mtb-active", btn.dataset.tab === name);
  });
}

// --- Games Screen ---

function showWelcomeMessage() {
  cleanupBlitzkarten();
  cleanupSubnetz();
  cleanupBinary();
  cleanupDiagramm();
  state.currentModuleId = null;
  contentEl.innerHTML = `
    <div class="welcome-msg">
      <div class="welcome-icon">📖</div>
      <h2>Los geht's!</h2>
      <p>Wähle ein Modul aus der Seitenleiste<br>oder öffne es über das <strong>☰</strong>-Menü.</p>
    </div>`;
}

function showGamesScreen() {
  cleanupBlitzkarten();
  cleanupSubnetz();
  cleanupBinary();
  cleanupDiagramm();
  state.currentModuleId = null;
  document.querySelectorAll(".module-item").forEach(l => l.classList.remove("active"));

  contentEl.innerHTML = `
    <div class="home-screen">
      <div class="home-heading">
        <h2>Spiele &amp; Training</h2>
        <p>Wähle ein interaktives Lernspiel</p>
      </div>
      <div class="home-tiles">
        <button class="home-tile home-tile-bk" id="homeBk">
          <span class="home-tile-icon">⚡</span>
          <span class="home-tile-name">Blitz-Karten</span>
          <span class="home-tile-desc">Schnelles Abfrage-Training</span>
        </button>
        <button class="home-tile home-tile-sn" id="homeSn">
          <span class="home-tile-icon">🌐</span>
          <span class="home-tile-name">Subnetz-Trainer</span>
          <span class="home-tile-desc">IPv4-Subnetting üben</span>
        </button>
        <button class="home-tile home-tile-bin" id="homeBin">
          <span class="home-tile-icon">01</span>
          <span class="home-tile-name">Binär-Trainer</span>
          <span class="home-tile-desc">Zahlensysteme meistern</span>
        </button>
        <button class="home-tile home-tile-dg" id="homeDg">
          <span class="home-tile-icon">📐</span>
          <span class="home-tile-name">Diagramm-Trainer</span>
          <span class="home-tile-desc">UML, ER &amp; Use-Case</span>
        </button>
      </div>
    </div>`;

  document.getElementById("homeBk")?.addEventListener("click", () => {
    document.querySelectorAll(".module-item").forEach(l => l.classList.remove("active"));
    launchBlitzkarten(contentEl, () => { setActiveTab("spiele"); showGamesScreen(); });
  });
  document.getElementById("homeSn")?.addEventListener("click", () => {
    document.querySelectorAll(".module-item").forEach(l => l.classList.remove("active"));
    launchSubnetz(contentEl, () => { setActiveTab("spiele"); showGamesScreen(); });
  });
  document.getElementById("homeBin")?.addEventListener("click", () => {
    document.querySelectorAll(".module-item").forEach(l => l.classList.remove("active"));
    launchBinary(contentEl, () => { setActiveTab("spiele"); showGamesScreen(); });
  });
  document.getElementById("homeDg")?.addEventListener("click", () => {
    document.querySelectorAll(".module-item").forEach(l => l.classList.remove("active"));
    launchDiagramm(contentEl, () => { setActiveTab("spiele"); showGamesScreen(); });
  });
}

/** After a module renders, auto-switch to quiz tab if user started from the Quiz tile. */
function applyPendingMode() {
  if (state.pendingMode === "quiz") {
    state.pendingMode = null;
    setActiveTab("quiz");
    requestAnimationFrame(() => switchMode("quiz"));
  } else {
    setActiveTab("lernen");
  }
}

// --- Module Loading ---

/**
 * Main routine to load a module's content (Markdown + Quiz).
 * 1. Fetches the Markdown file.
 * 2. Fetches the Quiz JSON (in parallel).
 * 3. Renders the content shell (Tabs, Intro).
 * 
 * @param {string} moduleId - The ID of the module (e.g., "001")
 */
async function loadModule(moduleId) {
  cleanupBlitzkarten();
  cleanupSubnetz();
  cleanupBinary();
  cleanupDiagramm();
  state.currentModuleId = moduleId;
  
  // Reset filters when switching modules
  state.selectedConcept = null;
  state.quizMode = 'training';
  state.difficultyFilter = 'all';
  state.questionTypeFilter = 'all';
  
  // Update active state in sidebar
  const links = document.querySelectorAll(".module-item");
  links.forEach(l => l.classList.toggle("active", l.getAttribute("data-module-id") === moduleId));

  // --- Fast path: fully cached shell (no fetch, no parse, no render) ---
  if (state.shellCache[moduleId]) {
    // Still need the correct quizData in state before the quiz tab can work
    if (state.quizCache[moduleId]) state.currentQuizData = state.quizCache[moduleId];
    contentEl.innerHTML = state.shellCache[moduleId];
    applyPendingMode();
    return;
  }

  // Find module info
  const modInfo = MODULES.find(m => m[0] === moduleId);
  if (!modInfo) {
    contentEl.innerHTML = "<p>Modul nicht gefunden.</p>";
    return;
  }

  // Block locked modules
  const [id, title, mdPath, ready] = modInfo;
  if (ready === false) {
    contentEl.innerHTML = `<div style="text-align:center;padding:48px 24px;color:var(--muted);">
      <div style="font-size:3rem;margin-bottom:12px;">🔒</div>
      <h2 style="color:var(--text);margin-bottom:8px;">Modul ${moduleId} – ${escapeHtml(title)}</h2>
      <p>Dieses Modul ist noch in Entwicklung und wird bald verfügbar sein.</p>
    </div>`;
    return;
  }
  contentEl.innerHTML = "<p>Lade Inhalte...</p>";

  try {
    // Parallel: fetch markdown (if not cached) + fetch quiz JSON (if not cached)
    const [mdRaw, quizData] = await Promise.all([
      state.mdCache[moduleId]
        ? Promise.resolve(null)          // already parsed, skip fetch
        : fetch(mdPath).then(r => r.text()),
      loadQuizData(moduleId)
    ]);

    // Parse markdown only when we fetched it fresh
    if (!state.mdCache[moduleId]) {
      state.mdCache[moduleId] = markdownToHtml(mdRaw);
    }
    const { html: theoryHtml, toc: tocHtml } = state.mdCache[moduleId];
    const quizCount = getQuizItemCount(quizData);

    const shellHtml = renderModuleShell({ moduleId, title, tocHtml, theoryHtml, quizCount });
    // Cache the rendered shell so future visits are instant
    state.shellCache[moduleId] = shellHtml;

    contentEl.innerHTML = shellHtml;
    applyPendingMode();

  } catch (err) {
    console.error(err);
    contentEl.innerHTML = `<p class="error">Fehler beim Laden des Moduls: ${err.message}</p>`;
  }
}

function getQuizItemCount(quizData) {
  if (quizData.engine === "mcq") return (quizData.questions || []).length;
  if (quizData.engine === "case-lab") return (quizData.scenarios || []).length;
  if (quizData.engine === "fill_blank") return (quizData.questions || []).length;
  if (quizData.engine === "match") return (quizData.questions || []).length;
  if (quizData.engine === "order") return (quizData.questions || []).length;
  if (quizData.engine === "true_false") return (quizData.questions || []).length;
  if (quizData.engine === "mixed") {
    return (quizData.mcq || []).length + (quizData.fill_blank || []).length + 
           (quizData.match || []).length + (quizData.order || []).length +
           (quizData.true_false || []).length;
  }
  return 0;
}

function renderQuizControls() {
  const concepts = getAvailableConcepts();
  const stats = getQuizStats();
  const metadata = state.currentQuizData._metadata;
  
  // Determine active filters for badges
  const hasActiveMode = state.quizMode !== 'training';
  const hasActiveDifficulty = state.difficultyFilter !== 'all';
  const hasActiveType = state.questionTypeFilter !== 'all';
  const hasActiveConcept = state.selectedConcept !== null;
  
  // Quiz Mode Section
  const modeButtons = `
    <div class="filter-group" data-group="mode">
      <div class="filter-header">
        <span class="filter-icon">🎮</span>
        <h3>Quiz-Modus</h3>
        ${hasActiveMode ? '<span class="filter-badge">●</span>' : ''}
      </div>
      <div class="filter-buttons">
        <button type="button" class="filter-btn ${state.quizMode === 'training' ? 'active' : ''}" data-mode="training">
          <span class="btn-icon">📚</span>
          <span class="btn-text">Training<small>Alle Fragen, ausführlich</small></span>
        </button>
        <button type="button" class="filter-btn ${state.quizMode === 'quick' ? 'active' : ''}" data-mode="quick">
          <span class="btn-icon">⚡</span>
          <span class="btn-text">Schnelltest<small>10 zufällige Fragen</small></span>
        </button>
      </div>
    </div>
  `;
  
  // Difficulty Filter
  const difficultyButtons = metadata?.difficultyDistribution ? `
    <div class="filter-group" data-group="difficulty">
      <div class="filter-header">
        <span class="filter-icon">📊</span>
        <h3>Schwierigkeitsgrad</h3>
        ${hasActiveDifficulty ? '<span class="filter-badge">●</span>' : ''}
      </div>
      <div class="filter-buttons filter-compact">
        <button type="button" class="filter-btn-sm ${state.difficultyFilter === 'all' ? 'active' : ''}" data-difficulty="all">
          📚 Alle (${(metadata.difficultyDistribution.easy || 0) + (metadata.difficultyDistribution.medium || 0) + (metadata.difficultyDistribution.hard || 0)})
        </button>
        <button type="button" class="filter-btn-sm ${state.difficultyFilter === 'easy' ? 'active' : ''}" data-difficulty="easy">
          ✅ Leicht (${metadata.difficultyDistribution.easy || 0})
        </button>
        <button type="button" class="filter-btn-sm ${state.difficultyFilter === 'medium' ? 'active' : ''}" data-difficulty="medium">
          ⚠️ Mittel (${metadata.difficultyDistribution.medium || 0})
        </button>
        <button type="button" class="filter-btn-sm ${state.difficultyFilter === 'hard' ? 'active' : ''}" data-difficulty="hard">
          🔥 Schwer (${metadata.difficultyDistribution.hard || 0})
        </button>
      </div>
    </div>
  ` : '';
  
  // Question Type Filter
  const typeButtons = `
    <div class="filter-group" data-group="type">
      <div class="filter-header">
        <span class="filter-icon">�</span>
        <h3>Fragetyp</h3>
        ${hasActiveType ? '<span class="filter-badge">●</span>' : ''}
      </div>
      <div class="filter-buttons filter-compact">
        <button type="button" class="filter-btn-sm ${state.questionTypeFilter === 'all' ? 'active' : ''}" data-qtype="all">
          📚 Alle (${state.currentQuizData.meta?.totalQuestions || 0})
        </button>
          ${(state.currentQuizData.mcq?.length || 0) > 0 ? `<button type="button" class="filter-btn-sm ${state.questionTypeFilter === 'mcq' ? 'active' : ''}" data-qtype="mcq">
            Multiple Choice (${state.currentQuizData.mcq.length})
          </button>` : ''}
          ${(state.currentQuizData.fill_blank?.length || 0) > 0 ? `<button type="button" class="filter-btn-sm ${state.questionTypeFilter === 'fill_blank' ? 'active' : ''}" data-qtype="fill_blank">
            Lückentext (${state.currentQuizData.fill_blank.length})
          </button>` : ''}
          ${(state.currentQuizData.match?.length || 0) > 0 ? `<button type="button" class="filter-btn-sm ${state.questionTypeFilter === 'match' ? 'active' : ''}" data-qtype="match">
            Zuordnung (${state.currentQuizData.match.length})
          </button>` : ''}
          ${(state.currentQuizData.order?.length || 0) > 0 ? `<button type="button" class="filter-btn-sm ${state.questionTypeFilter === 'order' ? 'active' : ''}" data-qtype="order">
            Reihenfolge (${state.currentQuizData.order.length})
          </button>` : ''}
          ${(state.currentQuizData.true_false?.length || 0) > 0 ? `<button type="button" class="filter-btn-sm ${state.questionTypeFilter === 'true_false' ? 'active' : ''}" data-qtype="true_false">
            Wahr/Falsch (${state.currentQuizData.true_false.length})
          </button>` : ''}
        </div>
    </div>
  `;
  
  // Concept Filter (only if metadata exists)
  const conceptButtons = concepts && concepts.length > 0 ? `
    <div class="filter-group" data-group="concept">
      <div class="filter-header">
        <span class="filter-icon">🎯</span>
        <h3>Thema wählen</h3>
        ${hasActiveConcept ? '<span class="filter-badge">●</span>' : ''}
      </div>
      <div class="filter-buttons filter-wrap">
          <button type="button" class="filter-btn-sm ${!state.selectedConcept ? 'active' : ''}" data-concept="">
            Alle Themen
          </button>
          ${concepts.map(concept => {
            const count = metadata?.conceptCoverage?.[concept]?.count || 0;
            return `<button type="button" class="filter-btn-sm ${state.selectedConcept === concept ? 'active' : ''}" data-concept="${escapeAttr(concept)}">
              ${escapeHtml(concept)} (${count})
            </button>`;
          }).join('')}
        </div>
    </div>
  ` : '';
  
  // Stats Display
  const statsDisplay = `
    <div class="quiz-stats">
      <div class="stat-item">
        <span class="stat-icon">📊</span>
        <span class="stat-label">Aktive Fragen:</span>
        <span class="stat-value">${stats.total}</span>
      </div>
      ${stats.byType.mcq > 0 ? `<div class="stat-mini">MCQ: ${stats.byType.mcq}</div>` : ''}
      ${stats.byType.fill_blank > 0 ? `<div class="stat-mini">Lücken: ${stats.byType.fill_blank}</div>` : ''}
      ${stats.byType.match > 0 ? `<div class="stat-mini">Zuordnung: ${stats.byType.match}</div>` : ''}
      ${stats.byType.order > 0 ? `<div class="stat-mini">Reihenfolge: ${stats.byType.order}</div>` : ''}
      ${stats.byType.true_false > 0 ? `<div class="stat-mini">W/F: ${stats.byType.true_false}</div>` : ''}
      <button type="button" class="reset-filters-btn" id="resetFilters">🔄 Filter zurücksetzen</button>
    </div>
  `;
  
  return `
    <button type="button" class="toggle-filters-btn" id="toggleFilters">
      <span class="toggle-filters-icon">▲</span>
      <span class="toggle-filters-text">Filter anzeigen/ausblenden</span>
    </button>
    <div class="quiz-controls visible" id="quizFilters">
      ${modeButtons}
      ${difficultyButtons}
      ${typeButtons}
      ${conceptButtons}
    </div>
    ${statsDisplay}
  `;
}

function renderModuleShell({ moduleId, title, tocHtml, theoryHtml, quizCount }) {
  const hasQuiz = quizCount > 0;
  const engineDisp = state.currentQuizData.engine || "mcq";

  return `
    <section class="module-shell" data-module-id="${escapeAttr(moduleId)}">
      <div class="module-hero">
        <div>
          <div class="module-badge">Modul ${moduleId}</div>
          <h2>${inlineMd(title)}</h2>
          <p>Quiz-Engine: <strong>${escapeHtml(engineDisp)}</strong> · Elemente: <strong>${quizCount}</strong></p>
        </div>
        <div class="module-hero-right">
          <button type="button" class="bm-toggle-btn ${hasBookmark(moduleId) ? 'bm-active' : ''}" data-bm-mod="${escapeAttr(moduleId)}"
            title="${hasBookmark(moduleId) ? 'Lesezeichen entfernen' : 'Als Lesezeichen markieren'}">
            ${hasBookmark(moduleId) ? '📌 Gespeichert' : '📌 Lesezeichen'}
          </button>
          <div class="module-switch">
            <button type="button" class="mode-btn active" data-mode="learn">
              <span class="mode-btn-label">Lernmodus</span>
            </button>
            <button type="button" class="mode-btn" data-mode="quiz" ${hasQuiz ? "" : "disabled"}>
              <span class="mode-btn-label">Quiz starten</span>
            </button>
          </div>
        </div>
      </div>

      <section class="module-pane active" data-pane="learn">
        ${tocHtml}
        ${theoryHtml}
      </section>

      <section class="module-pane" data-pane="quiz">
        <div class="quiz-lazy-placeholder"></div>
      </section>
    </section>
  `;
}

function renderQuiz(moduleId, quizData) {
  const engine = quizData.engine || "mcq";
  
  if (engine === "mcq") return renderMcqSection(moduleId);
  if (engine === "case-lab") return renderCaseLabSection(moduleId);
  if (engine === "fill_blank") return renderFillBlankSection(moduleId);
  if (engine === "match") return renderMatchSection(moduleId);
  if (engine === "order") return renderOrderSection(moduleId);
  if (engine === "true_false") return renderTrueFalseSection(moduleId);
  if (engine === "mixed") return renderMixedSection(moduleId);
  
  return `<section class="quiz-section"><p>Unbekannte Quiz-Engine: ${escapeHtml(engine)}</p></section>`;
}

// --- Interaction Handlers ---

function handleGlobalClick(e) {
  const target = e.target;

  // Bookmark toggle
  const bmBtn = target.closest("[data-bm-mod]");
  if (bmBtn) {
    const modId = bmBtn.getAttribute("data-bm-mod");
    const added = toggleBookmark(modId);
    bmBtn.classList.toggle("bm-active", added);
    bmBtn.innerHTML = added ? '📌 Gespeichert' : '📌 Lesezeichen';
    bmBtn.title = added ? 'Lesezeichen entfernen' : 'Als Lesezeichen markieren';
    // Update sidebar dot
    renderModuleList(MODULES);
    const act = moduleListEl?.querySelector(`.module-item[data-module-id="${modId}"]`);
    act?.classList.add("active");
    return;
  }

  // Module Navigation (Sidebar)
  const link = target.closest(".module-item");
  if (link) {
    e.preventDefault();
    const id = link.getAttribute("data-module-id");
    loadModule(id);
    // Push state so back button works if we implemented creating history entries
    // For now just hash
    window.location.hash = id;
    return;
  }

  // Mode Switch (Learn vs Quiz)
  const modeBtn = target.closest(".mode-btn");
  if (modeBtn) {
    const mode = modeBtn.getAttribute("data-mode");
    switchMode(mode);
    return;
  }

  // Quiz Check Button
  if (target.classList.contains("quiz-check-btn")) {
    const qId = target.getAttribute("data-question-id");
    if (qId) checkAnswer(qId);
    return;
  }

  // Quiz Show Solution Button
  if (target.classList.contains("quiz-show-btn")) {
    const qId = target.getAttribute("data-question-id");
    if (qId) showSolution(qId);
    return;
  }

  // Case Show Solution
  if (target.classList.contains("case-show-btn")) {
    const idx = target.getAttribute("data-case-index");
    const res = document.getElementById(`case-result-${idx}`);
    if (res) res.classList.toggle("hidden");
    return;
  }

  // Quiz Mode Selection
  if (target.hasAttribute("data-mode") && target.classList.contains("filter-btn")) {
    const mode = target.getAttribute("data-mode");
    state.quizMode = mode;
    refreshQuiz();
    return;
  }

  // Difficulty Filter
  if (target.hasAttribute("data-difficulty")) {
    const difficulty = target.getAttribute("data-difficulty");
    state.difficultyFilter = difficulty;
    refreshQuiz();
    return;
  }

  // Question Type Filter
  if (target.hasAttribute("data-qtype")) {
    const qtype = target.getAttribute("data-qtype");
    state.questionTypeFilter = qtype;
    refreshQuiz();
    return;
  }

  // Concept Filter Selection
  if (target.hasAttribute("data-concept") && target.classList.contains("filter-btn-sm")) {
    const concept = target.getAttribute("data-concept");
    state.selectedConcept = concept || null;
    refreshQuiz();
    return;
  }

  // Reset All Filters
  if (target.id === "resetFilters" || target.closest("#resetFilters")) {
    state.selectedConcept = null;
    state.quizMode = 'training';
    state.difficultyFilter = 'all';
    state.questionTypeFilter = 'all';
    refreshQuiz();
    return;
  }

  // Toggle Complete Filter Panel
  if (target.id === "toggleFilters" || target.closest("#toggleFilters")) {
    const filtersPanel = document.getElementById("quizFilters");
    const toggleBtn = document.getElementById("toggleFilters");
    const toggleIcon = toggleBtn?.querySelector(".toggle-filters-icon");
    
    if (filtersPanel && toggleIcon) {
      const isVisible = filtersPanel.classList.contains("visible");
      filtersPanel.classList.toggle("visible", !isVisible);
      toggleIcon.textContent = isVisible ? "▼" : "▲";
    }
    return;
  }
}

function switchMode(mode) {
  const contentEl = document.getElementById("content");
  const panes = Array.from(contentEl.querySelectorAll(".module-pane"));
  const buttons = Array.from(contentEl.querySelectorAll(".mode-btn"));

  panes.forEach((pane) => pane.classList.toggle("active", pane.getAttribute("data-pane") === mode));
  buttons.forEach((button) => button.classList.toggle("active", button.getAttribute("data-mode") === mode));

  // Lazy-render quiz cards the first time the quiz tab is opened
  if (mode === "quiz") {
    const quizPane = contentEl.querySelector('[data-pane="quiz"]');
    if (quizPane && quizPane.querySelector(".quiz-lazy-placeholder")) {
      requestAnimationFrame(() => {
        const quizHtml = renderQuiz(state.currentModuleId, state.currentQuizData);
        quizPane.innerHTML = renderQuizControls() + `<div id="quiz-container">${quizHtml}</div>`;
      });
    }
  }
}

function refreshQuiz() {
  const quizPane = document.querySelector('[data-pane="quiz"]');
  if (!quizPane) return;

  // Don't re-render the hidden learn-pane quiz – wait until user opens it
  if (!quizPane.classList.contains('active')) return;

  const moduleId = state.currentModuleId;
  const engine = (state.currentQuizData.engine || 'mcq');

  requestAnimationFrame(() => {
    const controlsHtml = renderQuizControls();

    if (engine === 'mixed') {
      // Full re-render needed: filtered question list changes
      const quizHtml = renderQuiz(moduleId, state.currentQuizData);
      quizPane.innerHTML = `${controlsHtml}<div id="quiz-container">${quizHtml}</div>`;
    } else {
      // Non-mixed engines don't use filters for their cards – preserve them
      const existingContainer = quizPane.querySelector('#quiz-container');
      const savedCards = existingContainer ? existingContainer.innerHTML : renderQuiz(moduleId, state.currentQuizData);
      quizPane.innerHTML = `${controlsHtml}<div id="quiz-container">${savedCards}</div>`;
    }
  });
}

// Start app
init();
