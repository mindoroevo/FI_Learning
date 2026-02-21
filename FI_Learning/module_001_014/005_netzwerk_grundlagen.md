# 005 – Netzwerk-Grundlagen (Vollständiger Deep Dive)

## Lernzeit & Zielniveau
- **Empfohlene Lernzeit:** 3–4 Stunden (inkl. aller Übungen und Fallstudien)
- **Zielniveau:** Du verstehst den Aufbau von Netzwerken vom Kabel bis zur Anwendungsschicht so gut, dass du Topologien planst, Protokolle zuordnest, Netzwerkgeräte auswählst und AP1-Aufgaben zu Netzwerk-Infrastruktur begründet löst.
- **Vorkenntnisse:**
  - Modul 001 (Prüfungsrahmen) bekannt
  - Modul 003 (Hardware) hilfreich für Verständnis von Netzwerkkarten/Switches
  - Grundverständnis: Was ist ein Computer, was ist das Internet?
- **Prüfungsrelevanz:** ⭐⭐⭐⭐⭐ (5/5 Sterne)
  **Begründung:** Netzwerk-Grundlagen sind KERN-Thema der AP1! Fast jede Prüfung enthält ein Szenario mit Netzwerk-Anforderungen: "Richten Sie den Arbeitsplatz im Firmennetzwerk ein", "Warum kann der Mitarbeiter nicht auf den Server zugreifen?" oder "Welche Verkabelung empfehlen Sie für das Büro?"

---

## Kapitelübersicht
1. OSI-Modell & TCP/IP-Modell (Das Fundament)
2. Netzwerkgeräte (Hub, Switch, Router, AP)
3. Protokolle im Überblick (TCP, UDP, DNS, DHCP, HTTP/S)
4. Netzwerktypen und Topologien (LAN, WAN, WLAN, VPN)
5. Verkabelung & physische Standards (Cat, Glasfaser, WLAN-Standards)
6. Fehleranalyse & Netzwerk-Troubleshooting
7. AP1-Prüfungsfokus: Netzwerkplanung & Konfiguration
8. Fallstudien: Büronetz, WLAN-Ausbau, Heimnetz
9. Übungsaufgaben mit Musterlösungen
10. Zusammenfassung & Selbsttest

---

## 1) OSI-Modell & TCP/IP-Modell – Das Fundament

### 1.1 Was ist das OSI-Modell eigentlich?

Stell dir ein Postpaket vor. Bevor ein Brief ankommt, durchläuft er viele Stationen: Du schreibst ihn (Inhalt), steckst ihn in einen Umschlag (Verpackung), klebst eine Adresse drauf (Adressierung), gibst ihn an die Post (Transport) – und auf der anderen Seite wird das alles rückwärts entpackt.

Netzwerkkommunikation funktioniert genauso – strukturiert in **7 Schichten** (Layers). Das **OSI-Referenzmodell** (Open Systems Interconnection) beschreibt diese Schichten. Es ist kein echtes Protokoll, sondern ein **Denkmodell** für Netzwerktechnik.

**Die 7 Schichten mit Merkhilfe:**

| # | Name | Aufgabe | Beispiel | Einheit |
|---|------|---------|---------|---------|
| 7 | **Anwendung** (Application) | Schnittstelle für Nutzer-Apps | HTTP, FTP, DNS, SMTP | Daten |
| 6 | **Darstellung** (Presentation) | Verschlüsselung, Komprimierung, Codierung | TLS/SSL, JPEG, ASCII | Daten |
| 5 | **Sitzung** (Session) | Verbindungsaufbau/-abbau verwalten | NetBIOS, RPC | Daten |
| 4 | **Transport** | Zuverlässige Übertragung, Ports | TCP, UDP | Segment |
| 3 | **Vermittlung** (Network) | Adressierung, Routing zwischen Netzen | IP, ICMP (ping) | Paket |
| 2 | **Sicherung** (Data Link) | Fehlerkorrektur, MAC-Adressen | Ethernet, WLAN (802.11) | Frame |
| 1 | **Bit/Physikalisch** (Physical) | Bits übertragen (Strom, Licht, Funk) | Kabel, Glasfaser, WLAN | Bit |

🧠 **Eselsbrücke (7→1):** **A**lle **D**eutschen **S**tudenten **T**rinken **V**erschiedenes **S**ehr **B**ald  
→ Anwendung · Darstellung · Sitzung · Transport · Vermittlung · Sicherung · Bitübertragung

🧠 **Eselsbrücke (1→7):** **P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way (englisch)

### 1.2 TCP/IP-Modell (Das, was wirklich läuft)

Das OSI-Modell ist Theorie. In der Praxis läuft das **TCP/IP-Modell** mit nur **4 Schichten**:

| TCP/IP-Schicht | Entspricht OSI-Schichten | Protokolle |
|----------------|--------------------------|------------|
| **Anwendung** | OSI 7+6+5 | HTTP, HTTPS, DNS, DHCP, FTP, SSH, SMTP |
| **Transport** | OSI 4 | TCP, UDP |
| **Internet** | OSI 3 | IP (IPv4, IPv6), ICMP |
| **Netzzugang** | OSI 2+1 | Ethernet, WLAN (Wi-Fi), PPPoE |

**AP1-Tipp:** Wenn du nach Protokollen gefragt wirst, musst du wissen, auf welcher Schicht/Ebene sie arbeiten. Das zeigt Verständnis!

### 1.3 Häufige Missverständnisse

❌ **Missverständnis 1:** „Das OSI-Modell ist ein echtes Protokoll, das im Router läuft."  
✅ **Richtig:** OSI ist ein **Referenzmodell** (ein Denkfeldschema). Es gibt dir Sprache und Systematik – keine Software, die „OSI ausführt".

❌ **Missverständnis 2:** „Schicht 2 ist egal, ich muss nur Schicht 3 (IP) kennen."  
✅ **Richtig:** MAC-Adressen (Schicht 2) sind entscheidend für lokale Netzwerkkommunikation. Ohne gültige MAC findet ein Paket den nächsten Hop nicht. ARP verbindet beide Schichten!

❌ **Missverständnis 3:** „TCP ist immer besser als UDP."  
✅ **Richtig:** TCP ist **zuverlässig aber langsamer** (Quittierung, Verbindungsaufbau). UDP ist **schnell aber unzuverlässig** (kein Handshake). → Für DNS und Videostreaming ist UDP besser!

