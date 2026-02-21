# 002 – Bedarfsermittlung & Anforderungsanalyse (Vollständiger Deep Dive)


## Kapitelübersicht
1. Was ist Bedarfsermittlung eigentlich? (Grundlagen erklärt)
2. Die 3 Ebenen der Anforderungen (Business, User, System)
3. Wer will was? (Stakeholder-Analyse)
4. Lastenheft vs. Pflichtenheft (Der Klassiker erklärt)
5. Priorisierung mit MoSCoW (Was ist wirklich wichtig?)
5b. SMART-Kriterien: Anforderungen mess- und prüfbar machen *(neu)*
6. Von der Aufgabe zur Hardware (Transferleistung)
7. Fehleranalyse & Troubleshooting in der Anforderungsermittlung
8. AP1-Prüfungsfokus: So wird es konkret gefragt
9. Vollständige Fallstudien (3 Schwierigkeitsstufen)
10. Übungen mit Musterlösungen
11. Zusammenfassung & Selbsttest

---

## 1) Was ist Bedarfsermittlung eigentlich?

### 1.1 Das Fundament jedes Projekts

In der AP1-Prüfung (und im echten Leben) beginnt fast jede Aufgabe damit, dass jemand etwas "will". 
Die **Bedarfsermittlung** (oder Anforderungsanalyse) ist der Prozess, herauszufinden, was **genau** benötigt wird.

**Warum ist das so wichtig?**
Stell dir vor, du baust ein Haus. Wenn das Fundament schief ist, stürzt später alles ein. In der IT ist es genauso:
- Wenn du die Anforderungen nicht kennst, kaufst du die falsche Hardware.
- Wenn du die falsche Hardware kaufst, funktioniert die Software nicht.
- Wenn die Software nicht funktioniert, kann der Mitarbeiter nicht arbeiten.
- **Folge:** Du hast viel Geld ausgegeben und das Problem nicht gelöst.

**Das "Eisberg-Problem" in der IT**
Kunden sagen oft nur das Offensichtliche: *"Ich brauche einen Computer zum Arbeiten"*. 
Das ist nur die Spitze des Eisbergs (ca. 10%).
Unter der Wasserlinie liegen die **echten, unsichtbaren Probleme** (90%):
- *"Muss es gegen Spritzwasser geschützt sein?"* (Baustelle/Werkstatt?)
- *"Muss es besonders leise sein?"* (Großraumbüro?)
- *"Muss es in das alte Netzwerk passen?"* (Kompatibilität)
- *"Darf es maximal 500€ kosten?"* (Budget)

**Dein Job in der AP1:** Tauche unter die Wasserlinie und finde die 90% der versteckten Anforderungen!

### 1.2 Häufige Missverständnisse

❌ **Fehlvorstellung 1:** "Anforderungen ermitteln bedeutet, den Kunden zu fragen, welchen Computer er will."  
✅ **Richtig ist:** Der Kunde kennt oft gar nicht die technischen Möglichkeiten. Er beschreibt nur das Problem ("Excel ist zu langsam"). DU musst die Ursache herausfinden (zu wenig RAM? Langsame HDD?) und die Lösung vorschlagen.

❌ **Fehlvorstellung 2:** "Lastenheft und Pflichtenheft sind dasselbe, nur mit verschiedenen Namen."  
✅ **Richtig ist:** Lastenheft kommt VOM Kunden (Was will er?), Pflichtenheft kommt VON DIR (Wie machst du es?). Das sind zwei völlig unterschiedliche Dokumente zu verschiedenen Zeitpunkten.

❌ **Fehlvorstellung 3:** "Anforderungsanalyse mache ich nur am Anfang des Projekts."  
✅ **Richtig ist:** Anforderungen können sich ändern! Wenn während der Umsetzung neue Probleme auftauchen, musst du nachfragen und die Anforderungen anpassen. Das nennt man "iterativ".

❌ **Fehlvorstellung 4:** "Je teurer die Hardware, desto besser die Lösung."  
✅ **Richtig ist:** **Over-Engineering** (zu viel Leistung für den Bedarf) ist genauso falsch wie **Under-Engineering**. In der Prüfung gibt es Punktabzug für unwirtschaftliche Lösungen!

❌ **Fehlvorstellung 5:** "Alle Anforderungen sind gleich wichtig."  
✅ **Richtig ist:** Deshalb gibt es MoSCoW-Priorisierung! "Must-Have" geht vor "Nice-to-Have". Bei knappem Budget musst du Prioritäten setzen.

### 1.3 Anforderung vs. Wunsch

Ein wichtiger Unterschied für die Prüfung:
- **Wunsch:** "Ich hätte gerne den neuesten Gaming-Laptop mit RGB-Beleuchtung."
- **Anforderung:** "Ich benötige ein mobiles Gerät mit dedizierter Grafikkarte für 3D-Rendering."

**Was bedeutet das für dich?**
Du musst lernen, "Nein" zu sagen, wenn ein Wunsch technisch oder wirtschaftlich keinen Sinn macht, aber "Ja" zur Lösung des Problems.

### 1.4 Fachbegriffe präzise erklärt

