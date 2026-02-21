# 003 – Hardware-Architektur, Kompatibilität & Troubleshooting (Vollständiger Deep Dive)


## Kapitelübersicht
1. Das magische Dreieck der Hardware (Performance, TCO, Effizienz)
2. CPU-Architektur Deep Dive (Kerne, Threads, Cache, Virtualisierung)
3. Arbeitsspeicher (RAM) im Detail (Latenzen, Dual Channel, ECC)
4. Massenspeicher-Technologien (NAND-Typen, NVMe-Protokoll, TBW)
5. Mainboard & Chipsatz-Logik (PCIe-Lanes, VRMs, Formfaktoren)
6. Grafikkarten & Beschleuniger (CUDA, VRAM, Encoder)
7. **Fehleranalyse & Hardware-Troubleshooting** (NEU)
8. **AP1-Prüfungsfokus: Hardware-Auswahl** (NEU)
9. Fallstudien: High-Performance, Silent-Office, Budget-Server
10. Systematische Kompatibilitätsprüfung (Checkliste)
11. **Zusammenfassung & Selbsttest** (NEU)

> 💡 **Hinweis:** Abschnitte die mit 🔬 markiert sind, gehen über das AP1-Pflichtpensum hinaus.  
> Sie sind für die Praxis und für Interessierte gedacht – **nicht prüfungsrelevant**. Wenn du unter Zeitdruck lernst, kannst du diese Abschnitte beim ersten Durchgang überspringen.

---

## 1) Das magische Dreieck der Hardware

Hardware-Auswahl ist immer ein Kompromiss. Es gibt keine "beste" Hardware, nur die "passendste".

### 1.1 Die drei Dimensionen
1.  **Leistung (Performance):** Wie schnell wird eine Aufgabe erledigt? (Relevant für User Experience, Kompilierzeiten).
2.  **Kosten (TCO - Total Cost of Ownership):** Anschaffungspreis + Stromkosten + Wartung + Entsorgung.
3.  **Effizienz/Ergonomie:** Stromverbrauch, Abwärme, Lautstärke, Platzbedarf.

**AP1-Praxis:**
Ein "schnellerer" Prozessor kann eine **schlechte** Wahl sein, wenn er:
- Das Budget sprengt (Kosten).
- Zu heiß wird für das kleine Gehäuse (Effizienz).
- Ein teureres Mainboard/Netzteil erfordert (Folgekosten).

### 1.2 Over-Engineering vs. Under-Sizing
- **Over-Engineering:** Du kaufst einen Server-Prozessor für einen Office-PC. 
  - *Folge:* Geldverschwendung, höhere Stromkosten im Leerlauf.
- **Under-Sizing:** Du kaufst 8 GB RAM für einen Entwickler-PC mit Docker. 
  - *Folge:* System swappt (lagert auf SSD aus), Mitarbeiter wartet ständig -> Teure Arbeitszeit wird vernichtet.

### 1.3 Häufige Missverständnisse

#### ❌ "Mehr GHz = Schneller"
✅ **Richtig:** GHz ist nur **innerhalb derselben CPU-Generation** vergleichbar! Eine moderne CPU mit 3,5 GHz schlägt eine 10 Jahre alte CPU mit 4,5 GHz, weil moderne Architekturen **mehr Arbeit pro Taktzyklus** (IPC = Instructions Per Cycle) schaffen. In Prüfungsaufgaben darfst du nicht einfach GHz-Zahlen vergleichen, sondern musst die Generation/Architektur erwähnen!

#### ❌ "Grafikkarte ist nur für Gaming"
✅ **Richtig:** Grafikkarten werden auch für **CAD/3D** (AutoCAD, SolidWorks), **Video-Encoding** (Adobe Premiere), **Machine Learning** (TensorFlow, PyTorch) und **Multi-Monitor-Setups** (4+ Bildschirme) gebraucht. Eine iGPU reicht nur für Office/Surfen. **AP1-Tipp:** Wenn "CAD", "3D", "Video", "KI" im Text steht → dedizierte GPU empfehlen!

#### ❌ "SSD ist SSD"
✅ **Richtig:** Es gibt **SATA-SSDs** (max. 550 MB/s) und **NVMe-SSDs** (3.000-7.000 MB/s). Für Datenbank-Server, Entwickler-PCs (viele kleine Dateien) oder Video-Editing macht NVMe einen RIESIGEN Unterschied. Für Office-PCs ist der Unterschied kaum spürbar. **Wirtschaftlichkeit:** NVMe für Profis, SATA für Office okay (günstiger).

#### ❌ "Mein Board hat DDR4-Steckplätze, also kann ich DDR5-RAM einbauen"
✅ **Richtig:** **DDR-Generationen sind mechanisch UND elektrisch inkompatibel!** Die Kerbe (Notch) sitzt an unterschiedlicher Stelle. Du kannst DDR5 nicht in DDR4-Slots stecken und umgekehrt. **AP1-Klassiker:** In Prüfungen wird oft gefragt: "Warum startet der PC nicht?" → "RAM-Generation passt nicht zum Board."

#### ❌ "Netzteil mit 1000W ist immer besser als 500W"
✅ **Richtig:** Ein überdimensioniertes Netzteil läuft im Leerlauf **ineffizient** (z.B. nur 70% Wirkungsgrad bei 10% Last). Netzteile sind am effizientesten bei **50-80% Auslastung**. **TCO-Aspekt:** Bei 24/7-Servern kostet ein überdimensioniertes Netzteil über Jahre Hunderte Euro mehr Strom! **Richtige Dimensionierung:** (CPU-TDP + GPU-TDP + 50W Rest) × 1,5 Puffer.

### 1.4 Fachbegriffe-Tabelle (Essenzial für AP1)

| Begriff | Englisch | Bedeutung |
|---------|----------|-----------|
| **TDP** | Thermal Design Power | Maximale Abwärme, die CPU/GPU erzeugt (in Watt). Wichtig für Kühlungs- und Netzteil-Dimensionierung. |
| **IPC** | Instructions Per Cycle | Wie viele Befehle die CPU pro Taktzyklus ausführt. Moderne CPUs haben höheres IPC als alte. |
| **Dual Channel** | - | Zwei RAM-Riegel parallel betreiben → doppelte Bandbreite. Pflicht für Performance! |
| **NVMe** | Non-Volatile Memory Express | Protokoll für SSDs über PCIe-Lanes (viel schneller als SATA). Standard für moderne SSDs. |
| **ECC** | Error Correction Code | RAM, das Fehler erkennt und korrigiert. Pflicht für Server, optional für Workstations. |
| **PCIe-Lanes** | - | Datenleitungen zwischen CPU und Komponenten (GPU, SSD). x16 für GPU, x4 für NVMe. |
| **VRM** | Voltage Regulator Module | Spannungswandler auf dem Mainboard, der 12V in CPU-Spannung (~1,2V) wandelt. Billige VRMs → Throttling. |
| **80 PLUS** | - | Effizienz-Zertifizierung für Netzteile (Bronze/Silber/Gold/Platinum/Titanium = 82-96% Wirkungsgrad). |
| **TBW** | Terabytes Written | Garantierte Schreibmenge einer SSD. Wichtig für Server/Caching, irrelevant für Office-PCs. |
| **iGPU** | Integrated GPU | In CPU integrierte Grafikeinheit. Reicht für Office/Coding, nicht für CAD/Gaming. |