### 1.4 Fachbegriffe – OSI & Protokollmodell

| Begriff | Definition | AP1-Relevanz |
|---------|------------|--------------|
| **OSI-Modell** | 7-Schichten-Referenzmodell für Netzwerkkommunikation | ⭐⭐⭐⭐⭐ |
| **Protokoll** | Vereinbarte Regeln für Datenaustausch zwischen Systemen | ⭐⭐⭐⭐⭐ |
| **MAC-Adresse** | 48-Bit Hardware-Adresse (z.B. 00:1A:2B:3C:4D:5E), OSI Layer 2 | ⭐⭐⭐⭐⭐ |
| **IP-Adresse** | Logische Netzwerkadresse, OSI Layer 3 (z.B. 192.168.1.10) | ⭐⭐⭐⭐⭐ |
| **Port** | Nummer 0–65535 zur Unterscheidung von Diensten (Layer 4) | ⭐⭐⭐⭐⭐ |
| **ARP** | Address Resolution Protocol: IP→MAC-Auflösung im lokalen Netz | ⭐⭐⭐⭐ |
| **Encapsulation** | Daten werden beim Senden je Schicht mit Header ummantelt | ⭐⭐⭐ |
| **PDU** | Protocol Data Unit: Einheit je Schicht (Bit/Frame/Paket/Segment) | ⭐⭐⭐ |

---

## 2) Netzwerkgeräte – Was macht was?

### 2.1 Die vier Kern-Geräte

Ein häufiger Fehler in der AP1: Geräte verwechseln oder falsch begründen. Lerne diese vier auswendig.

#### Hub (Veraltet – Layer 1)
- **Was macht er?** Sendet jedes eingehende Signal an **alle** angeschlossenen Ports gleichzeitig.
- **Problem:** Alle Geräte teilen sich die Bandbreite. 10 Geräte am Hub = jeder bekommt 1/10 der Leistung.
- **Kollisionsdomäne:** Ein riesiges → alle senden und empfangen auf demselben Kanal.
- **AP1-Fazit:** ❌ Heute keine Verwendung mehr. Wird nur gefragt, um den Unterschied zu Switches zu erklären.

#### Switch (Layer 2 – der Standard)
- **Was macht er?** Lernt MAC-Adressen und leitet Frames **gezielt** an den richtigen Port weiter.
- **MAC-Adresstabelle (CAM-Table):** Der Switch baut eine Tabelle: „MAC XY → Port 3".
- **Vorteil:** Jeder Port ist eine eigene Kollisionsdomäne → volle Bandbreite für jeden Port.
- **AP1-Fazit:** ✅ Standard für lokale Netzwerke. Für 10 Büro-PCs: 1x 24-Port-Switch.

#### Router (Layer 3 – Grenzkontrolle)
- **Was macht er?** Verbindet **verschiedene Netzwerke** (z.B. Firmennetz ↔ Internet) und trifft Routing-Entscheidungen anhand von IP-Adressen.
- **Routing-Tabelle:** Liste bekannter Netzwerke + wohin das Paket soll.
- **Default Gateway:** Der Router, den ein Host nutzt, wenn das Ziel nicht im lokalen Netz ist.
- **AP1-Fazit:** ✅ Verbindet internes Netz mit Internet. Jedes Unternehmensnetz hat genau einen (oder mehr für Redundanz).

#### Wireless Access Point (WAP – Layer 2, Funk)
- **Was macht er?** Verbindet WLAN-Clients mit dem kabelgebundenen Netz.
- **Unterschied zu Router:** Kein Routing! Er ist eine „WLAN-Brücke" ins Kabelnetz.
- **AP1-Fazit:** ✅ Für WLAN im Büro: WAP an Switch anschließen, nicht Router ersetzen.

### 2.2 Weitere wichtige Geräte

| Gerät | Layer | Funktion | AP1-Kontext |
|-------|-------|----------|-------------|
| **Firewall** | 3–7 | Filtert Pakete nach Regeln (IP, Port, Protokoll) | Pflicht für Internet-Anbindung |
| **Modem** | 1–2 | Wandelt digitale Signale in Trägersignal (DSL, Kabel) | DSL-Anschluss = Modem+Router |
| **WLAN-Router** | 2–3 | Kombination aus Router + Switch + WAP | Typisch in KMU/Homeoffice |
| **Managed Switch** | 2 | Switch mit Konfiguration (VLANs, Port-Security) | Für größere Netze |
| **PoE-Switch** | 2 | Liefert Strom über Netzwerkkabel (z.B. für WAP, IP-Cam) | Wenn WAP ohne eigene Steckdose |

### 2.3 Häufige Missverständnisse – Geräte

❌ **Missverständnis:** „Ein Switch ist ein teurer Hub."  
✅ **Richtig:** Switch und Hub funktionieren **grundlegend anders**. Ein Hub bremst das ganze Netz, ein Switch bietet jedem Port volle Bandbreite and sendet nur gezielt.

❌ **Missverständnis:** „Der Router regelt auch das WLAN."  
✅ **Richtig:** Ein reiner Router hat kein WLAN. WLAN kommt vom **Wireless Access Point** oder von einem Kombigerät (WLAN-Router).

---

## 3) Protokolle im Überblick – Was spricht womit?

### 3.1 Transport-Schicht: TCP vs. UDP

| Merkmal | TCP | UDP |
|---------|-----|-----|
| **Verbindung** | Verbindungsorientiert (3-Way-Handshake) | Verbindungslos |
| **Zuverlässigkeit** | Garantiert Lieferung + Reihenfolge | Keine Garantie |
| **Geschwindigkeit** | Langsamer (Quittierungen) | Schneller (kein Overhead) |
| **Einsatz** | HTTP/S, E-Mail, FTP, SSH | DNS, VoIP, Video-Streaming, DHCP |
| **AP1-Tipp** | Wenn Daten ankommen müssen → TCP | Wenn Geschwindigkeit wichtiger als Vollständigkeit → UDP |

**3-Way-Handshake (TCP-Verbindungsaufbau):**
```
Client → Server: SYN  (Ich möchte verbinden)
Server → Client: SYN-ACK  (OK, ich bin bereit)
Client → Server: ACK  (Verstanden, starten wir!)
```

### 3.2 Wichtige Protokolle und ihre Ports