| Begriff | Definition | Englisch | Synonym |
|---------|------------|----------|---------|
| **Anforderung** | Eine messbare, überprüfbare Eigenschaft, die ein System erfüllen muss | Requirement | Erfordernis |
| **Stakeholder** | Jede Person/Gruppe, die Interesse am Projekt hat | Stakeholder | Interessengruppe |
| **Lastenheft** | Dokument des Auftraggebers mit allen Anforderungen | Customer Specification | - |
| **Pflichtenheft** | Dokument des Auftragnehmers mit der Umsetzung | Functional Specification | - |
| **MoSCoW** | Priorisierungsmethode (Must, Should, Could, Won't) | MoSCoW | - |
| **SMART** | Qualitätskriterien für Anforderungen (Spezifisch, Messbar, Akzeptiert, Realistisch, Terminiert) | SMART criteria | - |
| **Bedarfsanalyse** | Ermittlung dessen, was wirklich benötigt wird | Needs Analysis | Anforderungsanalyse |
| **Funktionale Anf.** | Was soll das System TUN? (Funktionen) | Functional Req. | - |
| **Nicht-funkt. Anf.** | WIE soll es sein? (Leistung, Sicherheit, Design) | Non-functional Req. | Qualitätsanf. |

---

## 2) Die 3 Ebenen der Anforderungen

Damit du in der Prüfung Struktur in deine Antworten bringst, unterscheiden wir drei Ebenen. Das hilft dir, Punkte zu sammeln, weil du zeigst, dass du das "Große Ganze" verstehst.

### 2.1 Ebene 1: Geschäftsanforderungen (Business Requirements)
Hier geht es um das **Unternehmen**. Was bringt das Projekt der Firma?

**Typische Fragen:**
- *Warum machen wir das überhaupt?*
- *Was ist das wirtschaftliche Ziel?*

**Beispiel:**
> "Der Außendienst soll 20% mehr Kunden pro Tag besuchen können."

### 2.2 Ebene 2: Benutzeranforderungen (User Requirements)
Hier geht es um den **Mitarbeiter**. Was muss er tun, um das Unternehmensziel zu erreichen?

**Typische Fragen:**
- *Was macht der Nutzer den ganzen Tag?*
- *Welche Aufgaben muss er erledigen?*

**Beispiel:**
> "Herr Müller muss unterwegs Zugriff auf aktuelle Kundendaten haben und Verträge direkt beim Kunden digital unterschreiben lassen."

### 2.3 Ebene 3: Systemanforderungen (System Requirements)
Hier geht es um die **Technik**. Welche Eigenschaften muss das System haben, um die Benutzeranforderungen zu erfüllen?

**Typische Fragen:**
- *Welche Hardware/Software brauchen wir dafür?*

**Beispiel (Anhand von Ebene 2 abgeleitet):**
- "Unterwegs Zugriff" -> **LTE-Modul** oder **VPN-Client**.
- "Digital unterschreiben" -> **Touchscreen** mit **Stift-Eingabe**.
- "Verträge (Datenschutz)" -> **Verschlüsselte Festplatte (BitLocker)**.

**Merke:** In der AP1 bekommst du meist Ebene 1 & 2 im Text und musst Ebene 3 (die Hardware/Software) daraus ableiten!

---

## 3) Wer will was? (Stakeholder-Analyse)

Ein "Stakeholder" ist jeder, der ein Interesse am Projekt hat. In Prüfungsszenarien verstecken sich oft verschiedene Rollen mit unterschiedlichen Interessen. Wenn du diese erkennst, regnet es Punkte.

### 3.1 Die typischen AP1-Rollen und ihre "Brillen"

| Rolle | Fokus / "Brille" | Typische Aussage im Text | Deine Übersetzung für die Lösung |
|-------|------------------|--------------------------|-----------------------------------|
| **Geschäftsleitung** | Geld, Zeit, Image | "Darf nicht viel kosten", "Muss morgen fertig sein" | **Wirtschaftlichkeit:** TCO beachten, Lieferzeiten prüfen. |
| **Fachabteilung** | Funktion, Leistung | "Es muss schnell gehen", "Ich brauche Programm X" | **Performance:** SSD, viel RAM, starke CPU. |
| **IT-Abteilung** | Sicherheit, Wartung | "Nicht noch ein Extrawurst-System", "Sicher muss es sein" | **Betrieb:** Standard-Hardware, Fernwartung, Updates. |
| **Datenschutz** | Rechtliches, DSGVO | "Kundendaten schützen", "Nichts verlieren" | **Security:** Verschlüsselung, Blickschutzfilter, Kensington-Lock. |
| **Betriebsrat** | Ergonomie, Überwachung | "Mitarbeiter sollen gesund bleiben", "Keine Kontrolle" | **Ergonomie:** Höhenverstellbare Monitore, keine Keylogger. |

### 3.2 Warum ist das wichtig?
Oft steht in der Aufgabe: *"Berücksichtigen Sie bei der Auswahl die Interessen aller Beteiligten."*
Dann musst du schreiben:
> "Ich wähle den Laptop X, weil er leistungsstark genug für die Fachabteilung ist (i7 Prozessor), aber durch den Mengenrabatt auch die Anforderungen der Geschäftsleitung (Kosten) erfüllt."

---

## 4) Lastenheft vs. Pflichtenheft (Der Klassiker erklärt)

Das ist eine der häufigsten Fragen (auch in der mündlichen Prüfung). Verwechsle diese beiden Dokumente **niemals**.

### 4.1 Das Lastenheft (Vom Auftraggeber)
**"Was ist meine Last?"**

- **Autor:** Der Kunde (Auftraggeber).
- **Inhalt:** Alle Anforderungen, Wünsche und Ziele.
- **Frage:** WAS soll gemacht werden? WOFÜR wird es gebraucht?
- **Stil:** Lösungsneutral (beschreibt das Problem, nicht die Technik).

**Beispiel im Lastenheft:**
> "Das System muss 500 gleichzeitige Benutzer verwalten können und datenschutzkonform sein."

### 4.2 Das Pflichtenheft (Vom Auftragnehmer - DU!)
**"Wie erfülle ich meine Pflicht?"**

- **Autor:** Du (Auftragnehmer / IT-Dienstleister).
- **Inhalt:** Die genaue Beschreibung der Umsetzung.
- **Frage:** WIE und WOMIT setze ich es um?
- **Stil:** Technisch detailliert.

**Beispiel im Pflichtenheft:**
> "Wir installieren einen Cluster aus 2 Servern mit Windows Server 2022 und einer SQL-Datenbank. Die Daten werden per AES-256 verschlüsselt."

### 4.3 Die Eselsbrücke
- **L**astenheft = **L**ast des Kunden (er hat ein Problem).
- **P**flichtenheft = **P**flicht des Profis (du lieferst die Lösung).

### 4.4 Gegenüberstellung

| Merkmal | Lastenheft | Pflichtenheft |
|---------|------------|---------------|
| **Wer schreibt es?** | Auftraggeber (Kunde) | Auftragnehmer (Du) |
| **Wann?** | Ganz am Anfang | Nach dem Lastenheft, vor der Umsetzung |
| **Was steht drin?** | Forderungen ("Wir wollen...") | Realisierung ("Wir machen...") |
| **Detaillierung** | Grob, fachlich | Fein, technisch |

---

## 5) Priorisierung mit MoSCoW (Was ist wirklich wichtig?)

In der Prüfung (und Realität) reichen Budget und Zeit nie für alles. Du musst entscheiden, was weggelassen wird. Dafür gibt es die **MoSCoW-Methode**.

### 5.1 Was bedeuten die Buchstaben?

#### **M - Must have (Muss)**
- **Definition:** Unverzichtbar. Ohne diese Funktion ist das Produkt nutzlos oder illegal.
- **Beispiel:** "Laptop muss angehen", "Muss Internetzugang haben (für Cloud-Arbeit)".
- **Folge bei Fehlen:** Projektabbruch / Durchfall.

#### **S - Should have (Soll)**
- **Definition:** Sehr wichtig. Sollte dabei sein, wenn möglich. Wenn es fehlt, tut es weh, aber man kann (mit Umwegen) arbeiten.
- **Beispiel:** "Dockingstation" (man kann auch Kabel einzeln stecken, nervt aber).

#### **C - Could have (Kann)**
- **Definition:** Wünschenswert ("Nice-to-have"). Erhöht die Zufriedenheit, ist aber für die reine Funktion egal. Wird als erstes gestrichen, wenn das Geld fehlt.
- **Beispiel:** "Beleuchtete Tastatur", "Tasche in Firmenfarbe", "Besonders leicht".

#### **W - Won't have (Wird nicht)**
- **Definition:** Bewusst für dieses Mal ausgeschlossen (vielleicht im nächsten Release).
- **Beispiel:** "Touchscreen" (wir kaufen normale Monitore, um Geld zu sparen).

### 5.2 Anwendung in der AP1-Aufgabe
Oft heißt es: *"Der Kunde hat ein Budget von 1000€. Wählen Sie aus der Liste geeignete Komponenten und begründen Sie, was Sie weglassen."*

**Antwort-Strategie:**
1. Identifiziere die **Must-Haves** (z.B. Leistung für die Software). Die kaufst du.
2. Nimm die **Should-Haves** dazu, solange Budget da ist.
3. Streiche die **Could-Haves** und begründe es mit Kosteneffizienz.

---

## 5b) SMART-Kriterien: Anforderungen mess- und prüfbar machen

### 5b.1 Was sind SMART-Kriterien?

Eine Anforderung ist nur dann wirklich nützlich, wenn man später überprüfen kann, ob sie erfüllt wurde. Dafür gibt es die **SMART-Methode** – ein Qualitätscheck für jede einzelne Anforderung:

| Buchstabe | Bedeutung | Beispiel ✅ gut | Beispiel ❌ schlecht |
|-----------|-----------|----------------|---------------------|
| **S** – Spezifisch | Die Anforderung ist eindeutig, kein Interpretationsspielraum | „Notebook mit 15,6-Zoll-Display" | „Großes Notebook" |
| **M** – Messbar | Es gibt einen konkreten Wert zur Überprüfung | „Akkulaufzeit ≥ 8 Stunden" | „Langer Akku" |
| **A** – Akzeptiert | Alle relevanten Stakeholder haben zugestimmt | „Von IT und Geschäftsleitung genehmigt" | „Ich dachte, das ist selbstverständlich" |
| **R** – Realistisch | Die Anforderung ist mit Budget und Technik machbar | „16 GB RAM für max. 1.500€" | „128 GB RAM für 500€" |
| **T** – Terminiert | Es gibt eine klare Frist / einen Liefertermin | „Lieferung bis 01.03.2026" | „Möglichst bald" |

### 5b.2 Warum sind SMART-Kriterien so wichtig?

**Nicht-SMART-Anforderungen** sind die häufigste Ursache für Streit zwischen Kunde und IT-Dienstleister:

> **Kunde:** „Ich habe gesagt, der PC soll schnell sein!"  
> **IT:** „Er ist schnell – startet in 5 Sekunden!"  
> **Kunde:** „Ich meinte, Excel öffnet große Dateien in unter einer Sekunde!"

Hätte die Anforderung gelautet: **„Excel öffnet Dateien bis 50 MB in unter 2 Sekunden"** → keine Diskussion möglich. Das ist SMART.

**AP1-Tipp:** Wenn du Anforderungen formulierst, prüfe kurz: *„Kann man später objektiv feststellen, ob das erfüllt wurde?"* → Wenn ja: SMART. Wenn nein: messbaren Wert oder Frist ergänzen.

### 5b.3 SMART-Anforderungen in der AP1-Praxis

| AP1-Kontext | ❌ Nicht-SMART (schlecht) | ✅ SMART (gut) |
|-------------|--------------------------|----------------|
| Arbeitsspeicher | „Viel RAM" | „Arbeitsspeicher ≥ 16 GB DDR5, Dual-Channel" |
| Mobilität | „Langer Akku" | „Akkulaufzeit ≥ 8 Stunden (JEITA-Office-Benchmark)" |
| Lieferung | „Schnell lieferbar" | „Lieferung spätestens bis 01.03.2026" |
| Budget | „Günstig" | „TCO über 5 Jahre ≤ 3.000€ pro Arbeitsplatz" |
| Datenschutz | „Sicher" | „Festplattenverschlüsselung via BitLocker mit TPM 2.0" |

### 5b.4 Häufige Missverständnisse

❌ **Missverständnis:** „SMART gilt nur für Projektziele, nicht für Hardware-Anforderungen."  
✅ **Richtig:** SMART gilt für **jede** Anforderung – Hardware, Software, Service-Level und Liefertermine.

❌ **Missverständnis:** „Wenn etwas messbar ist, ist es automatisch realistisch."  
✅ **Richtig:** „64 GB RAM für 50€" ist messbar, aber nicht realistisch. SMART erfordert, dass **alle fünf** Kriterien erfüllt sind.

### 5b.5 Verbindung zu Lastenheft und MoSCoW

SMART-Kriterien und MoSCoW ergänzen sich direkt:
- **MoSCoW** beantwortet: *Wie wichtig ist diese Anforderung?* (Priorität)
- **SMART** beantwortet: *Ist diese Anforderung klar und überprüfbar formuliert?* (Qualität)

In einem sauber geschriebenen **Lastenheft** sind alle Must-Have-Anforderungen SMART formuliert.  
Could-Haves dürfen zunächst unscharfer sein – sie werden erst SMART gemacht, wenn sie ins **Pflichtenheft** übernommen werden.

🧠 **Eselsbrücke:**  
**„S**chreib **M**essbare **A**ngaben, **R**ealistisch **T**erminiert!"  
→ Spezifisch · Messbar · Akzeptiert · Realistisch · Terminiert

---

## 6) Von der Aufgabe zur Hardware (Transferleistung)

Wie übersetzt du jetzt einen Text in technische Daten? Das ist die Kernkompetenz "Fachinformatiker".

### 6.1 Die Übersetzungs-Tabelle

Hier sind typische Signalwörter aus AP1-Prüfungen und was sie technisch bedeuten:

| Signalwort im Text | Technische Übersetzung (Hardware/Software) |
|--------------------|--------------------------------------------|
| "Muss viele Programme gleichzeitig offen haben" | **Viel RAM** (min. 16GB, besser 32GB) |
| "Arbeitet mit großen Datenbanken / Videobearbeitung" | **Schnelle Massenspeicher** (NVMe SSD) & viel RAM |
| "Macht CAD / 3D-Zeichnungen / Rendering" | **Je nach Workload dedizierte Grafikkarte** (GPU), bei anspruchsvollen Modellen/Rendering oft erforderlich; einfache 2D-Aufgaben können mit integrierter Grafik auskommen |
| "Arbeitet im Zug / Café / Außendienst" | **Blickschutzfilter**, **LTE/5G-Modul**, lange **Akkulaufzeit**, **Mattes Display** |
| "Vertrauliche Personaldaten / Finanzdaten" | **Verschlüsselung** (TPM-Chip, BitLocker), **Biometrie** (Fingerprint/IR-Kamera) |
| "Präsentiert oft beim Kunden" | **Anschlüsse** (HDMI/USB-C für Beamer), **Convertible**-Funktion |
| "Viel Videokonferenz" | Gute **Webcam** (FHD), **Headset** mit Noise-Cancelling |

### 6.2 Beispiel-Transfer
**Text:** *"Herr Meier aus der Buchhaltung beschwert sich, dass Excel beim Öffnen der Jahresbilanz (500MB Datei) immer abstürzt."*

**Analyse:**
- Problem: Datei ist groß und muss in den Arbeitsspeicher geladen werden.
- Lösung: **RAM aufrüsten** (z.B. von 8GB auf 16GB/32GB).
- Falsche Lösung: Neue Grafikkarte (bringt für Excel nichts).

---

## 7) Fehleranalyse & Troubleshooting in der Anforderungsermittlung

### 7.1 Systematisches Vorgehen bei Problemen

Wenn eine Anforderungsanalyse schiefgeht, merkst du es meist erst, wenn die Hardware da ist und nicht funktioniert. Hier lernst du, wie du typische Probleme VOR dem Kauf erkennst.

**6-Schritte-Diagnoseprozess:**

```
1. Symptom erfassen → Was beschwert sich der Kunde konkret?
2. Hypothese bilden → Welche Anforderung wurde vermutlich übersehen?
3. Test durchführen → Nachfragen: "Nutzen Sie auch Programm X?"
4. Ergebnis auswerten → Hypothese bestätigt oder widerlegt?
5. Lösung implementieren → Anforderungsliste anpassen, neue Hardware wählen
6. Kontrolle → Nochmal durchgehen: Passt jetzt alles?
```

**Praxisbeispiel:**
**Symptom:** Kunde beschwert sich: "Der neue Laptop ist viel zu langsam beim Öffnen großer Excel-Dateien."  
**Hypothese:** Zu wenig RAM oder langsame HDD statt SSD?  
**Test:** Taskmanager öffnen während Excel lädt → RAM-Auslastung bei 98%, Festplatte nur 30% → **RAM ist das Problem.**  
**Lösung:** RAM von 8GB auf 16GB aufrüsten.  
**Kontrolle:** Datei öffnet jetzt in 5 Sekunden statt 45 Sekunden → Problem gelöst!

### 7.2 Typische Fehlerbilder in der Anforderungsermittlung

| Symptom | Übersehene Anforderung | Diagnose-Methode | Lösung | Wie vermeiden? |
|---------|------------------------|------------------|--------|----------------|
| **Software stürzt ab** | RAM-Bedarf | Taskmanager → Speicherauslastung prüfen | RAM aufrüsten | Systemanforderungen der Software VORHER checken |
| **3D-Programm ruckelt** | Dedizierte GPU fehlt oder zu schwach | Grafikeinstellungen → integrierte GPU aktiv? | Passende Workstation-GPU oder Treiberkonfiguration | Bei CAD/3D/Video GPU-Anforderung immer konkret prüfen |
| **VPN verbindet nicht** | Firewall-Kompatibilität | IT-Admin fragen: Welche Ports/Protokolle? | VPN-Client abstimmen mit Firmennetzwerk | IT-Infrastruktur VORHER klären |
| **Display zu dunkel** | Helligkeit (Nits) | Datenblatt prüfen: <300 Nits = zu wenig | Display mit mind. 400 Nits (Outdoor) | Arbeitsort ernst nehmen ("oft im Außendienst") |
| **Akku hält nur 2 Std.** | Laufzeitanforderung | Herstellerangabe vs. reale Nutzung | Größerer Akku (WHr) oder Zweitakku | Mobilität = immer nach Akkulaufzeit fragen! |
| **Software läuft nicht** | OS-Kompatibilität | Hersteller-Website: Welches OS wird unterstützt? | Richtiges OS installieren (z.B. Windows Pro) | Software-Anforderungen VOR Kauf prüfen |
| **Zu laut im Büro** | Lautstärke (dB) | Datenblatt: Lüfter-Lautstärke im Leerlauf | Geräte mit passiver Kühlung oder leise | Arbeitsumgebung abfragen (Großraum?) |
| **Passt nicht ins Netz** | Netzwerk-Standards | IT fragen: WLAN 5 oder 6? Ethernet 1G/10G? | Netzwerkkarte/WLAN-Modul anpassen | Bestehende Infrastruktur IMMER abfragen |

### 7.3 Praxis-Troubleshooting-Szenarien

**Problem 1:** *"Der Marketing-Mitarbeiter beschwert sich, dass sein neuer Laptop beim Export von Videos aus Adobe Premiere Pro ewig braucht."*

**Falsche Diagnose:** CPU ist zu langsam → i9 kaufen!  
**Richtige Diagnose:** GPU-Beschleunigung wird nicht genutzt, weil keine dedizierte Grafikkarte vorhanden ist.  
**Beweis:** In Premiere Pro Einstellungen prüfen: GPU-Beschleunigung auf "Software Only" statt "CUDA".  
**Fix:** Workstation mit NVIDIA RTX-Karte nachkaufen oder Laptop tauschen.

---

**Problem 2:** *"Der Außendienstler kann unterwegs keine E-Mails abrufen, obwohl der Laptop neu ist."*

**Falsche Diagnose:** WLAN funktioniert nicht!  
**Richtige Diagnose:** Kein Mobilfunk-Modem (LTE/5G) verbaut, nur WLAN. Im Auto/Zug gibt es kein offenes WLAN.  
**Beweis:** Keine Mobile Broadband Adapter im Gerätemanager.  
**Fix:** LTE-USB-Stick kaufen oder Smartphone als Hotspot nutzen.

---

**Problem 3:** *"Die Buchhaltung kann die neue Finanzsoftware nicht installieren: 'Administrator-Rechte erforderlich'."*

**Falsche Diagnose:** Windows ist kaputt!  
**Richtige Diagnose:** Nutzer haben keine Admin-Rechte (Sicherheitsrichtlinie der Firma).  
**Beweis:** Rechtsklick → "Als Administrator ausführen" → Passwortabfrage erscheint.  
**Fix:** IT-Admin muss Software installieren.

---

**Problem 4:** *"Der Grafiker sagt, die Farben auf dem neuen Monitor sehen 'komisch' aus."*

**Falsche Diagnose:** Monitor ist defekt!  
**Richtige Diagnose:** Monitor ist nicht kalibriert und/oder hat falschen Farbraum (sRGB statt Adobe RGB).  
**Beweis:** Datenblatt prüfen: Farbraumabdeckung nur 72% NTSC → zu wenig für Profi-Grafik.  
**Fix:** Professionellen Monitor mit ≥99% Adobe RGB kaufen + Kalibrierungsgerät.

---

**Problem 5:** *"Der neue Server-Raum überhitzt ständig, obwohl eine Klimaanlage da ist."*

**Falsche Diagnose:** Klimaanlage zu schwach!  
**Richtige Diagnose:** Kühlleistung wurde falsch berechnet. Server produzieren mehr Abwärme (BTU/h) als Klimaanlage abführen kann.  
**Beweis:** Temperaturlog zeigt steigende Werte trotz laufender Klimaanlage.  
**Fix:** Zweite Klimaanlage installieren ODER Server mit geringerer TDP wählen.

---

## 8) AP1-Prüfungsfokus: So wird es konkret gefragt

### 8.1 So wird Bedarfsermittlung in der AP1 konkret geprüft

**Originalnahe AP1-Aufgabe:**

> **Aufgabe 3 (12 Punkte, ca. 14 Minuten):**
>
> Die "Tischlerei Holzmann GmbH" möchte für 3 Schreiner mobile Arbeitsplätze einrichten. Die Schreiner erstellen vor Ort beim Kunden 3D-Entwürfe von Möbeln (Software: "SketchUp Pro"). Anschließend werden die Entwürfe per E-Mail zur Zentrale geschickt, wo sie weiterverarbeitet werden.
>
> Die Geschäftsführung legt Wert auf Wirtschaftlichkeit und fordert eine Nutzungsdauer von mindestens 5 Jahren. Die IT-Abteilung besteht auf Windows 10 Pro (Domänenanbindung) und TPM 2.0 (Datenschutz).
>
> **a)** Erstellen Sie eine Anforderungsliste mit Priorisierung nach MoSCoW. (6 Punkte)  
> **b)** Begründen Sie, warum ein Tablet mit Stift-Eingabe hier NICHT geeignet ist. (3 Punkte)  
> **c)** Nennen Sie zwei Stakeholder und deren Hauptinteressen. (3 Punkte)

