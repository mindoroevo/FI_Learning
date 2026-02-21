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
  quizCache: {},
  /** @type {object} Cache for already parsed markdown: moduleId -> { html, toc } */
  mdCache: {},
  /** @type {object} Cache for fully rendered module shell HTML: moduleId -> string */
  shellCache: {},
  /** @type {string|null} Currently selected concept filter (null = all questions) */
  selectedConcept: null,
  /** @type {string} Quiz mode: 'training' | 'quick' | 'sprint' | 'exam' | 'focus' | 'warmup' */
  quizMode: 'training',
  /** @type {string} Difficulty filter: 'all' | 'easy' | 'medium' | 'hard' */
  difficultyFilter: 'all',
  /** @type {string} Question type filter: 'all' | 'mcq' | 'fill_blank' | 'match' | 'order' | 'true_false' */
  questionTypeFilter: 'all',
  /** @type {string|null} Pending mode to auto-switch after a module loads: null | 'quiz' */
  pendingMode: null
};

export const QUIZ_BASE_PATH = "./FI_Learning/quiz/modules";

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

/**
 * Gets list of available concepts from current quiz metadata.
 * @returns {string[]} Array of concept names
 */
export function getAvailableConcepts() {
  const metadata = state.currentQuizData._metadata;
  if (!metadata || !metadata.conceptCoverage) return [];
  return Object.keys(metadata.conceptCoverage);
}

/**
 * Filters questions by concept using metadata.conceptCoverage.
 * @param {string|null} concept - Concept name or null for all questions
 * @returns {object} Filtered quiz data with same structure
 */
export function filterQuizByConcept(concept) {
  if (!concept) return state.currentQuizData; // No filter
  
  const metadata = state.currentQuizData._metadata;
  if (!metadata || !metadata.conceptCoverage || !metadata.conceptCoverage[concept]) {
    return state.currentQuizData; // Concept not found, return all
  }
  
  const questionIds = new Set(metadata.conceptCoverage[concept].questionIds || []);
  
  const filtered = {
    ...state.currentQuizData,
    mcq: (state.currentQuizData.mcq || []).filter(q => questionIds.has(q.id)),
    fill_blank: (state.currentQuizData.fill_blank || []).filter(q => questionIds.has(q.id)),
    match: (state.currentQuizData.match || []).filter(q => questionIds.has(q.id)),
    order: (state.currentQuizData.order || []).filter(q => questionIds.has(q.id)),
    true_false: (state.currentQuizData.true_false || []).filter(q => questionIds.has(q.id))
  };
  
  return filtered;
}

/**
 * Applies all active filters (concept, difficulty, question type) to quiz data.
 * @returns {object} Fully filtered quiz data
 */
export function getFilteredQuizData() {
  let data = filterQuizByConcept(state.selectedConcept);
  
  // Apply difficulty filter
  const diffFilter = state.difficultyFilter;
  if (diffFilter !== 'all') {
    data = {
      ...data,
      mcq: (data.mcq || []).filter(q => q.difficulty === diffFilter),
      fill_blank: (data.fill_blank || []).filter(q => q.difficulty === diffFilter),
      match: (data.match || []).filter(q => q.difficulty === diffFilter),
      order: (data.order || []).filter(q => q.difficulty === diffFilter),
      true_false: (data.true_false || []).filter(q => q.difficulty === diffFilter)
    };
  }
  
  // Apply question type filter
  const typeFilter = state.questionTypeFilter;
  if (typeFilter !== 'all') {
    const emptyArrays = {
      mcq: [],
      fill_blank: [],
      match: [],
      order: [],
      true_false: []
    };
    data = {
      ...data,
      ...emptyArrays,
      [typeFilter]: data[typeFilter] || []
    };
  }
  
  const allQuestions = [
    ...(data.mcq || []),
    ...(data.fill_blank || []),
    ...(data.match || []),
    ...(data.order || []),
    ...(data.true_false || [])
  ];

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const limitAndGroup = (selected) => {
    const grouped = { ...data, mcq: [], fill_blank: [], match: [], order: [], true_false: [] };
    selected.forEach((q) => {
      if (q.statement !== undefined) grouped.true_false.push(q);
      else if (Array.isArray(q.items)) grouped.order.push(q);
      else if (Array.isArray(q.left) && Array.isArray(q.right)) grouped.match.push(q);
      else if (Array.isArray(q.blanks)) grouped.fill_blank.push(q);
      else grouped.mcq.push(q);
    });
    return grouped;
  };

  // Apply quiz mode modifications
  if (state.quizMode === 'quick') {
    data = limitAndGroup(shuffle(allQuestions).slice(0, 10));
  } else if (state.quizMode === 'sprint') {
    data = limitAndGroup(shuffle(allQuestions).slice(0, 5));
  } else if (state.quizMode === 'exam') {
    data = limitAndGroup(shuffle(allQuestions).slice(0, 20));
  } else if (state.quizMode === 'focus') {
    const hard = allQuestions.filter((q) => q.difficulty === 'hard');
    const medium = allQuestions.filter((q) => q.difficulty === 'medium');
    const easy = allQuestions.filter((q) => q.difficulty === 'easy');
    const prioritized = [...shuffle(hard), ...shuffle(medium), ...shuffle(easy)];
    data = limitAndGroup(prioritized.slice(0, 12));
  } else if (state.quizMode === 'warmup') {
    const easy = allQuestions.filter((q) => q.difficulty === 'easy');
    const medium = allQuestions.filter((q) => q.difficulty === 'medium');
    const pool = [...shuffle(easy), ...shuffle(medium)];
    const fallback = pool.length ? pool : shuffle(allQuestions);
    data = limitAndGroup(fallback.slice(0, 8));
  }
  
  return data;
}

/**
 * Gets statistics about current filtered quiz data.
 * @returns {object} Stats object with counts
 */
export function getQuizStats() {
  const data = getFilteredQuizData();
  const total = (data.mcq?.length || 0) + (data.fill_blank?.length || 0) + 
                (data.match?.length || 0) + (data.order?.length || 0) + 
                (data.true_false?.length || 0);
  
  return {
    total,
    byType: {
      mcq: data.mcq?.length || 0,
      fill_blank: data.fill_blank?.length || 0,
      match: data.match?.length || 0,
      order: data.order?.length || 0,
      true_false: data.true_false?.length || 0
    }
  };
}

