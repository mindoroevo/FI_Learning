# 002 – Bedarfsermittlung & Anforderungsanalyse vollständig verstehen

## Lernzeit & Zielniveau
- **Empfohlene Lernzeit:** 120–150 Minuten (mit allen Erklärungen und Fallbeispielen
- **Zielniveau:** Du kannst aus jedem noch so schwammigen Prüfungsszenario ("Wir brauchen neue Laptops") eine **präzise, technische Anforderungsliste** extrahieren, priorisieren (Muss/Kann) und dokumentieren. Du verstehst, warum falsche Anforderungen das teuerste Problem in IT-Projekten sind.

---

## Kapitelübersicht
1. Was ist Bedarfsermittlung eigentlich? (Grundlagen erklärt)
2. Die 3 Ebenen der Anforderungen (Business, User, System)
3. Wer will was? (Stakeholder-Analyse)
4. Lastenheft vs. Pflichtenheft (Der Klassiker erklärt)
5. Priorisierung mit MoSCoW (Was ist wirklich wichtig?)
6. Von der Aufgabe zur Hardware (Transferleistung)
7. Vollständige Fallanalyse (durchgelöst)
8. Häufige Fehler und wie du sie vermeidest
9. Übungen mit Lösungen

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

### 1.2 Anforderung vs. Wunsch

Ein wichtiger Unterschied für die Prüfung:
- **Wunsch:** "Ich hätte gerne den neuesten Gaming-Laptop mit RGB-Beleuchtung."
- **Anforderung:** "Ich benötige ein mobiles Gerät mit dedizierter Grafikkarte für 3D-Rendering."

**Was bedeutet das für dich?**
Du musst lernen, "Nein" zu sagen, wenn ein Wunsch technisch oder wirtschaftlich keinen Sinn macht, aber "Ja" zur Lösung des Problems.

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

## 6) Von der Aufgabe zur Hardware (Transferleistung)

Wie übersetzt du jetzt einen Text in technische Daten? Das ist die Kernkompetenz "Fachinformatiker".

### 6.1 Die Übersetzungs-Tabelle

Hier sind typische Signalwörter aus AP1-Prüfungen und was sie technisch bedeuten:

| Signalwort im Text | Technische Übersetzung (Hardware/Software) |
|--------------------|--------------------------------------------|
| "Muss viele Programme gleichzeitig offen haben" | **Viel RAM** (min. 16GB, besser 32GB) |
| "Arbeitet mit großen Datenbanken / Videobearbeitung" | **Schnelle Massenspeicher** (NVMe SSD) & viel RAM |
| "Macht CAD / 3D-Zeichnungen / Rendering" | **Dedizierte Grafikkarte** (GPU), z.B. NVIDIA Quadro/RTX (kein Onboard-Chip!) |
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

## 7) Vollständige Fallanalyse (durchgelöst)

Hier spielen wir ein komplettes Prüfungsszenario durch.

### 7.1 Das Szenario
Die "Möbel-Meyer GmbH" möchte 5 Arbeitsplätze für ihre Innenarchitekten neu ausstatten.
**Anforderungen laut Abteilungsleiter:**
- Die Architekten erstellen 3D-Modelle von Küchen (Software: "KitchenDraw").
- Sie fahren oft zum Kunden, um die Maße zu nehmen und die Pläne vor Ort zu zeigen.
- Die Pläne sind sehr detailliert (hohe Auflösung nötig).
- Budget pro Platz: ca. 2.000€.
- Die IT-Abteilung fordert eine einfache Integration in das bestehende Windows-Netzwerk.

### 7.2 Schritt 1: Analyse der Ebenen & Rollen
- **Nutzer (Architekten):** Brauchen 3D-Leistung (GPU), Mobilität (Kundenbesuch), gutes Display.
- **IT-Admin:** Will Windows-Integraton (Windows Pro/Enterprise).
- **Geschäftsleitung:** Budget 2000€.

### 7.3 Schritt 2: MoSCoW-Priorisierung

| Merkmal | Prio | Begründung |
|---------|------|------------|
| Dedizierte Grafikkarte | **Must** | Für 3D-Software zwingend nötig. |
| Mobilität (Laptop) | **Must** | Kundenbesuche vor Ort. |
| Hochauflösendes Display | **Must** | Detaillierte Pläne zeigen. |
| Windows Pro Betriebssystem | **Must** | Forderung der IT (Domänen-Join). |
| Dockingstation | **Should** | Im Büro angenehmer, aber notfalls per Kabel. |
| Touchscreen / Stift | **Could** | Praktisch für Skizzen, aber teuer. |

### 7.4 Schritt 3: Hardware-Auswahl & Begründung (Musterlösung)

**Empfehlung:** Mobile Workstation (z.B. 15 Zoll)
- **CPU:** Intel Core i7 oder AMD Ryzen 7 (Leistung für Berechnungen).
- **RAM:** 32 GB (3D-Modelle sind speicherintensiv).
- **GPU:** NVIDIA RTX A1000/2000 (Zertifiziert für CAD-Anwendungen).
- **SSD:** 1 TB NVMe (Schnelles Laden der Projekte).
- **OS:** Windows 11 Pro (für Domänenintegration).

**Begründung für die Prüfung:**
*"Da die Architekten 3D-Software nutzen, ist eine dedizierte Grafikkarte ein **Must-Have**, da Onboard-Grafik hier zu langsam wäre. Für die Kundenbesuche ist ein mobiles Gerät (Laptop) zwingend nötig. Ich empfehle 32 GB RAM, damit auch komplexe Küchenpläne flüssig bearbeitet werden können. Als Betriebssystem wird Windows 11 Pro gewählt, um die Forderung der IT-Abteilung nach Netzwerkintegration zu erfüllen. Das Budget von 2.000€ wird hier zwar knapp ausgereizt, ist aber für diese Leistungsklasse notwendig."*

---

## 8) Häufige Fehler und wie du sie vermeidest

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

## 9) Übungen mit Lösungen

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

**Nächster Schritt:** Wenn du grün bist, mach das Quiz!