---

**Erwartungshorizont (Was Prüfer sehen wollen):**

**Zu a) Anforderungsliste:**
- ✅ **Must-Have:** Dedizierte Grafikkarte für 3D-Software → +2 Punkte
- ✅ **Must-Have:** Mobilität (Laptop/Convertible) → +1 Punkt
- ✅ **Must-Have:** Windows 10 Pro + TPM 2.0 → +1 Punkt
- ✅ **Should-Have:** LTE/5G für E-Mail unterwegs → +1 Punkt
- ✅ **Could-Have:** Touchscreen (nett, aber nicht nötig) → +1 Punkt
**Gesamt:** 6 Punkte

**Typische Punktverluste:**
- ❌ Keine Priorisierung (nur Liste ohne Must/Should/Could) → -2 Punkte
- ❌ "Schneller Prozessor" ohne Begründung → -1 Punkt (zu unspezifisch!)
- ❌ Budget nicht erwähnt (Wirtschaftlichkeit!) → -1 Punkt

---

**Zu b) Warum kein Tablet:**
- ✅ "SketchUp Pro ist rechenintensiv und benötigt dedizierte GPU, die in Tablets meist fehlt." → +2 Punkte
- ✅ "Windows 10 Pro ist auf vielen Tablets nicht verfügbar (oft nur Home)." → +1 Punkt

