# Kapitel 7: Das Speichersystem

In diesem Kapitel erklären wir, wie die App Lernfortschritte, XP-Punkte, Erfolge und Lesezeichen **sicher und dauerhaft** speichert – vollständig ohne Server, verschlüsselt direkt im Browser des Nutzers.

---

## 7.1 Das Problem: Wie merkt sich die App alles?

Standardmäßig vergisst ein Browser alles, sobald Sie den Tab schließen.  
Früher hat die App den Lernstand nur im RAM gehalten. Nach einem Browser-Neustart war alles weg.

Die Lösung: Das **Speichersystem** (`js/saveSystem.js`).

Es kombiniert zwei Speicherorte:

| Speicherort | Was | Wann |
|---|---|---|
| `localStorage` | Geräteschlüssel + Backup | Sofort, automatisch |
| `.fiae`-Datei | Vollständiger Lernstand (verschlüsselt) | Auf Nutzerwunsch |

---

## 7.2 Die Verschlüsselung: AES-GCM 256-bit

**Warum verschlüsseln?** Damit niemand fremdes die Lernstand-Datei einfach öffnen und lesen kann.

Die App nutzt **AES-GCM 256-bit** – das ist derselbe Verschlüsselungs-Standard, den Banken und Regierungen nutzen. Das Besondere: Die gesamte Kryptografie findet im Browser statt, durch die eingebaute **Web Crypto API**. Wir brauchen dafür keine externe Bibliothek.

### Wie funktioniert das genau?

**Beim ersten Start:**
1. Der Browser erzeugt einen zufälligen **Schlüssel** (256 Bit = 32 zufällige Bytes).
2. Dieser Schlüssel wird als Base64-String in `localStorage` gespeichert: `fiae_device_key_v1`.
3. Der Schlüssel ist **gerätespezifisch** – jedes Gerät hat seinen eigenen.

**Beim Speichern:**
1. Die Lernstand-Daten werden als JSON zusammengestellt.
2. Ein zufälliger **IV** (Initialisierungsvektor, 12 Byte) wird erzeugt – wie ein Einweg-Salt, der verhindert, dass gleiche Daten immer gleich aussehen.
3. JSON + IV werden mit dem Schlüssel verschlüsselt.
4. Das Ergebnis: `FIAE_SAVE_V1\n` + Base64(IV + Ciphertext) → wird in die `.fiae`-Datei geschrieben.

**Beim Laden:**
1. Die Datei wird gelesen.
2. Der Header (`FIAE_SAVE_V1\n`) wird geprüft und entfernt.
3. Base64 → IV + Ciphertext trennen.
4. Mit dem Geräteschlüssel entschlüsseln → JSON → Lernstand-Objekt.

```
┌─────────────────────────────────────────────────────────────┐
│  Lernstand  →  JSON-String  →  AES-GCM  →  Base64  →  .fiae│
│                                  ↑                          │
│                          Geräteschlüssel                    │
│                          (bleibt im Browser)                │
└─────────────────────────────────────────────────────────────┘
```

> **Wichtig:** Der Schlüssel verlässt niemals das Gerät. Ohne den Schlüssel (der in `localStorage` liegt) kann die `.fiae`-Datei auf keinem anderen Gerät entschlüsselt werden – es sei denn, der Nutzer exportiert den Schlüssel manuell.

---

## 7.3 Der Autosave: Immer aktuell, ohne Spam

Das System spart automatisch – aber nicht nach jedem einzelnen Klick. Das wäre zu langsam.

Es nutzt einen **Debounce-Timer** (800 ms):

```
Nutzer beantwortet Frage
         ↓
   _dirty = true
   Timer starten (800ms)
         ↓
   Nutzer beantwortet noch eine Frage → Timer wird zurückgesetzt
         ↓
   800ms keine Aktivität → Speichern!
```

Zusätzlich gibt es immer ein **localStorage-Backup** (`fiae_save_backup_v1`), das sofort beim Daten-Update geschrieben wird – als Sicherheitsnetz, falls die Datei mal nicht verfügbar ist.

---

## 7.4 Das gespeicherte Datenobjekt

Die Datei enthält nach der Entschlüsselung ein JSON-Objekt mit dieser Struktur:

```json
{
  "profile": {
    "name": "Max Mustermann",
    "xp": 420,
    "createdAt": "2026-01-15T10:30:00.000Z"
  },
  "achievements": {
    "quiz_first": true,
    "quiz_10": true,
    "streak_5": false
  },
  "bookmarks": ["001", "005", "012"],
  "stats": {
    "quizAnswered": 150,
    "quizCorrect": 120,
    "gamesPlayed": {
      "blitzkarten": 5,
      "subnetz": 3,
      "binary": 8
    }
  },
  "lastSaved": "2026-02-21T14:22:00.000Z"
}
```

---

## 7.5 Das XP- und Level-System

Jede Aktivität in der App bringt **XP-Punkte** (Erfahrungspunkte). Genug XP → nächstes Level.

### Die 10 Level-Stufen

