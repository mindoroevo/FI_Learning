# Kapitel 3: Die Quiz-Engine

In diesem Kapitel tauchen wir tief in das Herz der App ein: **Das Quiz**.
Wir erklären, wie aus langweiligen JSON-Daten ein interaktives Lernspiel wird.

---

## 3.1 Die Struktur (Das "Modell")

Was ist überhaupt ein Quiz? Technisch gesehen ist es ein JSON-Objekt.
Ein Beispiel für eine Frage:

```json
{
  "id": "1",
  "question": "Welche Farbe hat eine Zitrone?",
  "options": ["Rot", "Gelb", "Blau"],
  "correct": [1] // Gelb (Index startet bei 0)
}
```

Die App muss nun wissen: "Wie zeige ich das an?" und "Wie prüfe ich das?"

---

## 3.2 Das Zeichnen (`renderers.js`)

Die Datei `js/quiz/renderers.js` ist der **Künstler** (Renderer).
Sie nimmt das Datengerüst und malt daraus **HTML**.

#### Wie funktioniert das?

Der Renderer hat spezialisierte Funktionen für jeden Fragetyp:
*   `renderMcqCards`: Malt Radio-Buttons oder Checkboxen.
*   `renderFillBlankCards`: Malt Dropdown-Menüs in Sätze.
*   `renderMatchCards`: Malt Zuordnungs-Listen (Links/Rechts).

Der Clou: Wir nutzen sog. **Template Literals** (Backticks `` ` ``), um HTML direkt im JavaScript zu schreiben. Das ist sehr flexibel und schnell.

**Beispiel:**
```javascript
// renderers.js (vereinfacht)

function renderMcq(frage) {
  return `
    <div class="frage-karte" id="${frage.id}">
      <h3>${frage.text}</h3>
      <ul>
        <li><input type="radio"> Option A</li>
        <li><input type="radio"> Option B</li>
      </ul>
      <button onclick="checkAnswer('${frage.id}')">Prüfen</button>
    </div>
  `;
}
```

---

## 3.3 Die Organisation (`sections.js`)

Die Datei `js/quiz/sections.js` ist der **Organisator**.
Sie ruft nicht wild Funktionen auf, sondern strukturiert das Quiz.

*   `renderMixedSection`: Der wichtigste Manager.
    1.  Er schaut: Haben wir MCQ-Fragen? -> Rufe `renderMcqCards`.
    2.  Haben wir Lückentexte? -> Rufe `renderFillBlankCards`.
    3.  Klebt alles zusammen in einen großen HTML-Block.
    4.  Sorgt für eine **durchgehende Nummerierung** (1, 2, 3...), damit der Nutzer nicht verwirrt ist.

---

## 3.4 Die Prüfung (`validation.js`)

Die Datei `js/quiz/validation.js` ist der **Lehrer** (Validator).
Sie wird aktiv, wenn Sie auf "Antwort prüfen" klicken.

#### Der Ablauf einer Prüfung:

1.  **Sammeln (`collectUserAnswer`)**:
    Der Lehrer geht durch den HTML-Code und schaut: Was hat der Schüler angekreuzt?
    *   Bei MCQ: Welche Checkbox ist `checked`?
    *   Bei Lückentext: Welcher Wert steht im `<select>`?

2.  **Vergleichen**:
    Der Lehrer holt sich die Musterlösung aus dem **State** (siehe Kapitel 2).
    *   Schüler sagt: "B"
    *   Lösung ist: "B"
    *   Ergebnis: Richtig!

3.  **Feedback (`showResult`)**:
    Der Lehrer schreibt unter die Frage:
    *   Grüner Haken ✅ oder Rotes Kreuz ❌.
    *   Erklärungstext ("Weil Zitronen gelb sind...").

#### Wichtig: Arrays vergleichen

Computer sind dumm.
`[1, 2]` ist für einen Computer NICHT dasselbe wie `[1, 2]` (verschiedene Speicheradressen).
Wir haben extra eine Hilfsfunktion `arraysEqual` geschrieben, die Zahl für Zahl vergleicht.

---

## Fragetypen im Detail

### 1. Multiple Choice (MCQ)
*   **Typ:** `radio` (eine Antwort) oder `checkbox` (mehrere).
*   **Prüfung:** Vergleicht Arrays von Indizes (z.B. `[0, 2]` vs `[0, 2]`).

### 2. Lückentext (Fill-Blank)
*   **Typ:** `<select>` Dropdowns im Text.
*   **Besonderheit:** Der Text enthält Platzhalter wie `[blank]`. Diese werden beim Rendern durch HTML ersetzt.
*   **Prüfung:** Vergleicht Text-Werte (Strings).

### 3. Zuordnung (Match)
*   **Typ:** Links steht ein Begriff, rechts ein Dropdown.
*   **Prüfung:** Die Reihenfolge der Dropdowns muss stimmen.

### 4. Reihenfolge (Order)
*   **Typ:** Dropdowns mit Zahlen (1., 2., 3...).
*   **Prüfung:** Die Liste der *gewählten* Positionen muss der `correctOrder` ensprechen.