**Typische Punktverluste:**
- ❌ "Tablets sind zu klein" → +0 Punkte (Zu oberflächlich!)
- ❌ "Tablets sind zu teuer" → +0 Punkte (Stimmtnicht immer!)

---

**Zu c) Stakeholder:**
- ✅ **Geschäftsführung:** Wirtschaftlichkeit, TCO, 5 Jahre Nutzung → +1,5 Punkte
- ✅ **IT-Abteilung:** Sicherheit (TPM 2.0), Verwaltbarkeit (Domäne) → +1,5 Punkte

**Typische Punktverluste:**
- ❌ "Kunde" als Stakeholder → +0 Punkte (Kunde ist extern!)
- ❌ Nur Stakeholder ohne Interesse → Nur halbe Punktzahl

---

### 8.2 Prüfungsrelevante Fachbegriffe (Pflicht-Vokabular)

Diese Begriffe MUSST du in der Prüfung verwenden:

| Fachbegriff | Wann verwenden? | Punktbringer weil... |
|-------------|-----------------|----------------------|
| **Anforderungsanalyse** | Bei jeder Aufgabe | Zeigt systematisches Vorgehen |
| **Lastenheft** | Wenn Kunde Wünsche äußert | IHK-Standardwissen |
| **Pflichtenheft** | Wenn DU die Lösung beschreibst | IHK-Standardwissen |
| **Stakeholder** | Bei mehreren Parteien | "Großes Ganzes" denken |
| **MoSCoW-Methode** | Bei Priorisierung | Strukturierte Herangehensweise |
| **Must-Have / Should-Have** | Bei Anforderungslisten | Fachbegriff für Priorisierung |
| **TCO** | Bei Wirtschaftlichkeit | Gesamtkosten über Lebensdauer |
| **Systemanforderungen** | Bei Software-Lauffähigkeit | Fachbegriff für "Min.-Hardware" |
| **Kompatibilität** | Bei bestehender Infrastruktur | Zeigt Integration mitdenken |
| **Datenschutz/DSGVO** | Bei personenbezogenen Daten | Rechtliche Pflicht = Punkte! |

