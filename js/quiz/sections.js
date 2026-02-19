import { renderMcqCards, renderFillBlankCards, renderMatchCards, renderOrderCards, renderTrueFalseCards, renderCaseLabCards } from "./renderers.js";
import { state } from "../state.js";

function renderSection(title, content, emptyMsg) {
  if (!content) return `<section class="quiz-section"><h2>${title}</h2><p>${emptyMsg}</p></section>`;
  return `<section class="quiz-section"><h2>${title}</h2>${content}</section>`;
}

export function renderMcqSection(moduleId) {
  const data = state.currentQuizData;
  const questions = data.questions || [];
  if (!questions.length) return renderSection("Quiz", null, `Für Modul ${moduleId} sind noch keine MCQ-Fragen vorhanden.`);
  return renderSection(`Quiz zu Modul ${moduleId}`, renderMcqCards(questions));
}

export function renderFillBlankSection(moduleId) {
  const data = state.currentQuizData;
  const questions = data.questions || [];
  if (!questions.length) return renderSection("Lückentext-Quiz", null, `Für Modul ${moduleId} sind noch keine Lückentexte vorhanden.`);
  return renderSection(`Lückentext-Quiz zu Modul ${moduleId}`, renderFillBlankCards(questions));
}

export function renderMatchSection(moduleId) {
  const data = state.currentQuizData;
  const questions = data.questions || [];
  if (!questions.length) return renderSection("Zuordnungs-Quiz", null, `Für Modul ${moduleId} sind noch keine Zuordnungsaufgaben vorhanden.`);
  return renderSection(`Zuordnungs-Quiz zu Modul ${moduleId}`, renderMatchCards(questions));
}

export function renderOrderSection(moduleId) {
  const data = state.currentQuizData;
  const questions = data.questions || [];
  if (!questions.length) return renderSection("Sortier-Quiz", null, `Für Modul ${moduleId} sind noch keine Sortieraufgaben vorhanden.`);
  return renderSection(`Sortier-Quiz zu Modul ${moduleId}`, renderOrderCards(questions));
}

export function renderTrueFalseSection(moduleId) {
  const data = state.currentQuizData;
  const questions = data.questions || [];
  if (!questions.length) return renderSection("Wahr/Falsch-Quiz", null, `Für Modul ${moduleId} sind noch keine Wahr/Falsch-Fragen vorhanden.`);
  return renderSection(`Wahr/Falsch-Quiz zu Modul ${moduleId}`, renderTrueFalseCards(questions));
}

export function renderCaseLabSection(moduleId) {
  const data = state.currentQuizData;
  const scenarios = data.scenarios || [];
  if (!scenarios.length) return renderSection("Case-Lab", null, `Für Modul ${moduleId} sind noch keine Case-Labs vorhanden.`);
  return renderSection(`Case-Lab zu Modul ${moduleId}`, renderCaseLabCards(scenarios));
}

export function renderMixedSection(moduleId) {
  const data = state.currentQuizData;
  let html = `<section class="quiz-section"><h2>Abschluss-Quiz (Mixed) zu Modul ${moduleId}</h2>`;
  
  let questionCounter = 0;

  if (data.mcq && data.mcq.length) {
    html += renderMcqCards(data.mcq, questionCounter);
    questionCounter += data.mcq.length;
  }
  if (data.fill_blank && data.fill_blank.length) {
    html += renderFillBlankCards(data.fill_blank, questionCounter);
    questionCounter += data.fill_blank.length;
  }
  if (data.match && data.match.length) {
    html += renderMatchCards(data.match, questionCounter);
    questionCounter += data.match.length;
  }
  if (data.order && data.order.length) {
    html += renderOrderCards(data.order, questionCounter);
    questionCounter += data.order.length;
  }
  if (data.true_false && data.true_false.length) {
    html += renderTrueFalseCards(data.true_false, questionCounter);
    questionCounter += data.true_false.length;
  }
  
  html += `</section>`;
  return html;
}
