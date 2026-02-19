# 005 – Netzwerkgrundlagen: Die Adern der IT (Deep Dive)

## Lernzeit & Zielniveau
- **Empfohlene Lernzeit:** 4 – 6 Stunden (inkl. Rechenübungen)
- **Zielniveau:** Experte. Du beherrscht das OSI-Modell im Detail (Layer 1–7), kannst Subnetting sicher berechnen (CIDR, Netzmasken binär), verstehst die Unterschiede zwischen Routing und Switching auf Paket-Ebene und kennst die Details der physikalischen Verkabelung (Strukturierte Verkabelung).

---

## Kapitelübersicht
1.  **Einführung & Netzwerktopologien (Physisch vs. Logisch)**
2.  **Das OSI-Referenzmodell (7 Schichten im Detail)**
3.  **Hardware & Übertragungstechnik (Layer 1)**
    *   Kupferkabel (Twisted Pair, Schirmung)
    *   Lichtwellenleiter (Single-/Multimode)
    *   Strukturierte Verkabelung (Primär-, Sekundär-, Tertiärbereich)
4.  **Switching (Layer 2) – Mehr als nur Verteilen**
    *   MAC-Adressen & Frames
    *   Kollisions- vs. Broadcast-Domänen
    *   VLANs (Virtuelle LANs) & Tagging (802.1Q)
5.  **Routing & IP-Adressierung (Layer 3) – Der Wegweiser**
    *   IPv4 Aufbau & Klassen
    *   **Subnetting Deep Dive:** Netz- & Hostanteil, CIDR
    *   Routing-Tabellen & NAT (Network Address Translation)
    *   IPv6 Einführung (Adressaufbau, Hexadezimal)
6.  **Transport & Protokolle (Layer 4)**
    *   TCP (3-Way-Handshake) vs. UDP
    *   Wichtige Ports & Dienste
7.  **Zusammenfassung & Prüfungs-Checkliste**

---

## 1. Einführung & Netzwerktopologien

Ein Netzwerk dient dem Austausch von Daten und der gemeinsamen Nutzung von Ressourcen (Drucker, Speicher, Internet). Man unterscheidet nach Ausdehnung (LAN, MAN, WAN) und Struktur (Topologie).

### 1.1 Netzwerkausdehnung
*   **PAN (Personal Area Network):** Wenige Meter (Bluetooth, NFC, ZigBee).
*   **LAN (Local Area Network):** Ein Gebäude oder Firmengelände. Hohe Datenraten (1-10 GBit/s), geringe Latenz. Eigentum des Betreibers.
*   **MAN (Metropolitan Area Network):** Stadtnetz (z.B. Vernetzung von Filialen in einer Stadt, Glasfaserringe der Stadtwerke).
*   **WAN (Wide Area Network):** Länderübergreifend. Nutzt öffentliche Leitungen (Telekom, Backbone-Provider). Langsamer als LAN, teurer.
*   **GAN (Global Area Network):** Weltumspannend (Satellitenlinks).

### 1.2 Topologien (Aufbau)
Wichtig für die AP1: Unterschied zwischen **physikalischer** (Verkabelung) und **logischer** (Datenfluss) Topologie.

| Topologie | Aufbau | Vorteile | Nachteile | Einsatz heute |
| :--- | :--- | :--- | :--- | :--- |
| **Stern** | Alle Geräte an zentralem Knoten (Switch). | Ausfall eines Endgeräts stört andere nicht. Leicht erweiterbar. Fehlersuche einfach. | Fällt der Zentralknoten (Switch) aus, steht alles. Hoher Kabelaufwand. | **Standard im Ethernet-LAN.** |
| **Bus** | Alle Geräte an einem Kabelstrang. Abschlusswiderstände nötig. | Wenig Kabel. Einfach zu installieren. | Kabelbruch legt alles lahm. Kollisionen (CSMA/CD nötig). Kaum skalierbar. | Veraltet (LWL-Backbones, Koax). |
| **Ring** | Geschlossener Kreis (jeder hat 2 Nachbarn). | Deterministischer Zugriff (Token Passing), keine Kollisionen. | Ausfall eines Geräts unterbricht Ring (außer Doppelring FDDI). Aufwendig. | MAN-Bereich (Glasfaserringe). |
| **Baum** | Hierarchische Sterne (Core-Switch -> Etagen-Switch -> PC). | Strukturiert, gut verwaltbar für große Gebäude. | Fällt die Wurzel (Core) aus, sind ganze Äste getrennt. | Große Firmen-Netzwerke. |
| **Mesh (Vermascht)** | Jeder mit jedem (Vollvermascht) oder vielen (Teilvermascht). | Höchste Ausfallsicherheit. Fällt eine Leitung aus, nimmt man eine andere. | Extrem teuer und komplex. | Internet-Backbone, Router-Vernetzung. |

