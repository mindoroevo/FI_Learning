# Kapitel 2: Kern-Logik & Steuerung

In diesem Kapitel schauen wir uns das "Gehirn" unserer Anwendung an. Wir erklären, wie die App startet, Entscheidungen trifft und warum sie sich Dinge merken muss.

---

## 2.1 Der Start (`app.js`)

Die Datei `js/app.js` ist der **Regisseur** (oder Hauptverantwortliche). Sie ist der Anfang von allem.

#### Was passiert beim Start?

1.  **Laden der Module (`init()`)**: 
    Der Browser ruft beim Seitenaufruf automatisch die Funktion `init()` auf.
    *   Sucht im HTML nach der Liste für die Module.
    *   Schreibt dort Links hinein: `href="#001"`, `href="#002"`, usw.

2.  **Der Klick (`loadModule()`)**:
    Wenn ein Link geklickt wird, ruft der Browser NICHT eine neue Seite, sondern ändert nur den Hash (`#002`).
    Ein Event-Listener (Lauscher) merkt das und ruft `loadModule("002")`.

3.  **Die Lade-Routine**:
    *   Zeigt Text "Lade Inhalte..." an.
    *   Holt parallel:
        *   Den Theorie-Text (Markdown).
        *   Die Quiz-Fragen (JSON).
    *   Wartet, bis beides da ist (`Promise.all`).
    *   Ruft dann den **Renderer** (`renderers.js`), um HTML zu bauen.

**Code-Beispiel:**

```javascript
// app.js (vereinfacht)

async function loadModule(moduleId) {
  // 1. Zeige Lade-Nachricht
  content.innerHTML = "Lade...";
  
  // 2. Hole Daten (Text & Quiz)
  const theory = await fetchMarkdown(moduleId);
  const quiz = await loadQuizData(moduleId);
  
  // 3. Wenn alles da ist: Zeichne HTML
  renderContent(theory, quiz);
}
```

---

## 2.2 Der Zustand (`state.js`)

Warum brauchen wir einen **State** (Zustand)? 

Stellen Sie sich vor, Sie lesen ein Buch. Wenn Sie es zuklappen und weglegen, wissen Sie später nicht mehr, wo Sie waren. Sie brauchen ein Lesezeichen.
Der `state.js` ist unser globales Lesezeichen-Management.

#### Was wird gespeichert?

*   `currentModuleId`: Welches Kapitel lesen wir gerade? (z.B. "003")
*   `currentQuizData`: Welche Quizfragen gehören dazu? (z.B. Fragen über RAM und CPU)
*   `quizCache`: Ein cleverer Trick.
    **Der Cache (Zwischenspeicher)** merkt sich bereits geladene Fragen.
    *   Sie öffnen Modul 1. Der Browser lädt es aus dem Internet.
    *   Sie wechseln zu Modul 2.
    *   Sie gehen zurück zu Modul 1.
    *   **Der Cache sagt:** "Halt! Ich habe Modul 1 noch im Kopf. Ich muss nicht nochmal ins Internet."
    *   **Vorteil:** Die App reagiert sofort und spart Datenvolumen.

**Code-Beispiel:**

```javascript
// state.js (vereinfacht)

export const state = {
  currentModuleId: null, // Start: Kein Modul
  quizCache: {}          // Leeres "Regal" für zukünftige Fragen
};
```
