/**
 * Global state object for the application.
 * Stores the currently active module, the loaded quiz data, and cache.
 */
export const state = {
  /** @type {string|null} The current module ID (e.g. "001") */
  currentModuleId: null,
  /** @type {object} The currently loaded quiz JSON object */
  currentQuizData: { engine: "mcq", questions: [] },
  /** @type {object} Cache for already fetched quiz files to minimize network requests */
  quizCache: {}
};

export const QUIZ_BASE_PATH = "../quiz/modules";

/**
 * Fetches and caches quiz data for a given module.
 * 
 * Logic:
 * 1. Checks `state.quizCache` first.
 * 2. If missing, fetches from `${QUIZ_BASE_PATH}/{moduleId}.quiz.json`.
 * 3. Updates `state.currentQuizData` and returns the data.
 * 4. Catches errors (404, network) and returns a fallback structure to prevent crashes.
 *
 * @param {string} moduleId
 * @returns {Promise<object>} The quiz data object
 */
export async function loadQuizData(moduleId) {
  if (state.quizCache[moduleId]) {
      state.currentQuizData = state.quizCache[moduleId];
      return state.quizCache[moduleId];
  }

  try {
    const response = await fetch(`${QUIZ_BASE_PATH}/${moduleId}.quiz.json`);
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    state.quizCache[moduleId] = data;
    state.currentQuizData = data;
    return data;
  } catch (e) {
    console.warn("Quiz load error for module " + moduleId, e);
    const fallback = { engine: "mcq", questions: [], meta: { module: moduleId } };
    state.quizCache[moduleId] = fallback;
    state.currentQuizData = fallback;
    return fallback;
  }
}
