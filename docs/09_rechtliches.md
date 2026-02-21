# Kapitel 9: Rechtliches & Compliance

Dieses Kapitel dokumentiert die rechtliche Grundlage der App, die Datenschutzarchitektur und alle Compliance-Entscheidungen.

---

## 9.1 Lizenz

Die App steht unter einer **proprietären Lizenz** (All Rights Reserved).

```
Copyright (c) 2026 Mindoro Evolution
Alle Rechte vorbehalten.
```

**Das bedeutet konkret:**
- ✅ Private, nicht-kommerzielle Nutzung erlaubt
- ❌ Kein Kopieren oder Weitergeben des Quellcodes
- ❌ Keine kommerzielle Verwertung
- ❌ Kein Erstellen von abgeleiteten Werken ohne schriftliche Genehmigung

Die vollständige Lizenzdatei liegt unter `LICENSE` im Projektroot.

---

## 9.2 Datenschutz-Architektur (Privacy by Design)

Die App wurde von Grund auf datenschutzfreundlich gebaut. Das ist kein nachträgliches Pflaster, sondern eine bewusste Architekturentscheidung.

### Grundprinzip: Alles bleibt lokal

```
Nutzerdaten
    ↓
localStorage des Browsers    ← Geräteschlüssel + Backup
    ↓
optionale .fiae-Datei        ← Verschlüsselt, liegt beim Nutzer
    ↓
Nirgendwo sonst
```

**Es gibt keinen Server, der Nutzerdaten empfängt.**

### Was wird wo gespeichert?

| localStorage-Schlüssel | Inhalt |
|---|---|
| `fiae_device_key_v1` | AES-256-Schlüssel (Base64) |
| `fiae_save_backup_v1` | Lernstand-Backup (verschlüsselt) |
| `fiae_sn_stats` | Subnetz-Trainer Statistiken (JSON) |
| `fiae_bn_stats` | Binär-Trainer Statistiken (JSON) |

### Was wird NICHT gespeichert / übertragen?

- ❌ Keine Cookies
- ❌ Kein Tracking / Analytics (kein Google Analytics, kein Matomo)
- ❌ Keine externen Skripte in der Produktions-App
- ❌ Keine Nutzerdaten auf Servern
- ❌ Keine IP-Adresse gespeichert
- ❌ Keine Identifikationsdaten (kein Name, keine E-Mail – nur ein selbst gewählter Anzeigename lokal)

### fetch()-Aufrufe

Die App macht genau einen Typ von Netzwerk-Requests: das Laden der eigenen Quiz-JSON-Dateien.

```javascript
// state.js
fetch(`./FI_Learning/quiz/modules/${moduleId}.quiz.json`)
```

Das ist eine **relative URL** – die Datei liegt im selben Verzeichnis wie die App selbst. Es wird kein externer Server angefragt.

---

## 9.3 Rechtsgrundlagen (DSGVO)

Obwohl die App keine personenbezogenen Daten an Server überträgt, speichert sie technisch notwendige Daten lokal. Die Rechtsgrundlagen dafür:

| Verarbeitung | Rechtsgrundlage |
|---|---|
| localStorage für Lernstand | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung / Dienst) |
| Service Worker Cache | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: Offline-Nutzung) |
| Optionale Speicherdatei | Art. 6 Abs. 1 lit. a DSGVO (Einwilligung durch aktiven Nutzerentscheid) |

> Da alle Daten ausschließlich lokal verbleiben, ist der Verantwortliche nicht in der Lage, auf diese Daten zuzugreifen – der Nutzer hat volle Kontrolle.

---

## 9.4 Die rechtlichen Dokumente

| Datei | Inhalt | Zielgruppe |
|---|---|---|
| `LICENSE` | Proprietäre Nutzungslizenz | Entwickler / andere Nutzende des Codes |
| `datenschutz.html` | DSGVO-Datenschutzerklärung | Endnutzer |
| `agb.html` | Nutzungsbedingungen (§§1–10) | Endnutzer |
| Impressum (extern) | Pflichtangaben § 5 TMG | Endnutzer / Behörden |

### Datenschutzerklärung (`datenschutz.html`)

Deckt ab:
1. Verantwortlicher (verlinkt auf Impressum)
2. Überblick: kein Tracking, keine externen Server
3. Tabelle aller localStorage-Schlüssel mit Zweck
4. Keine Datenübertragung
5. Service Worker Erklärung
6. Rechtsgrundlagen (Art. 6 DSGVO)
7. Betroffenenrechte (Art. 15–22 DSGVO)
8. Beschwerderecht bei Aufsichtsbehörde
9. Hinweis zur Entwickler-Testumgebung

### AGB (`agb.html`)

Kernaussagen:
- **§2:** App ist privates Lernhilfsmittel, Anbieter ist Privatperson – keine offizielle Prüfungsinstanz
- **§3:** Vollständiger Haftungsausschluss für inhaltliche Fehler
- **§4:** Keine Prüfungs- oder Erfolgsgarantie
- **§5:** Allgemeine Haftungsbeschränkung
- **§6:** Urheberrechtsschutz (kein Copy/Weitergabe durch Nutzer)
- **§9:** Deutsches Recht als Gerichtsstand
- **§10:** Salvatorische Klausel

---

## 9.5 Entwickler-Testumgebung (Hinweis)

Das Verzeichnis `tests/` lädt beim Ausführen externe Ressourcen von `unpkg.com` (Chai + Mocha für Tests).

**Das ist kein Bestandteil der Produktions-App.**

- Der Service Worker cachet die `tests/`-Dateien nicht.
- Endnutzer gelangen nicht in diese Umgebung.
- Bei sensiblen Deployments: `tests/`-Ordner aus der Produktions-Auslieferung ausschließen.

---

## 9.6 Checkliste: Vor dem ersten öffentlichen Release

- [ ] Impressum vollständig befüllt (Anschrift, E-Mail)
- [ ] E-Mail in Datenschutzerklärung eingetragen
- [ ] `LICENSE`-Datei geprüft
- [ ] `tests/`-Ordner aus Produktion ausgeschlossen (optional)
- [ ] Service Worker Version stimmt mit aktuellem Deployment überein
- [ ] Alle neuen Dateien in `ASSETS_TO_CACHE` in `sw.js` eingetragen
