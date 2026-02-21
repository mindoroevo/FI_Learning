# Kapitel 5: Erweiterung & Wartung

In diesem Kapitel lernen Sie, wie Sie die Lernapp erweitern können.
Sei es ein neues Modul oder ein ganz neuer Fragetyp.

---

## 5.1 Neues Lernmodul hinzufügen

Die App wächst mit Ihrem Wissen. Ein neues Modul anzulegen ist einfach!

### Schritt 1: Das Handbuch (Markdown)
1.  Erstellen Sie eine neue Datei unter `FI_Learning/module_015_040/`, z.B. `041_neues_thema.md`.
2.  Schreiben Sie Ihr Wissen hinein. Nutzen Sie Überschriften (`#`, `##`), Listen (`-`) und Code (` ``` `).

### Schritt 2: Das Quiz (JSON)
1.  Erstellen Sie `FI_Learning/quiz/modules/041.quiz.json`.
2.  Nutzen Sie dieses aktuelle Template:

```json
{
  "meta": { "module": "041", "title": "Mein Titel", "version": 1 },
  "questions": [
    {
      "id": "041_q01",
      "type": "mcq",
      "difficulty": "easy",
      "concept": "Grundlagen",
      "question": "Was ist 1+1?",
      "options": ["1", "2", "3"],
      "correct": [1],
      "explanation": "1+1 ergibt 2, weil..."
    }
  ]
}
```

> **Wichtig:** Das Format `"questions": [...]` mit `"type"` pro Frage ist das aktuelle Format.
> Ältere Beispiele mit `"mcq": [...]` direkt auf Root-Ebene sind veraltet.

### Schritt 3: Registrieren (`modules.js`)
1.  Öffnen Sie `js/modules.js`.
2.  Fügen Sie Ihr Modul der Liste hinzu:

```javascript
export const MODULES = [
  // ... bestehende Module ...
  ["041", "Mein Titel", "./FI_Learning/module_015_040/041_neues_thema.md", true]
  //  ↑ id  ↑ Name        ↑ Pfad zur .md-Datei                             ↑ hasQuiz
  // hasQuiz: true  = Quiz-Tab wird angezeigt (nur wenn .quiz.json existiert)
  // hasQuiz: false = kein Quiz-Tab, nur Lerninhalt
];
```

### Schritt 4: Service Worker aktualisieren
In `sw.js` die neue Quiz-Datei in `ASSETS_TO_CACHE` eintragen und die Cache-Version erhöhen:

```javascript
const CACHE_NAME = "fiae-app-v22"; // ← Zahl erhöhen!
const ASSETS_TO_CACHE = [
  // ... bestehende Einträge ...
  "./FI_Learning/quiz/modules/041.quiz.json"
];
```

Das war's! Starten Sie die App neu (Refresh im Browser).

---

## 5.2 Neuen Fragetyp hinzufügen (Profi)

Sie wollen z.B. **Drag & Drop** Bilder? Das ist etwas Arbeit, aber machbar!

### 1. Datenstruktur planen
Überlegen Sie sich, wie das JSON aussehen muss.
```json
"dragdrop": [ { "id": "DD1", "image": "schema.png", "zones": [...] } ]
```

### 2. Renderer bauen (`renderers.js`)
Schreiben Sie eine Funktion `renderDragDropCards(questions)`.
Sie muss HTML zurückgeben. Nutzen Sie `<div>` für Dropzones und `<img>` für Draggables.

### 3. Sektion einbinden (`sections.js`)
In `renderMixedSection` müssen Sie den neuen Typ abfangen:
```javascript
if (data.dragdrop) {
  html += renderDragDropCards(data.dragdrop);
}
```

### 4. Validierung (`validation.js`)
Schreiben Sie Logik in `collectUserAnswer`:
*   Wie lese ich aus, wo welches Bild liegt? (DOM-Abfrage)

Schreiben Sie Logik in `checkAnswer`:
*   Vergleiche `istZone` mit `sollZone`.

---

## 5.3 Testing

Wenn Sie am Code basteln, sollten Sie testen, ob alles noch geht.
Öffnen Sie einfach `lernapp/tests/index.html` in Ihrem Browser.
Wenn alle Lampen grün sind ✅ -> Alles gut!
Wenn rot ❌ -> Fehler suchen.
