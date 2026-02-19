import { escapeAttr, escapeHtml, inlineMd } from "../utils.js";

export function renderMcqCards(questions, startIndex = 0) {
  return questions.map((q, index) => {
    const questionNumber = startIndex + index + 1;
    const inputType = q.type === "multi" ? "checkbox" : "radio";
    const options = (q.options || []).map((option, optionIndex) => {
      const optionId = `${q.id}-${optionIndex}`;
      return `
        <label class="quiz-option" for="${escapeAttr(optionId)}">
          <input type="${inputType}" name="q-${escapeAttr(q.id)}" id="${escapeAttr(optionId)}" value="${optionIndex}" />
          <span>${inlineMd(String(option))}</span>
        </label>
      `;
    }).join("");

    return `
      <article class="quiz-card" data-question-id="${escapeAttr(q.id)}">
        <h3>Frage ${questionNumber}: ${inlineMd(String(q.question || ""))}</h3>
        <div class="quiz-options">${options}</div>
        <div class="quiz-actions">
          <button type="button" class="quiz-check-btn" data-question-id="${escapeAttr(q.id)}">Antwort prüfen</button>
          <button type="button" class="quiz-show-btn" data-question-id="${escapeAttr(q.id)}">Lösung anzeigen</button>
        </div>
        <div class="quiz-result" id="result-${escapeAttr(q.id)}"></div>
      </article>
    `;
  }).join("");
}

export function renderFillBlankCards(questions, startIndex = 0) {
  return questions.map((q, index) => {
    const questionNumber = startIndex + index + 1;
    const blanks = q.blanks || [];
    let textWithBlanks = q.text || "";
    
    blanks.forEach((blank, blankIndex) => {
      // Shuffle options for this blank
      const shuffledOptions = [...(blank.options || [])].sort(() => Math.random() - 0.5);

      const selectOptions = shuffledOptions.map((opt) => 
        `<option value="${escapeAttr(opt)}">${escapeHtml(opt)}</option>`
      ).join("");
      
      const selectHtml = `<select class="fill-blank-select" data-question-id="${escapeAttr(q.id)}" data-blank-index="${blankIndex}">
        <option value="">---</option>${selectOptions}</select>`;

      // Try to replace explicitly numbered placeholder {{0}} first
      if (textWithBlanks.includes(`{{${blankIndex}}}`)) {
         textWithBlanks = textWithBlanks.replace(`{{${blankIndex}}}`, selectHtml);
      } else {
         // Fallback: replace the first occurrence of [blank]
         textWithBlanks = textWithBlanks.replace("[blank]", selectHtml);
      }
    });

    return `
      <article class="quiz-card" data-question-id="${escapeAttr(q.id)}">
        <h3>Frage ${questionNumber}: Lückentext</h3>
        <div class="fill-blank-text">${textWithBlanks}</div>
        <div class="quiz-actions">
          <button type="button" class="quiz-check-btn" data-question-id="${escapeAttr(q.id)}">Antwort prüfen</button>
          <button type="button" class="quiz-show-btn" data-question-id="${escapeAttr(q.id)}">Lösung anzeigen</button>
        </div>
        <div class="quiz-result" id="result-${escapeAttr(q.id)}"></div>
      </article>
    `;
  }).join("");
}

export function renderMatchCards(questions, startIndex = 0) {
  return questions.map((q, index) => {
    const questionNumber = startIndex + index + 1;
    const leftItems = q.left || [];
    const rightOptions = [...(q.right || [])].sort(() => Math.random() - 0.5);
    
    const matchHtml = leftItems.map((leftItem, leftIndex) => {
      const selectOptions = rightOptions.map((opt) => 
        `<option value="${escapeAttr(opt)}">${escapeHtml(opt)}</option>`
      ).join("");
      
      return `
        <div class="match-row">
          <div class="match-left">${inlineMd(String(leftItem))}</div>
          <div class="match-right">
             <select class="match-select" data-question-id="${escapeAttr(q.id)}" data-index="${leftIndex}">
               <option value="">Zuordnung wählen...</option>
               ${selectOptions}
             </select>
          </div>
        </div>
      `;
    }).join("");

    return `
      <article class="quiz-card" data-question-id="${escapeAttr(q.id)}">
        <h3>Frage ${questionNumber}: Zuordnungsfrage</h3>
        <p>${inlineMd(String(q.question || "Ordne die Begriffe richtig zu:"))}</p>
        <div class="match-container">${matchHtml}</div>
        <div class="quiz-actions">
          <button type="button" class="quiz-check-btn" data-question-id="${escapeAttr(q.id)}">Antwort prüfen</button>
          <button type="button" class="quiz-show-btn" data-question-id="${escapeAttr(q.id)}">Lösung anzeigen</button>
        </div>
        <div class="quiz-result" id="result-${escapeAttr(q.id)}"></div>
      </article>
    `;
  }).join("");
}

