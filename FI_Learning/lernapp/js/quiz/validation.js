import { state } from "../state.js";
import { inlineMd, arraysEqual } from "../utils.js";

// Helper to find question
/**
 * Locates a question object by ID within the current global state logic.
 * Supports both standard single-mode and "mixed" mode structures.
 *
 * @param {string} questionId
 * @returns {object|null} The question object or null if not found
 */
export function findQuestionById(questionId) {
  const engine = state.currentQuizData.engine || "mcq";
  if (engine === "mixed") {
    return findQuestionInMixed(questionId);
  }
  return (state.currentQuizData.questions || []).find((q) => q.id === questionId);
}

/**
 * Iterates through all possible sub-arrays in a mixed-mode structure
 * to find the matching question ID.
 *
 * @param {string} questionId
 * @returns {object|null} The question object with an augmented `_type` property
 */
function findQuestionInMixed(questionId) {
  const types = ["mcq", "fill_blank", "match", "order", "true_false"];
  for (const type of types) {
    const questions = state.currentQuizData[type] || [];
    const found = questions.find(q => q.id === questionId);
    if (found) {
      return { ...found, _type: type };
    }
  }
  return null;
}

/**
 * Extracts the user's input from the DOM based on the question type.
 *
 * - MCQ/TrueFalse: Reads checked radio/checkbox inputs.
 * - FillBlank/Match: Reads values from <select> elements.
 * - Order: Reads values from <select> elements (positioning).
 *
 * @param {string} questionId
 * @returns {Array|string|null} The raw answer value(s)
 */
export function collectUserAnswer(questionId) {
  const engine = state.currentQuizData.engine || "mcq";
  
  // MCQ and True/False
  if (engine === "mcq" || engine === "true_false") {
    const inputs = Array.from(document.querySelectorAll(`input[name="q-${questionId}"]:checked`));
    if (engine === "true_false") {
      return inputs.length > 0 ? inputs[0].value : null;
    }
    return inputs.map((input) => Number(input.value)).sort((a, b) => a - b);
  }
  
  // Fill-Blank
  if (engine === "fill_blank") {
    const selects = Array.from(document.querySelectorAll(`select.fill-blank-select[data-question-id="${questionId}"]`));
    return selects.map(select => select.value);
  }
  
  // Match
  if (engine === "match") {
    const selects = Array.from(document.querySelectorAll(`select.match-select[data-question-id="${questionId}"]`));
    return selects.map(select => select.value);
  }
  
  // Order
  if (engine === "order") {
    const selects = Array.from(document.querySelectorAll(`select.order-select[data-question-id="${questionId}"]`));
    return selects.map(select => parseInt(select.value) || 0);
  }
  
  // Mixed engine - Reuse logic by checking question type context
  if (engine === "mixed") {
    const question = findQuestionInMixed(questionId);
    if (!question) return [];
    
    if (question._type === "mcq") {
      const inputs = Array.from(document.querySelectorAll(`input[name="q-${questionId}"]:checked`));
      return inputs.map((input) => Number(input.value)).sort((a, b) => a - b);
    }
    if (question._type === "true_false") {
      const inputs = Array.from(document.querySelectorAll(`input[name="q-${questionId}"]:checked`));
      return inputs.length > 0 ? inputs[0].value : null;
    }
    if (question._type === "fill_blank") {
      const selects = Array.from(document.querySelectorAll(`select.fill-blank-select[data-question-id="${questionId}"]`));
      return selects.map(select => select.value);
    }
    if (question._type === "match") {
      const selects = Array.from(document.querySelectorAll(`select.match-select[data-question-id="${questionId}"]`));
      return selects.map(select => select.value);
    }
    if (question._type === "order") {
      const selects = Array.from(document.querySelectorAll(`select.order-select[data-question-id="${questionId}"]`));
      return selects.map(select => parseInt(select.value) || 0);
    }
  }
  
  return [];
}

function normalizeAnswer(ans) {
  if (Array.isArray(ans)) return ans.sort((a, b) => a - b);
  return [ans]; 
}

export function showResult(questionId, html, status) {
  const resultEl = document.getElementById(`result-${questionId}`);
  if (!resultEl) return;

  resultEl.innerHTML = html;
  resultEl.className = `quiz-result ${status}`;
}