**Eselsbrücke:** **T**im **I**sst **D**oppelt **N**udeln, **E**r **P**feift **V**om **8**0er **T**eller **I**mmer.  
(TDP, IPC, Dual Channel, NVMe, ECC, PCIe, VRM, 80 PLUS, TBW, iGPU)

---

## 2) CPU-Architektur Deep Dive: Das Herzstück

Die **Central Processing Unit (CPU)** ist komplexer als nur "GHz und Kerne".

### 2.1 Kerne (Cores) vs. Threads (SMT/Hyper-Threading)
- **Physischer Kern:** Eine komplette Recheneinheit mit eigenen ALUs (Arithmetic Logic Units).
- **Logischer Thread (SMT):** Eine Technik, bei der ein Kern zwei Aufgaben "gleichzeitig" annimmt, um Lücken in der Auslastung zu füllen.
  - **Nutzen:** Bringt ca. 20-30% Mehrleistung bei Multitasking.
  - **AP1-Tipp:** Für Virtualisierung (VMs) sind Threads fast so wertvoll wie Kerne.

### 2.2 Taktfrequenz (Clock Speed) vs. IPC
- **Takt (GHz):** Wie oft schaltet der Transistor pro Sekunde? (z.B. 4 GHz = 4 Milliarden Mal).
- **IPC (Instructions Per Cycle):** Wie viel Arbeit schafft die CPU pro Takt? 
  - *Beispiel:* Eine moderne CPU mit 3 GHz ist viel schneller als eine 10 Jahre alte CPU mit 4 GHz, weil sie pro Takt mehr berechnet.
  - **Fazit:** Vergleiche GHz nur innerhalb derselben Generation!

### 2.3 Cache-Hierarchie (Das Kurzzeitgedächtnis der CPU)
Daten aus dem RAM zu holen dauert für eine CPU "ewig" (ca. 100 Nanosekunden).
Deshalb gibt es Caches direkt auf dem Chip:
1.  **L1 Cache:** Winzig (z.B. 64 KB), extrem schnell (ca. 1 ns). Je Kern.
2.  **L2 Cache:** Mittelgroß (z.B. 1 MB), sehr schnell (ca. 4 ns). Je Kern.
3.  **L3 Cache:** Groß (z.B. 32-100 MB), schnell (ca. 10-20 ns). Geteilt für alle Kerne.

**Warum wichtig?** Datenintensive Anwendungen (Datenbanken, Spiele, Kompilieren) profitieren massiv von großem L3-Cache (z.B. AMD "X3D" Modelle).

### 2.4 Virtualisierungs-Features (Wichtig für FIAE!)
Damit Docker oder VMs performant laufen, muss die CPU Hardware-Virtualisierung unterstützen.
- **Intel:** VT-x / VT-d
- **AMD:** AMD-V
*Achtung:* Muss oft erst im BIOS/UEFI aktiviert werden! Sonst startet Docker nicht.

### 2.5 Integrierte Grafik (iGPU)
- **Mit iGPU:** Monitor kann ans Mainboard. Reicht für Office/Coding. (z.B. Intel "non-F", AMD "G" oder Ryzen 7000+).
- **Ohne iGPU:** Monitor bleibt schwarz ohne Grafikkarte. (z.B. Intel "F"-Serie, viele ältere Ryzen).
- **Vorteil iGPU:** Spart Strom, Platz und Geld bei Office-PCs.
- **Vorteil ohne:** Günstiger, wenn eh eine Grafikkarte verbaut wird.

---

## 3) Arbeitsspeicher (RAM) im Detail

RAM ist der Arbeitsplatz der CPU. Zu wenig RAM ist der Performance-Killer Nr. 1.

### 3.1 DDR-Generationen (Double Data Rate)
Sie sind mechanisch und elektrisch **inkompatibel**.
- **DDR4:** Standard (günstig, ausgereift). Spannung 1.2V.
- **DDR5:** Der aktuelle Standard (höhere Bandbreite, teurer). Spannung 1.1V (Power-Management auf dem Riegel!).

### 3.2 Geschwindigkeit: MHz vs. MT/s & Latenz (CL)
> 🔬 **Vertiefung (optional – über AP1-Pflichtinhalt):** Dieser Abschnitt ist für die Prüfung nicht prüfungsrelevant, aber hilft dir, Datenblätter zu lesen. Für AP1 reicht der Merksatz: *„Hoher Takt + niedrige CL = schnell – für Office aber irrelevant."*

- **Takt (MT/s):** Wie viele Datenpakete pro Sekunde? (z.B. 3200 MT/s bei DDR4, 6000 MT/s bei DDR5).
- **Latenz (CL - CAS Latency):** Wie viele Takte dauert es, bis eine Anfrage beantwortet wird? (z.B. CL16 vs CL40).
- **Regel:** Hoher Takt + niedrige CL = Schnell.
- **Realität:** Für Office egal. Für Datenbanken/Kompilieren messbar.

### 3.3 Dual Channel vs. Single Channel
Die CPU hat meist 2 Speicherkanäle.
- **Single Channel:** 1x 16 GB Riegel. Datenautobahn ist einspurig.
- **Dual Channel:** 2x 8 GB Riegel. Datenautobahn ist zweispurig -> Doppelte Bandbreite!
- **AP1-Pflicht:** Immer 2 Riegel verbauen (Kit), außer bei extremem Sparzwang.

### 3.4 ECC (Error Correction Code)
- **Non-ECC:** Standard. Wenn ein Bit kippt (0 statt 1 durch Strahlung), stürzt das Programm ab oder Daten sind korrupt.
- **ECC:** Findet und korrigiert 1-Bit-Fehler. Meldet 2-Bit-Fehler.
- **Einsatz:** Zwingend für Server, Finanzsysteme, Medizin.
- **Voraussetzung:** CPU, Board und RAM müssen ECC unterstützen (meist Workstation/Server-Hardware).

---

## 4) Massenspeicher-Technologien: Das Langzeitgedächtnis

Die Ära der drehenden Festplatte (HDD) ist im PC vorbei. Aber SSD ist nicht gleich SSD.

### 4.1 Die Protokolle: AHCI vs. NVMe
- **AHCI (SATA):** Wurde für drehende Platten entwickelt. Hat eine Warteschlange (Queue) mit 32 Befehlen. Limitiert bei 600 MB/s.
- **NVMe (Non-Volatile Memory Express):** Wurde für Flash-Speicher entwickelt. Nutzt PCIe Highspeed-Lanes. Bis zu 64.000 Queues mit je 64.000 Befehlen.
- **Fazit:** NVMe kann tausende kleine Dateien (wie beim Kompilieren von Code) viel schneller verarbeiten als SATA.

