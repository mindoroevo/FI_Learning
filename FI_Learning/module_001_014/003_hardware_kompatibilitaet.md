# 003 – Hardware-Architektur, Kompatibilität & Troubleshooting (Experten-Guide)

## Lernzeit & Zielniveau
- **Empfohlene Lernzeit:** 180–240 Minuten (Sehr umfangreiches Material, idealerweise auf mehrere Sessions aufteilen)
- **Zielniveau:** Du verstehen die Hardware-Architektur so tief, dass du nicht nur Komponenten zusammenstecken, sondern komplexe Inkompatibilitäten und Flaschenhälse (Bottlenecks) erkennen und lösen kannst. Du verstehst die technischen Datenblätter im Detail.

---

## Kapitelübersicht
1. Das magische Dreieck der Hardware (Performance, TCO, Effizienz)
2. CPU-Architektur Deep Dive (Kerne, Threads, Cache, Virtualisierung)
3. Arbeitsspeicher (RAM) im Detail (Latenzen, Dual Channel, ECC)
4. Massenspeicher-Technologien (NAND-Typen, NVMe-Protokoll, TBW)
5. Mainboard & Chipsatz-Logik (PCIe-Lanes, VRMs, Formfaktoren)
6. Grafikkarten & Beschleuniger (CUDA, VRAM, Encoder)
7. Stromversorgung & Effizienz (80 Plus, Dimensionierung)
8. Kühlung & Thermal Management (TDP, Airflow)
9. Peripherie & Ergonomie für Entwickler (Panel-Typen, Switches)
10. Schnittstellen-Dschungel (USB-Namen, Thunderbolt, DisplayPort)
11. Systematische Kompatibilitätsprüfung
12. Fallstudien: High-Performance, Silent-Office, Budget-Server
13. Übungen und Troubleshooting-Guide

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
- **CAD/3D-Modeling:** Zwingend. (Oft zertifizierte Treiber nötig -> Quadro/Pro-Karten).
- **Video-Editing:** GPU-Beschleunigung (NVENC, QuickSync) für Encoding/Decoding.
- **Machine Learning / AI:** NVIDIA CUDA-Cores sind hier Standard. Viel VRAM nötig!
- **Multi-Monitor:** Wenn mehr als 2-3 Displays benötigt werden.

### 6.2 VRAM (Video RAM)
Der Speicher der Grafikkarte.
- **Zu wenig VRAM:** Texturen laden nicht, Rendering bricht ab, KI-Modelle laden nicht ("OOM - Out of Memory").
- **AP1-Tipp:** Für 4K-Auflösung oder ML ist VRAM oft wichtiger als reine Rechenleistung.

---

## 7) Stromversorgung (PSU) & Effizienz

Das Netzteil (Power Supply Unit) wird oft vernachlässigt.

### 7.1 Dimensionierung (Watt)
Faustformel: (CPU TDP + GPU TDP + 50W Rest) * 1.5 Puffer.
- Zu wenig Watt: PC stürzt unter Last ab (Reboot).
- Viel zu viel Watt: Netzteil läuft ineffizient (geringe Auslastung).
- **Optimal:** Netzteil läuft bei Last bei ca. 50-70% Auslastung (beste Effizienz).

### 7.2 80 PLUS Zertifizierung
Gibt an, wie effizient AC (Steckdose) in DC (PC) gewandelt wird.
- **80 Plus White:** min 80%
- **Bronze, Silber, Gold, Platinum, Titanium:** -> bis zu 96% Effizienz.
- **Wirtschaftlichkeit:** Ein Server, der 24/7 läuft, amortisiert ein teures Platinum-Netzteil schnell über die Stromrechnung!

### 7.3 Schutzschaltungen (Safety First)
Ein gutes Netzteil schützt die Hardware.
- **OVP (Over Voltage):** Zu viel Spannung -> Aus.
- **OCP (Over Current):** Zu viel Strom -> Aus.
- **SCP (Short Circuit):** Kurzschluss -> Aus.
- **OTP (Over Temperature):** Zu heiß -> Aus.
*Billige "China-Böller" haben diese Schutzschaltungen oft nicht und reißen beim Tod Mainboard und GPU mit in den Abgrund.*

---

## 8) Kühlung & Thermal Management

Elektronik hasst Hitze. Silizium degradiert schneller bei Hitze.

### 8.1 Luftstrom (Airflow)
- **Prinzip:** Kühle Luft vorne rein, warme Luft hinten/oben raus.
- **Überdruck (Positive Pressure):** Mehr Lüfter rein als raus. Staub wird aus Ritzen gedrückt (gut, wenn Staubfilter vorne sind).
- **Unterdruck (Negative Pressure):** Mehr Lüfter raus als rein. Zieht Luft (und Staub) durch alle Ritzen. Kühlung oft etwas besser, aber mehr Staub.

### 8.2 Kühler-Typen
- **Boxed Kühler:** Liegt CPU bei. Laut, reicht gerade so für Basis-Leistung.
- **Tower-Kühler (Luft):** Metallblock mit Heatpipes und Lüfter. Zuverlässig, läuft ewig. Kann RAM-Slots blockieren.
- **AIO (All-in-One Wasserkühlung):** Radiator + Pumpe. Sieht schick aus, kühlt sehr gut bei Lastspitzen (Wasser ist träge). Nachteil: Pumpe kann ausfallen, Wasser verdunstet über Jahre.

