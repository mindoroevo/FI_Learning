# Kapitel 1: Die Architektur & Das Große Ganze

In diesem Abschnitt lernen Sie die Bauweise der Anwendung kennen. Wir verwenden ein Konzept namens **Single Page Application (SPA)**.

## Was ist eine Single Page Application (SPA)?

Stellen Sie sich vor, Sie nutzen eine klassische Webseite (wie Wikipedia). Wenn Sie auf einen Link klicken, lädt der Browser eine komplett neue Seite vom Server. Das fühlt sich kurz "weiß" an, alles flackert kurz auf.

Bei einer SPA (Lernapp) ist es anders:
*   Sie laden beim Start **nur einmal** die Seite (`index.html`).
*   Alle weiteren Klicks werden von JavaScript abgefangen.
*   Das JavaScript sagt: *"Aha, der Nutzer will zu Modul 2. Ich lösche den Inhalt in der Mitte und male neuen Inhalt hin."*

**Vorteil:** Die App ist blitzschnell und fühlt sich wie eine echte Software an.
**Nachteil:** Der Browser kann sich verlaufen, wenn wir ihm nicht helfen (siehe "Routing").

---

## 1.1 Responsive Design & PWA (Progressive Web App)

Wir nutzen ein **Responsive Mobile-First Design** und eine **PWA-Architektur**. Das bedeutet:
*   Die App passt sich jedem Bildschirm an (Mobil, Tablet, Desktop).
*   Sie ist **offline-fähig** dank eines Service Workers.
*   Sie lässt sich ohne App-Store auf Android/iOS installieren.
*   Mehr dazu im [Kapitel 6: Mobile & PWA](./06_mobile_pwa.md).

---

## Der Datenfluss: Vom Klick bis zum Bild

Wie kommt eine Frage auf den Bildschirm?

### Schritt 1: Das Routing (Die Navigation)
Der "Router" ist wie ein Pförtner. Er schaut auf die URL im Browser.
Beispiel: `.../index.html#002`

*   Der Router sieht `#002`.
*   Er weiß: Das ist das Modul "Bedarfsanalyse".
*   Er ruft den **Loader** (Lader).

### Schritt 2: Der State (Das Gedächtnis)
Der **Loader** fragt zuerst den **State**.
*   *"Habe ich die Fragen für Modul 002 schon im Kopf?"*
*   Wenn **JA**: Zeige sie sofort an.
*   Wenn **NEIN**: Frage den Server (bzw. die Datei auf der Festplatte).

### Schritt 3: Der Renderer (Der Maler)
Sobald die Daten da sind (Daten = JSON-Datei mit Fragen), ruft der Loader den **Renderer**.
Der Renderer nimmt die nackten Fakten (Text: "Was ist ein Bit?", Optionen: "0 oder 1", "Apfel", "Birne") und baut daraus schönen HTML-Code.

### Schritt 4: Die Validierung (Der Lehrer)
Wenn der Nutzer klickt, greift die **Validierung**.
Sie vergleicht die Eingabe des Nutzers mit der Musterlösung im **State**.

---

## Wichtige Design-Entscheidungen

### 1. Keine Datenbank
Wir nutzen JSON-Dateien statt einer Datenbank.
*   **Warum?** Einfachheit. Sie können die App auf einen USB-Stick kopieren und sie läuft. Keine Installation nötig.
*   **Wie funktioniert das?** Jedes Modul hat eine eigene kleine Datei (z.B. `001.quiz.json`).

### 2. Modulare JavaScript-Dateien
Früher schrieb man alles in eine riesige Datei. Das war unübersichtlich. Wir nutzen **ES6 Module**.
Das bedeutet: Jede Aufgabe hat ihre eigene Datei. Das macht den Code wartbar wie einen Legobaukasten.

| Datei | Aufgabe |
|---|---|
| `js/app.js` | Regisseur – Navigation, Rendering, Event-Handling |
| `js/state.js` | Gedächtnis – Zustand, Quiz-Cache, Filter |
| `js/modules.js` | Modulliste – 40 Einträge mit Pfaden |
| `js/markdown.js` | Parser – wandelt Markdown in HTML um |
| `js/utils.js` | Werkzeugkasten – escapeHtml, shuffle, inlineMd … |
| `js/saveSystem.js` | Tresor – AES-256-Verschlüsselung, XP, Erfolge, Lesezeichen |
| `js/quiz/sections.js` | Fragetyp-Renderer – 7 verschiedene Quiz-Typen |
| `js/quiz/validation.js` | Lehrer – prüft Antworten, feuert Events |
| `js/games/blitzkarten.js` | Karteikarten-Spiel |
| `js/games/subnetz.js` | IPv4-Subnetting-Trainer |
| `js/games/binary.js` | Binär/Hex-Umrechnungs-Trainer |