Ports musst du auswendig kennen – sie kommen in AP1-Prüfungen vor!

| Protokoll | Port | Schicht | Funktion | Sicher? |
|-----------|------|---------|---------|---------|
| **HTTP** | 80 | 7 | Web-Übertragung (unverschlüsselt) | ❌ Nein |
| **HTTPS** | 443 | 7 | Web-Übertragung (TLS-verschlüsselt) | ✅ Ja |
| **DNS** | 53 | 7 | Namensauflösung (Domain → IP) | teils |
| **DHCP** | 67/68 | 7 | Automatische IP-Vergabe | – |
| **FTP** | 21 | 7 | Dateiübertragung (unverschlüsselt) | ❌ Nein |
| **SFTP/SSH** | 22 | 7 | Sicherer Datei-/Fernzugriff | ✅ Ja |
| **SMTP** | 25/587 | 7 | E-Mail Versand | teils |
| **IMAP** | 143/993 | 7 | E-Mail Abruf (mit Sync) | ✅ TLS |
| **POP3** | 110/995 | 7 | E-Mail Abruf (lokal speichern) | ✅ TLS |
| **RDP** | 3389 | 7 | Windows-Fernzugriff (Remote Desktop) | ✅ (mit TLS) |
| **ICMP** | – | 3 | Diagnose (ping, traceroute) | – |

🧠 **Ports merken:** **H**ilf **H**err **D**r. **D**uchmann **F**link **S**eine **S**ache **M**it **I**nternet **P**ositiv **R**eifen!  
→ HTTP(80) HTTPS(443) DNS(53) DHCP(67) FTP(21) SSH(22) SMTP(25) IMAP(143) POP3(110) RDP(3389)

### 3.3 DNS – Der Telefonbuchdienst des Internets

**Was ist DNS?**  
Du tippst `www.google.de` – aber dein Computer braucht eine IP-Adresse. DNS übersetzt Domainnamen in IP-Adressen.

**Ablauf einer DNS-Anfrage:**
```
1. Browser: "Was ist die IP von www.google.de?"
2. Betriebssystem: Prüft DNS-Cache (schon bekannt?) → Nein
3. OS fragt DNS-Resolver (meist vom Router oder ISP)
4. Resolver fragt Root-Server → .de-Server → Google DNS
5. Antwort: 142.250.185.99
6. Browser baut Verbindung zu 142.250.185.99 auf
```

**AP1-Tipp:** DNS-Fehler = häufige Ursache für „Seite nicht erreichbar". Diagnose: `ping 8.8.8.8` (IP direkt) funktioniert → DNS kaputt. `ping google.de` schlägt fehl → DNS-Problem!

### 3.4 DHCP – Automatische IP-Vergabe

**Was ist DHCP?**  
Statt jedem PC manuell eine IP zuzuweisen, vergibt ein DHCP-Server automatisch IP-Adresse, Subnetzmaske, Default Gateway und DNS-Server.

**DORA-Prozess (DHCP-Ablauf):**
```
Discover → Client: "Gibt es einen DHCP-Server?"  (Broadcast)
Offer    → Server: "Hier, nimm 192.168.1.50!"
Request  → Client: "Ja, ich nehme 192.168.1.50"
Acknowledge → Server: "OK, für 24h reserviert!"
```

🧠 **Merk-Akronym: DORA** – Discover, Offer, Request, Acknowledge

**AP1-Praxis:** Wenn ein PC keine IP-Adresse hat (zeigt 169.254.x.x = APIPA), bedeutet das: DHCP-Server nicht erreichbar!

---

## 4) Netzwerktypen und Topologien

### 4.1 Netzwerktypen nach Größe

| Typ | Bedeutung | Reichweite | Typischer Einsatz |
|-----|-----------|------------|-------------------|
| **PAN** | Personal Area Network | ~10 m | Bluetooth-Headset, USB-Verbindung |
| **LAN** | Local Area Network | Gebäude/Campus | Büronetzwerk (ein Standort) |
| **MAN** | Metropolitan Area Network | Stadt | Uni-Campus, Stadtwerke |
| **WAN** | Wide Area Network | Weltweit | Internet, Konzern-Filialverbindungen |
| **WLAN** | Wireless LAN | ~50–200 m | WLAN im Büro/Homeoffice |
| **VPN** | Virtual Private Network | Weltweit | Sicherer Tunnel über das Internet |

### 4.2 Netzwerktopologien

Die **Topologie** beschreibt, wie Geräte physisch oder logisch miteinander verbunden sind.

| Topologie | Beschreibung | Vorteil | Nachteil | AP1-Relevanz |
|-----------|-------------|---------|----------|--------------|
| **Stern** (Star) | Alle Geräte an zentralem Switch | Ausfall eines Geräts stört Netz nicht | Switch-Ausfall = alles weg | ⭐⭐⭐⭐⭐ Standard heute! |
| **Bus** | Alle Geräte an einer Leitung | Günstig, einfach | Ein Kabelbruch = alles weg | ⭐ Veraltet |
| **Ring** | Geräte in Ringstruktur | Gleichmäßige Last | Ausfall = ganzer Ring weg | ⭐ Veraltet (Token Ring) |
| **Mesh** | Jedes Gerät direkt mit mehreren verbunden | Höchste Ausfallsicherheit | Teuer, aufwändig | ⭐⭐⭐ Für Server/Rechenzentrum |
| **Baum** (Tree) | Hierarchische Stern-Kombination | Skalierbar | Abhängig von Root-Switch | ⭐⭐⭐⭐ Typisch in Firmen |

**AP1-Praxis:** Die **Sterntopologie** (alle PCs an Switch, Switch ans Router) ist heute **der Standard** für Büronetze. Das musst du begründen können!

### 4.3 VPN – Sicherer Tunnel durch unsichere Netze

**Was ist VPN?**  
Ein VPN (Virtual Private Network) erstellt einen **verschlüsselten Tunnel** durch das Internet. Für den Nutzer ist es so, als wäre er direkt im Firmennetz.

**Einsatzfälle:**
- Außendienstler greift von unterwegs auf Firmendaten zu
- Homeoffice-Mitarbeiter verbindet sich mit dem Firmenserver
- Datenschutz in öffentlichen WLANs (Café, Hotel)