export function renderOrderCards(questions, startIndex = 0) {
  return questions.map((q, index) => {
    const questionNumber = startIndex + index + 1;
    const items = q.items || [];
    const itemsHtml = items.map((item, itemIndex) => {
      const options = items.map((_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("");
      return `
        <div class="order-row">
           <select class="order-select" data-question-id="${escapeAttr(q.id)}" data-index="${itemIndex}">
             <option value="">Pos.</option>
             ${options}
           </select>
           <div class="order-text">${inlineMd(String(item))}</div>
        </div>
      `;
    }).join("");

    return `
      <article class="quiz-card" data-question-id="${escapeAttr(q.id)}">
        <h3>Frage ${questionNumber}: Reihenfolge</h3>
        <p>${inlineMd(String(q.question || "Bringe die Elemente in die richtige Reihenfolge:"))}</p>
        <div class="order-container">${itemsHtml}</div>
        <div class="quiz-actions">
          <button type="button" class="quiz-check-btn" data-question-id="${escapeAttr(q.id)}">Antwort prüfen</button>
          <button type="button" class="quiz-show-btn" data-question-id="${escapeAttr(q.id)}">Lösung anzeigen</button>
        </div>
        <div class="quiz-result" id="result-${escapeAttr(q.id)}"></div>
      </article>
    `;
  }).join("");
}

export function renderTrueFalseCards(questions, startIndex = 0) {
  return questions.map((q, index) => {
    const questionNumber = startIndex + index + 1;
    return `
      <article class="quiz-card" data-question-id="${escapeAttr(q.id)}">
        <h3>Frage ${questionNumber}</h3>
        <p class="tf-statement">${inlineMd(String(q.statement || ""))}</p>
        <div class="quiz-options tf-options">
          <label class="quiz-option">
            <input type="radio" name="q-${escapeAttr(q.id)}" value="true" />
            <span>✓ Wahr</span>
          </label>
          <label class="quiz-option">
            <input type="radio" name="q-${escapeAttr(q.id)}" value="false" />
            <span>✗ Falsch</span>
          </label>
        </div>
        <div class="quiz-actions">
          <button type="button" class="quiz-check-btn" data-question-id="${escapeAttr(q.id)}">Antwort prüfen</button>
          <button type="button" class="quiz-show-btn" data-question-id="${escapeAttr(q.id)}">Lösung anzeigen</button>
        </div>
        <div class="quiz-result" id="result-${escapeAttr(q.id)}"></div>
      </article>
    `;
  }).join("");
}

export function renderCaseLabCards(scenarios) {
  return scenarios.map((scenario, index) => {
    const checklist = (scenario.checklist || []).map((item) => `<li>${inlineMd(String(item))}</li>`).join("");
    const solution = (scenario.solution || []).map((item) => `<li>${inlineMd(String(item))}</li>`).join("");

    return `
      <article class="quiz-card case-card">
        <h3>Case ${index + 1}: ${inlineMd(String(scenario.title || "Praxisfall"))}</h3>
        <p>${inlineMd(String(scenario.prompt || ""))}</p>
        <h4>Dein Vorgehen (Checkliste)</h4>
        <ul>${checklist}</ul>
        <button type="button" class="case-show-btn" data-case-index="${index}">Musterlösung anzeigen</button>
        <div class="quiz-result info hidden" id="case-result-${index}">
          <strong>Musterlösung:</strong>
          <ul>${solution}</ul>
        </div>
      </article>
    `;
  }).join("");
}