---

## 2. Das OSI-Referenzmodell (7 Schichten)

Das **O**pen **S**ystems **I**nterconnection Modell ist abstrakt, aber essenziell. Es beschreibt, wie Kommunikation funktioniert. Merksatz: *"Alle Deutschen Schüler Trinken Gerne Pils Schusster"* (7 bis 1) oder *"Please Do Not Throw Sausage Pizza Away"* (1 bis 7).

### Die 7 Schichten im Detail

#### Schicht 7: Anwendungsschicht (Application Layer)
*   **Aufgabe:** Schnittstelle zur Software/zum Benutzer. Hier finden Dateneingabe und -ausgabe statt.
*   **Protokolle:** HTTP (Web), SMTP (Mail), FTP (Datei), SSH (Remote).
*   **Beispiel:** Du klickst im Browser auf einen Link.

#### Schicht 6: Darstellungsschicht (Presentation Layer)
*   **Aufgabe:** Datenformate übersetzen. Sorgt dafür, dass Sender und Empfänger die gleiche "Sprache" sprechen. Auch Verschlüsselung und Kompression gehören hierher.
*   **Formate:** ASCII, EBCDIC, JPEG, MP3, UTF-8. TLS/SSL (Verschlüsselung) sitzt hier (und in Layer 5).

#### Schicht 5: Sitzungsschicht (Session Layer)
*   **Aufgabe:** Steuerung der Verbindung. Aufbau, Abbau und Wiederaufnahme (Checkpoints). Wer darf senden? (Dialogkontrolle).
*   **Beispiel:** Login-Session bei einer Datenbank oder RPC (Remote Procedure Call).

#### Schicht 4: Transportschicht (Transport Layer)
*   **Aufgabe:** Segmentation (Daten in Häppchen teilen) und Reassembly. Fehlerkontrolle (kamen alle Pakete an?). Zuordnung zu Diensten über **Ports**.
*   **Protokolle:** TCP (sicher), UDP (schnell).
*   **Einheit:** Segmente (TCP) oder Datagramme (UDP).

#### Schicht 3: Vermittlungsschicht (Network Layer)
*   **Aufgabe:** Logische Adressierung (IP-Adressen) und **Routing** (Wegfindung durch fremde Netze). Entscheidung: "Muss das Paket hier bleiben oder zum Router?".
*   **Protokolle:** IPv4, IPv6, ICMP (Ping), IPsec.
*   **Hardware:** Router, Layer-3-Switch.
*   **Einheit:** Pakete (Packets).

#### Schicht 2: Sicherungsschicht (Data Link Layer)
*   **Aufgabe:** Physikalischer Zugriff auf das Medium. Physikalische Adressierung (MAC). Fehlererkennung auf der Leitung (Prüfsumme FCS). Unterteilt in LLC (Logical Link Control) und MAC (Media Access Control).
*   **Protokolle:** Ethernet (802.3), WLAN (802.11), ARP (löst IP zu MAC auf).
*   **Hardware:** Switch, Bridge, NIC (Network Interface Card).
*   **Einheit:** Frames (Rahmen).

#### Schicht 1: Bitübertragungsschicht (Physical Layer)
*   **Aufgabe:** Übertragung von rohen Bits (0/1) als Strom, Licht oder Funkwellen. Definition von Steckern, Spannungen, Kabelspezifikationen.
*   **Hardware:** Hub, Repeater, Kabel, Modem.
*   **Einheit:** Bits.

---

## 3. Hardware & Übertragungstechnik (Layer 1)

Ohne Kabel keine Daten. In der AP1 werden oft Fragen zur "Strukturierten Verkabelung" gestellt.

### 3.1 Twisted Pair (Kupfer)
Verdrillte Adernpaare (Vermeidung von Übersprechen/Crosstalk).
*   **Kabeltypen (Schirmung):**
    *   **U/UTP:** Unscreened / Unscreened (Ungeschirmt).
    *   **F/UTP:** Foil / Unscreened (Gesamtschirm Folie).
    *   **S/FTP:** Screened / Foiled Twisted Pair (Gesamtschirm Geflecht + Adernpaare Folie). **Standard in DE!**
*   **Kategorien (Leistung):**
    *   **Cat 5e:** Bis 1 Gbit/s @ 100 MHz. (Standard).
    *   **Cat 6A:** Bis 10 Gbit/s @ 500 MHz. (Empfohlen für Neubau).
    *   **Cat 7:** Bis 10 Gbit/s @ 600-1000 MHz. (Erfordert spezielle Stecker wie GG45, wird oft mit RJ45 "gedrosselt").
    *   **Cat 8:** Bis 40 Gbit/s (nur kurze Strecken, Rechenzentrum).