### 8.3 Insider-Tipps vom Prüfer

💡 **Tipp 1: Immer begründen!**  
❌ "Ich empfehle 16GB RAM."  
✅ "Ich empfehle 16GB RAM, **da** die Software laut Hersteller mind. 12GB benötigt."

💡 **Tipp 2: Wirtschaftlichkeit erwähnen!**  
Auch wenn nicht gefragt: TCO, Energieeffizienz oder Lieferzeiten erwähnen → Sympathiepunkte!

💡 **Tipp 3: Sicherheit ist fast immer ein Thema!**  
Bei "Kundendaten", "Finanzen" oder "Außendienst" → Verschlüsselung, TPM, Blickschutz → Punktegarantie!

💡 **Tipp 4: "Standardisierung" ist ein Zauberwort!**  
*"Durch Wahl eines Standardmodells lassen sich Ersatzteile bevorraten und Support-Aufwände reduzieren."* → Praxisverständnis!

💡 **Tipp 5: Bei Zeitnot: Must-Haves fokussieren!**  
2–3 Kern-Must-Haves kurz begründen bringt mehr als lange, oberflächliche Liste.

---

## 9) Vollständige Fallstudien (3 Schwierigkeitsstufen)

### 9.1 Fallstudie 1: Möbel-Tischlerei (⭐⭐ Mittel-Schwierigkeit)