---

## 9) Peripherie & Ergonomie für Entwickler

Entwickler sind Handwerker. Tastatur und Monitor sind ihr Werkzeug.

### 9.1 Monitor-Panel-Technologien
- **TN (Twisted Nematic):** Billig, sehr schnell (Gaming). Schlechte Farben, schlechte Blickwinkel. -> *Für Entwickler ungeeignet.*
- **IPS (In-Plane Switching):** Gute Farben, sehr gute Blickwinkel. Standard für Büro/Grafik. -> *Empfehlung.*
- **VA (Vertical Alignment):** Top Kontrast (Schwarz ist schwarz), aber kann schmieren ("Ghosting"). -> *Okay für Büro.*
- **OLED:** Perfektes Schwarz, teuer, Einbrenngefahr bei statischen Fenstern (Taskleiste). -> *Vorsicht im Büro.*

### 9.2 Tastaturen
- **Rubberdome (Standard):** Gummimatte. Schwammiges Gefühl. Verschleißt. Billig.
- **Mechanisch:** Jeder Taste hat einen Schalter (Switch). Langlebig, präsises Feedback.
  - *Blue Switches:* Klicken laut (Taktil + Akustisch). Im Großraumbüro verhasst!
  - *Brown Switches:* Taktiles Feedback, aber leise. Beliebt bei Tippern.
  - *Red Switches:* Linear (kein Klick). Beliebt bei Gamern.

---

## 10) Schnittstellen-Dschungel Entwirrt

### 10.1 USB-Namenschaos Tabelle
Marketing hat USB-Namen ruiniert. Hier die Übersetzung:

| Alter Name | Marketing Name | Speed | Typischer Stecker |
|------------|----------------|-------|-------------------|
| USB 2.0 | High Speed | 480 Mbit/s | Typ-A, Micro-B |
| USB 3.0 / 3.1 Gen 1 | USB 3.2 Gen 1 | 5 Gbit/s | Typ-A (Blau) |
| USB 3.1 Gen 2 | USB 3.2 Gen 2 | 10 Gbit/s | Typ-A (Rot), Typ-C |
| USB 3.2 Gen 2x2 | - | 20 Gbit/s | Typ-C |
| USB 4.0 | - | 40 Gbit/s | Typ-C |

### 10.2 Thunderbolt (Intel)
- Nutzt Typ-C Stecker.
- Ist quasi "PCIe über Kabel".
- **Thunderbolt 3/4:** 40 Gbit/s, Bild (2x 4K), Strom (bis 100W), Daten.
- Ermöglicht Docking-Check: Ein Kabel für ALLES.

---

## 11) Systematische Kompatibilitätsprüfung (Die mentale Checkliste)

Bevor du Hardware bestellst, gehe diese Liste durch:

1.  **Sockel-Check:** Passt CPU auf Board? (z.B. LGA1700 auf Z690).
2.  **RAM-Check:** DDR4 oder DDR5 Board?
3.  **Formfaktor-Check:** Passt Board (ATX) ins Gehäuse?
4.  **Längen-Check:** Ist GPU länger als Gehäuse-Platz? Ist Kühler höher als Gehäuse-Breite?
5.  **Power-Check:** Hat Netzteil genug Watt? Hat es genug PCIe-Stecker für die GPU?
6.  **BIOS-Check:** Braucht das Board ein Update für die CPU? (Oft bei neuen CPUs auf älteren Boards der gleichen Generation).

---

## 12) Fallstudien: Welcher PC für wen?

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

## 13) Übungen und Troubleshooting

### Übung 1: Fehleranalyse
**Symptom:** PC startet, Lüfter drehen, aber Bildschirm bleibt schwarz. Es piept nicht.
**Hardware:** Ryzen 5 5600X, B550 Board, 16 GB RAM. Keine Grafikkarte.
**Fehler:** Der Ryzen 5 5600X hat **keine integrierte Grafikeinheit (iGPU)**. Ein Monitor am Mainboard liefert kein Bild. Es fehlt eine Grafikkarte.

### Übung 2: Flaschenhals
**System:** High-End i9-13900K, 64 GB DDR5, aber Windows bootet langsam und Programme öffnen zäh.
**Verbaut:** Eine alte 2 TB HDD, die aus dem alten PC übernommen wurde als Systemplatte.
**Lösung:** Die HDD ist der massive Bottleneck. Einbau einer NVMe SSD und Klonen des Systems ist zwingend.

### Übung 3: Netzteil-Berechnung
**Komponenten:** CPU (120W TDP), GPU (350W TDP), Rest (50W).
**Vorhanden:** 500W Netzteil von 2015.
**Analyse:** 120 + 350 + 50 = 520 Watt *Nennlast*. Lastspitzen noch gar nicht beachtet.
**Urteil:** Das 500W Netzteil wird sofort abschalten oder durchbrennen. Benötigt: Min. 750W oder 850W Qualitätsnetzteil.

---
**Abschluss:** Jetzt hast du das Rüstzeug, um Hardware wirklich zu verstehen und nicht nur Prospekte zu lesen. Wenn du die Unterschiede zwischen L1-Cache und RAM-Latenz verstanden hast, bist du bereit für das Quiz!
