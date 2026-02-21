# 006 – IPv4-Subnetting (Vollständiger Deep Dive)


## Kapitelübersicht
1. IPv4-Adressstruktur & Binär-Notation
2. Subnetzmaske & CIDR-Präfix
3. Subnetz-Berechnung: Netz, Broadcast, Hosts (Schritt-für-Schritt)
4. Private Adressen & Sonderadressen (RFC 1918)
5. DHCP, Default Gateway & Netzwerkkonfiguration
6. Fehleranalyse & Troubleshooting
7. AP1-Prüfungsfokus
8. Fallstudien
9. Übungsaufgaben mit Musterlösungen
10. Zusammenfassung & Selbsttest

---

## 1) IPv4-Adressstruktur & Binär-Notation

### 1.1 Was ist eine IPv4-Adresse eigentlich?

Stell dir Adressen wie Hausnummern vor – aber für Netzwerkgeräte. Jedes Gerät im Netz braucht eine eindeutige Adresse, damit Datenpakete den richtigen Empfänger finden.

Eine **IPv4-Adresse** besteht aus genau **32 Bit** (4 × 8 Bit), dargestellt als vier Dezimalzahlen getrennt durch Punkte:

```
     192.     168.       1.     100
11000000.10101000.00000001.01100100
```

Jede der vier Zahlen (Oktett) liegt im Bereich **0–255**, weil 8 Bit maximal `11111111₂ = 255` ergeben.

**Wichtige Bit-Werte pro Oktett (von links nach rechts):**
```
128  64  32  16   8   4   2   1
  1   1   0   0   0   0   0   0  = 128 + 64 = 192
```

### 1.2 Binärumrechnung – Die 5 Werte die du kennen musst

| Dezimal | Binär    | Wie rechnen? |
|---------|----------|--------------|
| 128     | 10000000 | 2^7 |
| 192     | 11000000 | 2^7 + 2^6 = 128+64 |
| 224     | 11100000 | 128+64+32 |
| 240     | 11110000 | 128+64+32+16 |
| 248     | 11111000 | 128+64+32+16+8 |
| 252     | 11111100 | 128+64+32+16+8+4 |
| 255     | 11111111 | 2^8 - 1 |

🧠 **Merkhilfe:** Diese Zahlen sind die möglichen Werte im **letzten Oktett** einer Subnetzmaske. Alle anderen Möglichkeiten (z.B. 130) sind **keine gültigen** CIDR-Subnetzmasken!

### 1.3 Adressklassen (historisch, aber prüfungsrelevant)

Früher wurden IPv4-Adressen in Klassen eingeteilt. Heute nutzt man CIDR (Kapitel 2), aber Klassen tauchen in AP1-Aufgaben auf:

| Klasse | Bereich | 1. Oktett | Standard-Präfix | Private Adressen (RFC 1918) |
|--------|---------|-----------|-----------------|------------------------------|
| **A**  | 1.0.0.0 – 126.255.255.255 | 1–126 | /8 | 10.0.0.0 – 10.255.255.255 |
| **B**  | 128.0.0.0 – 191.255.255.255 | 128–191 | /16 | 172.16.0.0 – 172.31.255.255 |
| **C**  | 192.0.0.0 – 223.255.255.255 | 192–223 | /24 | 192.168.0.0 – 192.168.255.255 |
| **D**  | 224.0.0.0 – 239.255.255.255 | 224–239 | – | Multicast (kein Unicast) |
| **E**  | 240.0.0.0 – 255.255.255.255 | 240–255 | – | Reserviert/experimentell |

**Sonderfall 127.x.x.x:** Loopback-Bereich (→ Kapitel 4.3). Weder A noch B.

### 1.4 Häufige Missverständnisse

❌ **Missverständnis 1:** „Eine IP-Adresse ist 4 Zahlen – mehr steckt da nicht dahinter."  
✅ **Richtig:** Eine IP-Adresse hat immer zwei Teile: **Netzwerkteil** (welches Netz?) und **Hostteil** (welches Gerät im Netz?). Die Subnetzmaske definiert die Grenze.

❌ **Missverständnis 2:** „255.255.255.0 bedeutet, das Netz geht von .0 bis .255."  
✅ **Richtig:** `.0` ist die **Netzwerkadresse** (reserviert), `.255` ist die **Broadcastadresse** (reserviert). Nutzbare Hosts: `.1` bis `.254` – also **254**, nicht 256.

❌ **Missverständnis 3:** „Alle IPs mit 192.168 sind Klasse-C-Adressen."  
✅ **Richtig:** Klasse C reicht von 192.0.0.0 bis 223.255.255.255. 192.168.x.x ist Klasse C – aber auch 200.5.3.1 ist Klasse C (und öffentlich).

### 1.5 Fachbegriffe – IPv4 Grundlagen

| Begriff | Definition |
|---------|------------|
| **IPv4** | Internet Protocol Version 4, 32-Bit-Adressraum |
| **Oktett** | 8-Bit-Gruppe einer IPv4-Adresse (je eine der 4 Dezimalzahlen) |
| **Netzwerkteil** | Bits der IP-Adresse, die das Netz identifizieren |
| **Hostteil** | Bits der IP-Adresse, die das Gerät im Netz identifizieren |
| **Broadcast** | Adresse zum Ansprechen aller Hosts im Subnetz (alle Host-Bits = 1) |
| **RFC 1918** | IETF-Dokument, das private IP-Adressbereiche definiert |

---

## 2) Subnetzmaske & CIDR-Notation

### 2.1 Was ist eine Subnetzmaske?

