# Kapitel 5: Erweiterung & Wartung

In diesem Kapitel lernen Sie, wie Sie die Lernapp erweitern können.
Sei es ein neues Modul oder ein ganz neuer Fragetyp.

---

## 5.1 Neues Lernmodul hinzufügen

Die App wächst mit Ihrem Wissen. Ein neues Modul anzulegen ist einfach!

### Schritt 1: Das Handbuch (Markdown)
1.  Gehen Sie in den Ordner `module_001_014/` (oder Hauptordner).
2.  Erstellen Sie eine neue Datei, z.B. `module_015.md`.
3.  Schreiben Sie Ihr Wissen hinein. Nutzen Sie Überschriften (`#`, `##`), Listen (`-`) und Code (` ``` `).

### Schritt 2: Das Quiz (JSON)
1.  Gehen Sie in den Ordner `quiz/modules/`.
2.  Erstellen Sie `015.quiz.json`.
3.  Nutzen Sie dieses Template:

```json
{
  "meta": { "module": "015", "title": "Mein Titel" },
  "engine": "mixed",
  "mcq": [
    {
      "id": "1",
      "question": "Was ist 1+1?",
      "options": ["1", "2", "3"],
      "correct": [1]
    }
  ]
}
```

### Schritt 3: Registrieren (`modules.js`)
1.  Öffnen Sie `js/modules.js`.
2.  Fügen Sie Ihr Modul der Liste hinzu:

```javascript
export const MODULES = [
  // ... alte Module ...
  ["015", "Mein Titel", "../module_015.md"]
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