**Wichtige VPN-Protokolle:**
| Protokoll | Beschreibung | AP1-Relevanz |
|-----------|-------------|--------------|
| **IPSec** | Standard für Site-to-Site-VPNs, stark verschlüsselt | ⭐⭐⭐⭐ |
| **OpenVPN** | Open-Source, flexibel, oft für Remote-Access | ⭐⭐⭐⭐ |
| **WireGuard** | Modern, sehr schnell, wenig Code → sicher | ⭐⭐⭐ |
| **SSL/TLS-VPN** | Nur Browser nötig (z.B. Citrix, AnyConnect) | ⭐⭐⭐ |

---

## 5) Verkabelung & physische Standards

### 5.1 Twisted-Pair-Kabel (Kupfer)

Das am häufigsten verwendete Netzwerkkabel im Büro.

| Standard | Max. Geschwindigkeit | Max. Länge | Einsatz | Schirmung |
|----------|---------------------|-----------|---------|-----------|
| **Cat 5e** | 1 GBit/s | 100 m | Ältere Office-Netze | UTP/STP |
| **Cat 6** | 1–10 GBit/s | 100 m (1G) / 55 m (10G) | Standard heute | UTP/STP |
| **Cat 6a** | 10 GBit/s | 100 m | DataCenter, Server | STP/SFTP |
| **Cat 7** | 10 GBit/s | 100 m | Hochleistungsumgebung | SFTP |

**AP1-Empfehlung:** **Cat 6** ist der Standard für Neuinstallationen – gut für 10 GBit/s über kurze Strecken, zukunftssicher und günstiger als Cat 7.

**Schirmungstypen:**
- **UTP** (Unshielded): Ohne Schirmung. Günstig, anfällig für EMV-Störungen.
- **STP** (Shielded): Paarweise geschirmt. Für Industrieumgebungen.
- **SFTP** (Screened FTP): Gesamtschirm + Paarschirmung. Höchste Störsicherheit.

### 5.2 Glasfaser (Lichtwellenleiter)

Für große Distanzen, hohe Geschwindigkeit und elektrische Isolation.

| Typ | Kernduchmesser | Reichweite | Einsatz |
|-----|---------------|-----------|---------|
| **Monomode (SMF)** | 9 µm | Bis 100 km | LAN/WAN, Telekom-Backbone |
| **Multimode (MMF)** | 50/62,5 µm | Bis 550 m (OM4) | Datacenter, Gebäudeverteilung |

**Wann Glasfaser statt Kupfer?**
- Distanz > 100 m (Kupfer-Limit)
- Schutz vor elektrischen Störungen (Maschinen, Blitz)
- Höchste Bandbreite (bis 100 GBit/s)
- Datensicherheit (kein elektromagnetischer Abstrahlungsangriff möglich)

### 5.3 WLAN-Standards (IEEE 802.11)

| Standard | Bezeichnung | Max. Datenrate | Frequenz | AP1-Tipp |
|----------|------------|---------------|---------|---------|
| **802.11n** | Wi-Fi 4 | 600 Mbit/s | 2,4 / 5 GHz | Veraltet, aber noch häufig |
| **802.11ac** | Wi-Fi 5 | 3,5 GBit/s | 5 GHz | Standard bis ~2021 |
| **802.11ax** | Wi-Fi 6 | 9,6 GBit/s | 2,4 / 5 / 6 GHz | Aktueller Standard |
| **802.11be** | Wi-Fi 7 | 46 GBit/s | 2,4 / 5 / 6 GHz | Aktuellster Standard (2024) |

**2,4 GHz vs. 5 GHz:**
| Frequenz | Reichweite | Geschwindigkeit | Störanfälligkeit |
|----------|-----------|----------------|-----------------|
| **2,4 GHz** | Größer | Geringer | Hoch (Mikrowelle, Bluetooth!) |
| **5 GHz** | Kleiner | Höher | Geringer |

**AP1-Tipp:** Im Büro mit vielen Geräten → **5 GHz** bevorzugen (weniger Interferenz). In großen Flächen mit Wänden → **2,4 GHz** für Reichweite.

---

## 6) Fehleranalyse & Netzwerk-Troubleshooting

### 6.1 Systematisches Vorgehen

```
1. Symptom erfassen  → Was genau geht nicht? (Ping? Browser? Laufwerk?)
2. Schicht eingrenzen → Hardware? IP? DNS? Protokoll?
3. Hypothese bilden  → Wahrscheinlichste Ursache?
4. Test durchführen  → Diagnose-Tool einsetzen
5. Fix umsetzen      → Konkrete Maßnahme
6. Kontrolle         → Funktioniert es jetzt?
```

### 6.2 Diagnose-Befehle (Windows)

| Befehl | Funktion | Wann einsetzen? |
|--------|---------|----------------|
| `ipconfig` | Zeigt IP, Subnetz, Gateway, DNS | Keine IP? DHCP kaputt? |
| `ping 8.8.8.8` | Testet Internet-Konnektivität (IP-Ebene) | Internet erreichbar? |
| `ping google.de` | Testet DNS-Auflösung | DNS kaputt? |
| `nslookup google.de` | DNS-Diagnose, welcher Server antwortet | DNS-Server ermitteln |
| `tracert 8.8.8.8` | Zeigt Routing-Weg (Hop by Hop) | Wo bricht die Verbindung ab? |
| `netstat -an` | Zeigt offene Verbindungen und Ports | Dienst läuft? Port blockiert? |
| `arp -a` | Zeigt ARP-Tabelle (IP → MAC) | Gerät im Netz sichtbar? |

### 6.3 Typische Fehlerbilder