### 4.2 Speicherzellen-Typen (SLC, MLC, TLC, QLC)
> 🔬 **Vertiefung (optional – über AP1-Pflichtinhalt):** Dieses Detailwissen ist für Fachgespräche und Server-Planung wertvoll, aber in AP1-Prüfungen selten direkt gefragt. AP1-Pflicht: *„TLC ist der aktuelle Standard; QLC ist günstig aber weniger langlebig; SLC nur für Enterprise-Server."*

Flash-Speicher speichert Bits in Zellen durch Spannung.
- **SLC (Single Level Cell):** 1 Bit pro Zelle. Extrem schnell, extrem langlebig, extrem teuer. (Nur Enterprise).
- **MLC (Multi):** 2 Bits.
- **TLC (Triple):** 3 Bits. Der heutige Standard. Guter Mix.
- **QLC (Quad):** 4 Bits. Günstig, viel Platz, aber langsamer und weniger haltbar. (Gut als Datengrab, schlecht als Systemlaufwerk).

### 4.3 Lebensdauer: TBW (Terabytes Written)
SSD-Zellen nutzen sich ab beim Schreiben.
- **TBW:** Garantierte Schreibmenge (z.B. 600 TBW = Du kannst 600 Terabyte schreiben, bevor die Garantie erlischt).
- **Wichtig für:** Server, Caching-Platten, Video-Processing. Für Office-PCs irrelevant (halten ewig).

---

## 5) Mainboard & Chipsatz-Logik

Das Mainboard ist das Nervensystem.

### 5.1 Formfaktoren (Größe)
Die Bohrungen sind genormt.
1.  **E-ATX:** Extended. Riesig. Für Server/High-End. Passt nicht in normale Gehäuse.
2.  **ATX:** Der Standard. 7 Erweiterungsslots.
3.  **Micro-ATX (µATX):** Kürzer. 4 Slots. Oft günstiger. Meistverkauft für Office-PCs.
4.  **Mini-ITX:** Winzig (17x17cm). 1 Slot (für GraKa). Für kompakte PCs. Teuer, da komplexes Layout.

### 5.2 Der Chipsatz (Z690, B660, X670, B650...)
> 🔬 **Vertiefung (optional):** Die genauen Chipsatz-Bezeichnungen ändern sich mit jeder CPU-Generation. AP1-Pflicht: *„High-End (Z/X) = Overclocking + viele Lanes; Mid-Range (B) = beste Preis/Leistung für Office und Workstations."*

Er bestimmt die Features.
- **High-End (Z/X):** Übertaktung möglich, viele PCIe-Lanes (für mehrere SSDs/GPUs), viele USB-Ports.
- **Mid-Range (B/H):** Solide Ausstattung, meist kein CPU-Overclocking. Beste Preis/Leistung.
- **Entry (A/H):** Nur 2 RAM-Slots, wenig USB. Nur für einfachste Office-PCs.

### 5.3 VRMs (Spannungswandler)
Die Bauteile um den CPU-Sockel, die 12V vom Netzteil in ca. 1.2V für die CPU wandeln.
- **Wichtig:** Billige Boards haben schwache VRMs ohne Kühler. Wenn man da einen i9/Ryzen 9 draufsetzt, überhitzen die VRMs und die CPU drosselt (Throttling), obwohl die CPU selbst kühl ist!

### 5.4 PCIe-Lanes (Datenautobahnen)
Die CPU hat eine begrenzte Anzahl "Direktleitungen" (Lanes).
- **x16:** Meist für Grafikkarte.
- **x4:** Meist für NVMe SSDs.
- **Generationen:**
  - PCIe 3.0: ca. 1 GB/s pro Lane.
  - PCIe 4.0: ca. 2 GB/s pro Lane.
  - PCIe 5.0: ca. 4 GB/s pro Lane. (Zukunftssicher).

---

## 6) Grafikkarten & Beschleuniger (GPU)

Nicht nur für Gamer.

### 6.1 Wann brauche ich eine dedizierte GPU?
- **Gaming:** Offensichtlich.
- **CAD/3D-Modeling:** Häufig sinnvoll bis notwendig, je nach Software, Modellkomplexität und Treiberanforderungen (oft Workstation-GPU empfohlen).
- **Video-Editing:** GPU-Beschleunigung (NVENC, QuickSync) für Encoding/Decoding.
- **Machine Learning / AI:** NVIDIA CUDA-Cores sind hier Standard. Viel VRAM nötig!
- **Multi-Monitor:** Wenn mehr als 2-3 Displays benötigt werden.

### 6.2 VRAM (Video RAM)
Der Speicher der Grafikkarte.
- **Zu wenig VRAM:** Texturen laden nicht, Rendering bricht ab, KI-Modelle laden nicht ("OOM - Out of Memory").
- **AP1-Tipp:** Für 4K-Auflösung oder ML ist VRAM oft wichtiger als reine Rechenleistung.

---

## 7) Fehleranalyse & Hardware-Troubleshooting (Systematischer Ansatz)

Hardware-Probleme sind in der Praxis extrem häufig. Du musst systematisch vorgehen, nicht raten!

### 7.1 Der 6-Schritte-Diagnoseprozess

**Praxisbeispiel:** Ein Kunde ruft an: "Mein PC startet nicht mehr, Bildschirm bleibt schwarz!"

1. **Symptom präzise erfassen:**
   - Drehen die Lüfter? (Ja = Strom kommt an)
   - Piept der PC? (BIOS-Fehlercodes)
   - Leuchten LEDs am Mainboard? (Debug-LEDs)
   - Riecht es verbrannt? (Hardware-Schaden)

2. **Hypothese bilden:**
   - "Lüfter drehen, kein Piep, kein Bild" → Wahrscheinlich: RAM nicht erkannt, GPU defekt, oder CPU/Board-Problem

3. **Minimal-System testen:**
   - Alle unnötigen Komponenten abziehen (Grafikkarte, alle SSDs/HDDs außer System, USB-Geräte)
   - Nur: CPU, 1 RAM-Riegel, Netzteil, Mainboard, Tastatur
   - Startet es jetzt? → Dann war eine der entfernten Komponenten das Problem

4. **Komponenten einzeln tauschen:**
   - RAM in anderen Slot stecken
   - Anderen RAM-Riegel testen
   - Grafikkarte in anderen PCIe-Slot
   - Andere Grafikkarte testen (falls vorhanden)

5. **BIOS-Reset:**
   - CMOS-Batterie 30 Sekunden entfernen → BIOS auf Werkseinstellungen
   - Oft hilft das bei "PC ging nach BIOS-Update nicht mehr"

6. **Dokumentiere Ergebnis:**
   - Was war die Ursache? (z.B. "RAM-Riegel 2 defekt")
   - Was wurde getauscht?
   - Läuft es jetzt stabil?

### 7.2 Typische Hardware-Fehlermuster (Fehler → Diagnose → Lösung)

