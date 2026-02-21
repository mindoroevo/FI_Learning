# Handbuch zur FIAE Lernapp - Entwickler-Dokumentation

Willkommen im technischen Herzstück der FIAE Lernapp! 
Dieses Handbuch dient als umfassender Leitfaden durch den Quellcode und die Architektur der Anwendung.

## Zielgruppe dieses Dokuments
Diese Dokumentation ist so geschrieben, dass sie **nicht nur von erfahrenen Programmierern**, sondern auch von Einsteigern oder Projektmanagern verstanden werden kann. Wir erklären nicht nur *welcher* Code ausgeführt wird, sondern vor allem *warum* und *wie* die logischen Zusammenhänge funktionieren.

---

## Inhaltsverzeichnis

### 1. [Die Architektur & Das Große Ganze](./01_architektur.md)
Verstehen Sie das Fundament der Anwendung. 
*   Was ist eine "Single Page Application"?
*   Wie fließen Daten durch das System?
*   Wie interagieren HTML, CSS und JavaScript?

### 2. [Kern-Logik & Steuerung](./02_kernlogik.md)
Der "Dirigent" und das "Gedächtnis" der App.
*   Wie startet die App? (`app.js`)
*   Wie merkt sich die App, wo wir sind? (`state.js`)
*   Wie werden Module geladen?

### 3. [Die Quiz-Engine](./03_quiz_engine.md)
Das Herzstück der Interaktivität.
*   Wie werden Fragen auf den Bildschirm gezeichnet? (`renderers.js`)
*   Wie prüft der Computer, ob eine Antwort richtig ist? (`validation.js`)
*   Die verschiedenen Fragetypen im Detail.

### 4. [Werkzeuge & Sicherheit](./04_hilfsfunktionen.md)
Die unsichtbaren Helferlein.
*   Warum müssen wir Texte "escapen"? (Sicherheit)
*   Wie funktioniert der Zufall im Computer?

### 5. [Erweiterung & Wartung](./05_erweiterung.md)
Wie Sie die App wachsen lassen.
*   Neue Lernmodule hinzufügen.
*   Eigene Fragetypen programmieren.

### 6. [Mobile & PWA (Offline-Fähigkeit)](./06_mobile_pwa.md)
Wie die App auf jedem Gerät läuft.
*   PWA-Installation ohne App-Store.
*   Service Worker für Offline-Nutzung.
*   Responsive Design (Smartphone vs. PC).

### 7. [Das Speichersystem](./07_speichersystem.md)
Verschlüsselte Datenpersistenz und Spielmechaniken.
*   AES-GCM 256-bit Verschlüsselung (Web Crypto API).
*   XP-System, 10 Level-Stufen, 15 Erfolge.
*   Lesezeichen und Modal-UI.
*   Das Event-System (`fiae:quizAnswer` / `fiae:gameEnd`).

### 8. [Die Spiele](./08_spiele.md)
Alle drei interaktiven Lernspiele im Detail.
*   Blitzkarten – Karteikarten mit Flip-Animation und Streak.
*   Subnetz-Trainer – IPv4-Subnetting interaktiv üben.
*   Binär-Trainer – 9 Aufgabentypen, 3 Eingabe-Pads, Timer-Modus.
*   Anleitung: Neues Spiel selbst hinzufügen.

### 9. [Rechtliches & Compliance](./09_rechtliches.md)
Lizenz, Datenschutz und rechtliche Absicherung.
*   Proprietäre Lizenz (All Rights Reserved).
*   Privacy-by-Design-Architektur.
*   DSGVO-Rechtsgrundlagen.
*   Übersicht aller rechtlichen Dokumente.
*   Checkliste vor dem ersten öffentlichen Release.

---

## Schnellstart für Code-Leser

Wenn Sie direkt in den Code springen wollen, hier eine Orientierungshilfe:

| Datei | Funktion | Analogie |
| :--- | :--- | :--- |
| `js/app.js` | Hauptsteuerung | Der **Regisseur**, der sagt, was wann passiert. |
| `js/state.js` | Datenspeicher | Das **Kurzzeitgedächtnis**, das sich merkt, welches Quiz gerade offen ist. |
| `js/saveSystem.js` | Speichersystem | Der **Tresor**, der alles verschlüsselt sichert. |
| `sw.js` | Service Worker | Der **Hausmeister**, der alles offline verfügbar macht. |
| `js/quiz/renderers.js` | HTML-Erzeuger | Der **Maler**, der die Daten hübsch auf den Bildschirm pinselt. |
| `js/quiz/validation.js` | Prüf-Logik | Der **Lehrer**, der die Antworten der Schüler korrigiert. |
| `js/games/blitzkarten.js` | Blitzkarten-Spiel | Die **Karteikarte**, die auf Knopfdruck umdreht. |
| `js/games/subnetz.js` | Subnetz-Trainer | Der **Netzwerkrechner**, der IPv4-Aufgaben stellt. |
| `js/games/binary.js` | Binär-Trainer | Das **Übungsblatt** für Zahlenumrechnungen. |
| `js/utils.js` | Hilfsfunktionen | Der **Werkzeugkasten** mit Schraubendreher und Hammer. |