| Symptom | Wahrscheinliche Ursache | Diagnose | Lösung |
|---------|------------------------|---------|--------|
| PC zeigt **169.254.x.x** als IP | DHCP-Server nicht erreichbar | `ipconfig /release` dann `/renew` | DHCP-Server prüfen, WLAN-Verbindung prüfen |
| **Ping zur IP funktioniert**, Webseite nicht | DNS-Problem | `nslookup google.de` fehlschlägt | DNS-Server in Netzwerkkonfiguration prüfen |
| **Ping zum Gateway schlägt fehl** | Netzwerk-Layer-Problem (IP, Kabel) | `ipconfig` – Gateway korrekt? Kabel? | Gateway-IP prüfen, Switch-Port prüfen |
| **Langsame Übertragung** | Duplex-Mismatch: Port auf Half-Duplex | Switch-Port-Statistik → Collision-Counter | Auto-Negotiation aktivieren oder manuell einstellen |
| **Alle Ports am Switch leuchten dauerhaft** | Broadcast-Sturm (Switching Loop) | Alle Switch-Verbindungen prüfen | Redundante Verbindung entfernen, STP aktivieren |
| **WLAN verbindet sich, aber kein Internet** | Kein Default Gateway oder DNS vom Router | `ipconfig` → Gateway 0.0.0.0? | Router-DHCP prüfen, Router neu starten |
| **WLAN Gerät findet Netz nicht** | Falsche SSID oder Gerät unterstützt Frequenz nicht | SSID-Scan auf beiden Frequenzen | Gerät auf 2,4 GHz wechseln oder 5 GHz SSID prüfen |
| **SSL-Zertifikatsfehler im Browser** | Datum/Uhrzeit falsch ODER Zertifikat abgelaufen | Systemzeit prüfen; Zertifikat prüfen | Datum korrigieren oder Zertifikat erneuern |

### 6.4 Praxis-Troubleshooting-Szenarien

#### Szenario 1: „Der neue PC kommt nicht ins Internet"
**Symptom:** Frischer Büro-PC, Windows installiert, WLAN-Verbindung hergestellt. Browser zeigt „Keine Verbindung".

**Vorgehen:**
1. `ipconfig` → PC hat IP 169.254.55.3 (APIPA! Kein DHCP)
2. DHCP-Server: Router läuft, aber WLAN-Kanal ist auf 5 GHz; PC hat nur 2,4-GHz-WLAN-Karte
3. Fix: AP-Konfiguration → 2,4-GHz-SSID aktivieren ODER separaten 2,4-GHz-AP hinzufügen
4. Alternativ: USB-WLAN-Adapter mit 5-GHz-Support

**AP1-Lesson:** Vor WLAN-Kauf immer prüfen: Unterstützt das Gerät 5 GHz oder nur 2,4 GHz?

---

#### Szenario 2: „Drucker im Netz ist nicht erreichbar"
**Symptom:** Alle Mitarbeiter druckten gestern noch, heute niemand.

**Vorgehen:**
1. `ping [Drucker-IP]` → Request Timeout
2. Drucker physisch prüfen → Netzwerkkabel locker
3. Netzwerkkabel fest eingesteckt → Drucker-IP neu eingeben
4. `ping [Drucker-IP]` → Antwortet
5. Drucker wieder auswählbar in Windows

**AP1-Lesson:** Netzwerkprobleme starten immer mit **physischer Schicht** (Layer 1): Kabel, Stecker, LED am Switch-Port.

---

#### Szenario 3: „Webseite nicht erreichbar, aber andere schon"
**Symptom:** `www.firmenkunde.de` timeout, `google.de` lädt problemlos.

**Vorgehen:**
1. `ping firmenkunde.de` → „Ping request could not find host" → DNS löst nicht auf
2. `nslookup firmenkunde.de` → „Server: Unknown, Address: 192.168.1.1" → Router als DNS
3. `nslookup firmenkunde.de 8.8.8.8` → Antwortet mit IP → Domain existiert!
4. Problem: Router-DNS-Cache veraltet oder interner DNS-Server falsch
5. Fix: DNS auf PC manuell auf 8.8.8.8 setzen oder Router neu starten

---

#### Szenario 4: „VPN verbindet sich nicht aus dem Homeoffice"
**Symptom:** Mitarbeiter kann sich von zu Hause nicht per VPN mit dem Firmenserver verbinden.

**Vorgehen:**
1. Verbindung testen: Ping zur Firmen-VPN-IP → antwortet? → Nein
2. Heimrouter prüfen: Port 1194 (OpenVPN) freigegeben? → Nein, Provider blockiert
3. Fix A: VPN auf SSL/TLS umstellen (Port 443 ist überall offen)
4. Fix B: Mobilfunk-Hotspot statt Heimrouter nutzen

---

#### Szenario 5: „Netzwerk bricht intern alle 5 Minuten zusammen"
**Symptom:** Alle PCs verlieren kurz die Verbindung, dann kommt sie wieder.

**Vorgehen:**
1. Switch-Logs: Masse an Broadcast-Paketen (Broadcast-Sturm)
2. Ursache: IT hat aus Versehen zwei Switch-Ports miteinander verbunden (Loop)
3. STP (Spanning Tree Protocol) war deaktiviert → kein automatischer Schutz
4. Fix: Redundante Verbindung entfernen; STP am Managed Switch aktivieren

---

## 7) AP1-Prüfungsfokus: Netzwerkplanung & Konfiguration

### 7.1 Originalnahe AP1-Aufgabe mit Musterlösung

> **Aufgabe (18 Punkte, 16 Minuten):**
>
> Die „Kanzlei Becker & Partner" zieht in neue Räumlichkeiten. Sie haben 12 PC-Arbeitsplätze, 2 Netzwerkdrucker, 1 NAS-Server und Bedarf an WLAN-Zugang für Besprechungsräume. Alle Geräte sollen per DHCP IP-Adressen erhalten. Mitarbeiter sollen von unterwegs per VPN auf den NAS zugreifen können. Das Netz muss DSGVO-konform sein (Mandantendaten!).
>
> **a)** Welche Netzwerkgeräte benötigt die Kanzlei? Begründen Sie jedes Gerät. (8 Punkte)  
> **b)** Welches Kabel empfehlen Sie und warum? (4 Punkte)  
> **c)** Wie ermöglichen Sie den sicheren Fernzugriff per VPN? (3 Punkte)  
> **d)** Welche Sicherheitsmaßnahmen empfehlen Sie für DSGVO-Konformität? (3 Punkte)

---

**Musterlösung:**

**Zu a) Netzwerkgeräte (8 Punkte):**
- **1x Router/Firewall** (2 Pkt.): Trennt internes Netz vom Internet, ermöglicht VPN-Endpunkt. Pflicht für jede Internet-Anbindung.
- **1x 24-Port Managed Switch** (2 Pkt.): Verbindet alle 12 PCs, 2 Drucker, 1 NAS, 2 WAPs – also mind. 17 Ports. Managed für VLAN-Trennung (Mandantendaten!).
- **2x Wireless Access Point** (2 Pkt.): WLAN für Besprechungsräume. WAPs, keine Router, da Routing schon vom Router übernommen wird.
- **1x NAS (bereits vorhanden)**: Dateiserver für gemeinsamen Zugriff.

