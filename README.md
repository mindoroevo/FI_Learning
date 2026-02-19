# FI Learning

Open-Source-Lernmaterialien und Quiz-Inhalte zur Vorbereitung auf die AP1 (FIAE).
Das Repository kombiniert Lernunterlagen, modulare Themenaufbereitung und eine kleine
webbasierte Lernapp auf Basis von HTML, CSS und JavaScript.

## Ziele

- AP1-relevante Inhalte strukturiert und nachvollziehbar bereitstellen
- Inhalte modular pflegen und leicht erweitern
- Lernen mit einer einfachen lokalen Web-App unterstuetzen

## Projektstruktur

```text
FI_Learning/
|- handbuch_ap1_fiae_f26.md
|- modulares_handbuch_ap1_fiae_f26.md
|- pruefungsrelevante_themen.md
|- module_001_014/
|  |- README.md
|  |- 001_pruefungsrahmen_ap1.md
|  |- ...
|- quiz/
|  |- quiz_bank_ap1_fiae_f26.json
|  |- modules/
|     |- 001.quiz.json
|     |- ...
|- lernapp/
   |- index.html
   |- app.css
   |- js/
   |- tests/
   |- docs/
```

## Inhalte im Detail

- `FI_Learning/handbuch_ap1_fiae_f26.md`: kompaktes Haupt-Handbuch
- `FI_Learning/modulares_handbuch_ap1_fiae_f26.md`: modulorientierte Darstellung
- `FI_Learning/pruefungsrelevante_themen.md`: Fokus auf AP1-relevante Inhalte
- `FI_Learning/module_001_014/`: einzelne Themenmodule als Markdown-Dateien
- `FI_Learning/quiz/`: zentrale Quizdaten und modulbezogene Fragen
- `FI_Learning/lernapp/`: lokale Lernapp inkl. Tests und technischer Doku

## Schnellstart

1. Repository klonen:

```bash
git clone <repo-url>
cd dowload
```

2. Lernunterlagen lesen:
- Starte mit `FI_Learning/pruefungsrelevante_themen.md`
- Vertiefe danach ueber die Dateien in `FI_Learning/module_001_014/`

3. Lernapp lokal starten:
- Direkt: `FI_Learning/lernapp/index.html` im Browser oeffnen
- Optional mit lokalem Server (empfohlen):

```bash
cd FI_Learning/lernapp
python -m http.server 5500
```

Dann im Browser:

```text
http://localhost:5500
```

## Entwicklung und Pflege

- Die Lernapp ist bewusst framework-frei gehalten (Vanilla HTML/CSS/JS).
- Neue Inhalte koennen direkt als Markdown-Module oder Quiz-JSON ergaenzt werden.
- Weiterfuehrende technische Hinweise stehen in:
  - `FI_Learning/lernapp/DEVELOPER_GUIDE.md`
  - `FI_Learning/lernapp/docs/index.md`

## Beitragen

Beitraege sind willkommen.

1. Issue erstellen oder bestehende Diskussion aufgreifen
2. Branch fuer die Aenderung anlegen
3. Klar abgegrenzte Commits mit verstaendlichen Messages erstellen
4. Pull Request mit kurzer Beschreibung und Testhinweisen oeffnen

## Open Source Lizenz

Dieses Projekt ist unter der MIT-Lizenz veroeffentlicht.
Details stehen in `LICENSE`.

## Hinweis

Die Inhalte werden kontinuierlich erweitert. Trotz Sorgfalt kann es fachliche
oder formale Fehler geben. Verbesserungen per Issue oder Pull Request sind
ausdruecklich erwuenscht.