| Level | Icon | Name | Ab XP |
|---|---|---|---|
| 1 | 🌱 | Neuling | 0 |
| 2 | 📖 | Lernender | 100 |
| 3 | 🔍 | Entdecker | 300 |
| 4 | ⚙️ | Praktiker | 600 |
| 5 | 💡 | Fortgeschrittener | 1.000 |
| 6 | 🎯 | Experte | 1.600 |
| 7 | 🏅 | Spezialist | 2.500 |
| 8 | 🚀 | Profi | 3.600 |
| 9 | 🧠 | Meister | 5.000 |
| 10 | 🏆 | Großmeister | 7.000 |

### XP-Quellen

- Richtige Quiz-Antwort: **+2 XP**
- Erste richtige Antwort überhaupt: **+5 XP** (Bonus)
- Spiel abgeschlossen: **+10–30 XP** je nach Spiel
- Speicherdatei erstellt: **+20 XP**
- Erfolge freischalten: **+5 bis +100 XP**

---

## 7.6 Die Erfolge (Achievements)

Erfolge sind Meilensteine, die einmalig freigeschaltet werden. Jeder Erfolg gibt XP.

| ID | Icon | Name | Bedingung | XP |
|---|---|---|---|---|
| save_created | 💾 | Datei gesichert | Speicherdatei erstellt | 20 |
| quiz_first | 🧠 | Erste Antwort | 1 Quiz-Frage beantwortet | 5 |
| quiz_10 | 📚 | Im Lernfluss | 10 Fragen beantwortet | 15 |
| quiz_50 | 💡 | Wissenshungrig | 50 Fragen beantwortet | 30 |
| quiz_100 | 🎓 | Lernmaschine | 100 Fragen beantwortet | 50 |
| quiz_correct_10 | ✅ | Treffsicher | 10 korrekte Antworten | 20 |
| quiz_correct_50 | 🎯 | Scharf wie ein Messer | 50 korrekte Antworten | 40 |
| game_first | 🎮 | Spieler | Erstes Spiel abgeschlossen | 10 |
| game_10 | 🕹️ | Hardcore Gamer | 10 Spiele gespielt | 30 |
| streak_5 | 🔥 | On Fire | 5er-Streak | 15 |
| streak_10 | ⚡ | Blitzschnell | 10er-Streak | 30 |
| bookmark_first | 🔖 | Merkliste | Erstes Lesezeichen gesetzt | 5 |
| bookmark_5 | 📌 | Sammler | 5 Lesezeichen | 15 |
| level_5 | 🚀 | Aufsteiger | Level 5 erreicht | 50 |
| level_10 | 🏆 | Meisterschüler | Level 10 erreicht | 100 |

---

## 7.7 Lesezeichen

Jedes Lernmodul kann als Lesezeichen markiert werden (🔖-Button im Modul-Header).

```javascript
// In app.js: Bookmark-Button im Modul-Kopf
<button data-bm-mod="${id}">${hasBookmark(id) ? "🔖" : "☆"}</button>

// saveSystem.js exportiert:
toggleBookmark(moduleId)  // Setzt / entfernt Lesezeichen
hasBookmark(moduleId)     // Gibt true zurück wenn vorhanden
```

Lesezeichen sind im Modal unter dem Tab **„Lesezeichen"** übersichtlich aufgelistet. Ein Klick navigiert direkt zum Modul.

---

## 7.8 Das Modal (Die UI)

Das Speichersystem hat eine eigene vollständige Benutzeroberfläche – ein Modal, das sich über die App legt.

Öffnen: Klick auf 💾 in der oberen Leiste.

### Die 5 Tabs

| Tab | Inhalt |
|---|---|
| 👤 Profil | Name, Level, XP-Fortschritt, nächstes Level |
| 🔖 Lesezeichen | Alle gespeicherten Module mit Direkt-Links |
| 🏆 Erfolge | Alle 15 Achievements (freigeschaltet / gesperrt) |
| 📊 Statistiken | Quiz-Stats, Spielstatistiken, Gesamt-Übersicht |
| ⚙️ Einstellungen | Datei erstellen/laden, Schlüssel verwalten, Daten löschen |

---

## 7.9 Die öffentlichen Funktionen (API)

Andere Module importieren aus `saveSystem.js`:

```javascript
import {
  initSaveSystem,   // Beim App-Start aufrufen – lädt Schlüssel + Datei
  openSaveManager,  // Modal öffnen: openSaveManager("bookmarks")
  toggleBookmark,   // toggleBookmark("005")
  hasBookmark       // hasBookmark("005") → true/false
} from "./saveSystem.js";
```

### Das Event-System

Das Speichersystem kommuniziert über **Custom Events** – so muss `saveSystem.js` nichts über `validation.js` oder die Spiele wissen (lose Kopplung).

```javascript
// Wird von validation.js gefeuert wenn eine Quiz-Antwort gegeben wird:
document.dispatchEvent(new CustomEvent("fiae:quizAnswer", {
  detail: { correct: true, moduleId: "005" }
}));

// Wird von jedem Spiel gefeuert wenn eine Runde endet:
document.dispatchEvent(new CustomEvent("fiae:gameEnd", {
  detail: { game: "binary", stats: { played: 1, correct: 1 } }
}));
```

`saveSystem.js` hört auf beide Events und aktualisiert Statistiken, XP und Erfolge automatisch.