Hier spielen wir ein komplettes Prüfungsszenario durch.

### 9.1.1 Das Szenario
Die "Möbel-Meyer GmbH" möchte 5 Arbeitsplätze für ihre Innenarchitekten neu ausstatten.
**Anforderungen laut Abteilungsleiter:**
- Die Architekten erstellen 3D-Modelle von Küchen (Software: "KitchenDraw").
- Sie fahren oft zum Kunden, um die Maße zu nehmen und die Pläne vor Ort zu zeigen.
- Die Pläne sind sehr detailliert (hohe Auflösung nötig).
- Budget pro Platz: ca. 2.000€.
- Die IT-Abteilung fordert eine einfache Integration in das bestehende Windows-Netzwerk.

### 9.1.2 Schritt 1: Analyse der Ebenen & Rollen
- **Nutzer (Architekten):** Brauchen 3D-Leistung (GPU), Mobilität (Kundenbesuch), gutes Display.
- **IT-Admin:** Will Windows-Integraton (Windows Pro/Enterprise).
- **Geschäftsleitung:** Budget 2000€.

### 9.1.3 Schritt 2: MoSCoW-Priorisierung

| Merkmal | Prio | Begründung |
|---------|------|------------|
| Dedizierte Grafikkarte | **Must** | Für 3D-Software zwingend nötig. |
| Mobilität (Laptop) | **Must** | Kundenbesuche vor Ort. |
| Hochauflösendes Display | **Must** | Detaillierte Pläne zeigen. |
| Windows Pro Betriebssystem | **Must** | Forderung der IT (Domänen-Join). |
| Dockingstation | **Should** | Im Büro angenehmer, aber notfalls per Kabel. |
| Touchscreen / Stift | **Could** | Praktisch für Skizzen, aber teuer. |

### 9.1.4 Schritt 3: Hardware-Auswahl & Begründung (Musterlösung)

**Empfehlung:** Mobile Workstation (z.B. 15 Zoll)
- **CPU:** Intel Core i7 oder AMD Ryzen 7 (Leistung für Berechnungen).
- **RAM:** 32 GB (3D-Modelle sind speicherintensiv).
- **GPU:** NVIDIA RTX A1000/2000 (Zertifiziert für CAD-Anwendungen).
- **SSD:** 1 TB NVMe (Schnelles Laden der Projekte).
- **OS:** Windows 11 Pro (für Domänenintegration).

**Begründung für die Prüfung:**
*"Da die Architekten 3D-Software nutzen, ist eine dedizierte Grafikkarte ein **Must-Have**, da Onboard-Grafik hier zu langsam wäre. Für die Kundenbesuche ist ein mobiles Gerät (Laptop) zwingend nötig. Ich empfehle 32 GB RAM, damit auch komplexe Küchenpläne flüssig bearbeitet werden können. Als Betriebssystem wird Windows 11 Pro gewählt, um die Forderung der IT-Abteilung nach Netzwerkintegration zu erfüllen. Das Budget von 2.000€ wird hier zwar knapp ausgereizt, ist aber für diese Leistungsklasse notwendig."*

---

## 10) Häufige Fehler und wie du sie vermeidest