Die Subnetzmaske ist eine 32-Bit-Maske, die festlegt, wo der **Netzwerkteil** endet und der **Hostteil** beginnt. Sie folgt immer diesem Muster: **erst eine Folge von Einsen, dann eine Folge von Nullen** – nie gemischt!

**Beispiel 255.255.255.0 in Binär:**
```
11111111.11111111.11111111.00000000
← 24 Einsen (Netzwerkteil)  → ← 8 Nullen (Hostteil) →
```

Das nennt man **CIDR-Schreibweise: /24** (24 Netzwerk-Bits).

### 2.2 CIDR – Classless Inter-Domain Routing

CIDR (ausgesprochen: „Sider") ist die moderne Schreibweise: Statt `255.255.255.0` schreibst du einfach `/24` hinter die IP-Adresse:

```
192.168.1.0/24
```

Das bedeutet: Die ersten 24 Bits sind Netzwerkteil, die restlichen 8 Bits sind Hostteil.

### 2.3 Quick-Reference: Die wichtigsten CIDR-Präfixe

Diese Tabelle **musst du für die AP1 kennen** (/24 bis /30):

| CIDR | Subnetzmaske | Host-Bits | Adressen gesamt | Nutzbare Hosts |
|------|-------------|-----------|-----------------|----------------|
| /24  | 255.255.255.0   | 8 | 256  | **254** |
| /25  | 255.255.255.128 | 7 | 128  | **126** |
| /26  | 255.255.255.192 | 6 | 64   | **62**  |
| /27  | 255.255.255.224 | 5 | 32   | **30**  |
| /28  | 255.255.255.240 | 4 | 16   | **14**  |
| /29  | 255.255.255.248 | 3 | 8    | **6**   |
| /30  | 255.255.255.252 | 2 | 4    | **2**   |

🧠 **Formel: Nutzbare Hosts = 2^(32 − Präfix) − 2**  
(−2 weil: Netzwerkadresse und Broadcastadresse sind reserviert)

### 2.4 Subnetze aufteilen – Wie viele Subnetze entstehen?

Wenn du ein Netz (z.B. /24) in kleinere Teile aufteilst, leihst du Bits aus dem Hostteil:

| Ausgangsnetz | Zielpräfix | Geliehene Bits | Anzahl Subnetze |
|-------------|-----------|---------------|-----------------|
| /24 | /25 | 1 | 2^1 = **2** |
| /24 | /26 | 2 | 2^2 = **4** |
| /24 | /27 | 3 | 2^3 = **8** |
| /24 | /28 | 4 | 2^4 = **16** |

**Formel: Anzahl Subnetze = 2^(Zielpräfix − Ausgangspräfix)**

### 2.5 Subnetzmaske umrechnen: Dezimal ↔ CIDR

**Dezimal → CIDR:**  
Zähle die Einsen im Binärformat aller 4 Oktette.

Beispiel: `255.255.255.224`  
→ `11111111.11111111.11111111.11100000`  
→ Zähle Einsen: 8+8+8+3 = **/27** ✓

**CIDR → Dezimal:**  
Verteile die Bits (zuerst die vollen 255er-Oktette, dann den Restwert):

Beispiel: `/26`  
→ 26 Bits: 8+8+8+2 → letztes Oktett hat 2 Einsen = `11000000` = 192  
→ **255.255.255.192** ✓

---

## 3) Subnetz-Berechnung: Netz, Broadcast, Hosts

### 3.1 Die 5 entscheidenden Werte

Für jede IP-Adresse mit Subnetzmaske berechnest du:

1. **Netzwerkadresse** (erste Adresse im Subnetz, Hostteil = alle 0)
2. **Broadcastadresse** (letzte Adresse im Subnetz, Hostteil = alle 1)
3. **Erste nutzbare Hostadresse** (Netzwerkadresse + 1)
4. **Letzte nutzbare Hostadresse** (Broadcastadresse − 1)
5. **Anzahl nutzbarer Hosts** (2^Hostbits − 2)

### 3.2 Das Rechenschema (ohne Binär, für AP1)

**Schritt 1:** Bestimme die **Blockgröße** = 2^(32 − Präfix)  
**Schritt 2:** Finde den **Netzwerkblock**: Teile das relevante Oktett durch die Blockgröße, runde ab, multipliziere zurück.  
**Schritt 3:** **Netzwerkadresse** = Block-Anfang  
**Schritt 4:** **Broadcastadresse** = Netzwerkadresse + Blockgröße − 1  
**Schritt 5:** **Hosts**: Netzwerkadresse+1 bis Broadcastadresse−1

### 3.3 Vollständiges Beispiel: 192.168.1.70/26

**Schritt 1:** Blockgröße = 2^(32−26) = 2^6 = **64**

**Schritt 2:** 70 ÷ 64 = 1,09… → abrunden auf 1 → 1 × 64 = **64**

**Schritt 3:** Netzwerkadresse = **192.168.1.64**

**Schritt 4:** Broadcast = 192.168.1.64 + 64 − 1 = 192.168.1.**127**

**Schritt 5:**
- Erste Hostadresse: 192.168.1.**65**
- Letzte Hostadresse: 192.168.1.**126**
- Nutzbare Hosts: 2^6 − 2 = **62**

```
Subnetz 192.168.1.64/26:
┌─────────────────────────────────────────────────┐
│  .64  = Netzwerkadresse (reserviert)            │
│  .65  = erste nutzbare Hostadresse              │
│  ...                                            │
│  .126 = letzte nutzbare Hostadresse             │
│  .127 = Broadcastadresse (reserviert)           │
└─────────────────────────────────────────────────┘
```

### 3.4 Beispiel: 10.10.10.200/28

**Schritt 1:** Blockgröße = 2^(32−28) = 2^4 = **16**

**Schritt 2:** 200 ÷ 16 = 12,5 → abrunden auf 12 → 12 × 16 = **192**

**Schritt 3:** Netzwerkadresse = **10.10.10.192**

**Schritt 4:** Broadcast = 10.10.10.192 + 16 − 1 = 10.10.10.**207**

**Schritt 5:**
- Hosts: 10.10.10.193 – 10.10.10.206 (**14 nutzbare Hosts**)

### 3.5 Alle vier /26-Subnetze aus 192.168.1.0/24

Wenn du 192.168.1.0/24 in /26-Subnetze aufteilst (4 Stück):

| Subnetz | Netzwerkadresse | Broadcast | Hosts (nutzbar) |
|---------|----------------|-----------|-----------------|
| 1 | 192.168.1.0 | 192.168.1.63 | .1 – .62 (62 Hosts) |
| 2 | 192.168.1.64 | 192.168.1.127 | .65 – .126 |
| 3 | 192.168.1.128 | 192.168.1.191 | .129 – .190 |
| 4 | 192.168.1.192 | 192.168.1.255 | .193 – .254 |

**Kontrolle:** 4 × 64 Adressen = 256 = 2^8 ✓ (genauso viele wie /24)

### 3.6 Häufige Missverständnisse – Berechnung

❌ **Missverständnis:** „Die Netzwerkadresse endet immer auf .0."  
✅ **Richtig:** Nur bei /24 endet das letzte Oktett auf .0. Bei /26 gibt es Netzwerkadresse .0, .64, .128, .192

❌ **Missverständnis:** „Broadcastadresse endet immer auf .255."  
✅ **Richtig:** Nur bei /24. Bei /26 ist die Broadcast .63, .127, .191 oder .255 (je nach Block).

❌ **Missverständnis:** „Ich kann die Formel weglassen und einfach zählen."  
✅ **Richtig:** Für /28 (16 Adressen) geht das noch. Für /26 (64 Adressen) verlierst du Zeit. Lerne die Formel!

---

## 4) Private Adressen & Sonderadressen (RFC 1918)

### 4.1 Warum gibt es private Adressen?

IPv4 hat theoretisch ca. 4,3 Milliarden Adressen (2^32). Das klingt viel – aber Firmen, Heimnetze und Smartphones haben den Adressraum erschöpft. Die Lösung: **Private Adressen** sind intern nutzbar, im Internet aber nicht routbar.

**RFC 1918** (Request for Comments) definiert drei private Bereiche:

| Klasse | Privater Bereich | CIDR | Anzahl Adressen |
|--------|-----------------|------|-----------------|
| A | 10.0.0.0 – 10.255.255.255 | 10.0.0.0/8 | ~16,7 Millionen |
| B | 172.16.0.0 – 172.31.255.255 | 172.16.0.0/12 | ~1 Million |
| C | 192.168.0.0 – 192.168.255.255 | 192.168.0.0/16 | 65.536 |

🧠 **Merkhilfe RFC 1918:** „**10**, **172.16–31**, **192.168** – alles andere ist öffentlich!"

**Häufige Falle:** `172.32.0.0` ist **NICHT** privat! Privat ist nur 172.**16**.0.0 bis 172.**31**.255.255.

### 4.2 NAT – Network Address Translation

Da private Adressen im Internet nicht routbar sind, übersetzt der **Router mit NAT** private IPs in öffentliche IPs – und umgekehrt.

```
[PC 192.168.1.10] → [Router/NAT] → [Internet: öffentliche IP 85.1.2.3]
```

NAT wird oft gefragt bei Aufgaben zur Internet-Anbindung eines Firmennetzes.

### 4.3 Sonderadressen – Die musst du kennen

| Adresse/Bereich | Typ | Bedeutung |
|----------------|-----|-----------|
| **127.0.0.1** | Loopback | Testet die eigene Netzwerkschnittstelle (Ping auf sich selbst) |
| **127.0.0.0/8** | Loopback-Netz | Alle 127.x.x.x sind Loopback (127.0.0.1 = Standard) |
| **169.254.0.0/16** | APIPA / Link-Local | PC selbst vergeben, wenn kein DHCP erreichbar |
| **0.0.0.0** | Unspecified | Platzhalter: „noch keine IP" oder „alle lokalen IPs" |
| **255.255.255.255** | Limited Broadcast | Broadcast an alle im lokalen Netz (nicht geroutet) |

**APIPA (Automatic Private IP Addressing):** Windows vergibt sich automatisch eine 169.254.x.x-Adresse, wenn der DHCP-Server nicht antwortet. **Diagnose:** PC hat kein Netz → DHCP-Problem!

### 4.4 Häufige Missverständnisse – Private Adressen

❌ **Missverständnis:** „172.20.0.1 ist eine öffentliche IP."  
✅ **Richtig:** 172.20.x.x liegt im Bereich 172.16.0.0–172.31.255.255 → **privat nach RFC 1918**.

❌ **Missverständnis:** „APIPA-Adressen werden durch den DHCP-Server vergeben."  
✅ **Richtig:** APIPA-Adressen vergibt sich das Betriebssystem **selbst**, wenn es keinen DHCP-Server erreicht. Ein DHCP-Server hat damit nichts zu tun.

---

## 5) DHCP, Default Gateway & Netzwerkkonfiguration

### 5.1 DHCP – Der automatische Adress-Verteiler

**DHCP (Dynamic Host Configuration Protocol)** vergibt Netzwerkkonfigurationen automatisch. Ein DHCP-Server teilt einem Client mit:

1. **IP-Adresse** (aus dem konfigurierten Pool)
2. **Subnetzmaske**
3. **Default Gateway** (Router-IP)
4. **DNS-Server** (Namensauflösung)

**Port:** DHCP nutzt **UDP Port 67** (Server) und **UDP Port 68** (Client) – kein TCP!

### 5.2 DHCP DORA – Der 4-Schritt-Handshake

| Schritt | Name | Wer sendet? | Ziel | Inhalt |
|---------|------|-------------|------|--------|
| 1 | **D**iscover | Client | Broadcast (255.255.255.255) | „Gibt es einen DHCP-Server?" |
| 2 | **O**ffer | Server | Client | „Hier ist ein Angebot: 192.168.1.50" |
| 3 | **R**equest | Client | Broadcast | „Ich nehme die Adresse 192.168.1.50" |
| 4 | **A**cknowledge | Server | Client | „OK, bestätigt! Lease: 24h" |

🧠 **Merkhilfe:** **D**iscovery **O**ffer **R**equest **A**ck → **DORA** (wie die Entdeckerin!)

### 5.3 Default Gateway – Das Tor zum Internet

Das **Default Gateway** ist die IP-Adresse des Routers, an den dein PC alle Pakete schickt, die NICHT im lokalen Netz sind.

**Wichtig:** Das Gateway MUSS im gleichen Subnetz wie der Host liegen!

**Beispiel:**
- PC: 192.168.1.10/24
- Gateway: 192.168.1.1 ✅ (im gleichen /24-Netz)
- Gateway: 192.168.2.1 ❌ (anderes Netz → PC findet Gateway nicht!)

### 5.4 IP-Konfiguration unter Windows

```cmd
ipconfig                     → Zeigt IP, Subnetzmaske, Gateway
ipconfig /all                → Zeigt zusätzlich MAC, DHCP-Server, DNS
ipconfig /release            → Gibt DHCP-Lease frei (IP aufgeben)
ipconfig /renew              → Fordert neue IP vom DHCP-Server an
ipconfig /flushdns           → Leert den DNS-Cache

ping 192.168.1.1             → Testet Gateway-Erreichbarkeit
ping 8.8.8.8                 → Testet Internet-Erreichbarkeit (Google DNS)
ping localhost               → Testet lokalen Netzwerk-Stack (127.0.0.1)
tracert 8.8.8.8              → Zeigt den Weg zum Ziel (alle Hops)
nslookup google.de           → DNS-Auflösung testen
```

### 5.5 DHCP-Scope planen

Beispiel: Büronetz 192.168.10.0/24, 30 PCs:
- **Netz:** 192.168.10.0/24
- **Gateway (Router):** 192.168.10.1 (statisch vergeben!)
- **DHCP-Pool:** 192.168.10.10 – 192.168.10.100 (91 Adressen, Puffer für Wachstum)
- **Drucker:** 192.168.10.200 (statisch, immer gleiche IP!)
- **DNS:** 192.168.10.1 (wenn Router DNS macht) oder 8.8.8.8 (Google)

---

## 6) Fehleranalyse & Troubleshooting

### 6.1 Systematisches Vorgehen – der 6-Schritt

```
1. Symptom erfassen  → Was kann der User nicht? (Internet? Netzlaufwerk? Drucker?)
2. Hypothese        → Falsche IP? Falsches Gateway? Kabel? DNS?
3. Test             → ipconfig, ping, tracert, nslookup
4. Ergebnis         → Hypothese bestätigt oder widerlegt?
5. Lösung           → DHCP erneuern, feste IP setzen, Kabel tauschen
6. Kontrolle        → Funktioniert es jetzt? Ursache dauerhaft behoben?
```

### 6.2 Typische Fehlerbilder

| Symptom | Häufige Ursache | Diagnose | Lösung |
|---------|----------------|---------|--------|
| 169.254.x.x als IP | DHCP-Server nicht erreichbar | `ipconfig` | Kabel prüfen, DHCP-Server prüfen, `ipconfig /renew` |
| Nur lokales Netz, kein Internet | Falsches oder kein Default Gateway | `ping gateway`, `tracert 8.8.8.8` | Gateway in IP-Einstellungen korrigieren |
| Kein Internetzugriff, aber Gateway erreichbar | Falscher DNS-Server | `nslookup google.de` | DNS-Server (z.B. 8.8.8.8) eintragen |
| Zwei PCs im gleichen Netz können sich nicht pingen | Falsche Subnetzmaske | `ipconfig /all` bei beiden PCs | Subnetzmaske angleichen |
| IP-Adress-Konflikt (Warnung in Windows) | Gleiche statische IP doppelt vergeben | Geräte mit Konflikten suchen | DHCP nutzen oder IPs koordinieren |
| Ping auf Gateway klappt, aber nicht auf Internet | NAT-Fehler oder ISP-Problem | `tracert 8.8.8.8` | Router-Konfiguration prüfen, ISP kontaktieren |
| DHCP erhält keine IP | DHCP-Pool erschöpft | DHCP-Server-Log | Pool erweitern oder Leasetime reduzieren |
| PC im falschen Subnetz | Falsches VLAN oder IP-Bereich | `ipconfig` zeigt unerwartetes Netz | VLAN-Zuweisung oder IP prüfen |

### 6.3 Troubleshooting-Szenarien

**Szenario 1:** PC kann nicht pingen, obwohl beide im gleichen Netz sein sollen  
**Falsche Diagnose (häufig):** „Kabel kaputt oder Windows-Firewall."  
**Richtige Diagnose:** `ipconfig /all` zeigt: PC1 hat 192.168.1.10/**24**, PC2 hat 192.168.1.10/**25** → unterschiedliche Subnetzmasken → obwohl gleiche Basis-IP, sehen sich die PCs in verschiedenen Subnetzen!  
**Fix:** Gleiche Subnetzmaske auf beiden PCs setzen.

**Szenario 2:** PC hat 169.254.43.87 als IP  
**Falsche Diagnose:** „Der PC hat eine komische private IP."  
**Richtige Diagnose:** APIPA-Adresse = DHCP nicht erreichbar. DHCP-Server läuft nicht, oder Kabel nicht gesteckt, oder DHCP-Pool leer.  
**Fix:** Physische Verbindung prüfen → `ipconfig /release` → `ipconfig /renew` → DHCP-Server-Status prüfen.

**Szenario 3:** Mitarbeiter kann lokale Server erreichen, aber nicht das Internet  
**Falsche Diagnose:** „DNS-Problem oder Firewall."  
**Richtige Diagnose:** `ping 8.8.8.8` klappt nicht → kein Internet auf Layer 3. `ping 192.168.1.1` klappt → Gateway erreichbar. `ipconfig` zeigt falsches Gateway (z.B. 192.168.1.1 statt 192.168.1.254).  
**Fix:** Default Gateway korrekt eintragen.

**Szenario 4:** Neue PCs bekommen keine IP per DHCP  
**Falsche Diagnose:** „Switch-Problem."  
**Richtige Diagnose:** DHCP-Pool war 192.168.1.10–192.168.1.100 (90 Adressen). Firma hat gewachsen, jetzt 95 Geräte.  
**Fix:** DHCP-Pool erweitern (z.B. bis .200), oder Leasetime von 24h auf 8h reduzieren, oder neues Subnetz hinzufügen.

**Szenario 5:** Drucker bekommt nach Neustart immer andere IP  
**Falsche Diagnose:** „Netzwerkkarte defekt."  
**Richtige Diagnose:** Drucker bezieht IP per DHCP → andere IP nach Neustart → alle Druckerkonfigurationen bei den Clients werden ungültig.  
**Fix:** Drucker mit **statischer IP** außerhalb des DHCP-Pools konfigurieren (z.B. 192.168.1.200), oder DHCP-Reservation (feste MAC → feste IP).

---

## 7) AP1-Prüfungsfokus

### 7.1 Typische AP1-Aufgabestellungen

**Aufgabentyp 1 – Subnetz berechnen:**
> „Gegeben: IP-Adresse 172.16.5.130, Subnetzmaske 255.255.255.240. Berechnen Sie Netzwerkadresse, Broadcastadresse und Anzahl nutzbarer Hosts."

**Erwartete Antwort:**
- CIDR: /28 (11110000 = 240 → 4 Bits → 28)
- Blockgröße: 16
- 130 ÷ 16 = 8,125 → 8 × 16 = 128
- Netzwerkadresse: **172.16.5.128**
- Broadcastadresse: 128 + 15 = **172.16.5.143**
- Hosts: 172.16.5.129 – 172.16.5.142 → **14 nutzbare Hosts**

**Aufgabentyp 2 – Subnetz planen:**
> „Für drei Abteilungen mit je 25 Mitarbeitern soll das Netz 10.0.0.0/24 aufgeteilt werden. Welcher CIDR-Präfix ist mindestens nötig? Wie viele Subnetze entstehen?"

**Erwartete Antwort:**
- Benötigt: mind. 25 Hosts → /27 bietet 30 Hosts (2^5−2) ✓
- /26 bietet 62 Hosts (zu groß, aber möglich), /28 bietet nur 14 (zu wenig!)
- /27 aus /24: 2^(27−24) = **8 Subnetze**

**Aufgabentyp 3 – Fehleranalyse:**
> „PC-Mitarbeiter Müller hat IP 192.168.5.50 mit Maske 255.255.255.0. Sein Gateway ist 192.168.4.1. Er kann nicht ins Internet. Warum?"

**Erwartete Antwort:** Das Gateway 192.168.4.1 liegt im Netz 192.168.4.0/24, der PC aber in 192.168.5.0/24 → **Gateway nicht im selben Subnetz** → PC kann das Gateway nicht direkt erreichen → Kein Internet.

### 7.2 Prüfungsrelevante Fachbegriffe

| Fachbegriff | Wann verwenden? | Punktbringer weil… |
|-------------|-----------------|---------------------|
| **CIDR** | Bei Präfix-Notation /xx | Zeigt Verständnis moderner Adressierung |
| **Subnetzmaske** | Immer wenn Netzgrenzen definiert werden | Pflichtbegriff für jede Netzaufgabe |
| **Netzwerkadresse** | Erste Adresse im Subnetz (Hostteil = 0) | Unterscheidet dich von Grundwissenden |
| **Broadcastadresse** | Letzte Adresse im Subnetz (Hostteil = 1) | Direkter Punktgewinn |
| **Default Gateway** | Wenn keine Internetverbindung | Zeigt Verständnis von Routing |
| **RFC 1918** | Bei privaten IP-Adressen | Normbezug = immer Punkte |
| **DHCP** | Bei automatischer IP-Vergabe | Protokollname + DORA erwähnen |
| **APIPA** | Bei 169.254.x.x Adressen | Exakter Fachbegriff bringt Punkte |
| **NAT** | Bei Internet-Anbindung privater Netze | Erklärt warum private IPs funktionieren |
| **Lease** | Bei DHCP-Adressvergabe | Zeigt Protokollkenntnis |

### 7.3 Insider-Tipps

- 💡 **Tipp 1:** Immer die **Blockgröße** erst berechnen, bevor du rechnest. Das spart Fehler.
- 💡 **Tipp 2:** Bei „Wie viele Hosts?" immer **−2** für Netz- und Broadcastadresse abziehen! Der häufigste Fehler in der Prüfung.
- 💡 **Tipp 3:** Wenn nach „privatem Adressbereich" gefragt wird: **RFC 1918** als Quelle nennen!
- 💡 **Tipp 4:** Subnetzmaske und CIDR können durch Tabelle schnell abgelesen werden – lerne die Quick-Reference aus Kapitel 2.3 auswendig.

---

## 8) Fallstudien

### 8.1 Fallstudie 1: Büronetz planen (⭐ Basis)

**Szenario:**
> Die Firma TechBau GmbH hat 20 Büro-PCs, 2 Drucker und 1 Server. Alle sollen ins gleiche Subnetz. Das Netz 192.168.10.0/24 soll genutzt werden. Der Router der Firma hat die IP 192.168.10.1.

**Aufgaben:**
1. Wie viele nutzbare Hostadressen hat das Netz?
2. Welche IP ist die Broadcast-Adresse?
3. Welchen IP-Bereich würdest du für den DHCP-Pool vorschlagen? (Drucker und Server sollen feste IPs haben)

**Musterlösung:**

**Zu 1)** 192.168.10.0/24: 2^8 − 2 = **254 nutzbare Hosts** (mehr als genug für 23 Geräte)

**Zu 2)** Broadcast: **192.168.10.255**

**Zu 3)** Empfehlung:
- Router: 192.168.10.1 (statisch)
- Server: 192.168.10.10 (statisch)
- Drucker 1: 192.168.10.20, Drucker 2: 192.168.10.21 (statisch)
- DHCP-Pool: 192.168.10.50 – 192.168.10.200 (151 Adressen, Puffer für Wachstum)

**Punkteverteilung:** Zu 1: 1P, Zu 2: 1P, Zu 3: 3P (DHCP-Pool außerhalb statischer IPs + Begründung)

---

### 8.2 Fallstudie 2: Subnetz aufteilen (⭐⭐ Mittel)

**Szenario:**
> Die Firma NetzWerk AG bekommt das Netz 10.20.0.0/24 zugewiesen. Es sollen 4 Abteilungen je ein eigenes Subnetz mit jeweils mind. 25 Hosts erhalten: IT (25), Vertrieb (25), Buchhaltung (14), Management (10).

**Aufgaben:**
1. Welcher CIDR-Präfix eignet sich für Abteilungen mit 25 Hosts?
2. Teile 10.20.0.0/24 in 4 Subnetze à /27. Liste alle vier auf.
3. Wie viele Adressen bleiben ungenutzt?

**Musterlösung:**

**Zu 1)** /27 bietet 2^5 − 2 = **30 nutzbare Hosts** – ausreichend für alle Abteilungen.  
/28 (14 Hosts) wäre für IT und Vertrieb zu klein!

**Zu 2)**
| Subnetz | Netzwerkadresse | Broadcast | Hosts |
|---------|----------------|-----------|-------|
| IT | 10.20.0.0/27 | 10.20.0.31 | .1 – .30 |
| Vertrieb | 10.20.0.32/27 | 10.20.0.63 | .33 – .62 |
| Buchhaltung | 10.20.0.64/27 | 10.20.0.95 | .65 – .94 |
| Management | 10.20.0.96/27 | 10.20.0.127 | .97 – .126 |

**Zu 3)** 4 × 32 = 128 genutz, 256 − 128 = **128 Adressen ungenutzt**

---

### 8.3 Fallstudie 3: Fehlerdiagnose (⭐⭐⭐ Experten)

**Szenario:**
> Außendienstmitarbeiter Weber kommt ins Büro und verbindet seinen Laptop mit dem Büronetz (192.168.1.0/24). Er berichtet: „Ich kann keine Serverfreigabe aufrufen und auch nicht ins Internet. Zuhause klappt alles."

`ipconfig /all` auf Webers Laptop zeigt:
```
IPv4-Adresse: 169.254.88.12
Subnetzmaske: 255.255.0.0
Standardgateway: (leer)
DHCP aktiviert: Ja
```

**Aufgaben:**
1. Was ist die Ursache des Problems? (präzise Diagnose)
2. Welche Sofortmaßnahmen führst du durch?
3. Falls DHCP nach Erneuerung immer noch nicht funktioniert – welche zwei weiteren Ursachen prüfst du?

**Musterlösung:**

**Zu 1)** Weber hat eine **APIPA-Adresse** (169.254.x.x) – der DHCP-Server hat nicht geantwortet. Der Laptop ist nicht im Büronetz (192.168.1.0/24) sondern im Link-Local-Netz → kein Gateway, kein DNS, keine Kommunikation mit Büroservern möglich.

**Zu 2)** Sofortmaßnahmen:
1. Netzwerkkabel prüfen (gesteckt? Linklight am Switch?)
2. `ipconfig /release` → `ipconfig /renew` ausführen
3. `ipconfig /all` erneut prüfen – bekommt Weber jetzt eine .192.168.1.x IP?

**Zu 3)** Weitere Ursachen falls DHCP weiter fehlschlägt:
- **DHCP-Server liegt an:** DHCP-Dienst auf dem Server gestoppt → DHCP-Dienst neu starten
- **DHCP-Pool erschöpft:** Alle 192.168.1.x-Adressen vergeben → Pool erweitern oder Leasetime reduzieren

---

## 9) Übungsaufgaben mit Musterlösungen

### Aufgabenblock 1: Basiswissen (⭐)

#### Aufgabe 006-B1: Subnetzmaske umrechnen
**Zeitlimit:** 2 Minuten | **Punkte:** 2

Wandle folgende Subnetzmasken in CIDR-Schreibweise um:  
a) 255.255.255.0 → ___  
b) 255.255.255.192 → ___  
c) 255.255.255.240 → ___

**Musterlösung:** a) /24 | b) /26 | c) /28

---

#### Aufgabe 006-B2: Nutzbare Hosts berechnen
**Zeitlimit:** 2 Minuten | **Punkte:** 3

Wie viele nutzbare Hosts haben folgende Netze?  
a) /25 → ___ Hosts  
b) /28 → ___ Hosts  
c) /30 → ___ Hosts  

**Musterlösung:** a) 2^7−2 = **126** | b) 2^4−2 = **14** | c) 2^2−2 = **2**

---

#### Aufgabe 006-B3: Private oder öffentlich?
**Zeitlimit:** 3 Minuten | **Punkte:** 4

Klassifiziere als privat (RFC 1918) oder öffentlich:  
a) 10.10.10.1 → ___  
b) 172.32.5.9 → ___  
c) 192.168.0.254 → ___  
d) 172.20.100.5 → ___  

**Musterlösung:** a) privat | b) **öffentlich** (172.32 außerhalb 172.16–31) | c) privat | d) **privat** (172.20 liegt in 172.16–31)

---

#### Aufgabe 006-B4: Sonderadressen
**Zeitlimit:** 2 Minuten | **Punkte:** 3

Erkläre: Was bedeutet es, wenn `ipconfig` folgende IP anzeigt?  
a) 127.0.0.1  
b) 169.254.12.5  
c) 255.255.255.255  

**Musterlösung:** a) Loopback – lokaler Test | b) APIPA – kein DHCP erreichbar | c) Broadcast (kein Host)

---

#### Aufgabe 006-B5: DHCP DORA
**Zeitlimit:** 3 Minuten | **Punkte:** 4

Nenne die vier Schritte des DHCP-Handshakes in der richtigen Reihenfolge und erkläre je einen Satz pro Schritt.

**Musterlösung:** Discover (Client sucht Server) → Offer (Server bietet IP an) → Request (Client akzeptiert) → Acknowledge (Server bestätigt)

---

### Aufgabenblock 2: Anwendung (⭐⭐)

#### Aufgabe 006-A1: Vollständige Subnetzberechnung
**Zeitlimit:** 5 Minuten | **Punkte:** 6

Gegeben: IP-Adresse 192.168.3.220, Subnetzmaske 255.255.255.248.  
Berechne: a) CIDR-Präfix, b) Blockgröße, c) Netzwerkadresse, d) Broadcastadresse, e) Erste/letzte Hostadresse, f) Anzahl nutzbarer Hosts.

**Musterlösung:**  
a) 248 = 11111000 → /29  
b) Blockgröße: 2^3 = 8  
c) 220 ÷ 8 = 27,5 → 27 × 8 = 216 → **Netzwerk: 192.168.3.216**  
d) 216 + 7 = 223 → **Broadcast: 192.168.3.223**  
e) Erste Host: 192.168.3.217, letzte Host: 192.168.3.222  
f) 2^3 − 2 = **6 Hosts**

---

#### Aufgabe 006-A2: Subnetze planen
**Zeitlimit:** 6 Minuten | **Punkte:** 5

Das Netz 10.0.0.0/24 soll in 8 gleich große Subnetze aufgeteilt werden. Welcher Präfix? Liste alle 8 Netzwerkadressen auf.

**Musterlösung:** 8 Subnetze = /27 (2^3 = 8). Blockgröße: 32.  
Netzwerkadressen: 10.0.0.0, 10.0.0.32, 10.0.0.64, 10.0.0.96, 10.0.0.128, 10.0.0.160, 10.0.0.192, 10.0.0.224

---

#### Aufgabe 006-A3: Gateway-Fehler erkennen
**Zeitlimit:** 3 Minuten | **Punkte:** 4

PC: 10.10.5.100/24, Gateway: 10.10.4.1. Klappt die Gateway-Kommunikation? Begründe.

**Musterlösung:** Nein. PC ist in 10.10.5.0/24, Gateway 10.10.4.1 ist in 10.10.4.0/24 → **anderes Netz** → PC kann Gateway nicht direkt (Layer 2) erreichen → kein Internet.

---

### Aufgabenblock 3: Experten (⭐⭐⭐)

#### Aufgabe 006-E1: Kombinierte Subnettaufgabe
**Zeitlimit:** 10 Minuten | **Punkte:** 8

Firma LogiTex hat das Netz 172.16.0.0/22 (entspricht 4 × /24 = Adressen .0.0 bis .3.255). Es sollen 3 Abteilungen eingerichtet werden: Lager (80 Hosts), Büro (50 Hosts), Management (20 Hosts).

a) Welcher Präfix reicht für Lager? Welcher für Büro?  
b) Gib für das Lager-Subnetz an: Netzwerkadresse, Broadcast, erste/letzte Hostadresse.  
c) Welche Adresse bekommt der DHCP-Server idealerweise (Begründung)?

**Musterlösung:**  
a) Lager: /25 (126 Hosts ≥ 80) ✓. Büro: /26 (62 Hosts ≥ 50) ✓.  
b) Lager: 172.16.0.0/25 → Broadcast: 172.16.0.127, Hosts: .1–.126  
c) DHCP-Server: 172.16.0.1 (statisch, erste nutzbare Adresse, gut merkbar; außerhalb DHCP-Pool)

---

## 10) Zusammenfassung & Selbsttest

### Die 15 wichtigsten Punkte

1. IPv4-Adressen sind 32 Bit lang, dargestellt als 4 Dezimalzahlen (0–255).
2. Die Subnetzmaske trennt Netzwerk- und Hostteil.
3. CIDR-Notation (z.B. /24) zählt die Netzwerk-Bits.
4. Nutzbare Hosts = 2^(32−Präfix) − 2 (−2 für Netz + Broadcast).
5. Netzwerkadresse = erste Adresse (Hostteil = 0), kann kein Host nutzen.
6. Broadcastadresse = letzte Adresse (Hostteil = 1), kann kein Host nutzen.
7. Blockgröße = 2^(32−Präfix). Damit findest du das richtige Subnetz.
8. RFC 1918 definiert private Bereiche: 10/8, 172.16–31.x/12, 192.168/16.
9. 172.32.x.x ist NICHT privat!
10. 169.254.x.x (APIPA) = kein DHCP-Server erreichbar.
11. 127.0.0.1 = Loopback (testet eigene Netzwerkschnittstelle).
12. DHCP liefert IP, Maske, Gateway und DNS via DORA-Handshake über UDP 67/68.
13. Das Default Gateway MUSS im gleichen Subnetz liegen wie der Host.
14. `ipconfig /renew` fordert eine neue IP vom DHCP-Server an.
15. Subnetzmaske-Werte im letzten Oktett: 0, 128, 192, 224, 240, 248, 252, 255.

### 5-Minuten-Blitz-Check

1. Kannst du aus dem Stegreif /26, /27, /28 in Subnetzmaske und Hostanzahl umrechnen?
2. Kennst du alle drei privaten Adressbereiche nach RFC 1918 auswendig?
3. Weißt du, was APIPA ist und woran du es erkennst?
4. Kannst du die Netzwerkadresse von 192.168.5.75/27 im Kopf berechnen?
5. Kennst du den DHCP-DORA-Ablauf mit allen 4 Schritten?
6. Weißt du warum das Gateway im gleichen Subnetz sein muss?
7. Kannst du 255.255.255.192 in CIDR-Schreibweise umrechnen?
8. Weißt du, welche Ports DHCP verwendet?
9. Erkennst du den Fehler: PC hat /24, Gateway liegt in einem /25-Block außerhalb?
10. Kannst du erklären, was `ipconfig /release` macht?

**Auswertung:**
- 10/10: ✅ Kapitel sitzt perfekt – weiter zu Modul 007!
- 7–9/10: ⚠️ Nochmal Kapitel 3 (Berechnung) und 4 (RFC 1918) wiederholen
- < 7/10: 🔄 Komplettes Modul nochmals durcharbeiten

### Checkliste: Kann ich das Modul abhaken?
- [ ] Subnetzberechnung (Netz, Broadcast, Hosts) klappt in < 3 Minuten
- [ ] RFC-1918-Bereiche kenne ich auswendig
- [ ] DHCP DORA kann ich erklären
- [ ] APIPA erkenne ich sofort
- [ ] AP1-Subnetzt-Aufgaben löse ich vollständig mit Begründung

### Wenn du jetzt unsicher bist...
**Schwach bei Subnetzberechnung?** → Kapitel 3.2–3.4 + Aufgabenblock 2  
**Schwach bei privaten Adressen?** → Kapitel 4.1 Tabelle auswendig lernen  
**Schwach bei DHCP/Gateway?** → Kapitel 5.2 + 5.3 + Fallstudie 8.3  

### Weiterführende Quellen
- RFC 1918 (Offizielle IETF-Spezifikation private Adressen): https://www.rfc-editor.org/rfc/rfc1918
- RFC 4632 (CIDR): https://www.rfc-editor.org/rfc/rfc4632
- Nächstes Modul: **007 – IT-Sicherheit & Schutzziele**

---

## Merkhilfen & Eselsbrücken

### Subnetzmasken-Werte
🧠 **Merkhilfe:** 128 → 192 → 224 → 240 → 248 → 252 → 255  
→ Jedes Mal verdoppeln sich die Einsen im Binärwert: 1, 11, 111, 1111…

### RFC 1918
🧠 **Merkhilfe:** „**10** nehme ich für große Firmen, **172.16–31** für mittlere, **192.168** für Zuhause."

### Nutzbare Hosts
🧠 **Merkhilfe:** „**Zwei weg** – Netz und Broadcast fressen zwei Adressen."  
→ 2^Hostbits − **2**

### CIDR schnell schätzen
🧠 **Merkhilfe:** /24 = 254 Hosts, jeder Schritt kleiner halbiert:  
/25 = 126, /26 = 62, /27 = 30, /28 = 14

### DORA
🧠 **Merkhilfe:** **D**ora die Entdeckerin – zuerst **entdecken** (Discover), dann **anbieten** (Offer), dann **anfragen** (Request), dann **bestätigen** (Acknowledge).

