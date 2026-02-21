# Kapitel 4: Werkzeuge & Sicherheit

Die unsichtbaren Helfer im Hintergrund.
Wir nutzen zwei Haupt-Dateien für Hilfsaufgaben: `js/utils.js` und `js/markdown.js`.

---

## 4.1 Die Sicherheit (`utils.js`)

Im Web sind Benutzereingaben **gefährlich**. Wer Code direkt ausgibt, öffnet Türen für Hacker (Cross-Site Scripting, XSS).
Unsere App hat dagegen zwei Schutzschilde.

### Der Wächter: `escapeHtml()`

Diese Funktion nimmt einen Text und ersetzt gefährliche Zeichen durch harmlose HTML-Entities.

**Beispiel:**
*   **Gefährlich:** `<script>alert('Böse!')</script>`
*   **Sicher (escaped):** `&lt;script&gt;alert('Böse!')&lt;/script&gt;`

Der Browser weiß nun: "Aha, das ist nur Text, kein Code."

### Der Attribut-Wächter: `escapeAttr()`

Wenn wir Werte IN HTML-Attribute schreiben (z.B. `<div id="...">`), nutzen wir `escapeAttr()`.
Es ersetzt zusätzlich Anführungszeichen (`"`), damit das HTML nicht kaputt geht.

---

## 4.2 Der Zufall (`shuffleArray`)

Quiz-Fragen sollen jedes Mal anders aussehen, damit man nicht stumpf "A, B, C" auswendig lernt.
Wir nutzen den **Fisher-Yates Shuffle Algorithmus**.

#### Wie funktioniert das Mischen?
Stellen Sie sich einen Kartenstapel vor.
1.  Wir nehmen die letzte Karte (Index `i`).
2.  Wir ziehen eine zufällige Karte aus dem Reststapel (Index `j`).
3.  Wir tauschen beide.
4.  Wir wiederholen das, bis der Stapel durch ist.

Das ist statistisch gesehen die fairste Methode.

```javascript
/* utils.js */
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      // Wähle zufälligen Partner
      const j = Math.floor(Math.random() * (i + 1));
      // Tausche
      [array[i], array[j]] = [array[j], array[i]];
  }
}
```

---

## 4.3 Der Markdown-Parser (`markdown.js`)

Wir schreiben die Handbücher im **Markdown-Format** (`.md`). Das ist einfach zu schreiben, aber der Browser versteht nur HTML.
Der Parser (`markdownToHtml`) übersetzt das.

#### Die wichtigsten Übersetzungen:

1.  **Überschriften:**
    *   `# Titel` -> `<h1>Titel</h1>`
    *   `## Untertitel` -> `<h2>Untertitel</h2>` (Baut auch IDs für das Inhaltsverzeichnis!)

2.  **Listen:**
    *   `* Punkt` -> `<li>Punkt</li>` in einer `<ul>`

3.  **Code-Blöcke:**
    *   ```` ``` ``` ```` -> `<pre><code>...</code></pre>`

Der Parser baut auch automatisch ein **Inhaltsverzeichnis (TOC)**. Er sammelt alle `<h2>` Überschriften und erstellt eine Sprungmarken-Liste am Anfang der Seite.

---

## 4.4 Inline-Markdown (`inlineMd`)

Während `markdown.js` komplette Seiten parst, gibt es die Funktion `inlineMd()` für kleine Textstellen –
z.B. Quiz-Fragetext, der fett, kursiv oder mit Code formatiert sein kann.

```javascript
inlineMd("Das ist **wichtig** und `code`")
// → "Das ist <strong>wichtig</strong> und <code>code</code>"
```

Sie kombiniert `escapeHtml()` (Sicherheit) mit Inline-Regex-Ersetzungen. Wird überall im Quiz-Rendering genutzt.

---

## 4.5 Anker-IDs erzeugen (`generateTocId`)

Für das automatische Inhaltsverzeichnis braucht jede Überschrift eine eindeutige, URL-freundliche ID.

```javascript
generateTocId("2.1 Der Start & Initialisierung!")
// → "21-der-start--initialisierung"
```

Die Funktion wandelt Großbuchstaben in Kleinbuchstaben um, ersetzt Leerzeichen durch `-` und entfernt Sonderzeichen. Deutsche Umlaute (ä, ö, ü, ß) bleiben erhalten.

---

## 4.6 Arrays vergleichen (`arraysEqual`)

Bei der Validierung von **Reihenfolge-Fragen** (`order`-Typ) muss geprüft werden, ob der Nutzer
die Elemente in exakt der richtigen Reihenfolge angeordnet hat. `===` reicht dafür nicht.

```javascript
arraysEqual([1, 2, 3], [1, 2, 3])  // → true
arraysEqual([1, 3, 2], [1, 2, 3])  // → false
```

Die Funktion vergleicht Länge und jeden Wert an jeder Position.