export function checkAnswer(questionId) {
  const question = findQuestionById(questionId);
  if (!question) return;

  const engine = state.currentQuizData.engine || "mcq";
  const questionType = question._type || engine;
  const userAnswer = collectUserAnswer(questionId);
  
  // Validation
  if (questionType === "fill_blank" || questionType === "match" || questionType === "order") {
    if (userAnswer.some(val => !val || val === "" || val === 0)) {
      showResult(questionId, "Bitte fülle alle Felder aus.", "warn");
      return;
    }
  } else if (questionType === "true_false") {
    if (!userAnswer) {
      showResult(questionId, "Bitte wähle eine Antwort aus.", "warn");
      return;
    }
  } else if (questionType === "mcq") {
    if (!userAnswer.length) {
      showResult(questionId, "Bitte wähle zuerst mindestens eine Antwort aus.", "warn");
      return;
    }
  }

  // Check answer based on type
  let ok = false;
  const explanation = inlineMd(String(question.explanation || ""));
  
  if (questionType === "mcq") {
    const expected = normalizeAnswer(question.correct || question.answer || []);
    ok = arraysEqual(userAnswer, expected);
  } else if (questionType === "true_false") {
    ok = String(userAnswer) === String(question.answer);
  } else if (questionType === "fill_blank") {
    const expected = question.blanks.map(b => b.correct);
    ok = arraysEqual(userAnswer, expected);
  } else if (questionType === "match") {
    const expected = question.matches || [];
    ok = arraysEqual(userAnswer, expected);
  } else if (questionType === "order") {
    const expected = question.correctOrder || [];
    ok = arraysEqual(userAnswer, expected);
  }

  showResult(questionId, ok ? `✅ Richtig!<br>${explanation}` : `❌ Nicht korrekt.<br>${explanation}`, ok ? "ok" : "error");
}

export function showSolution(questionId) {
  const question = findQuestionById(questionId);
  if (!question) return;
  
  const engine = state.currentQuizData.engine || "mcq";
  const questionType = question._type || engine;
  // const explanation = inlineMd(String(question.explanation || "")); // Not used in solution text directly
  let solutionText = "";
  
  if (questionType === "mcq") {
    const expected = normalizeAnswer(question.correct || question.answer || []);
    const labels = expected.map((index) => `${index + 1}. ${question.options[index]}`).join("<br>");
    solutionText = `💡 Richtige Lösung:<br>${labels}`;
  } else if (questionType === "true_false") {
    solutionText = `💡 Richtige Antwort: <strong>${question.answer === "true" || question.answer === true ? "Wahr" : "Falsch"}</strong>`;
  } else if (questionType === "fill_blank") {
    const blanks = question.blanks || [];
    const solutions = blanks.map((b, i) => `Lücke ${i + 1}: <strong>${b.correct}</strong>`).join("<br>");
    solutionText = `💡 Richtige Lösungen:<br>${solutions}`;
  } else if (questionType === "match") {
    const left = question.left || [];
    const matches = question.matches || [];
    const solutions = left.map((l, i) => `${l} → <strong>${matches[i]}</strong>`).join("<br>");
    solutionText = `💡 Richtige Zuordnungen:<br>${solutions}`;
  } else if (questionType === "order") {
    // const items = question.items || [];
    // const correctOrder = question.correctOrder || [];
    // This is tricky. correctOrder is usually the indices.
    // If the user sees "Item A", "Item B", "Item C". 
    // And correct order is [2, 3, 1] -> Item A is pos 2, Item B is pos 3, Item C is pos 1.
    // So output: Item C, Item A, Item B.
    
    // Original code for order solution:
    /*
    const items = question.items || [];
    const correctOrder = question.correctOrder || [];
    // correctOrder = [1, 2, 3] usually means user assigns 1, 2, 3.
    // Let's assume standard ordering behavior.
    */
     const items = question.items || [];
     const correctOrder = question.correctOrder || [];
     
     // Construct list based on correct positions
     // We need to pair items with their correct position.
     const paired = items.map((item, idx) => ({ item, pos: correctOrder[idx] }));
     paired.sort((a, b) => a.pos - b.pos);
     
     const steps = paired.map(p => `${p.pos}. ${p.item}`).join("<br>");
     solutionText = `💡 Richtige Reihenfolge:<br>${steps}`;
  }

  showResult(questionId, solutionText, "info");
}
