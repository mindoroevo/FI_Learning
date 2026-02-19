# Developer Guide & Architektur-Dokumentation

Diese Dokumentation dient als "Roter Faden" durch das Projekt. Sie beschreibt die Architektur, die wichtigsten Module und wie man die App erweitert.

---

## Inhaltsverzeichnis

1.  [Projekt-Übersicht](#1-projekt-übersicht)
2.  [Architektur & Design Patterns](#2-architektur--design-patterns)
3.  [Verzeichnisstruktur](#3-verzeichnisstruktur)
4.  [Kern-Module (Detailed Description)](#4-kern-module)
    *   [App & Routing](#app--routing)
    *   [State Management](#state-management)
    *   [Quiz Validation Engine](#quiz-validation-engine)
5.  [How-To: Neue Inhalte hinzufügen](#5-how-to-neue-inhalte-hinzufügen)
6.  [How-To: Neuen Fragetyp implementieren](#6-how-to-neuen-fragetyp-implementieren)
7.  [Testing](#7-testing)

---

## 1. Projekt-Übersicht

Die "FIAE Lernapp" ist eine **Single Page Application (SPA)** ohne Framework-Abhängigkeiten (Vanilla JS / ES6 Modules). Sie dient zur Vorbereitung auf die AP1-Prüfung und kombiniert:
*   **Theorie**: Markdown-basierte Handbücher.
*   **Praxis**: JSON-basierte Quizze mit verschiedenen Fragetypen (MCQ, Lückentext, etc.).

Ziel ist maximale Performance, einfache Wartbarkeit (kein Build-Step nötig) und leichte Erweiterbarkeit.

---

## 2. Architektur & Design Patterns

Wir verwenden eine modulare **ES6-Architektur**. Es gibt keinen zentralen "Monolithen", sondern spezialisierte Dateien für UI, Daten und Logik.

### Kern-Prinzipien
*   **Event-Driven**: Die UI reagiert auf User-Events (`click`, `hashchange`) und delegiert an Controller-Funktionen.
*   **Separation of Concerns**:
    *   `renderers.js`: Erzeugt nur HTML-Strings (View).
    *   `validation.js`: Prüft nur Logik (Model/Controller).
    *   `state.js`: Hält die Daten (Store).
*   **Lazy Loading**: Quiz-Daten werden erst geladen, wenn das Modul angeklickt wird.

---

## 3. Verzeichnisstruktur

```
lernapp/
├── app.css              # Globales Styling (Dark Mode, Layout)
├── index.html           # Einstiegspunkt
├── js/                  # JavaScript Source Code
│   ├── app.js           # Main Entry Point & Routing
│   ├── modules.js       # Konfigurations-Liste aller Module
│   ├── state.js         # Zentraler State & Caching
│   ├── utils.js         # Hilfsfunktionen (XSS-Schutz, Markdown)
│   └── quiz/            # Quiz-Logik
│       ├── renderers.js   # HTML-Template-Generatoren
│       ├── sections.js    # Zusammenstellung der Quiz-Sektionen
│       ├── validation.js  # Antwort-Prüfung
│       └── ...
├── tests/               # Unit-Tests (Mocha/Chai)
└── ...
```

---

## 4. Kern-Module

### App & Routing (`js/app.js`)
Der "Klebstoff" der Anwendung.
*   **Routing**: Nutzt `window.location.hash` (`#001`, `#002`), um Module zu laden.
*   **Init**: Startet beim Laden der Seite `init()`, rendert die Sidebar und lädt das erste Modul.
*   **Event Handling**: Ein globaler Event-Listener auf `document.body` fängt Klicks ab (Performance!), z.B. für "Antwort prüfen".

### State Management (`js/state.js`)
Ein einfaches Objekt, das den aktuellen Zustand hält.
*   `currentModuleId`: Welches Modul ist aktiv?
*   `currentQuizData`: Das JSON-Objekt des aktuellen Quiz.
*   `quizCache`: Verhindert, dass wir `001.quiz.json` mehrfach vom Server laden müssen.

### Quiz Validation Engine (`js/quiz/validation.js`)
Das Herzstück der Interaktivität.
*   `checkAnswer(id)`: Wird aufgerufen, wenn der User klickt.
*   **Polymorphie**: Die Funktion entscheidet anhand des `engine`-Typs (mixed, mcq, fill_blank), wie die Antwort geprüft wird.
*   **Feedback**: Setzt CSS-Klassen (`ok`, `error`) und zeigt Erklärungen an.

---

## 5. How-To: Neue Inhalte hinzufügen

1.  **Markdown erstellen**:
    *   Lege eine Datei an: `module_015_name.md`.
    *   Schreibe den Inhalt (Überschriften, Listen, Code-Blöcke).

2.  **Quiz erstellen**:
    *   Lege `quiz/modules/015.quiz.json` an.
    *   Struktur (Beispiel):
    ```json
    {
      "meta": { "module": "015", "title": "Mein neues Thema" },
      "engine": "mixed",
      "mcq": [ ... ],
      "fill_blank": [ ... ]
    }
    ```

3.  **Registrieren**:
    *   Öffne `js/modules.js`.
    *   Füge einen Eintrag hinzu: `["015", "Titel", "../module_015.md"]`.

---

## 6. How-To: Neuen Fragetyp implementieren

Beispiel: "Drag & Drop".

1.  **Datenstruktur definieren**: Wie sieht das JSON aus?
2.  **Renderer bauen** (`js/quiz/renderers.js`):
    *   Funktion `renderDragDropCards(questions)` erstellen.
    *   Muss HTML zurückgeben.
3.  **UI einbinden** (`js/quiz/sections.js`):
    *   In `renderMixedSection` den neuen Typ abfragen und Renderer aufrufen.
4.  **Validierung** (`js/quiz/validation.js`):
    *   In `collectUserAnswer`: Wie lese ich den DOM-Status aus?
    *   In `checkAnswer`: Wie vergleiche ich Soll vs. Ist?

---

## 7. Testing

Die App verfügt über eine Test-Suite im Ordner `tests/`.
Öffne `tests/index.html` im Browser, um die Tests auszuführen.

*   `utils.test.js`: Prüft Hilfsfunktionen.
*   `quiz_validation.test.js`: Simuliert Quiz-Logik.

**Erweitern der Tests**:
Lege eine neue Datei `tests/neuer_test.js` an und importiere sie in `tests/index.html`.
