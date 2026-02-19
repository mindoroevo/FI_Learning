import { MODULES } from "./modules.js";
import { state, loadQuizData } from "./state.js";
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
const searchInputEl = document.getElementById("searchInput");
const searchInputMobile = document.querySelector("#mobileSearch input");
const searchToggle = document.getElementById("searchToggle");
const themeToggleEl = document.getElementById("themeToggle");

// Mobile Elements
const mobileBtn = document.getElementById("mobileMenuBtn");
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

  // Mobile Menu Logic
  if (mobileBtn) mobileBtn.addEventListener("click", toggleSidebar);
  if (closeBtn) closeBtn.addEventListener("click", toggleSidebar);
  if (overlay) overlay.addEventListener("click", toggleSidebar);

  // Search Logic
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = MODULES.filter(
      ([id, title]) => id.includes(term) || title.toLowerCase().includes(term)
    );
    renderModuleList(filtered);
  };

  if (searchInputEl) searchInputEl.addEventListener("input", handleSearch);
  if (searchInputMobile) searchInputMobile.addEventListener("input", handleSearch);

  if (searchToggle) {
    searchToggle.addEventListener("click", () => {
      document.getElementById("mobileSearch").classList.toggle("hidden");
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
      if (window.innerWidth < 1024) {
        sidebar.classList.remove("open");
        overlay.classList.remove("open");
      }
    }
    handleGlobalClick(e);
  });

  // Load initial module or from URL hash
  const hash = window.location.hash.replace("#", "");
  if (hash) {
    loadModule(hash);
  } else {
    // Default load first module
    loadModule(MODULES[0][0]);
  }
}

function toggleSidebar() {
  if (sidebar) sidebar.classList.toggle("open");
  if (overlay) overlay.classList.toggle("open");
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("Service Worker registered"))
      .catch((err) => console.warn("Service Worker failed", err));
  }
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
    .map(([id, title]) => {
      const activeClass = state.currentModuleId === id ? "active" : "";
      return `<a href="#${id}" class="module-item ${activeClass}" data-module-id="${id}">
        <small class="module-id">${id}</small>
        <span class="module-title">${escapeHtml(title)}</span>
      </a>`;
    })
    .join("");
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
  state.currentModuleId = moduleId;
  
  // Update active state in sidebar
  const links = document.querySelectorAll(".module-item");
  links.forEach(l => l.classList.toggle("active", l.getAttribute("data-module-id") === moduleId));

  // Find module info
  const modInfo = MODULES.find(m => m[0] === moduleId);
  if (!modInfo) {
    contentEl.innerHTML = "<p>Modul nicht gefunden.</p>";
    return;
  }
  
  const [id, title, mdPath] = modInfo;
  contentEl.innerHTML = "<p>Lade Inhalte...</p>";

  try {
    // Parallel load markdown and quiz
    const [mdRes, quizData] = await Promise.all([
      fetch(mdPath).then(r => r.text()),
      loadQuizData(moduleId)
    ]);

    const { html: theoryHtml, toc: tocHtml } = markdownToHtml(mdRes);
    const quizCount = getQuizItemCount(quizData);
    const quizHtml = renderQuiz(moduleId, quizData);

    contentEl.innerHTML = renderModuleShell({
      moduleId, 
      title, 
      tocHtml, 
      theoryHtml, 
      quizHtml, 
      quizCount
    });

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

function renderModuleShell({ moduleId, title, tocHtml, theoryHtml, quizHtml, quizCount }) {
  const hasQuiz = quizCount > 0;
  // Default to mcq if engine not set, but display purposes mainly
  const engineDisp = state.currentQuizData.engine || "mcq";
  
  return `
    <section class="module-shell" data-module-id="${escapeAttr(moduleId)}">
      <div class="module-hero">
        <div>
          <div class="module-badge">Modul ${moduleId}</div>
          <h2>${inlineMd(title)}</h2>
          <p>Quiz-Engine: <strong>${escapeHtml(engineDisp)}</strong> · Elemente: <strong>${quizCount}</strong></p>
        </div>
        <div class="module-switch">
          <button type="button" class="mode-btn active" data-mode="learn">📘 Lernmodus</button>
          <button type="button" class="mode-btn" data-mode="quiz" ${hasQuiz ? "" : "disabled"}>🧠 Quiz starten</button>
        </div>
      </div>

      <section class="module-pane active" data-pane="learn">
        ${tocHtml}
        ${theoryHtml}
      </section>

      <section class="module-pane" data-pane="quiz">
        ${quizHtml}
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
  if (target.classList.contains("mode-btn")) {
    const mode = target.getAttribute("data-mode");
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
}

function switchMode(mode) {
  const contentEl = document.getElementById("content");
  const panes = Array.from(contentEl.querySelectorAll(".module-pane"));
  const buttons = Array.from(contentEl.querySelectorAll(".mode-btn"));

  panes.forEach((pane) => pane.classList.toggle("active", pane.getAttribute("data-pane") === mode));
  buttons.forEach((button) => button.classList.toggle("active", button.getAttribute("data-mode") === mode));
}

// Start app
init();