| Symptom | Wahrscheinliche Ursache | Diagnose-Methode | Lösung | Vermeidung |
|---------|-------------------------|------------------|--------|------------|
| **PC startet, kein Bild, kein Piep** | RAM nicht erkannt oder falsch eingebaut | RAM einzeln testen, andere Slots probieren | RAM neu einsetzen oder tauschen | Immer auf "Klick" beim RAM-Einbau achten, Clips müssen einrasten |
| **PC startet, piept mehrfach** | RAM-Fehler (1 lang + 2 kurz bei Award-BIOS) | BIOS-Piepcode-Tabelle vom Mainboard-Hersteller konsultieren | RAM tauschen oder umstecken | ECC-RAM für kritische Systeme |
| **PC startet, läuft 2 Min, dann plötzlich aus** | CPU überhitzt (Thermal Shutdown) | CPU-Temp im BIOS prüfen: >90°C = Problem | Kühler neu montieren mit frischer Wärmeleitpaste, Airflow prüfen | Immer Schutzfolie vom Kühler entfernen! (Anfängerfehler #1) |
| **PC läuft, aber extrem langsam (gefühlt 10% Speed)** | CPU throttelt wegen Überhitzung oder Strommangel | Task-Manager: CPU bei 100% aber GHz niedrig (z.B. 0,8 statt 3,5 GHz) | VRM-Kühlung prüfen, Netzteil tauschen, BIOS-Einstellungen (Power Limit) | Mainboard-VRMs müssen zur CPU passen (i9 braucht starke VRMs!) |
| **GPU-Lüfter dreht auf 100%, keine Bildausgabe** | GPU überhitzt oder defekt | GPU-Temp mit Tool prüfen (>95°C kritisch), andere GPU testen | GPU-Kühler reinigen/neu aufbauen, GPU tauschen | Gehäuse-Airflow optimieren, Staub regelmäßig entfernen |
| **Zufällige Bluescreens (BSOD) unter Last** | RAM instabil (zu hohe Frequenz/zu niedrige Spannung), oder Überhitzung | MemTest86 laufen lassen (8+ Stunden), Temps prüfen | RAM-Frequenz im BIOS senken (z.B. von 3600 auf 3200 MHz), Spannung leicht erhöhen | XMP/DOCP-Profile nicht blind aktivieren, sondern testen! |
| **SSD wird nicht erkannt im BIOS** | M.2-Slot teilt sich PCIe-Lanes mit SATA-Ports oder GPU | Mainboard-Handbuch: "M.2_1 disabled SATA_5/6" | SSD in anderen M.2-Slot, ODER SATA-Geräte von Ports 5/6 entfernen | Vor Kauf Mainboard-Handbuch lesen! |
| **Netzteil riecht verbrannt, PC tot** | Netzteil defekt, möglicherweise hat es Mainboard/GPU mit "gerissen" | Andere Komponenten mit anderem Netzteil testen (Leih-Netzteil) | Netzteil tauschen, Mainboard/GPU auf Schäden prüfen (Kondensatoren gewölbt?) | NIEMALS Billig-Netzteile! 80 PLUS Bronze minimum für kritische Systeme |

### 7.3 Fünf Praxis-Troubleshooting-Szenarien

#### Szenario 1: "Der neue Gaming-PC crasht unter Last"
**Symptom:** PC läuft stabil bei Office-Arbeit, aber sobald ein Spiel startet, stürzt er nach 5-10 Minuten ab (Blackscreen oder Reboot).

**❌ FALSCHE Diagnose (häufig):**  
"Die Grafikkarte ist defekt, zurückschicken!"

**✅ RICHTIGE Diagnose:**  
1. GPU-Temp prüfen: 75°C (okay)
2. CPU-Temp prüfen: 85°C (okay)
3. **Netzteil-Test:** GPU hat 350W TDP, CPU hat 125W TDP = 475W. Verbautes Netzteil: 500W "NoName". → **Problem gefunden!**

**Beweis:** Unter Last zieht die GPU Lastspitzen von bis zu 400W, CPU 150W → 550W Peak. Das Billig-500W-Netzteil schafft real nur ~450W und schaltet ab (OCP triggert).

**Lösung:** Hochwertiges 750W 80 PLUS Gold Netzteil einbauen.

**AP1-Lesson:** **TCO-Argument:** Ein 20€ teureres Marken-Netzteil hätte den RMA-Zirkus (Return Merchandise Authorization = Rücksendung) gespart = 3 Stunden Arbeitszeit à 50€ = 150€ verloren!

---

#### Szenario 2: "Docker-Container starten extrem langsam"
**Symptom:** Ein Entwickler beschwert sich: "Docker braucht 2 Minuten zum Starten eines Containers, bei Kollegen nur 10 Sekunden!"

**❌ FALSCHE Diagnose:**  
"Docker ist halt langsam, kann man nichts machen."

**✅ RICHTIGE Diagnose:**  
1. Task-Manager öffnen → Leistung → Festplatte: **100% Auslastung bei nur 50 MB/s Transferrate**
2. Festplatten-Check: Systempartition ist eine **alte HDD** (5400 RPM)!
3. Docker liest/schreibt ständig kleine Dateien (Images, Layers) → HDDs sind bei Random I/O extrem langsam

**Beweis:** Gleiche Container auf Kollegen-PC mit NVMe-SSD: 3500 MB/s Random-Read vs. 50 MB/s der HDD.

**Lösung:** NVMe-SSD einbauen (M.2, PCIe 4.0), System klonen oder neu aufsetzen.

**AP1-Lesson:** **Bottleneck-Analyse:** Der i9-Prozessor war vollkommen nutzlos, weil die HDD der Flaschenhals war. **Wirtschaftlichkeit:** 100€ SSD spart dem Entwickler täglich 30 Minuten Wartezeit = 25 Stunden/Monat à 50€/h = 1250€/Monat verschwendet!

---

#### Szenario 3: "Neuer RAM wird nicht erkannt"
**Symptom:** Kunde kauft 2x16 GB DDR4-3600 CL16 RAM-Kit, baut es ein. BIOS zeigt nur "1333 MHz" an, nicht 3600 MHz.

**❌ FALSCHE Diagnose:**  
"Der RAM ist defekt oder gefälscht!"

**✅ RICHTIGE Diagnose:**  
RAM ist **nicht defekt**! DDR-RAM startet immer mit JEDEC-Standard-Takt (DDR4 = 2133 MHz, angezeigt als 1333 MHz wegen Double-Data-Rate). Die **3600 MHz sind ein Overclocking-Profil (XMP/DOCP)**, das manuell im BIOS aktiviert werden muss.

**Beweis:** BIOS → Memory Settings → XMP Profile 1 aktivieren → Reboot → Jetzt läuft RAM mit 3600 MHz.

**Lösung:** XMP/DOCP aktivieren im BIOS.

**AP1-Lesson:** **User-Schulung:** Kunden verstehen technische Begriffe oft falsch. "3600 MHz RAM" bedeutet NICHT, dass er automatisch so läuft. Du musst erklären: "Die 3600 MHz sind die mögliche Höchstgeschwindigkeit, die Sie im BIOS freischalten müssen."

---

#### Szenario 4: "CAD-Software ruckelt auf High-End-PC"
**Symptom:** Architekturbüro kauft sich neue High-End-PCs (i7-13700K, 32 GB RAM), aber AutoCAD ruckelt beim Drehen von 3D-Modellen.

**❌ FALSCHE Diagnose:**  
"Die CPU ist zu schwach, wir brauchen einen i9!"

**✅ RICHTIGE Diagnose:**  
1. GPU-Check: Keine dedizierte Grafikkarte verbaut! Monitor hängt am Mainboard (nutzt iGPU).
2. iGPU der Intel UHD 770 hat nur ~96 Shader-Einheiten, kein Hardware-Raytracing, nur 2 GB VRAM (vom RAM geklaut).
3. **CAD-Software profitiert häufig stark von dedizierter GPU.** (Bei komplexen 3D-Workloads oft notwendig; bei einfachen 2D-Szenarien nicht immer zwingend.)

**Beweis:** NVIDIA RTX A2000 (Workstation-GPU mit zertifizierten Treibern) einbauen → Ruckeln weg, Modell läuft flüssig.

**Lösung:** Workstation-GPU nachrüsten (NVIDIA Quadro/RTX-A-Serie oder AMD Radeon Pro).

**AP1-Lesson:** **Anforderungsermittlung war fehlerhaft!** Bei "CAD", "3D", "Rendering" sollte die GPU-Anforderung immer konkret geprüft und meist eine dedizierte GPU empfohlen werden. Hätte man in Modul 002 (Bedarfsermittlung) gelernt: Signalwort "CAD" → GPU!

---

#### Szenario 5: "Monitor bleibt schwarz, aber PC läuft"
**Symptom:** Neuer PC wird zusammengebaut. Lüfter drehen, Mainboard-LED leuchtet, aber Monitor zeigt "No Signal".

**❌ FALSCHE Diagnose:**  
"Monitor ist kaputt!"

**✅ RICHTIGE Diagnose:**  
1. CPU-Check: Verbaut ist ein **AMD Ryzen 5 5600X**.
2. Mainboard-Check: B550-Mainboard mit HDMI/DisplayPort-Ausgängen.
3. **Problem:** Ryzen 5600X hat **KEINE iGPU**! (Nur Ryzen-Modelle mit "G" im Namen oder Ryzen 7000+ haben iGPU)
4. Monitor hängt am Mainboard → kein Signal möglich ohne iGPU

**Beweis:** Günstige Grafikkarte (z.B. GT 1030) einbauen, Monitor an GPU anschließen → Bild erscheint.

**Lösung:** Grafikkarte einbauen (auch wenn nur für Office) ODER CPU tauschen gegen Modell mit iGPU (z.B. Ryzen 5 5600G).

**AP1-Lesson:** **Kompatibilitätsprüfung:** Vor Zusammenbau prüfen: "Hat die CPU eine iGPU?" Falls nein: GPU ist PFLICHT, nicht optional!

---

## 8) AP1-Prüfungsfokus: Hardware-Auswahl & Begründung

### 8.1 Originalnahe AP1-Aufgabe mit Musterlösung

**Aufgabenstellung (20 Punkte, 18 Minuten):**

Die Firma "DesignStudio GmbH" (12 Mitarbeiter) benötigt 4 neue Arbeitsplätze für Grafikdesigner.

**Anforderungen:**
- Software: Adobe Creative Suite (Photoshop, Illustrator, Premiere Pro)
- Bildschirmauflösung: 2x 27" 4K-Monitore pro Arbeitsplatz
- Dateien: Oft 2-5 GB große PSD-Dateien mit vielen Ebenen
- Nutzungsdauer: Mindestens 5 Jahre
- Budget: Max. 2000€ pro Arbeitsplatz (ohne Monitore)
- Arbeitsumgebung: Großraumbüro (Lautstärke ist ein Thema)

**Aufgaben:**
1. Wählen Sie geeignete Hauptkomponenten aus (CPU, RAM, SSD, GPU, Netzteil). **(10 Punkte)**
2. Begründen Sie Ihre Auswahl hinsichtlich **Leistung, Wirtschaftlichkeit und Ergonomie**. **(8 Punkte)**
3. Nennen Sie EINE kritische Kompatibilitätsprüfung, die vor dem Kauf durchgeführt werden muss. **(2 Punkte)**

---

**📋 MUSTERLÖSUNG MIT ERWARTUNGSHORIZONT:**

#### Zu 1) Komponentenwahl (10 Punkte):

| Komponente | Auswahl | Begründungsansatz |
|------------|---------|-------------------|
| **CPU** | Intel Core i5-13600K ODER AMD Ryzen 7 7700X (je ~300€) | 6-8 Performanzkerne für Multitasking, integrierte Grafik als Backup, Virtualisierungsunterstützung |
| **RAM** | 2x 16 GB (32 GB) DDR5-5200 Kit (~120€) | Adobe-Empfehlung: Min. 16 GB, optimal 32 GB für große PSD-Dateien. Dual-Channel für doppelte Bandbreite! |
| **SSD** | 1 TB NVMe Gen4 (~100€) | NVMe für schnelles Laden/Speichern großer Dateien (2-5 GB). 1 TB für Projektarchiv. |
| **GPU** | NVIDIA RTX 4060 (8 GB VRAM) ODER AMD RX 7600 XT (~330€) | Adobe nutzt GPU-Beschleunigung (CUDA/OpenCL). 8 GB VRAM für 4K-Auflösung. 4x DisplayPort für Dual-Monitor. |
| **Mainboard** | B660/B760 (Intel) ODER B650 (AMD) (~150€) | Mid-Range reicht, da kein Overclocking geplant. PCIe 4.0 für GPU/SSD. |
| **Netzteil** | 650W 80 PLUS Gold (~80€) | CPU 125W + GPU 170W + Rest 50W = 345W. × 1,5 Puffer = ~520W. 650W optimal für Effizienz. Gold = niedrige Stromkosten. |
| **Gehäuse** | Gedämmtes Gehäuse (z.B. be quiet! Pure Base 500) (~90€) | Großraumbüro = Lautstärke wichtig! Dämmung + leise Lüfter. |
| **Kühler** | Tower-Luftkühler (z.B. be quiet! Dark Rock 4) (~70€) | Leiser als Boxed-Kühler, zuverlässiger als AIO, wartungsfrei. |
| **SUMME** | **~1.240€** | Rest für Tastatur, Maus, Windows-Lizenz. |

**Punkteverteilung (10 Punkte):**
- CPU sinnvoll gewählt: 1 Punkt
- RAM 32 GB + Dual-Channel erwähnt: 2 Punkte
- SSD NVMe statt SATA: 1 Punkt
- GPU dediziert (nicht iGPU!): 2 Punkte
- Netzteil korrekt dimensioniert (600-750W): 2 Punkte
- Gehäuse/Kühler Lautstärke-Aspekt: 1 Punkt
- Budget eingehalten: 1 Punkt

---

#### Zu 2) Begründung (8 Punkte):

**Leistung (3 Punkte):**
- **32 GB RAM:** Adobe Photoshop lädt 2-5 GB PSD-Dateien komplett in den Arbeitsspeicher. Mit nur 16 GB würde das System bei mehreren offenen Dateien auf die SSD auslagern (Paging) → extrem langsam. **Dual-Channel verdoppelt die RAM-Bandbreite** → schnellerer Filter/Rendering-Einsatz.
- **NVMe-SSD:** Random-I/O ist 5-10x schneller als SATA-SSD. Beim Speichern einer 5-GB-Datei spart das 10-15 Sekunden. Bei 50 Speichervorgängen/Tag = 10 Minuten/Tag gespart.
- **Dedizierte GPU:** Adobe nutzt GPU-Beschleunigung für Filter (z.B. "Weichzeichnen", "Verflüssigen"), Premiere Pro für Video-Encoding (NVENC). **iGPU ist 10x langsamer bei diesen Tasks!**

**Wirtschaftlichkeit / TCO (3 Punkte):**
- **80 PLUS Gold Netzteil:** Bei 8h/Tag, 250 Tagen/Jahr, Ø 200W Verbrauch: Gold (90% Effiz.) = ~440 kWh/Jahr. Bronze (85%) = ~470 kWh/Jahr. Differenz: 30 kWh × 0,30€ = **9€ Ersparnis/Jahr × 5 Jahre × 4 PCs = 180€**. Gold-Netzteil kostet nur 15€ mehr → **amortisiert sich in 2 Jahren!**
- **Langlebigkeit:** Tower-Luftkühler haben keine Verschleißteile (keine Pumpe wie bei AIO). Mainboard mit guten VRMs verhindert Throttling auch nach Jahren. **Weniger Ausfälle = weniger Support-Kosten.**
- **Upgrade-Pfad:** B660/B650-Boards unterstützen CPU-Upgrades der gleichen Generation. Wenn in 3 Jahren mehr Leistung nötig ist: CPU tauschen statt komplett neuer PC.

**Ergonomie (2 Punkte):**
- **Großraumbüro → Lautstärke kritisch:** Gedämmtes Gehäuse + Tower-Luftkühler + semi-passive GPU (Lüfter aus bei < 60°C) = **max. 30 dB(A) im Idle, 40 dB(A) unter Last**. Boxed-Kühler in billigem Blechgehäuse wäre 50+ dB(A) → nervt Kollegen!
- **Dual-Monitor mit 4K:** GPU hat 3x DisplayPort 1.4 → **2x 4K@60Hz kein Problem**. iGPU unterstützt oft nur 1x 4K.

---

#### Zu 3) Kompatibilitätsprüfung (2 Punkte):

**Beispiel-Antwort:**
"Vor dem Kauf muss geprüft werden, ob das **Mainboard 2x M.2-Slots für NVMe-SSDs** hat und ob die **GPU-Länge** (z.B. 30cm) ins Gehäuse passt (Gehäuse-Spezifikation: 'Max. GPU-Länge')."

**Weitere akzeptierte Antworten:**
- "RAM-Kompatibilität prüfen: Board muss DDR5 unterstützen (nicht DDR4)."
- "Netzteil muss ausreichend PCIe-8-Pin-Stecker haben (moderne GPUs brauchen 2x 8-Pin)."
- "Kühler-Höhe prüfen vs. Gehäuse-Breite (z.B. Tower-Kühler 16cm hoch, Gehäuse 18cm breit)."

**Punkteverteilung:**
- Sinnvolle Kompatibilitätsprüfung genannt: 2 Punkte
- Vage Aussage ("alles muss passen"): 0 Punkte

---

### 8.2 Prüfungsrelevante Hardware-Begriffe (Pflicht-Vokabular)

| Begriff | Kontext | Wann erwähnen in AP1? |
|---------|---------|------------------------|
| **TDP (Thermal Design Power)** | Abwärme von CPU/GPU | Bei Netzteil-Dimensionierung + Kühlung |
| **Dual Channel RAM** | 2 Riegel parallel = doppelte Bandbreite | IMMER bei RAM-Empfehlungen! |
| **NVMe vs. SATA** | NVMe ist 5x schneller bei Random-I/O | Bei "große Dateien", "Datenbanken", "Entwicklung" |
| **PCIe-Lanes** | Datenleitungen für GPU/SSD | Bei Multi-GPU oder vielen NVMe-SSDs |
| **80 PLUS Zertifizierung** | Netzteil-Effizienz (Bronze/Gold/Platinum) | Bei TCO-Begründung (Stromkosten über 5 Jahre!) |
| **iGPU vs. dedizierte GPU** | Integriert vs. separate Grafikkarte | Bei "CAD", "Video", "KI" → dediziert. Sonst iGPU okay. |
| **VRM (Voltage Regulator Module)** | Spannungswandler auf Mainboard | Bei High-End-CPUs (i9/Ryzen 9) erwähnen |
| **Bottleneck (Flaschenhals)** | Schwächstes Glied limitiert Gesamtsystem | Bei Troubleshooting (z.B. HDD bremst i9 aus) |
| **ECC RAM** | Fehlerkorrektur-Speicher | Bei Servern, Finanz, Medizin zwingend erwähnen |
| **Formfaktor** | Größe (ATX, Micro-ATX, Mini-ITX) | Bei Gehäuse-Kompatibilität |

**Prüfer-Insider:** Wenn du **"Dual Channel"** und **"TCO mit 80 PLUS"** in deiner Antwort hast, zeigst du Profi-Niveau!

### 8.3 Fünf Insider-Tipps vom Prüfer

#### 1. **Begründungspflicht ist ALLES**
❌ **Falsch:** "Ich empfehle 32 GB RAM."  
✅ **Richtig:** "Ich empfehle 32 GB RAM (2x 16 GB Dual-Channel), weil Adobe Photoshop 5-GB-PSD-Dateien komplett in den Arbeitsspeicher lädt. Mit nur 16 GB würde das System bei mehreren offenen Dateien auf die SSD auslagern (Paging), was 20x langsamer ist. TCO-Argument: Ein Grafiker à 40€/Stunde wartet dann täglich 15 Minuten = 100€/Monat Verlust. 32 GB RAM kosten einmalig 50€ mehr."

**Faustregel:** Pro Komponente mind. 2 Sätze Begründung!

#### 2. **Wirtschaftlichkeit = TCO rechnen!**
Prüfer LIEBEN Rechnungen! Zeig, dass du TCO verstehst:
- Stromkosten über 5 Jahre
- Arbeitszeit-Verlust bei zu langsamer Hardware
- Amortisation von teureren, aber effizienteren Komponenten

**Beispiel-Rechnung:**  
"80 PLUS Gold kostet 20€ mehr als Bronze, spart aber 30 kWh/Jahr × 0,30€ × 5 Jahre = 45€ Strom. → Amortisation nach 2,5 Jahren."

#### 3. **Sicherheit erwähnen (wenn passend)**
Bei Server-Hardware IMMER:
- ECC RAM (Datensicherheit)
- Redundante Netzteile (Ausfallsicherheit)
- RAID (Datenredundanz)

**Buzzword:** "Aus Sicherheitsgründen empfehle ich ECC-RAM, da unkorrekte Berechnungen in der Finanzbuchhaltung zu rechtlichen Problemen führen können."

#### 4. **Standardisierungs-Argument**
"Für alle 4 Arbeitsplätze wähle ich identische Hardware (Standardisierung). Vorteile:
1. Mengenrabatt beim Einkauf (~10%)
2. Ein Image für alle PCs → Rollout schneller
3. Ersatzteile lagerbar (RAM, SSD, Netzteil)
4. Support-Aufwand sinkt (IT kennt Hardware in- und auswendig)"

#### 5. **Must-Have Fokussierung**
Trenne klar zwischen **Must-Have** und **Nice-to-Have**:
- **Must:** 32 GB RAM, NVMe-SSD, dedizierte GPU (sonst kann Adobe nicht vernünftig laufen)
- **Nice:** RGB-Beleuchtung, Glas-Seitenteil, AIO-Wasserkühlung

**In Prüfungen:** Wenn Budget knapp ist, streiche Nice-to-Haves, NIE Must-Haves!

---

## 9) Fallstudien: Welcher PC für wen?

### Fall A: Der Software-Entwickler (Web/Backend)
- **Anforderung:** Docker-Container, VM, IDEs (IntelliJ), Browser-Tabs, 2 Monitore.
- **Kritisch:** RAM (VMs fressen RAM), Kerne (Parallelisierung).
- **Setup:** 
  - CPU: Ryzen 7 oder i7 (8+ Kerne).
  - RAM: **32 GB** oder 64 GB.
  - SSD: NVMe (schnelles I/O für Datenbank-Container).
  - GPU: iGPU reicht oft, sonst kleine T600/GTX für Multi-Monitor.

### Fall B: Der Data-Scientist / ML-Engineer
- **Anforderung:** Große Datensätze, Modell-Training (lokal).
- **Kritisch:** VRAM der Grafikkarte, CUDA-Cores, CPU-Kerne für Pre-Processing.
- **Setup:**
  - GPU: NVIDIA RTX 4090 (24 GB VRAM) oder A-Serie.
  - RAM: 64 GB+ (Datenset muss in RAM passen).
  - CPU: Threadripper oder High-End Desktop.

### Fall C: Der Sachbearbeiter (Buchhaltung)
- **Anforderung:** DATEV, Office, Browser, PDF. Stabil, leise.
- **Kritisch:** Zuverlässigkeit, Ergonomie (scharfer Monitor).
- **Setup:**
  - CPU: i3 / i5.
  - RAM: 16 GB (Zukunftssicher).
  - SSD: 512 GB.
  - Gehäuse: Gedämmt oder Mini-PC (lautlos am Monitor-Rücken montiert).
  - Monitor: 27" IPS QHD (scharfe Schrift für Tabellen).

---

## 10) Systematische Kompatibilitätsprüfung & Übungen

### 10.1 Die mentale Checkliste vor dem Kauf

Bevor du Hardware bestellst, gehe diese Liste durch:

1.  **Sockel-Check:** Passt CPU auf Board? (z.B. LGA1700 auf Z690).
2.  **RAM-Check:** DDR4 oder DDR5 Board?
3.  **Formfaktor-Check:** Passt Board (ATX) ins Gehäuse?
4.  **Längen-Check:** Ist GPU länger als Gehäuse-Platz? Ist Kühler höher als Gehäuse-Breite?
5.  **Power-Check:** Hat Netzteil genug Watt? Hat es genug PCIe-Stecker für die GPU?
6.  **BIOS-Check:** Braucht das Board ein Update für die CPU? (Oft bei neuen CPUs auf älteren Boards der gleichen Generation).

### 10.2 Praxis-Übungen zur Selbstkontrolle

#### Übung 1: Fehleranalyse
**Symptom:** PC startet, Lüfter drehen, aber Bildschirm bleibt schwarz. Es piept nicht.
**Hardware:** Ryzen 5 5600X, B550 Board, 16 GB RAM. Keine Grafikkarte.
**Fehler:** Der Ryzen 5 5600X hat **keine integrierte Grafikeinheit (iGPU)**. Ein Monitor am Mainboard liefert kein Bild. Es fehlt eine Grafikkarte.

#### Übung 2: Flaschenhals-Analyse
**System:** High-End i9-13900K, 64 GB DDR5, aber Windows bootet langsam und Programme öffnen zäh.
**Verbaut:** Eine alte 2 TB HDD, die aus dem alten PC übernommen wurde als Systemplatte.
**Lösung:** Die HDD ist der massive Bottleneck. Einbau einer NVMe SSD und Klonen des Systems ist zwingend.

#### Übung 3: Netzteil-Dimensionierung
**Komponenten:** CPU (120W TDP), GPU (350W TDP), Rest (50W).
**Vorhanden:** 500W Netzteil von 2015.
**Analyse:** 120 + 350 + 50 = 520 Watt *Nennlast*. Lastspitzen noch gar nicht beachtet.
**Urteil:** Das 500W Netzteil wird sofort abschalten oder durchbrennen. Benötigt: Min. 750W oder 850W Qualitätsnetzteil.

---

## 11) Zusammenfassung & Selbsttest: Bist du AP1-bereit?

### 11.1 Die 15 Kernpunkte, die du IMMER nennen können musst

1. **Das magische Dreieck:** Performance ⟷ TCO ⟷ Energieeffizienz. Immer drei Faktoren abwägen!
2. **IPC > GHz:** 8 Kerne à 3,5 GHz (hohe IPC) schlagen 12 Kerne à 4,2 GHz (niedrige IPC) bei Single-Thread-Last.
3. **Cache-Hierarchie:** L1 (Zyklen) → L2 (10-20 Zyklen) → L3 (50+ Zyklen) → RAM (100-200 Zyklen).
4. **Dual-Channel ist PFLICHT:** 2x 16 GB ist doppelte Bandbreite gegenüber 1x 32 GB!
5. **NVMe vs. SATA:** NVMe hat 5-10x bessere Random-I/O. Bei großen Dateien (2+ GB) oder Datenbanken zwingend!
6. **TBW (Total Bytes Written):** SLCs halten länger als QLCs. Bei Server-Workloads TBW-Garantie prüfen!
7. **VRMs auf Mainboard:** High-End-CPU (i9/Ryzen 9) braucht 12+ Power-Phasen. Billig-Board = Throttling!
8. **PCIe-Lane-Verteilung:** x16 für GPU, x4 für NVMe, Rest für SATA etc. Wenn M.2_1 belegt → SATA_5/6 disabled!
9. **80 PLUS Zertifizierung:** Gold (90% Effizienz) hat sich in 2-3 Jahren amortisiert vs. Bronze (85%).
10. **TDP-Netzteil-Regel:** (CPU-TDP + GPU-TDP + 50W) × 1,5 = empfohlene Netzteil-Watt.
11. **iGPU vs. dediziert:** Bei "CAD", "3D", "Video", "KI" ist eine dedizierte GPU bei anspruchsvollen Workloads meist sinnvoll; iGPU reicht für Office und leichte Aufgaben.
12. **ECC RAM:** Bei Server, Finanz, Medizin zwingend (Fehlerkorrektur für Datensicherheit).
13. **Formfaktoren:** ATX (305×244mm) > MicroATX (244×244mm) > Mini-ITX (170×170mm). Je kleiner, desto weniger Slots!
14. **Bottleneck-Analyse:** Schwächstes Glied limitiert Gesamtsystem. i9 + HDD = Geldverschwendung!
15. **Kompatibilität vor Kauf:** Sockel, DDR-Generation, GPU-Länge vs. Gehäuse, Kühler-Höhe, BIOS-Version, PCIe-Lanes!

### 11.2 5-Minuten-Blitz-Check (Ja/Nein-Fragebogen)

Beantworte jede Frage spontan mit **Ja** oder **Nein**. Dann zähle deine Punkte.

| # | Frage | Deine Antwort |
|---|-------|---------------|
| 1 | Kann ich erklären, warum Dual-Channel RAM doppelte Bandbreite hat? | ☐ Ja ☐ Nein |
| 2 | Weiß ich, dass höhere GHz nicht automatisch "schneller" bedeutet? (IPC!) | ☐ Ja ☐ Nein |
| 3 | Kann ich TDP eines Systems berechnen: (CPU + GPU + 50W) × 1,5? | ☐ Ja ☐ Nein |
| 4 | Weiß ich, wann NVMe statt SATA SSD sinnvoll ist? (große Dateien, DBs) | ☐ Ja ☐ Nein |
| 5 | Kann ich 80 PLUS Gold wirtschaftlich begründen? (TCO-Rechnung) | ☐ Ja ☐ Nein |
| 6 | Weiß ich, dass Ryzen 5600X keine iGPU hat, 5600G aber schon? | ☐ Ja ☐ Nein |
| 7 | Kann ich erklären, warum ein M.2-Slot SATA-Ports deaktivieren kann? | ☐ Ja ☐ Nein |
| 8 | Weiß ich, wann ECC RAM PFLICHT ist? (Server, Finanz, Medizin) | ☐ Ja ☐ Nein |
| 9 | Kann ich einen Bottleneck diagnostizieren? (z.B. HDD bremst i9) | ☐ Ja ☐ Nein |
| 10 | Weiß ich, dass VRMs bei High-End-CPUs wichtig sind? (Throttling!) | ☐ Ja ☐ Nein |

**Auswertung:**
- **10/10 Ja:** 🏆 Du bist AP1-bereit! Quiz starten.
- **7-9 Ja:** ⚠️ Noch 1-2 Schwachstellen. Nochmal Kapitel 1, 2, 5 lesen.
- **< 7 Ja:** ❌ Zu viele Lücken. Modul von vorne durcharbeiten!

### 11.3 Checkliste: Kann ich das?

Hake ab, was du sicher kannst:

- [ ] **Komponente CPU:** Kerne, Threads, IPC, Cache, Virtualisierung erklären
- [ ] **Komponente RAM:** DDR-Generationen, Dual Channel, ECC, Latenzen (CL)
- [ ] **Komponente SSD:** SATA vs. NVMe, TLC vs. QLC, TBW-Garantie
- [ ] **Komponente Mainboard:** VRMs, PCIe-Lanes, Formfaktoren, Chipsatz
- [ ] **Komponente GPU:** CUDA vs. OpenCL, VRAM, PCIe-x16/x8, iGPU vs. dediziert
- [ ] **Komponente Netzteil:** TDP-Berechnung, 80 PLUS, Kabelmanagement, Schutzschaltungen (OCP/OVP)
- [ ] **Fehleranalyse:** 6-Schritte-Prozess, Minimal-System, BIOS-Reset
- [ ] **Troubleshooting:** 8 typische Fehler erkennen und lösen (z.B. "kein Bild, kein Piep")
- [ ] **AP1-Prüfung:** Hardware-Auswahl mit TCO-Begründung begründen
- [ ] **Kompatibilität:** Sockel, DDR, Formfaktor, GPU-Länge, PCIe-Lanes vor Kauf prüfen

**Wenn alles abgehakt:** Glückwunsch! Du beherrschst Modul 003!

### 11.4 Weiterführende Quellen für Profis

- **CPU/GPU-Benchmarks:** [PassMark](https://www.cpubenchmark.net), [3DMark](https://www.3dmark.com)
- **Kompatibilitätsprüfung:** [PCPartPicker](https://pcpartpicker.com/list/) (automatische Inkompatibilitäts-Warnung!)
- **Netzteil-Rechner:** [be quiet! PSU Calculator](https://www.bequiet.com/de/psucalculator)
- **Datenblätter:** Immer Intel ARK, AMD Specs, NVIDIA Specs konsultieren, NICHT nur Marketing!
- **TBW-Garantien:** SSD-Hersteller-Spezifikationen (z.B. Samsung 970 EVO Plus: 600 TBW für 1 TB Modell)

### 11.5 Eselsbrücken zum Merken (Die "Hardware-Merksätze")

#### 1. **TDP-Netzteil-Formel**
> **"Tiere Gehen Plus 50 Mal 1,5 Watt!"**  
> (CPU-**T**DP + **G**PU-TDP + **50**W) × **1,5** = Netzteil-Watt  
> Beispiel: (125 + 350 + 50) × 1,5 = 787,5W → 850W Netzteil nehmen!

#### 2. **Dual-Channel-Pflicht**
> **"Zwei Riegel Rasen, Einer Rostet!"**  
> 2x 16 GB = doppelte Bandbreite gegenüber 1x 32 GB.  
> Bei AMD Ryzen ist Dual Channel PFLICHT (Infinity Fabric profitiert massiv!).

#### 3. **Cache-Hierarchie (L1 → L2 → L3 → RAM)**
> **"Lass Lieber Lange Rechnen!"**  
> **L**1 (schnellst, kleinst) → **L**2 → **L**3 → **R**AM (langsam, groß).  
> Je näher am Core, desto schneller, aber teurer/kleiner!

#### 4. **PCIe-Lane-Verteilung**
> **"GPU kriegt 16, SSD kriegt 4, Rest ist für Scherze da!"**  
> PCIe x16 → GPU  
> PCIe x4 → NVMe-SSD  
> Rest → SATA, USB-Controller, etc.

#### 5. **DDR-Generationen sind NICHT kompatibel**
> **"Die Kerbe sitzt woanders, merke dir die Grenzen!"**  
> DDR4 vs. DDR5: Mechanisch inkompatibel (Kerbe an anderer Stelle).  
> Niemals versuchen, DDR4 in DDR5-Slot zu zwingen!

#### 6. **iGPU vs. dedizierte GPU**
> **"C-A-D und K-I brauchen GPU, sonst ruckelt's zu!"**  
> Signalwörter: **C**AD, **A**utoCAD, **D**esign, **K**I, 3D-Modelling, Video-Editing → dedizierte GPU oft sinnvoll; konkrete Software-Anforderungen immer prüfen.

#### 7. **NVMe vs. SATA SSD**
> **"Große Dateien? Dann NVMe-Zeilen!"**  
> Bei > 1 GB Dateien (Datenbanken, Video, Docker-Images) ist NVMe 5-10x schneller.

#### 8. **ECC RAM Pflicht-Szenarien**
> **"Finanz, Server, Medizin – ECC muss mit hinein!"**  
> Fehlerkorrektur-Speicher bei kritischen Daten (Buchhaltung, Krankenhaus-IT).

---

**Abschluss:** Jetzt hast du das Rüstzeug, um Hardware wirklich zu verstehen und nicht nur Prospekte zu lesen. Wenn du die Unterschiede zwischen L1-Cache und RAM-Latenz verstanden hast, bist du bereit für das Quiz!