*   **Limit:** Max. **100 Meter** (90m Verlegekabel + 10m Patchkabel).

### 3.2 Lichtwellenleiter (LWL / Glasfaser)
Übertragung durch Lichtimpulse.
*   **Singlemode (Monomode):**
    *   Sehr dünner Kern (9 µm).
    *   Lichtquelle: Laser.
    *   Kaum Signaldämpfung -> Riesige Reichweiten (bis 100 km+).
    *   Teuer.
*   **Multimode:**
    *   Dickerer Kern (50 µm oder 62,5 µm).
    *   Lichtquelle: LED.
    *   Licht wird im Kern reflektiert -> Signal verschwimmt auf Distanz (Modendispersion).
    *   Reichweite: ca. 500m - 2km. Günstiger, gut für Inhouse-Backbones.
*   **Vorteile:** Abhörsicher, galvanische Trennung (kein Kurzschluss möglich, kein Potentialausgleich nötig), unempfindlich gegegen elektromagnetische Störungen (EMV). Ideal für Verbindungen zwischen Gebäuden (kein Blitzschlagrisiko).

### 3.3 Strukturierte Verkabelung (EN 50173)
Ein genormtes Konzept für Gebäude.
1.  **Primärbereich (Gelände):** Verbindung zwischen Gebäuden (Campus-Backbone). -> Meist **Glasfaser (Singlemode)**, da >100m und Potentialtrennung wichtig.
2.  **Sekundärbereich (Gebäude):** Verbindung zwischen Etagen (Vertikal-Verkabelung / Steigleitung). -> Meist **Glasfaser (Multimode)** oder hochwertiges Kupfer.
3.  **Tertiärbereich (Etage):** Verbindung vom Etagenverteiler zur Dose im Büro (Horizontal-Verkabelung). -> Meist **Kupfer (Cat 6a/7)**. Max 90m + 10m Patchkabel.

---

## 4. Switching (Layer 2) – Die Intelligenz im LAN

Ein Switch verbindet Geräte im LAN und nutzt **MAC-Adressen** (Media Access Control).
*   Beispiel MAC: `00:A0:C9:14:C8:29` (48 Bit / 6 Byte, Hexadezimal).
*   Die ersten 3 Byte (`00:A0:C9`) sind die **OUI** (Herstellerkennung, z.B. Intel).
*   Die letzten 3 Byte sind die Seriennummer.

### Funktionsweise
Der Switch führt eine **SAT (Source Address Table)**.
1.  Frame kommt auf Port 1 rein (Absender A). Switch lernt: "A ist an Port 1".
2.  Switch prüft Ziel-MAC.
    *   Ist Ziel bekannt (z.B. an Port 5)? -> Weiterleitung **nur** an Port 5 (Unicast).
    *   Ist Ziel unbekannt? -> Weiterleitung an **alle** Ports außer 1 (**Flooding**).
    *   Ist es ein Broadcast (`FF:FF:FF:FF:FF:FF`)? -> Immer an **alle**.

### Domänen (Wichtig!)
*   **Kollisionsdomäne:** Wo können Pakete zusammenstoßen?
    *   Hub: Das ganze Netz ist *eine* Kollisionsdomäne.
    *   Switch: *Jeder Port* ist eine eigene Kollisionsdomäne (Kollisionen fast unmöglich dank Full-Duplex).
*   **Broadcastdomäne:** Wie weit geht ein "Ruf an alle"?
    *   Switch: Leitet Broadcasts weiter. Ein Switch-Netz = *eine* Broadcastdomäne.
    *   Router: **Stoppt** Broadcasts. Jede Router-Schnittstelle = eigene Broadcastdomäne.

### VLAN (Virtual LAN) - IEEE 802.1Q
Man teilt einen physischen Switch logisch in mehrere Netze.
*   **Sinn:** Sicherheit (Abteilung Vertrieb sieht nicht HR), Performance (weniger Broadcasts).
*   **Tagging:** Wenn Frames zwischen Switches reisen, bekommen sie einen "Aufkleber" (Tag) mit der VLAN-ID (z.B. ID 10 für Vertrieb).

---

## 5. Routing & IP-Adressierung (Layer 3)

IP (Internet Protocol) ermöglicht weltweite Kommunikation.

### 5.1 IPv4-Adressen
32 Bit lang, dargestellt als 4 Dezimalzahlen (Dotted Decimal).
Beispiel: `192.168.178.1`
Besteht immer aus **Netzwerkanteil** (PLZ) und **Hostanteil** (Hausnummer).