### Fehler 1: Das "Gaming-Laptop"-Problem
Viele Prüflinge empfehlen "Gaming-Laptops" für Business-Anwendungen, weil sie von zu Hause kennen, dass die "schnell" sind.
- **Problem:** Gaming-Laptops sind oft schwer, haben schlechte Akkulaufzeit, sind laut (Lüfter), haben Windows Home (keine Domäne) und sehen unprofessionell aus (RGB-Disco).
- **Lösung:** Empfehle immer **Business-Geräte** (ThinkPad, EliteBook, Latitude) oder **Workstations**.

### Fehler 2: Wirtschaftlichkeit ignorieren
- **Problem:** Du konfigurierst den "besten PC der Welt" für eine Sekretärin.
- **Lösung:** Nur so viel Leistung wie nötig! "Over-Engineering" gibt Punktabzug.

### Fehler 3: Software-Inkompatibilität
- **Problem:** Du verkaufst ein MacBook für eine Software, die es nur für Windows gibt.
- **Lösung:** Immer prüfen: Auf welchem OS läuft die geforderte Software?

---

## Weitere Übungen zur Selbstkontrolle

### Übung 1: Stakeholder erkennen
Identifiziere die Rolle hinter der Aussage:
1. "Ich will nicht, dass man sieht, wie viele Tastenanschläge ich pro Stunde mache."
2. "Wir müssen die Investition über 3 Jahre abschreiben."
3. "Hauptsache, ich kann meine CAD-Maus anschließen."

<details>
<summary>Lösung anzeigen</summary>

1. **Betriebsrat** (Mitarbeiterüberwachung verhindern).
2. **Geschäftsleitung / Buchhaltung** (Finanzieller Fokus).
3. **Fachanwender** (Fokus auf Arbeitsmittel).
</details>

### Übung 2: MoSCoW-Training
Szenario: Ein Serverraum soll klimatisiert werden. Budget ist sehr knapp.
Sortiere:
- Redundantes Klimagerät (Ausfallsicherheit)
- Temperatursensor mit Alarm
- Bunte LED-Beleuchtung am Gehäuse
- Kühlleistung für aktuelle Server

<details>
<summary>Lösung anzeigen</summary>

- **Must:** Kühlleistung (sonst brennen Server durch).
- **Should:** Temperatursensor (wichtig zur Kontrolle).
- **Could:** Redundantes Gerät und (Sicherheit, aber teuer -> bei knappem Budget evtl. streichen oder Risiko akzeptieren).
- **Won't:** LED-Beleuchtung (Spielerei).
</details>

### Übung 3: Transfer-Training
Was empfiehlst du technisch für folgende Anforderung?
"Der Mitarbeiter muss oft Verträge im Café bearbeiten, darf aber nicht riskieren, dass Sitznachbarn die Daten sehen."

<details>
<summary>Lösung anzeigen</summary>

**Blickschutzfolie** (Privacy Filter) für das Display.
(Zusatzpunkt: Festplattenverschlüsselung, falls Gerät geklaut wird).
</details>

---

## 10) Selbstdiagnose

🟢 **Prüfungsfit**
- Ich kann den Unterschied zwischen Lastenheft und Pflichtenheft im Schlaf erklären.
- Ich kann aus einem Text sofort die "Must-Haves" herausfiltern.
- Ich weiß, wann ich eine Grafikkarte empfehle und wann viel RAM.

🟡 **Unsicher**
- Ich verwechsle manchmal noch, wer das Lastenheft schreibt.
- Ich tue mich schwer, technische Daten (GB, GHz) zuzuordnen.

🔴 **Kritisch**
- Ich würde jedem Nutzer einfach den teuersten PC empfehlen, um sicher zu gehen. (Achtung: Das fällt durch!)

**Nächster Schritt:** Wenn du grün bist, lies weiter zum vollständigen Selbsttest!

---

## 11) Zusammenfassung & Selbsttest

### Die 16 wichtigsten Punkte aus diesem Modul

1. **Bedarfsermittlung ist das Fundament**: Falsche Anforderungen = teuerstes Problem in IT-Projekten
2. **Der Eisberg**: Nur 10% sind sichtbar, 90% musst DU durch Nachfragen herausfinden
3. **3 Ebenen**: Business (Warum?) → User (Was tut der Nutzer?) → System (Welche Technik?)
4. **Lastenheft = vom Kunden**: WAS will er? (Problem beschreiben)
5. **Pflichtenheft = von dir**: WIE löst du es? (Technische Umsetzung)
6. **MoSCoW-Priorisierung**: Must > Should > Could > Won't (bei knappem Budget!)
7. **SMART-Kriterien**: Anforderungen müssen Spezifisch, Messbar, Akzeptiert, Realistisch und Terminiert sein
8. **Stakeholder-Analyse**: Jede Rolle hat andere "Brille" (IT = Sicherheit, Chef = Kosten)
9. **Funktionale Anforderung**: WAS soll es tun? (Features)
10. **Nicht-funktionale Anforderung**: WIE soll es sein? (Performance, Sicherheit, Ergonomie)
11. **Signalwort → Technik**: "3D/CAD" = GPU, "große Dateien" = RAM, "unterwegs" = LTE+Akku
12. **TCO statt Kaufpreis**: Gesamtkosten über 5 Jahre (Energie, Wartung, Ersatzteile)
13. **Over-Engineering = Punktabzug**: Nur so viel Leistung wie nötig!
14. **Business-Geräte > Gaming**: Langlebigkeit, leise, Windows Pro, professionelles Design
15. **Immer begründen**: "Ich empfehle X, **weil/da**..." → Das bringt Punkte!
16. **Sicherheit + Wirtschaftlichkeit**: Wenn nicht gefragt, trotzdem erwähnen = Bonus!

---

### 5-Minuten-Blitz-Check

Beantworte ehrlich mit Ja/Nein:

1. Kannst du den Unterschied zwischen Lastenheft und Pflichtenheft ohne nachzuschauen erklären?
2. Kannst du aus einem Prüfungstext sofort die 3 Ebenen (Business/User/System) identifizieren?
3. Weißt du, welche Hardware du bei "3D-Software" empfehlen musst?
4. Kennst du mindestens 3 Stakeholder und deren typische Interessen?
5. Kannst du eine MoSCoW-Priorisierung in 2 Minuten erstellen?
6. Kannst du eine schlechte Anforderung ("langer Akku") in eine SMART-Anforderung umformulieren?
7. Weißt du, wann du eine dedizierte Grafikkarte brauchst (und wann nicht)?
8. Kannst du TCO erklären und von Kaufpreis unterscheiden?
9. Würdest du NIEMALS einen Gaming-Laptop für Business-Anwendungen empfehlen?
10. Kennst du die Signalwörter für RAM (große Dateien, Multitasking)?
11. Würdest du bei "Außendienst" automatisch an Blickschutz, Verschlüsselung und Akku denken?

**Auswertung:**
- **11/11:** ✅ Modul sitzt perfekt! Mach das Quiz zur Vertiefung.
- **8-10/11:** ⚠️ Fast da! Wiederhole die Kapitel zu den Nein-Antworten.
- **<8/11:** 🔄 Lies das komplette Modul nochmal durch, fokussiere dich auf Kapitel 2, 4, 5 und 5b.
- **<7/10:** 🔄 Lies das komplette Modul nochmal durch, fokussiere dich auf Kapitel 2, 4 und 6.

---

### Checkliste: Kann ich das Modul abhaken?

- [ ] Ich kann Lastenheft vs. Pflichtenheft im Schlaf unterscheiden
- [ ] Ich erkenne alle Stakeholder in einem Prüfungstext und deren Interessen  
- [ ] Ich kann eine vollständige Anforderungsliste mit MoSCoW-Priorisierung erstellen
- [ ] Ich kann eine schwammige Anforderung in eine SMART-Anforderung umformulieren
- [ ] Ich weiß, welche Hardware ich für welche Anforderung empfehle (RAM/GPU/SSD/Akku/LTE)
- [ ] Ich kann meine Empfehlungen mit Fachbegriffen begründen (TCO, Kompatibilität, Performance)
- [ ] Ich würde niemals Over-Engineering betreiben (zu teuer) oder Under-Engineering (zu schwach)
- [ ] Ich denke bei jeder Lösung an Wirtschaftlichkeit UND Sicherheit
- [ ] Ich kann eine AP1-Musterlösung in 10-15 Minuten schreiben

---

### Wenn du jetzt unsicher bist...

**Schwach bei Lastenheft/Pflichtenheft?**  
→ Wiederhole Kapitel 4 + mach Übung 1

**Schwach bei MoSCoW-Priorisierung?**  
→ Wiederhole Kapitel 5 + mach Übung 2

**Schwach bei SMART-Kriterien?**  
→ Wiederhole Kapitel 5b und formuliere 3 eigene Anforderungen SMART um

**Schwach bei Hardware-Transfer (Signalwörter)?**  
→ Wiederhole Kapitel 6.1 + mach Übung 3

**Schwach bei Stakeholder-Analyse?**  
→ Wiederhole Kapitel 3 + mach Fallstudie im Kapitel 7

**Schwach bei Fehleranalyse?**  
→ Lies Kapitel 8 nochmal und bearbeite die Troubleshooting-Szenarien

---

### Weiterführende Quellen

**Offizielle Dokumente:**
- DIN 69901-5: Projektmanagement - Begriffe (Lastenheft/Pflichtenheft)
- IEEE 830: Software Requirements Specification
- V-Modell XT (Anforderungsmanagement in der Bundesverwaltung)

**Praxiswissen:**
- IREB Certified Professional for Requirements Engineering (Zertifizierung)
- Requirements Engineering Fundamentals (IREB Lehrplan)

**Nächstes Modul:**
- **Modul 003:** Hardware & Kompatibilität (Wie prüfe ich, ob Komponenten zusammenpassen?)

---

## Merkhilfen & Eselsbrücken

### Lastenheft vs. Pflichtenheft
🧠 **Merkhilfe:**  
**L**astenheft = **L**ast des Kunden (Er hat ein Problem)  
**P**flichtenheft = **P**flicht des Profis (Du lieferst die Lösung)

**Bildliche Vorstellung:**  
Lastenheft = Kunde sagt: *"Ich brauche ein Haus mit 4 Zimmern und Garten"*  
Pflichtenheft = Du sagst: *"Ich baue 120m², Ziegel, Fußbodenheizung, Rollrasen"*

---

### MoSCoW-Priorisierung
🧠 **Spruch:**  
**M**ama **S**agt: **C**hippendales **W**aren gestern!  
→ Must → Should → Could → Won't

**Oder bildlich:**  
- **Must** = Das Auto muss einen Motor haben (sonst fährt es nicht)
- **Should** = Das Auto sollte eine Klimaanlage haben (sonst schwitzt du, aber es fährt)
- **Could** = Das Auto könnte Sitzheizung haben (nett, aber egal)
- **Won't** = Das Auto wird jetzt kein Panoramadach haben (zu teuer, kommt später)

---

### Stakeholder-Rollen
🧠 **Merkhilfe:**  
**G**eschäftsleitung = **G**eld  
**F**achabteilung = **F**unktion  
**I**T-Abteilung = **I**nfrastruktur & Sicherheit  
**D**atenschutz = **D**SGVO  
**B**etriebsrat = **E**rgonomie (+ Mitarbeiterrechte)

---

### Häufige Signalwörter
🧠 **Wenn du liest... denkst du:**

| Text | → Hardware |
|------|------------|
| "3D/CAD/Rendering" | → **GPU** (Grafikkarte!) |
| "Große Dateien/Multitasking" | → **RAM** (Arbeitsspeicher!) |
| "Schnelles Laden/Booten" | → **SSD** (NVMe!) |
| "Außendienst/unterwegs" | → **LTE + Akku + Blickschutz** |
| "Vertrauliche Daten" | → **Verschlüsselung + TPM + Biometrie** |
| "Videokonferenz" | → **Webcam + Mikrofon + schnelles Internet** |
| "Präsentationen" | → **HDMI/USB-C + gutes Display** |

---

**🎓 Du hast Modul 002 abgeschlossen!**  
Nächster Schritt: **Quiz 002** bearbeiten (50-80 Fragen zur Vertiefung)

Dann geht es weiter mit **Modul 003: Hardware-Kompatibilität & Komponenten**.


