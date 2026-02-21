# Kapitel 2: Kern-Logik & Steuerung

In diesem Kapitel schauen wir uns das "Gehirn" unserer Anwendung an. Wir erklären, wie die App startet, Entscheidungen trifft und warum sie sich Dinge merken muss.

---

## 2.1 Der Start (`app.js`)

Die Datei `js/app.js` ist der **Regisseur** (oder Hauptverantwortliche). Sie ist der Anfang von allem.

#### Was passiert beim Start?

1.  **`init()` wird aufgerufen**:  
    Die Funktion `init()` ist der einzige Einstiegspunkt. Sie richtet alles ein.

2.  **Tab-Navigation registrieren**:  
    Die App hat 3 Haupt-Tabs in der unteren Leiste:
    *   `tabLernen` → Modul-Inhalt anzeigen
    *   `tabQuiz` → Quiz-Modus aktivieren
    *   `tabSpiele` → Spieleübersicht anzeigen

3.  **Spiele-Buttons registrieren**:  
    In der Sidebar gibt es 3 Spiel-Buttons:
    *   `blitzkartenBtn` → startet `launchBlitzkarten()`
    *   `subnetzBtn` → startet `launchSubnetz()`
    *   `binaryBtn` → startet `launchBinary()`

4.  **Speichersystem starten**:  
    `initSaveSystem()` wird aufgerufen – lädt den Geräteschlüssel,
    stellt die letzte Speicherdatei wieder her und registriert die Event-Listener
    für `fiae:quizAnswer` und `fiae:gameEnd`.

5.  **Lesezeichen-Navigation**:  
    Ein Listener auf `fiae:navigateMod` erlaubt es dem Modal, direkt zu einem
    Modul zu springen wenn der Nutzer ein Lesezeichen anklickt.

6.  **Modul laden oder Willkommen zeigen**:  
    Wenn ein `#hash` in der URL steht, wird das passende Modul direkt geladen.
    Ansonsten erscheint der Willkommens-Bildschirm.

**Code-Beispiel (vereinfacht):**

```javascript
// app.js

function init() {
  renderModuleList(MODULES);        // Sidebar befüllen
  registerServiceWorker();          // PWA aktivieren

  // Tab-Navigation
  document.getElementById("tabLernen")?.addEventListener("click", ...);
  document.getElementById("tabQuiz")?.addEventListener("click", ...);
  document.getElementById("tabSpiele")?.addEventListener("click", () => showGamesScreen());

  // Spiele
  document.getElementById("blitzkartenBtn")?.addEventListener("click", () =>
    launchBlitzkarten(contentEl, onBack)
  );

  // Speichersystem
  initSaveSystem();

  // Start
  showWelcomeMessage();
}
```

---

## 2.2 Der Zustand (`state.js`)

Warum brauchen wir einen **State** (Zustand)? 

Stellen Sie sich vor, Sie lesen ein Buch. Wenn Sie es zuklappen und weglegen, wissen Sie später nicht mehr, wo Sie waren. Sie brauchen ein Lesezeichen.
Der `state.js` ist unser globales Lesezeichen-Management.

#### Was wird gespeichert?

*   `currentModuleId`: Welches Kapitel lesen wir gerade? (z.B. `"003"`)
*   `currentQuizData`: Welche Quizfragen gehören dazu?
*   `quizCache`: Bereits geladene Quiz-JSON-Dateien (Zwischenspeicher – kein doppeltes Netzwerk-Request).
*   `mdCache`: Bereits geparste Markdown-Inhalte.
*   `shellCache`: Bereits gerenderte Modul-Shell-HTML-Strings.
*   `selectedConcept`: Aktiver Konzept-Filter (`null` = alle Fragen).
*   `quizMode`: Aktueller Lernmodus: `'training'` | `'quick'`.
*   `difficultyFilter`: Schwierigkeitsfilter: `'all'` | `'easy'` | `'medium'` | `'hard'`.
*   `questionTypeFilter`: Fragetypfilter: `'all'` | `'mcq'` | `'fill_blank'` | usw.
*   `pendingMode`: Gibt an, ob nach dem Laden direkt in den Quiz-Modus gewechselt werden soll.

**Code-Beispiel:**

```javascript
// state.js (vereinfacht)

export const state = {
  currentModuleId: null, // Start: Kein Modul
  quizCache: {}          // Leeres "Regal" für zukünftige Fragen
};
```