**Zu b) Verkabelung (4 Punkte):**
- **Cat 6, UTP** (2 Pkt.): Standard für Neubau. Unterstützt 1–10 GBit/s, max. 100 m, zukunftssicher, günstig.
- **Sternverkabelung** (2 Pkt.): Alle Endgeräte zentral an den Switch. Vorteil: Ausfall eines Geräts stört andere nicht; leicht erweiterbar.

**Zu c) VPN (3 Punkte):**
- **OpenVPN oder IPSec auf dem Router/Firewall** (2 Pkt.): Verschlüsselter Tunnel vom Homeoffice zur Kanzlei. Zugriff nur mit Zertifikat/Key.
- **Zwei-Faktor-Authentifizierung** (1 Pkt.): Passwort + TOTP (z.B. Authenticator-App) – Pflicht für Zugriff auf Mandantendaten.

**Zu d) DSGVO-Sicherheit (3 Punkte):**
- **VLAN-Trennung** (1 Pkt.): Mandantendaten auf eigenem VLAN, getrennt von Gäste-WLAN.
- **Firewall-Regeln** (1 Pkt.): Nur notwendige Ports offen (Whitelist statt Blacklist).
- **Netzwerk-Monitoring/Logging** (1 Pkt.): Zugriffe protokollieren (DSGVO-Rechenschaftspflicht).

### 7.2 Prüfungsrelevante Fachbegriffe (Pflicht-Vokabular)

| Fachbegriff | Wann verwenden? | Punktbringer weil... |
|-------------|-----------------|----------------------|
| **DHCP** | IP-Vergabe automatisch | Zeigt Kenntnis der Auto-Konfiguration |
| **DNS** | Namensauflösung | Erklärt, warum Domain→IP funktioniert |
| **Default Gateway** | Verbindung nach draußen | Router-Adresse für externe Verbindungen |
| **Subnetzmaske** | Netz-/Hostanteile trennen | Grundlage für IP-Vergabe |
| **VPN** | Fernzugriff sichern | Sicherheitsmaßnahme für Außendienst |
| **Firewall** | Internet-Anbindung schützen | Pflicht bei jeder Unternehmensanbindung |
| **VLAN** | Netze logisch trennen | Sicherheit + DSGVO-Argument |
| **Sterntopologie** | Netzwerkstruktur empfehlen | Standard, erkläre Vorteil! |
| **Cat 6** | Kabelempfehlung | Standard begründen (Geschwindigkeit, Distanz) |
| **PoE** | WAP ohne eigene Steckdose | Elegante Lösung für WLAN-Ausbau |
| **802.11ax (Wi-Fi 6)** | WLAN-Standard | Aktuell, hohe Kapazität in Büroumgebung |
| **3-Way-Handshake** | TCP-Verbindungsaufbau | Erklärt, warum TCP zuverlässig ist |

### 7.3 Insider-Tipps vom Prüfer

💡 **Tipp 1: Gerät + Schicht + Begründung = volle Punkte**  
❌ „Ich brauche einen Switch."  
✅ „Ich empfehle einen **Managed Switch (Layer 2)**, da er VLAN-Konfiguration ermöglicht. Dies ist notwendig, um Mandantendaten vom Gäste-WLAN zu trennen (DSGVO-Anforderung)."

💡 **Tipp 2: Sicherheit immer mit DSGVO verknüpfen**  
Sobald Kunden-/Patientendaten oder Anwaltskanzleien im Szenario → DSGVO → VPN + Verschlüsselung + Logs = garantierte Punkte!

💡 **Tipp 3: OSI-Schicht nennen**  
Wenn du einen Router als „Layer 3 Gerät" und einen Switch als „Layer 2 Gerät" bezeichnest, zeigst du Profi-Niveau!

💡 **Tipp 4: Bei WLAN immer Frequenz und Standard nennen**  
„Wi-Fi 6 (802.11ax) auf 5 GHz, da weniger Kanalinterferenz im besetzten Büro" = 2 Punkte extra!

---

## 8) Fallstudien

### 8.1 Fallstudie: Kleines Büronetzwerk (⭐ Basis)

**Szenario:**  
Die „Fahrschule Schmidt" (6 Mitarbeiter, 1 Büro) benötigt ein neues Netzwerk. Sie haben: 6 PCs, 1 Drucker, 1 NAS, DSL 100 Mbit/s Internetanschluss. Budget: 500€. WLAN ist kein Thema.

**Lösung:**  
- **1x DSL-Router/Modem** (ca. 60€): Internet-Anschluss, DHCP-Server.
- **1x 8-Port-Switch, unmanaged** (ca. 30€): Reicht für 6 PCs + Drucker + NAS.
- **Kabel: Cat 6, max. 10 m** (ca. 50€ für alles): Standard, für 100 Mbit ausreichend.
- **Gesamt: ca. 140€** – Budget deutlich unterschritten.

**Begründung:** Für 6 Geräte in einem Raum ist ein unmanaged Switch ausreichend. Managed Switch wäre Over-Engineering (ca. 150€ teurer).

---

### 8.2 Fallstudie: WLAN-Ausbau in Bürogebäude (⭐⭐ Mittel)

**Szenario:**  
Ein Architekturbüro (3 Etagen, 25 Mitarbeiter) möchte WLAN auf allen Etagen. Bisheriges Netz: Cat-6-Stern, 24-Port-Managed-Switch. PC-Arbeit + mobile Tablets für 3D-Visualisierung.

**Anforderungen:**
- Ausreichende Signalstärke auf allen 3 Etagen
- Tablets nutzen 5 GHz für schnelle Datenübertragung
- Gäste-WLAN ohne Zugriff auf Firmendaten

**Lösung:**
- **3x Wireless Access Point (Wi-Fi 6, 802.11ax)** – einer pro Etage, PoE-fähig
- **PoE-Switch** (notwendig, da WAPs keinen eigenen Stromanschluss haben)
- **Konfiguration:** 2 SSIDs pro AP – „Firma-5GHz" und „Gaeste-2.4GHz"
- **VLAN:** Gäste-SSID auf eigenes VLAN → kein Zugriff auf NAS

---

### 8.3 Fallstudie: Homeoffice-Anbindung (⭐⭐⭐ Experten)