#### Subnetzmasken & CIDR
Die Maske bestimmt, wie groß der Netzwerkanteil ist.
*   Klasse C Standard: `255.255.255.0` (/24).
    *   Die ersten 24 Bit sind Netzwerk (`192.168.178`).
    *   Die letzten 8 Bit sind Host (256 Möglichkeiten).
    *   **Wichtig:** Erste Adresse = Netz-ID (`.0`), Letzte Adresse = Broadcast (`.255`).
    *   Nutzbare Adressen: 256 - 2 = **254**.

#### Berechnung für Profis (Subnetting)
Szenario: Wir brauchen Netze für je 30 Hosts.
Wir brauchen 5 Host-Bits ($2^5 = 32$ Adressen).
Bleiben 27 Netz-Bits ($32 - 5 = 27$).
Neue Maske: **/27** oder `255.255.255.224`.
*   Netz 1: `.0` bis `.31` (Nutzbar: 1-30).
*   Netz 2: `.32` bis `.63` (Nutzbar: 33-62).

### 5.2 NAT (Network Address Translation)
Wir haben zu wenig IPv4-Adressen.
*   **Lösung:** Private IPs im LAN (`192.168.x.x`, `10.x.x.x`, `172.16.x.x`). Diese werden im Internet nicht geroutet.
*   Der Router tauscht beim Rausgehen die private Absender-IP gegen seine *eine* öffentliche IP aus und merkt sich die Zuordnung (**NAT Table** / Masquerading).

### 5.3 IPv6 - Die Zukunft (seit 20 Jahren)
*   **128 Bit** lang. Unendlich viele Adressen.
*   Format: Hexadezimal, 8 Blöcke. `2001:0db8:85a3:0000:0000:8a2e:0370:7334`.
*   **Kürzungsregeln:**
    1.  Führende Nullen pro Block weg: `0db8` -> `db8`.
    2.  Einmalig Folge von Null-Blöcken durch `::` ersetzen.
    *   Beispiel: `fe80:0:0:0:200:f8ff:fe21:67cf` -> `fe80::200:f8ff:fe21:67cf`.
*   **Link-Local Address:** Fängt immer mit `fe80` an. Funktioniert ohne Router (ähnlich wie eine MAC).

---

## 6. Transport Layer & Protokolle (Layer 4)

Hier wird entschieden, *wie* transportiert wird.

### 6.1 TCP (Transmission Control Protocol)
*   Der "Einschreiben mit Rückschein"-Dienst.
*   **Verbindungsorientiert:** Baut Verbindung auf -> Sendet -> Baut ab.
*   **3-Way-Handshake:**
    1.  Client -> Server: **SYN** ("Hallo, will reden").
    2.  Server -> Client: **SYN-ACK** ("Okay, ich auch").
    3.  Client -> Server: **ACK** ("Alles klar, los gehts").
*   Zuverlässig, ordnet Pakete, fordert verlorene Pakete neu an. (Web, Mail).

### 6.2 UDP (User Datagram Protocol)
*   Der "Postkarte"-Dienst.
*   **Verbindungslos:** Einfach rausschicken.
*   Keine Garantie, keine Ordnung, kein Handshake.
*   Extrem schnell & wenig Overhead. (Streaming, DNS, VoIP/Telefonie).

### 6.3 Die wichtigsten Ports (Auswendig lernen!)
| Port | Protokoll | Dienst |
| :--- | :--- | :--- |
| 20/21 | TCP | FTP (File Transfer) |
| 22 | TCP | SSH (Secure Shell - Fernwartung verschlüsselt) |
| 23 | TCP | Telnet (Fernwartung unverschlüsselt - böse!) |
| 25 | TCP | SMTP (Mailversand) |
| 53 | UDP/TCP | DNS (Namensauflösung) |
| 80 | TCP | HTTP (Webseiten unverschlüsselt) |
| 110 | TCP | POP3 (Mail abholen) |
| 143 | TCP | IMAP (Mail synchronisieren) |
| 443 | TCP | HTTPS (Webseiten verschlüsselt) |
| 3389 | TCP | RDP (Remote Desktop Windows) |

---

## 7. Zusammenfassung & Prüfungs-Checkliste

*   [ ] Ich kann die 7 OSI-Schichten aufsagen und deren Funktion erklären.
*   [ ] Ich weiß, dass ein Repeater nach 100m im Kupferkabel nötig ist, aber LWL kilometerweit reicht.
*   [ ] Ich kann ein /24 Netz in subnetze zerlegen (z.B. /26).
*   [ ] Ich kenne den 3-Way-Handshake (SYN -> SYN-ACK -> ACK).
*   [ ] Ich weiß, dass Router Broadcasts stoppen und Switches sie weiterleiten.
*   [ ] Ich kenne die Ports 22, 53, 80, 443 im Schlaf.

**Merksatz für die Prüfung:** Wenn etwas langsam ist, ist es DNS. Wenn etwas nicht geht, ist es die Firewall. Wenn das Kabel ab ist, ist es Layer 1.
