# Kapitel 8: Die Spiele

Neben den klassischen Quiz-Modulen bietet die App drei interaktive **Lernspiele**, die Prüfungsinhalte durch Wiederholung und spielerische Mechaniken verankern. Alle Spiele sind in `js/games/` zu finden.

---

## 8.1 Architektur: Wie ein Spiel gebaut ist

Jedes Spiel folgt demselben einfachen Muster. Das sorgt dafür, dass die App neue Spiele einfach hinzufügen kann, ohne sich um den Rest zu kümmern.

```javascript
// Jede Spiel-Datei exportiert genau zwei Funktionen:

export function launchXYZ(container, onBack) {
  // Wird von app.js aufgerufen
  // container: das HTML-Element, in das das Spiel gezeichnet wird
  // onBack: Funktion, die aufgerufen wird wenn "Zurück" geklickt wird
}

export function cleanupXYZ() {
  // Räumt auf: Event-Listener entfernen, Timer stoppen
  // Wird von app.js aufgerufen bevor ein neues Modul geladen wird
}
```

**Wann wird `cleanup` aufgerufen?**  
Wenn der Nutzer z.B. aus einem Spiel heraus auf einen Modul-Link klickt, würde der Spiel-Timer weiterlaufen und Events feuern, auch wenn das Spiel gar nicht mehr sichtbar ist. `cleanup` verhindert das.

**Das Spiel-Ende-Event:**  
Am Ende jeder Spielrunde feuert das Spiel:

```javascript
document.dispatchEvent(new CustomEvent("fiae:gameEnd", {
  detail: { game: "spielname", stats: { /* Statistiken */ } }
}));
```

Das Speichersystem hört darauf und aktualisiert Achievements und XP.

---

## 8.2 Blitzkarten (`js/games/blitzkarten.js`)

### Was ist das?

Das **älteste und einfachste** der drei Spiele. Es funktioniert wie klassische Karteikarten:

1. Eine Karte zeigt die **Vorderseite** (Frage / Begriff).
2. Der Nutzer überlegt die Antwort.
3. Klick → Karte dreht sich um, zeigt die **Rückseite** (Antwort / Erklärung).
4. Der Nutzer bewertet sich selbst: **„Gewusst" ✅** oder **„Nicht gewusst" ❌**.

### Woher kommen die Karten?

Die Karten werden aus den **Quiz-JSON-Daten** der Module erzeugt. Jede Quiz-Frage wird zur Vorderseite, die Erklärung (`explanation`) oder die korrekte Antwort wird zur Rückseite.

### Das Streak-System

Eine der Kernmechaniken ist der **Streak** (Serie):

```
Richtig → Richtig → Richtig → Richtig → Richtig
                              Streak: 5 🔥🔥🔥
```

Ab einem bestimmten Streak erscheinen Feuer-Emojis. Das motiviert dazu, die Karten wirklich zu lernen und nicht einfach durchzuklicken.

### Statistiken

Am Ende einer Karteikarten-Session werden angezeigt:
- Gesamtzahl Karten
- Davon gewusst / nicht gewusst
- Höchster Streak der Session

Diese werden via `fiae:gameEnd` ans Speichersystem übergeben.

---

## 8.3 Subnetz-Trainer (`js/games/subnetz.js`)

### Was ist das?

Der **Subnetz-Trainer** ist ein interaktives Werkzeug, um IPv4-Subnetting zu üben – eines der häufigsten Themen in der AP1-Prüfung.

Das Spiel generiert **zufällige IPv4-Aufgaben** und erwartet berechnete Antworten.

### Die 4 Aufgabentypen

| Typ | Beispielaufgabe | Erwartet |
|---|---|---|
| Netzadresse | Was ist die Netzadresse von 192.168.1.50/24? | 192.168.1.0 |
| Broadcast | Was ist die Broadcast-Adresse von 10.0.0.1/28? | 10.0.0.15 |
| Anzahl Hosts | Wie viele Hosts passen in /26? | 62 |
| IP-Klasse | Welcher Klasse gehört 172.16.0.1 an? | Klasse B |

### Die Eingabe

IP-Adressen werden in **4 separate Eingabefelder** (eines pro Oktet) eingetippt:

```
[ 192 ] . [ 168 ] . [ 1 ] . [ 0 ]
```

Das verhindert Tippfehler durch falsche Trennzeichen und macht die Eingabe übersichtlicher.

### Das Hinweissystem

Wenn eine Antwort falsch ist, kann der Nutzer **schrittweise Hilfen** aufrufen:

- **Hinweis 1:** Allgemeiner Tipp (z.B. "Schaue dir die Subnetzmaske an")
- **Hinweis 2:** Schritt-für-Schritt-Rechenweg
- **Hinweis 3:** Die vollständige Lösung mit Erklärung

### Statistiken & Beststreak

Die Statistiken (gespielte Runden, korrekte Antworten, Beststreak) werden persistent in `localStorage` gespeichert: `fiae_sn_stats`. Sie bleiben also auch nach einem Browser-Neustart erhalten.

Zusätzlich gibt es einen optionalen **Timer-Modus**, bei dem jede Aufgabe innerhalb einer Zeit gelöst werden muss.

---

## 8.4 Binär-Trainer (`js/games/binary.js`)

### Was ist das?

Der **Binär-Trainer** ist der komplexeste der drei Trainer. Er übt Umrechnungen zwischen Zahlensystemen und bitweise Operatoren – ebenfalls häufige AP1-Themen.

### Die 9 Aufgabentypen

| Typ | Aufgabe |
|---|---|
| `dec_to_bin` | Dezimalzahl → Binär |
| `bin_to_dec` | Binär → Dezimalzahl |
| `dec_to_hex` | Dezimalzahl → Hexadezimal |
| `hex_to_dec` | Hexadezimal → Dezimalzahl |
| `bin_to_hex` | Binär → Hexadezimal |
| `hex_to_bin` | Hexadezimal → Binär |
| `bit_and` | Bitweises AND zweier Zahlen |
| `bit_or` | Bitweises OR zweier Zahlen |
| `bit_shift` | Bitweiser Shift (links / rechts) |

### Die 3 Eingabe-Pads

Je nach erwarteter Antwort erscheint ein anderes Eingabe-Interface:

**Bit-Pad** (für Binärantworten):
```
[ 1 ][ 0 ][ 1 ][ 1 ][ 0 ][ 0 ][ 1 ][ 0 ]
```
Einzelne Bit-Buttons, die per Klick zwischen 0 und 1 togglen.

**Hex-Pad** (für Hexadezimal-Antworten):
```
[ 0 ][ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ][ 7 ][ 8 ][ 9 ]
[ A ][ B ][ C ][ D ][ E ][ F ]  [⌫ Löschen]
```

**Num-Pad** (für Dezimalantworten):
```
[ 7 ][ 8 ][ 9 ]
[ 4 ][ 5 ][ 6 ]
[ 1 ][ 2 ][ 3 ]
[ 0 ][     ⌫ ]
```

### Schwierigkeitsstufen

Das Spiel hat 3 Schwierigkeitsstufen, die die Wertebereiche der zufällig generierten Zahlen bestimmen:

| Stufe | Wertebereich |
|---|---|
| Einfach | 0–15 (4 Bit) |
| Mittel | 0–255 (8 Bit) |
| Schwer | 0–65535 (16 Bit) |

### Timer-Modus

Im Timer-Modus läuft ein Countdown pro Aufgabe. Wenn die Zeit abläuft, wird die Aufgabe als falsch gewertet. Das schult Prüfungsstress und schnelles Rechnen.

### Statistiken

Werden persistent in `localStorage: fiae_bn_stats` gespeichert.

---

## 8.5 Spiel hinzufügen: Schritt-für-Schritt

Wenn Sie ein neues Spiel integrieren möchten:

**1. Datei erstellen** in `js/games/neuesspiel.js` mit `launchNeuesSpiel()` und `cleanupNeuesSpiel()`.

**2. In `js/app.js` importieren:**
```javascript
import { launchNeuesSpiel, cleanupNeuesSpiel } from "./games/neuesspiel.js";
```

**3. Button in `index.html` hinzufügen** (in der Spiele-Sektion der Sidebar):
```html
<button id="neuesSpielBtn" class="sidebar-game-btn">
  🎯 Neues Spiel
</button>
```

**4. Event-Listener in `app.js` registrieren** (innerhalb `init()`):
```javascript
document.getElementById("neuesSpielBtn")?.addEventListener("click", () => {
  closeSidebar();
  launchNeuesSpiel(contentEl, () => { setActiveTab("spiele"); showGamesScreen(); });
});
```

**5. Beim Spielende das Event feuern:**
```javascript
document.dispatchEvent(new CustomEvent("fiae:gameEnd", {
  detail: { game: "neuesspiel", stats: { played: 1, correct: 1 } }
}));
```

**6. Service Worker updaten** – neue Datei in `ASSETS_TO_CACHE` in `sw.js` eintragen und Version erhöhen.