**Szenario:**  
Die „Steuerberatung Müller GmbH" hat 4 buchhalter im Homeoffice. Diese brauchen Zugriff auf den zentralen Mandanten-NAS in der Kanzlei. Anforderungen: Sicher (DSGVO), ohne IT-Vorkenntnisse bedienbar, schnell.

**Lösung mit Begründung:**
- **Zentraler VPN-Server** (Router/Firewall in der Kanzlei): OpenVPN oder WireGuard. WireGuard bevorzugt (schnell, moderne Kryptographie, einfache Konfiguration).
- **Verteilung:** Jeder Mitarbeiter erhält vorgefertigte VPN-Konfigurationsdatei → Import in App (1 Klick verbinden).
- **Zwei-Faktor-Authentifizierung:** TOTP-App (z.B. Aegis Authenticator) → DSGVO-Nachweis.
- **Split-Tunneling:** Nur Zugriff auf Kanzlei-NAS geht durch VPN; YouTube, E-Mail laufen direkt → Performance-Optimierung.

---

## 9) Übungsaufgaben mit Musterlösungen

### Aufgabenblock 1: Basiswissen (⭐)

#### Aufgabe 5-B1: Gerät zuordnen
**Zeitlimit:** 3 Minuten | **Punkte:** 4

Ein Büro hat: 8 PCs, 1 Drucker, DSL-Anschluss, 2 Besprechungsräume mit WLAN-Bedarf.

Nenne für jeden Zweck das passende Netzwerkgerät und die OSI-Schicht.

**Musterlösung:**
1. PCs verbinden → **Switch (Layer 2)**
2. Internet → **Router (Layer 3)**
3. WLAN → **Wireless Access Points (Layer 2)**
4. Strom für WAP über Kabel → **PoE-Switch**

---

#### Aufgabe 5-B2: Protokoll und Port
**Zeitlimit:** 2 Minuten | **Punkte:** 3

Nenne Port und Protokoll für:  
a) Sicheres Websurfen  
b) E-Mail empfangen mit Sync (verschlüsselt)  
c) Remote-Desktop auf Windows-Server

**Musterlösung:**  
a) **HTTPS, Port 443, TCP**  
b) **IMAP über TLS, Port 993, TCP**  
c) **RDP, Port 3389, TCP**

---

#### Aufgabe 5-B3: IP-Diagnose
**Zeitlimit:** 3 Minuten | **Punkte:** 4

Ein Kollege hat die IP 169.254.44.12. Was bedeutet das? Was ist dein erster Schritt?

**Musterlösung:**  
169.254.x.x = **APIPA** (Automatic Private IP Addressing) → DHCP-Server nicht erreicht. Erster Schritt: `ipconfig /release` dann `ipconfig /renew`. Falls weiter kein DHCP: DHCP-Server prüfen / Netzwerkkabel prüfen.

---

### Aufgabenblock 2: Anwendung (⭐⭐)

#### Aufgabe 5-A1: Topologieempfehlung begründen
**Zeitlimit:** 5 Minuten | **Punkte:** 6

Ein Startup (15 Mitarbeiter, 1 Büroetage) fragt, ob Bus- oder Sterntopologie besser ist. Begründe eine Empfehlung mit mind. 3 Argumenten.

**Musterlösung:**  
**Empfehlung: Sterntopologie (mit zentralem Switch).**
1. **Ausfallsicherheit:** Fällt ein PC aus, sind alle anderen unberührt. Bei Bus → ein Bruch unterbricht alle.
2. **Skalierbarkeit:** Neuer Mitarbeiter? → Freien Switch-Port belegen, fertig.
3. **Diagnose:** Probleme auf einen Port isolierbar. Bei Bus → gesamte Leitung suchen.
4. **Standard:** Alle modernen Ethernet-Adapter und Switches sind für Stern ausgelegt.

---

#### Aufgabe 5-A2: DSGVO-konforme Netzwerkplanung
**Zeitlimit:** 8 Minuten | **Punkte:** 8

Eine Arztpraxis (10 PCs, Patientendaten, WLAN für Wartezimmer) fragt nach Netzwerkplanung. Welche Trennung ist notwendig und wie setzt du sie um?

**Musterlösung:**  
**VLAN-Trennung:**
- **VLAN 10 (Praxisnetz):** Alle Mitarbeiter-PCs, Drucker, Server. Nur intern erreichbar.
- **VLAN 20 (Gäste-WLAN):** Wartezimmer-SSID. Nur Internet, kein Zugriff auf VLAN 10.
- **Firewall-Regel:** Traffic von VLAN 20 → VLAN 10 wird blockiert.
- **Verschlüsselung:** WPA3 für Praxis-WLAN (Patientendaten!), WPA2 für Gäste (ausreichend).

**Begründung DSGVO:** Art. 25 DSGVO (Privacy by Design) fordert technische Maßnahmen; Art. 32 (Sicherheit der Verarbeitung) → Netzwerktrennung ist direkte Umsetzung.

---

### Aufgabenblock 3: Experten (⭐⭐⭐)

#### Aufgabe 5-E1: Troubleshooting-Kette
**Zeitlimit:** 10 Minuten | **Punkte:** 10

Ein neuer Außendienstler verbindet sich von zu Hause per VPN mit der Firma. Er sieht „Verbunden" in der VPN-App, kann aber den Server nicht unter `\\server\freigabe` erreichen.

Gib 3 mögliche Ursachen an und je einen Diagnose-Schritt.

**Musterlösung:**
1. **Split-Tunneling falsch konfiguriert:** VPN leitet interne Adressen nicht durch den Tunnel. → `route print` im VPN-Zustand prüfen: Ist die Serveradresse über VPN-Interface geroutet?
2. **DNS löst interne Namen nicht auf:** VPN verbunden, aber DNS bleibt auf Heimrouter. → `nslookup \\server` → antwortet externer DNS statt interner? → VPN-Konfiguration: DNS-Server auf interne Adresse setzen.
3. **Windows-Firewall blockiert SMB (Port 445):** VPN-Verbindung zählt als öffentliches Netz → SMB gesperrt. → `netsh advfirewall show currentprofile` und Netzwerkprofil auf „Privat" oder Firewall-Ausnahme für Port 445 setzen.

---

## 10) Zusammenfassung & Selbsttest

### Die 15 Kernpunkte aus diesem Modul

1. **OSI-Modell = Denkschema, kein Protokoll:** 7 Schichten – Anwendung oben, Bit unten.
2. **TCP/IP = Praxis:** 4 Schichten – das wirklich laufende Modell im Internet.
3. **Hub = Layer 1, teilt Bandbreite:** Veraltet. Nicht mehr empfehlen!
4. **Switch = Layer 2, MAC-basiert:** Standard für lokale Netze. Jeder Port = eigene Kollisionsdomäne.
5. **Router = Layer 3, IP-basiert:** Verbindet Netzwerke. Default Gateway für Hosts.
6. **WAP ≠ Router:** WAP ist eine WLAN-Brücke, kein Router.
7. **TCP = zuverlässig, UDP = schnell:** TCP für Dateiübertragung, UDP für VoIP/DNS.
8. **Ports auswendig:** 80 HTTP, 443 HTTPS, 53 DNS, 22 SSH, 3389 RDP.
9. **DHCP-Fehler → 169.254.x.x:** APIPA = kein DHCP erreichbar!
10. **DNS trennt IP von Name:** `ping 8.8.8.8` ✅ aber `ping google.de` ❌ → DNS-Problem.
11. **Sterntopologie = Standard:** Zentraler Switch, alle Geräte dran. Ausfallsicher, skalierbar.
12. **Cat 6 = Kabelstandard für Neubau:** 1–10 GBit/s, 100 m, zukunftssicher.
13. **5 GHz = schnell/wenig Störung, 2,4 GHz = Reichweite.**
14. **VPN = verschlüsselter Tunnel:** Pflicht für Homeoffice/Außendienst mit sensiblen Daten.
15. **VLAN = logische Netztrennung:** Pflicht für DSGVO-konforme Trennung (Gäste/Firma, Mandanten).

### 5-Minuten-Blitz-Check (Ja/Nein)

1. Kannst du die 7 OSI-Schichten aufsagen (auch nur die Namen)?
2. Weißt du den Unterschied zwischen Switch und Router?
3. Kennst du Port 443, 53 und 22 auswendig?
4. Kannst du erklären, was DHCP macht (DORA-Ablauf)?
5. Weißt du, was 169.254.x.x bedeutet und wie du es löst?
6. Kannst du Sterntopologie mit 3 Argumenten begründen?
7. Weißt du, wann Glasfaser statt Kupfer sinnvoll ist?
8. Kennst du den Unterschied zwischen WAP und Router?
9. Weißt du, was ein VPN macht und wann es Pflicht ist?
10. Kennst du den Unterschied zwischen 2,4 GHz und 5 GHz WLAN?

**Auswertung:**
- **10/10 Ja:** 🏆 Modul 005 sitzt! Starte Quiz 005.
- **7-9/10 Ja:** ⚠️ Schwache Punkte gezielt wiederholen (s. u.)
- **< 7/10 Ja:** 🔄 Modul komplett neu durcharbeiten.

### Checkliste: Kann ich das Modul abhaken?

- [ ] OSI-Schichten 1–7 mit Beispielen nennen
- [ ] Switch vs. Router vs. WAP unterscheiden und begründen
- [ ] Wichtige Ports (HTTP, HTTPS, SSH, DNS, RDP) nennen
- [ ] TCP vs. UDP erklären (wann welches?)
- [ ] DHCP-DORA-Prozess erklären
- [ ] DNS-Ablauf erklären (was passiert bei `www.google.de`?)
- [ ] 169.254.x.x diagnostizieren und beheben
- [ ] Netzwerkplan für ein kleines Büro erstellen (inkl. Geräte + Begründung)
- [ ] VPN für Homeoffice empfehlen und begründen (DSGVO!)
- [ ] VLAN-Trennung für Gäste-/Firmennetz erklären

### Wenn du jetzt unsicher bist...

**Schwach bei OSI/TCP-IP?** → Kapitel 1 + Aufgabe 5-B1 wiederholen  
**Schwach bei Geräten?** → Kapitel 2 + Fallstudie 8.1  
**Schwach bei Protokollen/Ports?** → Kapitel 3 + Aufgabe 5-B2  
**Schwach bei Troubleshooting?** → Kapitel 6 + Aufgabe 5-E1  
**Schwach bei WLAN?** → Kapitel 5.3 + Fallstudie 8.2

### Weiterführende Quellen

- **RFC 791** (IPv4): [https://www.rfc-editor.org/rfc/rfc791](https://www.rfc-editor.org/rfc/rfc791)
- **RFC 2131** (DHCP): [https://www.rfc-editor.org/rfc/rfc2131](https://www.rfc-editor.org/rfc/rfc2131)
- **IEEE 802.11ax** (Wi-Fi 6): [https://www.ieee802.org/11/](https://www.ieee802.org/11/)
- **Cisco Networking Basics** (kostenloser Kurs): [https://skillsforall.com/](https://skillsforall.com/)
- **Nächstes Modul:** 006 – IPv4 & Subnetting (Wie berechne ich Subnetze?)

---

## Merkhilfen & Eselsbrücken

### OSI-Schichten (7→1)
🧠 **Alle Deutschen Studenten Trinken Verschiedenes Sehr Bald**  
→ **A**nwendung · **D**arstellung · **S**itzung · **T**ransport · **V**ermittlung · **S**icherung · **B**it

### DHCP-Ablauf
🧠 **DORA tanzt im Netz!**  
→ **D**iscover · **O**ffer · **R**equest · **A**cknowledge

### TCP vs. UDP
🧠 **TCP = Tennisclub (Rückmeldung Pflicht!), UDP = Postwurf (kommt an oder nicht)**  
→ TCP hat Handshake & Quittierungen; UDP sendet und vergisst

### Wichtige Ports
🧠 **"80 ohne S ist unsicher, 443 mit S ist safe, 22 ist SSH, 53 ist DNS, 3389 ist Remote"**

### Netzwerkgeräte nach Layer
🧠 **"Layer 1 = Hub (dumm), Layer 2 = Switch (schlau), Layer 3 = Router (weise)"**  
→ Hub teilt, Switch lenkt, Router entscheidet

### APIPA (169.254.x.x)
🧠 **"169 = kein DHCP, selbst vergeben!"**  
→ Sofort daran denken: DHCP-Server nicht erreichbar → Kabel? WLAN? Router läuft?
