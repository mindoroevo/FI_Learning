# 004 – Betriebssysteme, Benutzer & Rechteverwaltung (Praxisorientierter Deep Dive)

## Lernzeit & Zielniveau
- **Empfohlene Lernzeit:** 3–4 Stunden (Mittlerer Umfang mit vielen Praxisbeispielen)
- **Zielniveau:** Du verstehst die fundamental unterschiedlichen Rechtesysteme von Windows und Linux so tief, dass du Zugriffsprobleme systematisch diagnostizieren, Berechtigungen korrekt setzen und AP1-Aufgaben zu Rechtevergabe begründet lösen kannst. Du kennst die Sicherheitsprinzipien (Least Privilege, Need-to-Know) und kannst sie in realen Szenarien anwenden.
- **Vorkenntnisse:** 
  - Modul 001 (Prüfungsrahmen) bekannt
  - Modul 002 (Bedarfsermittlung) hilft beim Verständnis von Sicherheitsanforderungen
  - Grundkenntnisse: Was ist ein Betriebssystem, was sind Dateien/Ordner
- **Prüfungsrelevanz:** ⭐⭐⭐⭐⭐ (5/5 Sterne)  
  **Begründung:** Rechteverwaltung ist KERN-Thema der AP1 und kommt in fast jeder Prüfung vor! Typische Aufgaben: "Die Firma X braucht einen Dateiserver mit folgenden Anforderungen: Marketing-Abteilung darf eigene Dateien lesen/schreiben, aber Geschäftsführung darf Marketing-Ordner NUR lesen. Richten Sie die Berechtigungen ein." Du musst Windows NTFS oder Linux Permissions EXAKT kennen und BEGRÜNDEN können (Sicherheit, Prüfbarkeit, Wirtschaftlichkeit).

---

## Kapitelübersicht
1. Betriebssysteme im Vergleich (Windows Server vs. Linux)
2. Das Rechtesystem-Fundament (Subjekt → Objekt → Aktion)
3. Windows: Benutzer, Gruppen, NTFS-Berechtigungen
4. Linux: User, Groups, chmod/chown, sudo
5. Prinzip der minimalen Rechte (Least Privilege)
6. Vererbung & Explizite Deny (Die Fallen im Detail)
7. **Fehleranalyse: Zugriffsprobleme systematisch lösen** (NEU)
8. **AP1-Prüfungsfokus: Dateiserver-Berechtigungen** (NEU)
9. Fallstudien: Abteilungsordner, Projektordner, Datenschutz
10. Typische Fehler & Gegenstrategien
11. **Zusammenfassung & Selbsttest** (NEU)

---

## 1) Betriebssysteme im Vergleich: Windows vs. Linux

### 1.1 Die zwei Welten
In der AP1 musst du **beide** können! Viele Aufgaben stellen explizit ein Szenario mit "Linux-Server" oder "Windows Server 2022".

| Merkmal | Windows Server | Linux (Ubuntu/Debian/RHEL) |
|---------|----------------|----------------------------|
| **Lizenzmodell** | Kommerziell (ca. 800€/Server) | Open Source (kostenlos) |
| **Rechtesystem** | NTFS-Berechtigungen (ACL-basiert) | POSIX-Permissions (rwx-Modell) |
| **Verwaltung** | Active Directory + GUI (Server-Manager) | Hauptsächlich CLI (Terminal), optional GUI |
| **Einsatzgebiet** | KMU mit Windows-Clients, Office-Umgebungen | Web-Server, Container, Cloud, DevOps |
| **Admin-Konto** | Administrator (mit UAC) | root (mit sudo) |
| **Dateisystem** | NTFS, ReFS | ext4, xfs, btrfs |
| **AP1-Häufigkeit** | 60% der Aufgaben | 40% der Aufgaben |

**Prüfer-Tipp:** Wenn die Aufgabe "Active Directory" erwähnt → Windows. Wenn "Apache", "Docker", "Shell-Script" → Linux.

### 1.2 Warum zwei Systeme lernen?
In der Praxis wirst du **beides** verwalten:
- **Büro-Clients:** Windows 10/11 (Office, Outlook, SAP)
- **Server-Backend:** Linux (Web-Server, Datenbank, Container)
- **Entwickler-PCs:** Oft Linux oder macOS
- **IoT/Embedded:** Linux (Raspberry Pi, Router)

**AP1-Realität:** Die Prüfung testet, ob du zwischen beiden Systemen wechseln kannst, ohne durcheinander zu kommen!

### 1.3 Häufige Missverständnisse

#### ❌ Missverständnis 1: "Administrator/root darf alles, das ist sicher."
**Falsch!** Administrator/root = HÖCHSTES RISIKO! 
- Ein Fehler (versehentliches `rm -rf /`) = ganzes System zerstört
- Malware mit Admin-Rechten = komplette Kontrolle über System
- **✅ Richtig:** Normale Benutzer für Alltag, Admin nur wenn WIRKLICH nötig (UAC/sudo)

#### ❌ Missverständnis 2: "Vererbung ist automatisch gut."
**Falsch!** Vererbung kann Rechte UNKONTROLLIERBAR machen!
- Oberordner hat 50 Berechtigungseinträge → alle Unterordner erben
- Niemand weiß mehr, wer WAS darf
- **✅ Richtig:** Vererbung gezielt unterbrechen bei sensiblen Ordnern (z.B. "Geschäftsführung")

#### ❌ Missverständnis 3: "Deny schlägt Allow – also setz ich einfach überall Deny!"
**Falsch!** Deny übersteuert ALLES, auch spätere Allows!
- Benutzer A ist in Gruppe "Marketing" (Allow) UND "Gesperrt" (Deny) → Zugriff verweigert
- **✅ Richtig:** Deny NUR für Ausnahmen nutzen (z.B. "Praktikant darf NICHT in Finanz-Ordner, auch wenn in Gruppe")

#### ❌ Missverständnis 4: "chmod 777 ist die Lösung, wenn's nicht klappt."
**Falsch!** `chmod 777` = JEDER darf ALLES (auch löschen!)
- Sicherheitslücke Nummer 1 in Linux
- Malware kann Dateien überschreiben
- **✅ Richtig:** `chmod 755` für Ordner (rwxr-xr-x), `644` für Dateien (rw-r--r--)

#### ❌ Missverständnis 5: "Gruppen sind nur für große Firmen wichtig."
**Falsch!** Auch kleine Firmen MÜSSEN Gruppen nutzen!
- 5 Mitarbeiter im Marketing → NICHT jedem einzeln Rechte geben, sondern Gruppe "Marketing"
- Neuer Mitarbeiter → in Gruppe aufnehmen = hat sofort alle Rechte
- **✅ Richtig:** Gruppen = Zeitersparnis + Übersichtlichkeit + Wartbarkeit

### 1.4 Fachbegriffe-Tabelle (Pflicht-Vokabular für AP1)

| Begriff | Englisch | Bedeutung | AP1-Relevanz |
|---------|----------|-----------|--------------|
| **ACL** | Access Control List | Liste von Berechtigungseinträgen (wer darf was) | ⭐⭐⭐⭐⭐ |
| **NTFS** | New Technology File System | Windows-Dateisystem mit ACL-Unterstützung | ⭐⭐⭐⭐⭐ |
| **UAC** | User Account Control | Windows-Feature: Bestätigung bei Admin-Aktionen | ⭐⭐⭐⭐ |
| **sudo** | SuperUser DO | Linux-Befehl für temporäre root-Rechte | ⭐⭐⭐⭐⭐ |
| **Least Privilege** | Prinzip der minimalen Rechte | User bekommt NUR die Rechte, die er wirklich braucht | ⭐⭐⭐⭐⭐ |
| **Vererbung** | Inheritance | Unterordner erben Rechte vom Oberordner | ⭐⭐⭐⭐⭐ |
| **Explizite Deny** | Explicit Deny | "Verbieten" schlägt "Erlauben" (Deny > Allow) | ⭐⭐⭐⭐ |
| **SID** | Security Identifier | Windows-interne ID für Benutzer/Gruppen (S-1-5-21-...) | ⭐⭐⭐ |
| **UID/GID** | User ID / Group ID | Linux-Zahlen für Benutzer (z.B. UID 1000) | ⭐⭐⭐⭐ |
| **Need-to-Know** | - | User darf nur auf Daten zugreifen, die er für seine Arbeit braucht | ⭐⭐⭐⭐ |

**Eselsbrücke:** "**A**lle **C**hefs **L**ieben **N**eue **T**abellen **F**ür **S**icherheit" = ACL, NTFS

---

## 2) Das Rechtesystem-Fundament (Universal für beide Systeme)

Egal ob Windows oder Linux: Rechtesysteme folgen IMMER diesem Modell:

```
SUBJEKT → AKTION → OBJEKT
   |         |        |
  Wer?     Was?     Worauf?
   |         |        |
Benutzer  Lesen   Datei.txt
 Anna     Schreiben Ordner/
Gruppe    Löschen  Server
```

### 2.1 Subjekte (Wer darf handeln?)
- **Benutzer** (User): z.B. "Anna.Mueller", UID 1001
- **Gruppen** (Groups): z.B. "Marketing", GID 2001
- **Spezial:** "Jeder" (Everyone/Other), "System", "Administrat or"

### 2.2 Objekte (Worauf wird zugegriffen?)
- **Dateien** (.docx, .pdf, .exe)
- **Ordner** (Verzeichnisse)
- **Drucker** (Windows: Freigaben)
- **Registry-Schlüssel** (nur Windows)

### 2.3 Aktionen (Was darf gemacht werden?)
**Windows NTFS:**
- **Lesen** (Read): Datei öffnen, Ordnerinhalt sehen
- **Schreiben** (Write): Datei bearbeiten, neue Dateien erstellen
- **Ändern** (Modify): Lesen + Schreiben + Löschen
- **Vollzugriff** (Full Control): ALLES + Berechtigungen ändern
- **Ausführen** (Execute): Programme starten

**Linux POSIX:**
- **r** (read): Datei lesen, Ordnerinhalt listen
- **w** (write): Datei schreiben, Dateien in Ordner erstellen/löschen
- **x** (execute): Datei ausführen, in Ordner wechseln (cd)

### 2.4 Die goldene Regel: Least Privilege
> **"Jeder Benutzer bekommt NUR die Rechte, die er für seine Arbeit zwingend braucht – nicht mehr!"**

**Praxis-Beispiel:**
- Praktikant im Marketing: Darf Marketing-Dateien LESEN, aber NICHT löschen
- Marketing-Mitarbeiter: Darf Marketing-Dateien LESEN + SCHREIBEN
- Geschäftsführung: Darf Marketing-Dateien NUR LESEN (Kontrolle, aber keine Änderung)
- IT-Admin: Darf ALLES (Vollzugriff), aber nutzt im Alltag normalen Account!

---

## 3) Windows: Benutzer, Gruppen, NTFS-Berechtigungen

### 3.1 Benutzer & Gruppen erstellen

**GUI (Server-Manager):**
1. Server-Manager → Tools → "Computerverwaltung"
2. "Lokale Benutzer und Gruppen" → Benutzer → Rechtsklick → "Neuer Benutzer"
3. Name: "Anna.Mueller", Passwort setzen, "Benutzer kann Kennwort nicht ändern" (optional)

**PowerShell (Profi-Weg):**
```powershell
# Benutzer erstellen
New-LocalUser -Name "Anna.Mueller" -Password (ConvertTo-SecureString "Geheim123!" -AsPlainText -Force) -FullName "Anna Müller"

# Gruppe erstellen
New-LocalGroup -Name "Marketing" -Description "Marketing-Abteilung"

# Benutzer zu Gruppe hinzufügen
Add-LocalGroupMember -Group "Marketing" -Member "Anna.Mueller"

# Prüfen
Get-LocalGroupMember -Group "Marketing"
```

### 3.2 NTFS-Berechtigungen setzen

**Szenario:** Ordner `C:\Daten\Marketing` soll für Gruppe "Marketing" freigegeben werden.

**GUI:**
1. Rechtsklick auf Ordner → Eigenschaften → Sicherheit
2. "Bearbeiten" → "Hinzufügen" → Gruppe "Marketing" eingeben → OK
3. Berechtigungen auswählen:
   - ☑ Ändern (Lesen + Schreiben + Löschen)
   - ☐ Vollzugriff (NICHT vergeben, außer Admin!)
4. "Übernehmen"

**PowerShell (icacls):**
```powershell
# Marketing-Gruppe bekommt "Ändern"-Rechte
icacls "C:\Daten\Marketing" /grant "Marketing:(OI)(CI)M"

# Erklärung:
# (OI) = Object Inherit (Dateien erben)
# (CI) = Container Inherit (Unterordner erben)
# M = Modify (Ändern)
# F = Full Control (Vollzugriff)
# R = Read (Lesen)

# Rechte prüfen
icacls "C:\Daten\Marketing"
```

### 3.3 Vererbung verstehen (Die Tücke im Detail)

**Problem:** Vererbung ist praktisch, aber kann gefährlich werden!

```
C:\Daten (Marketing: Vollzugriff)
  └── Marketing (erbt: Vollzugriff)
  └── Geschaeftsfuehrung (erbt: Vollzugriff) ← PROBLEM!
```

**Lösung:** Vererbung bei sensiblen Ordnern UNTERBRECHEN!

**GUI:**
1. Rechtsklick auf `Geschaeftsfuehrung` → Eigenschaften → Sicherheit
2. "Erweitert" → "Vererbung deaktivieren"
3. "Geerbte Berechtigungen in explizite Berechtigungen für dieses Objekt konvertieren" (Kopie behalten)
4. Jetzt Marketing-Gruppe ENTFERNEN, nur Geschäftsführung + Admin behalten

**PowerShell:**
```powershell
# Vererbung deaktivieren
icacls "C:\Daten\Geschaeftsfuehrung" /inheritance:d

# Marketing-Gruppe entfernen
icacls "C:\Daten\Geschaeftsfuehrung" /remove "Marketing"

# Geschäftsführung-Gruppe hinzufügen
icacls "C:\Daten\Geschaeftsfuehrung" /grant "Geschaeftsfuehrung:(OI)(CI)M"
```

### 3.4 Explizite Deny: Das Schwert mit zwei Schneiden

**Regel:** `Deny` schlägt `Allow` – IMMER!

**Szenario:** Praktikant "Max.Neu" ist in Gruppe "Marketing" (Allow: Ändern), aber darf NICHT ins "Budget"-Unterverzeichnis.

**Lösung:**
```powershell
# Explizites Deny für Benutzer Max.Neu
icacls "C:\Daten\Marketing\Budget" /deny "Max.Neu:(OI)(CI)F"
```

**Resultat:**
- Max kann alle Marketing-Ordner nutzen (via Gruppe)
- ABER: Budget-Ordner ist für ihn blockiert (Deny > Allow)

**⚠️ Warnung:** Deny nur sparsam nutzen! Es übersteuert ALLES, auch spätere Gruppen-Allows. Nur für AUSNAHMEN!

---

## 4) Linux: User, Groups, chmod/chown, sudo

### 4.1 Benutzer & Gruppen erstellen

**Terminal (als root oder mit sudo):**
```bash
# Benutzer erstellen
sudo useradd -m -s /bin/bash anna.mueller
# -m = Home-Verzeichnis erstellen (/home/anna.mueller)
# -s = Login-Shell festlegen

# Passwort setzen
sudo passwd anna.mueller

# Gruppe erstellen
sudo groupadd marketing

# Benutzer zu Gruppe hinzufügen
sudo usermod -aG marketing anna.mueller
# -aG = append to Group (ohne -a würde user aus allen anderen Gruppen entfernt!)

# Prüfen
groups anna.mueller
# Ausgabe: anna.mueller : anna.mueller marketing
```

### 4.2 Linux-Rechtesystem (rwx-Modell)

**Jede Datei/Ordner hat 3 Rechte-Tripel:**
```
-rw-r--r-- 1 anna marketing 2048 Feb 20 10:00 bericht.pdf
 │││ │││ │││
 │││ │││ └── Other (Alle anderen)
 │││ └────── Group (marketing)
 └────────── Owner (anna)

r = read (4)
w = write (2)
x = execute (1)
```

**Beispiel:** `rw-r--r--` (644)
- Owner (anna): rw- (4+2+0 = 6) → Lesen + Schreiben
- Group (marketing): r-- (4+0+0 = 4) → Nur Lesen
- Other (alle): r-- (4+0+0 = 4) → Nur Lesen

### 4.3 chmod: Rechte ändern

```bash
# Symbolisch (lesbar)
chmod u+x script.sh       # Owner darf ausführen
chmod g-w datei.txt       # Group darf NICHT schreiben
chmod o= datei.txt        # Other: ALLE Rechte entfernen

# Oktal (schneller für Profis)
chmod 755 script.sh       # rwxr-xr-x (Owner: voll, Rest: lesen+ausführen)
chmod 644 datei.txt       # rw-r--r-- (Owner: lesen+schreiben, Rest: nur lesen)
chmod 700 geheim.txt      # rwx------ (NUR Owner, Rest: nichts!)
chmod 600 ssh_key         # rw------- (Privater SSH-Key: NUR Owner lesen/schreiben!)

# Rekursiv für Ordner
chmod -R 755 /var/www/html   # Alle Dateien im Web-Verzeichnis
```

**AP1-Klassiker:** "Warum startet mein Script nicht?"
→ Lösung: `chmod +x script.sh` (Ausführungsrecht fehlt!)

### 4.4 chown: Besitzer ändern

```bash
# Besitzer ändern
sudo chown anna datei.txt         # anna ist jetzt Owner

# Besitzer + Gruppe ändern
sudo chown anna:marketing datei.txt

# Rekursiv für Ordner
sudo chown -R www-data:www-data /var/www/html
# Webserver-Prozess läuft als "www-data" → braucht Besitz über Dateien
```

### 4.5 sudo: Temporäre Root-Rechte

**Problem:** Als root einloggen = gefährlich! Ein Tippfehler = System zerstört.

**Lösung:** `sudo` = "Superuser do" → Führe EINEN Befehl als root aus, dann zurück zu normalem User.

```bash
# FALSCH: Dauerhaft als root arbeiten
su -             # Wird root
rm -rf /wichtig  # Ups, / statt /unwichtig getippt → System futsch!

# RICHTIG: sudo nur wenn nötig
sudo apt update            # Paketliste aktualisieren (braucht root)
sudo systemctl restart nginx   # Service neustarten (braucht root)
nano dokument.txt          # Normale Datei bearbeiten (KEIN sudo!)
```

**sudo konfigurieren (/etc/sudoers):**
```bash
# Mit visudo bearbeiten (NIEMALS direkt editieren, sonst Syntax-Fehler = Lockout!)
sudo visudo

# Benutzer anna darf ALLES
anna ALL=(ALL:ALL) ALL

# marketing-Gruppe darf nur Webserver neustarten (kein Passwort nötig)
%marketing ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
```

---

## 5) Prinzip der minimalen Rechte (Least Privilege)

### 5.1 Need-to-Know Prinzip

**Frage:** "MUSS dieser Benutzer auf diese Datei zugreifen können, um seine Arbeit zu erledigen?"
- **Ja** → Berechtigung vergeben
- **Nein** → KEINE Berechtigung

**Praxis-Beispiel: Personalabteilung**
- Personaler darf Gehalts-Dateien lesen/schreiben (braucht er für Job)
- Marketing darf Gehalts-Dateien NICHT sehen (geht sie nichts an)
- Geschäftsführung darf Gehalts-Dateien NUR lesen (Kontrolle, aber keine Änderung durch Versehen)

### 5.2 Separation of Duties (Funktionstrennung)

**Beispiel: Bestellprozess**
1. **Einkäufer:** Bestellt Ware (erstellt Bestellung)
2. **Buchhaltung:** Prüft Rechnung und bezahlt
3. **Wareneingang:** Bestätigt Erhalt

→ KEINE Person darf alle 3 Schritte machen (Betrugsschutz!)

**IT-Äquivalent:**
- **Entwickler:** Darf Code schreiben, aber NICHT auf Produktion deployen
- **DevOps:** Darf deployen, aber NICHT Code ändern
- **Audit:** Kann alles sehen (Logs), aber NICHTS ändern

### 5.3 Zeitlich begrenzte Rechte

**Problem:** Admin-Rechte dauerhaft = Risiko!

**Lösung:**
- **Windows:** Benutzer in Gruppe "Administratoren" → nur bei Bedarf hinzufügen, danach wieder entfernen
- **Linux:** `sudo -i` nur für Installation, danach ausloggen
- **Cloud:** IAM-Rollen mit Ablaufzeit (z.B. nur 2 Stunden Admin-Zugriff)

---

## 6) Vererbung & Explizite Deny (Die Fallen im Detail)

### 6.1 Vererbung: Segen und Fluch

**Segen:**
```
C:\Daten (Marketing: Ändern)
  └── Kampagne2024 (erbt: Ändern)
  └── Grafiken (erbt: Ändern)
  └── Texte (erbt: Ändern)
```
→ Einmal Rechte setzen, 100 Unterordner profitieren!

**Fluch:**
```
C:\Daten (Everyone: Lesen) ← Zu großzügig!
  └── Marketing (erbt: Lesen)
  └── Geschaeftsfuehrung (erbt: Lesen) ← Jetzt kann JEDER Gehälter sehen!
```

**Fix:** Vererbung bei sensiblen Ordnern DEAKTIVIEREN!

### 6.2 Explizites Deny: Nur für Notfälle

**Szenario:** 10 Marketing-Mitarbeiter dürfen in Ordner, aber Praktikant Max nicht.

**❌ SCHLECHTE Lösung:** Max explizit Deny geben
- Funktioniert, ABER: Unübersichtlich (wer wurde alles "geblockt"?)
- Deny bleibt ewig (auch wenn Max später Vollzeit wird)

**✅ GUTE Lösung:** Separate Gruppe "Marketing-Vollzeit" (ohne Max)
- Übersichtlich (Gruppe listet alle Berechtigten)
- Max wird später in Gruppe aufgenommen = automatisch Zugriff

**Wann Deny nutzen?**
- **Temporär:** "User ist für 2 Wochen gesperrt" (Verdacht auf Datenklau)
- **Absolute Ausnahme:** "Diese eine Datei darf NIEMAND außer CEO löschen"

---

## 7) Fehleranalyse: Zugriffsprobleme systematisch lösen

### 7.1 Der 5-Schritte-Diagnoseprozess

**Szenario:** User beschwert sich: "Ich kann die Marketing-Datei nicht öffnen!"

**Schritt 1: Symptom präzise erfassen**
- **Windows:** "Zugriff verweigert" (Access Denied) Fehlercode?
- **Linux:** `Permission denied` oder `Operation not permitted`?
- Welche Datei/Ordner genau? (Pfad notieren!)
- Welche Aktion? (Öffnen, Bearbeiten, Löschen, Ausführen?)

**Schritt 2: Effektive Rechte prüfen**

**Windows (GUI):**
1. Rechtsklick auf Datei → Eigenschaften → Sicherheit → Erweitert
2. "Effektive Berechtigungen" → Benutzer auswählen → "Zugriff anzeigen"
3. Liste zeigt: Was darf der User WIRKLICH (nach Vererbung + Deny)?

**Windows (PowerShell):**
```powershell
# Effektive Rechte für Benutzer Anna.Mueller prüfen
$Path = "C:\Daten\Marketing\bericht.docx"
$User = "Anna.Mueller"
$Acl = Get-Acl $Path
$Acl.Access | Where-Object {$_.IdentityReference -like "*$User*"}
```

**Linux:**
```bash
# Rechte anzeigen
ls -la /daten/marketing/bericht.txt
# Ausgabe: -rw-r----- 1 anna marketing 2048 Feb 20 10:00 bericht.txt

# Effektive Zugriffsprüfung
sudo -u anna cat /daten/marketing/bericht.txt
# Wenn Fehler: User anna kann nicht lesen!
```

**Schritt 3: Gruppenmitgliedschaft prüfen**

**Windows:**
```powershell
# Alle Gruppen von User anzeigen
Get-LocalGroup | ForEach-Object {
    $Group = $_.Name
    $Members = Get-LocalGroupMember -Group $Group -ErrorAction SilentlyContinue
    if ($Members.Name -contains "Anna.Mueller") {
        Write-Host "$Group"
    }
}
```

**Linux:**
```bash
# Gruppen von User anna anzeigen
groups anna

# Oder aus Gruppen-Datei
grep anna /etc/group
```

**Schritt 4: Vererbungskette analysieren**
- Prüfe ALLE Oberordner bis zur Root!
- Hat ein Oberordner ein "Deny"? → Schlägt alle Allows!
- Ist Vererbung irgendwo unterbrochen? → Rechte gelten nicht mehr für Unterordner

**Schritt 5: Besitzer prüfen (Linux)**
```bash
# Besitzer + Gruppe anzeigen
ls -l /daten/marketing/bericht.txt
# -rw-r----- 1 root marketing ...
#             ↑
#             Besitzer ist "root", nicht "anna"!

# Fix: Besitzer ändern
sudo chown anna:marketing /daten/marketing/bericht.txt
```

### 7.2 Typische Fehlerquellen-Tabelle (Die "Top 8")

| Symptom | Wahrscheinliche Ursache | Diagnose-Methode | Lösung | Prävention |
|---------|-------------------------|------------------|--------|------------|
| **"Access Denied" trotz Gruppenmitgliedschaft** | User ist nicht EFFEKTIV in Gruppe (Windows: Neuanmeldung nötig!) | `whoami /groups` (Windows) / `groups` (Linux) | User ab-/anmelden (Token refresh) | Mitarbeiter nach Gruppen-Änderung informieren! |
| **Datei kann geöffnet aber nicht gespeichert werden** | Read vorhanden, aber Write fehlt | Effektive Rechte prüfen | "Ändern"-Recht statt nur "Lesen" vergeben | Immer "Ändern" statt einzelne Rechte vergebenPerformance considerations<br>- Use 'Read' only for archive folders |
| **"Permission denied" bei chmod** (Linux) | User ist nicht Owner und nicht root | `ls -l datei` → Owner prüfen | Mit sudo: `sudo chmod ...` ODER Besitzer werden: `sudo chown user datei` | Nur Owner oder root kann chmod! |
| **Script startet nicht: "Permission denied"** (Linux) | Execute-Bit fehlt | `ls -l script.sh` → kein `x` sichtbar | `chmod +x script.sh` | Bei Shell-Scripts immer `chmod +x` setzen! |
| **Ordner kann betreten, aber Inhalt nicht gelistet werden** (Linux) | Ordner hat `x` (execute), aber kein `r` (read) | `ls -ld ordner` → `d--x------` | `chmod u+r ordner` | Ordner brauchen IMMER `x` UND `r` für vollen Zugriff! |
| **Explizites Deny blockiert alles** | User ist in Gruppe mit Deny UND Allow | `icacls datei` (Windows) → Deny-Einträge suchen | Deny-Eintrag entfernen: `icacls datei /remove:d "User"` | Deny nur für absolute Ausnahmen! Lieber Gruppen-Struktur überarbeiten |
| **Neue Datei in Ordner kann nicht erstellt werden** (Linux) | Ordner hat kein `w` (write) für Gruppe/User | `ls -ld ordner` → `dr-xr-xr-x` (kein `w`!) | `chmod g+w ordner` | Ordner braucht `w` zum Erstellen/Löschen von Dateien darin! |
| **Windows: "Sie benötigen Berechtigungen von SYSTEM"** | Datei gehört SYSTEM-Konto, User ist kein Admin | Rechtsklick → Eigenschaften → Sicherheit → Besitzer prüfen | Als Admin: Besitzer ändern auf eigenen Account | Dateien sollten normalen Usern gehören, nicht SYSTEM! |

### 7.3 Fünf Praxis-Troubleshooting-Szenarien

#### Szenario 1: "Anna kann Budget-Datei nicht öffnen, obwohl in Gruppe Marketing"

**Symptom:** Windows "Zugriff verweigert" bei `C:\Daten\Marketing\Budget\2024.xlsx`

**❌ FALSCHE Diagnose:** "Die Datei ist defekt!"

**✅ RICHTIGE Diagnose:**
1. Effektive Rechte prüfen: `icacls "C:\Daten\Marketing\Budget"`
2. Ausgabe zeigt: `BUILTIN\Administratoren:(OI)(CI)(F)` (NUR Admins!)
3. **Problem:** Budget-Ordner hat Vererbung deaktiviert und nur Admin-Rechte!

**Beweis:**
```powershell
# Vererbung prüfen
(Get-Acl "C:\Daten\Marketing\Budget").AreAccessRulesProtected
# True = Vererbung deaktiviert!
```

**Lösung:** Marketing-Gruppe nachträglich hinzufügen:
```powershell
icacls "C:\Daten\Marketing\Budget" /grant "Marketing:(OI)(CI)R"
# R = Read (nur Lesen, da Budget-Daten sensibel!)
```

**AP1-Lesson:** Vererbung deaktivieren = GUT für Sicherheit, ABER: Rechte müssen EXPLIZIT neu vergeben werden!

---

#### Szenario 2: "Linux: Web-Server zeigt '403 Forbidden' obwohl Datei existiert"

**Symptom:** Apache/Nginx zeigt Error 403 bei `/var/www/html/index.html`

**❌ FALSCHE Diagnose:** "Der Webserver ist kaputt!"

**✅ RICHTIGE Diagnose:**
1. Rechte prüfen:
   ```bash
   ls -la /var/www/html/index.html
   -rw------- 1 anna anna 1024 Feb 20 10:00 index.html
   ```
2. **Problem:** Besitzer = "anna", aber Webserver läuft als "www-data"!
3. **Andere** (Other) haben KEINE Rechte (------)

**Beweis:**
```bash
# Webserver-Prozess-User identifizieren
ps aux | grep nginx
# www-data  1234  ...

# Versuch als www-data Datei zu lesen
sudo -u www-data cat /var/www/html/index.html
# Permission denied!
```

**Lösung:**
```bash
# Besitzer auf Webserver-User ändern
sudo chown www-data:www-data /var/www/html/index.html

# Rechte setzen: Owner lesen+schreiben, Gruppe+Other nur lesen
sudo chmod 644 /var/www/html/index.html
```

**AP1-Lesson:** Webserver-Dateien MÜSSEN dem Webserver-User gehören! Typische User: `www-data` (Debian/Ubuntu), `apache` (RHEL/CentOS), `nginx` (bei Nginx).

---

#### Szenario 3: "PowerShell-Script startet nicht: 'Ausführung von Skripts ist deaktiviert'"

**Symptom:** `.\script.ps1` → Fehler: "Die Datei kann nicht geladen werden, da die Ausführung von Skripts auf diesem System deaktiviert ist."

**❌ FALSCHE Diagnose:** "PowerShell ist kaputt!"

**✅ RICHTIGE Diagnose:**
1. Execution Policy prüfen:
   ```powershell
   Get-ExecutionPolicy
   # Restricted (Standard = kein Script darf laufen!)
   ```
2. **Problem:** Windows Sicherheits-Feature "Execution Policy" blockiert Scripts

**Beweis:**
```powershell
# Detaillierte Info
Get-ExecutionPolicy -List
# Scope          ExecutionPolicy
# -----          ---------------
# MachinePolicy  Undefined
# UserPolicy     Undefined
# Process        Undefined
# CurrentUser    Undefined
# LocalMachine   Restricted  ← Blockiert alles!
```

**Lösung:**
```powershell
# Für aktuellen User erlauben (empfohlen für Entwickler)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Erklärung:
# RemoteSigned = Lokale Scripts OK, Downloads müssen signiert sein
# Bypass = ALLES erlaubt (nur für Tests!)
# AllSigned = Nur signierte Scripts (für Produktion)
```

**AP1-Lesson:** Execution Policy ist KEIN Rechte-Problem, sondern Schutz vor Malware-Scripts! In Firmen oft per GPO (Group Policy) gesetzt.

---

#### Szenario 4: "User Max ist in Gruppe 'Entwickler', aber sudo funktioniert nicht"

**Symptom:** `sudo apt update` → "Max is not in the sudoers file. This incident will be reported."

**❌ FALSCHE Diagnose:** "sudo ist nicht installiert!"

**✅ RICHTIGE Diagnose:**
1. sudoers-Datei prüfen:
   ```bash
   sudo visudo -c
   # /etc/sudoers: parsed OK
   ```
2. Gruppen-Mitgliedschaft prüfen:
   ```bash
   groups max
   # max : max entwickler
   ```
3. **Problem:** Gruppe "entwickler" ist NICHT in `/etc/sudoers` eingetragen!

**Beweis:**
```bash
# sudoers-Datei durchsuchen
sudo grep -i entwickler /etc/sudoers
# (Keine Ausgabe = nicht vorhanden!)

# Standard: Nur Gruppe "sudo" oder "wheel" darf sudo nutzen
sudo grep -E "^%sudo|^%wheel" /etc/sudoers
# %sudo   ALL=(ALL:ALL) ALL
```

**Lösung 1 (Quick):** Max in sudo-Gruppe aufnehmen:
```bash
sudo usermod -aG sudo max
# Max muss sich ab-/anmelden!
```

**Lösung 2 (Proper):** Entwickler-Gruppe in sudoers eintragen:
```bash
sudo visudo
# Am Ende hinzufügen:
# %entwickler ALL=(ALL:ALL) ALL
```

**AP1-Lesson:** sudo-Rechte werden NICHT automatisch vererbt! Explizite Eintragung in `/etc/sudoers` nötig.

---

#### Szenario 5: "Ordner wurde kopiert, jetzt funktionieren Berechtigungen nicht mehr"

**Symptom (Windows):** Ordner `C:\Backup\Marketing` kopiert nach `D:\Projekte\Marketing` → Marketing-Gruppe kann nicht zugreifen!

**❌ FALSCHE Diagnose:** "Die Festplatte D: ist defekt!"

**✅ RICHTIGE Diagnose:**
1. Berechtigungen prüfen:
   ```powershell
   icacls "D:\Projekte\Marketing"
   # D:\Projekte\Marketing BUILTIN\Administratoren:(OI)(CI)(F)
   #                       NT AUTHORITY\SYSTEM:(OI)(CI)(F)
   #                       VORDEFINED\Users:(OI)(CI)(RX)
   ```
2. **Problem:** Beim Kopieren wurden Berechtigungen NICHT mitkopiert! Standard-ACL von D:\ wurde angewendet.

**Beweis:**
```powershell
# Original-Berechtigungen prüfen
icacls "C:\Backup\Marketing"
# C:\Backup\Marketing Marketing:(OI)(CI)(M)  ← Diese fehlen jetzt!
```

**Lösung:** Berechtigungen NACH dem Kopieren neu setzen:
```powershell
# Marketing-Gruppe hinzufügen
icacls "D:\Projekte\Marketing" /grant "Marketing:(OI)(CI)M" /T
# /T = rekursiv für alle Unterordner
```

**AP1-Lesson:** 
- **Kopieren** (Ctrl+C/Ctrl+V) = Berechtigungen gehen verloren, Ziel-Ordner-ACL wird übernommen!
- **Verschieben** innerhalb gleicher Partition = Berechtigungen bleiben erhalten
- **Verschieben** auf andere Partition = wie Kopieren (Berechtigungen weg!)
- **Backup-Tools** (robocopy) können Berechtigungen mit `/SEC` kopieren:
  ```powershell
  robocopy "C:\Backup\Marketing" "D:\Projekte\Marketing" /E /SEC
  # /E = alles inkl. leere Ordner
  # /SEC = Berechtigungen+Audit+Owner kopieren
  ```

---

## 8) AP1-Prüfungsfokus: Dateiserver-Berechtigungen

### 8.1 Originalnahe AP1-Aufgabe mit Musterlösung

**Aufgabenstellung (25 Punkte, 22 Minuten):**

Die Firma "TechStart GmbH" (30 Mitarbeiter) möchte einen neuen Dateiserver (Windows Server 2022) einrichten.

**Anforderungen:**
1. **Drei Abteilungen:**
   - **Marketing** (8 Mitarbeiter): Eigener Ordner, alle dürfen lesen/schreiben/löschen
   - **Entwicklung** (12 Mitarbeiter): Eigener Ordner, alle dürfen lesen/schreiben/löschen
   - **Geschäftsführung** (2 Personen): Eigener Ordner, nur GF darf zugreifen

2. **Besondere Regeln:**
   - Geschäftsführung darf alle Abteilungsordner LESEN (aber nicht ändern!)
   - Marketing und Entwicklung dürfen sich NICHT gegenseitig sehen
   - Praktikant "Lisa.Neu" (Entwicklung) darf Code LESEN, aber NICHT ändern/löschen

3. **Ordnerstruktur:**
   ```
   D:\Daten
     ├── Marketing
     ├── Entwicklung
     └── Geschaeftsfuehrung
   ```

**Aufgaben:**
1. Erstellen Sie die Ordnerstruktur und Gruppen-Konzept (Welche Gruppen?) **(5 Punkte)**
2. Setzen Sie die NTFS-Berechtigungen für alle Ordner (PowerShell oder GUI-Beschreibung) **(12 Punkte)**
3. Begründen Sie Ihre Lösung hinsichtlich **Sicherheit** und **Wartbarkeit** **(6 Punkte)**
4. Wie lösen Sie die Praktikanten-Anforderung (Lisa nur Leserechte)? **(2 Punkte)**

---

**📋 MUSTERLÖSUNG MIT ERWARTUNGSHORIZONT:**

#### Zu 1) Ordnerstruktur und Gruppen-Konzept (5 Punkte)

**Gruppen erstellen:**
```powershell
# Abteilungsgruppen
New-LocalGroup -Name "Marketing" -Description "Marketing-Abteilung (8 Mitarbeiter)"
New-LocalGroup -Name "Entwicklung" -Description "Entwicklung (12 Mitarbeiter)"
New-LocalGroup -Name "Geschaeftsfuehrung" -Description "Geschäftsführung (2 Personen)"

# Spezial-Gruppe für Praktikanten (Read-Only Entwicklung)
New-LocalGroup -Name "Entwicklung-ReadOnly" -Description "Praktikanten mit Lese-Zugriff"
```

**Ordner erstellen:**
```powershell
New-Item -Path "D:\Daten" -ItemType Directory
New-Item -Path "D:\Daten\Marketing" -ItemType Directory
New-Item -Path "D:\Daten\Entwicklung" -ItemType Directory
New-Item -Path "D:\Daten\Geschaeftsfuehrung" -ItemType Directory
```

**Punkteverteilung (5 Punkte):**
- Alle 3 Hauptgruppen erstellt: 2 Punkte
- Spezial-Gruppe für Praktikanten erwähnt: 1 Punkt
- Ordner korrekt strukturiert: 1 Punkt
- Beschreibungen bei Gruppen (Dokumentation!): 1 Punkt

---

#### Zu 2) NTFS-Berechtigungen setzen (12 Punkte)

**Schritt 1: Basis-Ordner D:\Daten**
```powershell
# Standard-Vererbung von D:\ entfernen
icacls "D:\Daten" /inheritance:d

# NUR Administratoren + System behalten
icacls "D:\Daten" /grant "Administratoren:(OI)(CI)(F)"
icacls "D:\Daten" /grant "SYSTEM:(OI)(CI)(F)"

# Geschäftsführung darf ALLES LESEN (aber nicht D:\Daten selbst ändern!)
icacls "D:\Daten" /grant "Geschaeftsfuehrung:(OI)(CI)(R)"
```

**Schritt 2: Marketing-Ordner**
```powershell
# Vererbung von D:\Daten deaktivieren
icacls "D:\Daten\Marketing" /inheritance:d

# Marketing-Gruppe: Vollzugriff (Ändern)
icacls "D:\Daten\Marketing" /grant "Marketing:(OI)(CI)(M)"

# Geschäftsführung: Nur Lesen
icacls "D:\Daten\Marketing" /grant "Geschaeftsfuehrung:(OI)(CI)(R)"

# Admin + System (Pflicht!)
icacls "D:\Daten\Marketing" /grant "Administratoren:(OI)(CI)(F)"
icacls "D:\Daten\Marketing" /grant "SYSTEM:(OI)(CI)(F)"
```

**Schritt 3: Entwicklung-Ordner**
```powershell
# Vererbung deaktivieren
icacls "D:\Daten\Entwicklung" /inheritance:d

# Entwicklung-Gruppe: Vollzugriff (Ändern)
icacls "D:\Daten\Entwicklung" /grant "Entwicklung:(OI)(CI)(M)"

# Entwicklung-ReadOnly (für Praktikanten): Nur Lesen
icacls "D:\Daten\Entwicklung" /grant "Entwicklung-ReadOnly:(OI)(CI)(R)"

# Geschäftsführung: Nur Lesen
icacls "D:\Daten\Entwicklung" /grant "Geschaeftsfuehrung:(OI)(CI)(R)"

# Admin + System
icacls "D:\Daten\Entwicklung" /grant "Administratoren:(OI)(CI)(F)"
icacls "D:\Daten\Entwicklung" /grant "SYSTEM:(OI)(CI)(F)"
```

**Schritt 4: Geschaeftsführung-Ordner**
```powershell
# Vererbung deaktivieren (WICHTIG: Maximale Sicherheit!)
icacls "D:\Daten\Geschaeftsfuehrung" /inheritance:d

# NUR Geschäftsführung: Vollzugriff
icacls "D:\Daten\Geschaeftsfuehrung" /grant "Geschaeftsfuehrung:(OI)(CI)(M)"

# Admin (für Backup/Wartung)
icacls "D:\Daten\Geschaeftsfuehrung" /grant "Administratoren:(OI)(CI)(F)"
icacls "D:\Daten\Geschaeftsfuehrung" /grant "SYSTEM:(OI)(CI)(F)"

# Marketing + Entwicklung haben KEINEN Zugriff (nicht explizit verbieten, einfach nicht vergeben!)
```

**Punkteverteilung (12 Punkte):**
- Vererbung korrekt deaktiviert (bei allen 4 Ordnern): 3 Punkte
- Marketing-Ordner korrekt: 2 Punkte  
  - Marketing: Modify ✓
  - GF: Read ✓
- Entwicklung-Ordner korrekt: 3 Punkte
  - Entwicklung: Modify ✓
  - Entwicklung-ReadOnly: Read ✓ (Praktikanten!)
  - GF: Read ✓
- Geschäftsführung-Ordner korrekt: 2 Punkte
  - NUR GF + Admin (keine anderen!)
- Admin + System überall: 1 Punkt
- GF darf Marketing+Entwicklung LESEN (nicht ändern!): 1 Punkt

---

#### Zu 3) Begründung: Sicherheit + Wartbarkeit (6 Punkte)

**Sicherheits-Begründung (3 Punkte):**

1. **Least Privilege (Minimale Rechte):**
   - Marketing sieht NICHT Entwicklung-Dateien (trennung der Bereiche)
   - Entwicklung sieht NICHT Marketing-Dateien
   - Praktikanten haben NUR Leserechte (können Code nicht versehentlich löschen!)
   - Geschäftsführung kann überwachen (Read), aber nicht versehentlich Daten ändern

2. **Need-to-Know:**
   - Nur wer für seine Arbeit Zugriff braucht, bekommt ihn
   - Gehälter/Verträge in GF-Ordner sind für normale Mitarbeiter UNSICHTBAR

3. **Explizite Vererbungs-Unterbrechung:**
   - GF-Ordner kann NICHT versehentlich von oben "aufgebohrt" werden
   - Bei Änderungen an D:\Daten bleiben GF-Berechtigungen geschützt

**Wartbarkeits-Begründung (3 Punkte):**

1. **Gruppen statt Einzelbenutzer:**
   - Neuer Marketing-Mitarbeiter → in Gruppe "Marketing" aufnehmen = fertig!
   - KEINE 100 Ordner durchgehen und einzeln Rechte setzen
   - **Zeit-Ersparnis:** 5 Minuten statt 2 Stunden

2. **Klare Namenskonvention:**
   - Gruppe "Marketing" → Ordner "Marketing" → offensichtliche Zuordnung
   - Gruppe "Entwicklung-ReadOnly" → Zweck sofort klar
  
3. **Dokumentation durch Beschreibungen:**
   - `New-LocalGroup -Description` → jeder Admin versteht sofort den Zweck
   - Kein "Tribal Knowledge" (Wissen nur im Kopf von 1 Person)

**Beispiel-Rechnung TCO:**
- **Alt:** Einzeln Rechte pro User → 10 Min pro User × 30 User = 300 Min = 5 Stunden × 50€/h = **250€**
- **Neu:** Gruppen-basiert → 30 Min Setup + 2 Min pro User = 90 Min = 1,5 Stunden × 50€/h = **75€**
- **Ersparnis:** **175€** + weniger Fehler (vergessene Rechte)!

---

#### Zu 4) Praktikanten-Lösung (2 Punkte)

**Ansatz:**
```powershell
# Lisa.Neu in beide Gruppen aufnehmen
Add-LocalGroupMember -Group "Entwicklung-ReadOnly" -Member "Lisa.Neu"

# NICHT in "Entwicklung"-Gruppe aufnehmen!
# (Sonst hätte sie Modify-Rechte)
```

**Begründung (2 Punkte):**
- Separate Gruppe "Entwicklung-ReadOnly" mit Read-Only-Rechten (1 Punkt)
- Lisa ist NICHT in "Entwicklung"-Hauptgruppe (sonst Modify!) (1 Punkt)

**Alternative (auch akzeptiert):**
```powershell
# Lisa in "Entwicklung"-Gruppe, aber explizites Deny für Write
icacls "D:\Daten\Entwicklung" /deny "Lisa.Neu:(W)"
```
**Aber:** Schlechter Stil! Deny ist schwer wartbar. Best Practice = Separate Gruppe.

---

### 8.2 Prüfungsrelevante Begriffe (Pflicht-Vokabular)

| Begriff | Kontext | Wann in AP1 erwähnen? |
|---------|---------|------------------------|
| **Least Privilege** | Minimale Rechte vergeben | IMMER bei Begründung! "User bekommt NUR was er braucht" |
| **Need-to-Know** | User darf nur sehen was für Job nötig | Bei sensiblen Daten (Gehälter, Kundendaten) |
| **Separation of Duties** | Aufgaben trennen (4-Augen-Prinzip) | Bei Finanzen, Bestellprozessen, Code-Deployment |
| **Vererbung** | Rechte vom Oberordner | Erklären warum deaktiviert bei sensiblen Ordnern! |
| **Explizite Deny** | Verbieten schlägt Erlauben | Nur für Ausnahmen, sonst Wartungs-Albtraum |
| **Effektive Rechte** | Was darf User WIRKLICH (nach Vererbung + Deny) | Bei Troubleshooting immer prüfen! |
| **ACL** | Access Control List (Berechtigungsliste) | Windows-NTFS-Grundlage |
| **UAC** | User Account Control (Admin-Prompt) | Windows-Sicherheitsfeature gegen Malware |
| **sudo** | Temporäre root-Rechte (Linux) | Besser als dauerhaft als root arbeiten |
| **chmod/chown** | Rechte/Besitzer ändern (Linux) | Linux-Grundlagen für AP1 |

**Prüfer-Insider:** Wenn du "Least Privilege" + "Need-to-Know" + "Separation of Duties" in einer Antwort hast, zeigt das Security-Mindset → Bonus-Punkte!

### 8.3 Fünf Insider-Tipps vom Prüfer

#### 1. **Begründungspflicht ist ALLES (wie bei Hardware!)**
❌ **Falsch:** "Marketing-Gruppe bekommt Modify-Rechte."  
✅ **Richtig:** "Marketing-Gruppe bekommt Modify-Rechte (Lesen + Schreiben + Löschen), da Mitarbeiter eigenständig Kampagnen-Dateien erstellen/bearbeiten/archivieren müssen. Vollzugriff ist NICHT nötig, da Berechtigungs-Änderungen nur durch IT-Admin erfolgen (Least Privilege). Geschäftsführung erhält nur Read-Rechte für Kontroll-Zwecke, um versehentliche Änderungen zu vermeiden."

**Faustregel:** Pro Berechtigung mind. 2 Sätze Begründung!

#### 2. **Sicherheit = TCO-Argument!**
Prüfer LIEBEN Rechn ungen:
- "Durch Gruppen-basierte Rechtevergabe spart IT-Admin 4 Stunden/Monat (keine einzelnen User anpassen)"
- "4h × 50€/h × 12 Monate = **2.400€/Jahr** Ersparnis"
- "Weniger Fehler (vergessene Rechte) = weniger Support-Tickets = weitere Einsparung"

#### 3. **Immer Vererbung erklären!**
Zeige dass du verstehst, WANN Vererbung gut/schlecht ist:
- "Oberordner 'D:\Daten' hat Vererbung aktiviert (praktisch für Standard-Rechte)"
- "Geschäftsführung-Ordner hat Vererbung DEAKTIVIERT, weil sonst Abteilungen-Gruppen Zugriff erben würden (Sicherheitsrisiko!)"

#### 4. **Linux vs. Windows: Wissen dass es Unterschiede gibt!**
Wenn Aufgabe offen lässt ("Dateiserver"):
- "Bei Windows Server: NTFS-ACL mit Gruppen + Vererbung"
- "Bei Linux: POSIX-Rechte (rwx) + Gruppen, ggf. ACLs mit `setfacl` für feinere Kontrolle"
- "Wahl hängt ab von: Client-Betriebssysteme (Windows-Clients → Samba/Windows-Server), Kosten (Linux Open Source), Admin-Know-How"

#### 5. **Praktikanten/Externe = Separate Gruppen!**
Standard-Pattern für AP1:
- "Entwicklung"-Gruppe (Vollzeit-Mitarbeiter)
- "Entwicklung-ReadOnly"-Gruppe (Praktikanten/Externe)
- "Entwicklung-Extern"-Gruppe (Partner-Firmen, nur bestimmte Projekte)

→ Zeigt, dass du über Rollen-Konzepte nachdenkst!

---

## 9) Fallstudien: Welche Berechtigungen für wen?

### Fall A: Arztpraxis (Datenschutz/DSGVO)
- **Anforderung:** Patienten-Akten dürfen NUR von behandelndem Arzt + Empfang gelesen werden. Andere Ärzte (andere Patienten) dürfen NICHT sehen!
- **Kritisch:** DSGVO-Verstoß = 20 Mio € Strafe!
- **Lösung:** 
  - **Kein** gemeinsamer "Ärzte"-Ordner!
  - Pro Arzt eigener Ordner: `D:\Patienten\Dr.Mueller\` (nur Dr. Mueller darf rein)
  - Empfang-gruppe: Read-Rechte auf ALLE Ärzte-Ordner (für Terminvergabe)
  - Praxis-Leiter: Audit-Rechte (nur Logs lesen, keine Patientendaten)

### Fall B: Shared-Hosting-Provider (Multi-Tenant-Linux)
- **Anforderung:** 100 Kunden, jeder hat eigenen Web-Space. Kunde A darf Kunde B's Dateien NICHT sehen!
- **Kritisch:** Datenleck = Vertrauensverlust + Kündigungen
- **Lösung:**
  ```bash
  # Pro Kunde eigener User + Gruppe
  sudo useradd -m kunde-a
  sudo useradd -m kunde-b
  
  # Web-Verzeichnisse
  sudo mkdir -p /var/www/kunde-a.de
  sudo mkdir -p /var/www/kunde-b.de
  
  # Besitz + Rechte
  sudo chown kunde-a:kunde-a /var/www/kunde-a.de
  sudo chmod 750 /var/www/kunde-a.de  # rwxr-x--- (User voll, Gruppe lesen+execute, Other nichts!)
  
  # Webserver (www-data) ist in Gruppe kunde-a
  sudo usermod -aG kunde-a www-data
  ```

### Fall C: DevOps-Team (Git-Repository auf Linux-Server)
- **Anforderung:** Entwickler dürfen Code pushen/pullen. CI/CD-System (Jenkins) darf nur lesen. Externe Code-Reviewer dürfen nur lesen.
- **Kritisch:** Externe dürfen NICHT produktiven Code überschreiben!
- **Lösung:**
  ```bash
  # Gruppen
  sudo groupadd dev-team
  sudo groupadd code-reviewer
  
  # Repository
  sudo mkdir -p /git/projekt.git
  sudo chown root:dev-team /git/projekt.git
  sudo chmod 2770 /git/projekt.git
  # 2 = SetGID (neue Dateien erben Gruppe "dev-team")
  # 770 = rwxrwx--- (Owner+Group voll, Other nichts)
  
  # Code-Reviewer: ACL für Read-Only
  sudo setfacl -R -m g:code-reviewer:rx /git/projekt.git
  sudo setfacl -R -d -m g:code-reviewer:rx /git/projekt.git
  # -d = default (für neue Dateien)
  ```

---

## 10) Typische Fehler & Gegenstrategien

### Fehler 1: "Jeder in Gruppe 'Administratoren' aufnehmen wenn's nicht klappt"
**Warum falsch:** Sicherheitslücke! User kann System zerstören, Malware installieren, Logs löschen.  
**Gegenstrategie:** Least Privilege! Nur gezielt die fehlende Berechtigung geben, NICHT Admin.

### Fehler 2: "chmod 777 auf Linux-Server"
**Warum falsch:** JEDER User kann Dateien löschen/überschreiben = Chaos + Sicherheitsloch.  
**Gegenstrategie:** `chmod 755` Ordner, `644` Dateien (Standard), `700` für Secrets.

### Fehler 3: "Deny überall setzen für Feinsteuerung"
**Warum falsch:** Deny schlägt Allow → spätere Änderungen brechen Zugriff. Wartungs-Hölle!  
**Gegenstrategie:** Gruppen-Struktur überarbeiten, Positive Rechte-Vergabe (Allow), Deny nur absolute Ausnahme.

### Fehler 4: "Vererbung ignorieren (einfach Rechte oben setzen)"
**Warum falsch:** Sensible Unterordner (GF) erben Rechte von oben → Datenleck!  
**Gegenstrategie:** Vererbung bei sensiblen Ordnern EXPLIZIT deakt ivieren, Rechte neu setzen.

### Fehler 5: "Gruppen-Mitgliedschaft ändern ohne User-Neuanmeldung"
**Warum falsch:** Windows/Linux Token wird NUR bei Login erstellt. Neue Gruppe = erst nach Neuanmeldung aktiv!  
**Gegenstrategie:** User informieren: "Bitte einmal ab-/anmelden, dann funktioniert Zugriff!"

---

## 11) Zusammenfassung & Selbsttest: Bist du AP1-bereit?

### 11.1 Die 15 Kernpunkte, die du IMMER nennen können musst

1. **Least Privilege:** Jeder User nur die Rechte die er WIRKLICH braucht, nicht mehr!
2. **Need-to-Know:** User darf nur auf Daten zugreifen, die er für seine Arbeit benötigt.
3. **Separation of Duties:** Aufgaben trennen (4-Augen-Prinzip bei kritischen Prozessen).
4. **Gruppen > Einzelbenutzer:** Immer Gruppen nutzen, NICHT jedem User einzeln Rechte geben!
5. **Vererbung verstehen:** Unterordner erben von oben. Bei sensiblen Ordnern DEAKTIVIEREN!
6. **Deny > Allow:** Explizite Deny schlägt alle Allows. Nur für Ausnahmen nutzen!
7. **Effektive Rechte prüfen:** User in 10 Gruppen? Prüfe was er WIRKLICH darf (Tool nutzen)!
8. **Windows NTFS:** ACL-basiert, Read/Write/Modify/FullControl, Vererbung (OI)(CI).
9. **Linux POSIX:** rwx-Modell (Owner/Group/Other), chmod/chown, sudo statt root.
10. **UAC (Windows):** Admin-Prompt verhindert dass Malware lautlos System übernimmt.
11. **sudo (Linux):** Temporäre root-Rechte für EINEN Befehl, dann zurück zu normalem User.
12. **Neuanmeldung nach Gruppen-Änderung:** Token wird nur bei Login erneuert!
13. **chmod 755 für Ordner, 644 für Dateien:** Standard-Rechte (nicht 777!).
14. **Webserver-User:** Apache/Nginx läuft als www-data/nginx, Dateien müssen ihm gehören!
15. **Troubleshooting:** 1) Symptom, 2) Effektive Rechte, 3) Gruppen, 4) Vererbung, 5) Besitzer.

### 11.2 5-Minuten-Blitz-Check (Ja/Nein-Fragebogen)

| # | Frage | Deine Antwort |
|---|-------|---------------|
| 1 | Kann ich erklären, warum Gruppen besser sind als Einzelbenutzer-Rechte? | ☐ Ja ☐ Nein |
| 2 | Weiß ich, dass Deny IMMER Allow übersteuert (Deny > Allow)? | ☐ Ja ☐ Nein |
| 3 | Kann ich Windows NTFS-Rechte setzen (PowerShell: icacls)? | ☐ Ja ☐ Nein |
| 4 | Kann ich Linux-Rechte setzen (chmod 755, chown)? | ☐ Ja ☐ Nein |
| 5 | Weiß ich, wann Vererbung deaktiviert werden MUSS (GF-Ordner!)? | ☐ Ja ☐ Nein |
| 6 | Kenne ich die 5 Troubleshooting-Schritte bei "Access Denied"? | ☐ Ja ☐ Nein |
| 7 | Weiß ich, dass User sich nach Gruppen-Änderung NEU anmelden muss? | ☐ Ja ☐ Nein |
| 8 | Kenne ich Least Privilege + Need-to-Know + Separation of Duties? | ☐ Ja ☐ Nein |
| 9 | Kann ich AP1-Begründung schreiben (Sicherheit + Wartbarkeit)? | ☐ Ja ☐ Nein |
| 10 | Weiß ich den Unterschied zwischen UAC (Windows) und sudo (Linux)? | ☐ Ja ☐ Nein |

**Auswertung:**
- **10/10 Ja:** 🏆 Du bist AP1-bereit! Quiz starten.
- **7-9 Ja:** ⚠️ Noch 1-2 Lücken. Kapitel 3, 4, 7 nochmal lesen.
- **< 7 Ja:** ❌ Zu viele Lücken. Modul von vorne durcharbeiten!

### 11.3 Checkliste: Kann ich das?

- [ ] **Windows:** Benutzer + Gruppen erstellen (PowerShell + GUI)
- [ ] **Windows:** NTFS-Berechtigungen setzen (icacls, Vererbung (OI)(CI))
- [ ] **Windows:** Vererbung deaktivieren bei sensiblen Ordnern
- [ ] **Windows:** Effektive Rechte prüfen (Get-Acl, GUI "Erweitert")
- [ ] **Linux:** User + Groups erstellen (useradd, groupadd, usermod -aG)
- [ ] **Linux:** chmod (rwx-Modell, Oktal 755/644/700)
- [ ] **Linux:** chown (Besitzer ändern, rekursiv mit -R)
- [ ] **Linux:** sudo konfigurieren (/etc/sudoers, visudo)
- [ ] **Troubleshooting:** 5-Schritte-Prozess (Symptom → Effektive Rechte → Gruppen → Vererbung → Besitzer)
- [ ] **AP1-Begründung:** Least Privilege + Need-to-Know + Separation of Duties erwähnen
- [ ] **Prüfungsaufgabe:** Dateiserver-Berechtigungen strukturiert lösen (Gruppen-Konzept → Rechte setzen → Begründung)

**Wenn alles abgehakt:** Glückwunsch! Du beherrschst Modul 004!

### 11.4 Weiterführende Quellen

- **Microsoft Docs:** NTFS-Permissions, icacls, Active Directory
- **Linux Documentation:** chmod, chown, sudo, Access Control Lists (ACLs)
- **Tool:** Windows Sysinternals "AccessChk" (Rechte-Analyse-Tool)
- **Tool:** Linux "getfacl/setfacl" (erweiterte ACLs für feinere Kontrolle)
- **DSGVO:** Berechtigungskonzepte müssen dokumentiert sein (Rechenschaftspflicht!)

### 11.5 Eselsbrücken zum Merken (Die "Rechte-Merksätze")

#### 1. **Least Privilege Regel**
> **"L-eber P-raktisch R-echte R-eduzieren!"**  
> **L**east **P**rivilege = Nur was du wirklich brauchst!  
> Nicht "zur Sicherheit Admin" = FALSCH!

#### 2. **Deny schlägt Allow**
> **"Der D-oofe A-lways schlägt!"**  
> **D**eny > **A**llow = IMMER!  
> Explizites Verbieten übersteuert alle Erlaubnisse.

#### 3. **rwx bedeuten je nach Objekt etwas anderes!**
> **"Datei Read = Lesen, Ordner Read = Listen!"**  
> - Datei: `r` = Inhalt lesen, `x` = ausführen
> - Ordner: `r` = Inhalt listen (ls), `x` = betreten (cd)  
> Ordner OHNE `x` = nutzlos! (kann nicht betreten werden)

#### 4. **chmod Oktal-Zahlen**
> **"R-obert W-ill X-ylophon spielen = 4-2-1!"**  
> **R**ead=4, **W**rite=2, e**X**ecute=1  
> - 7 = 4+2+1 = rwx
> - 6 = 4+2 = rw-
> - 5 = 4+1 = r-x
> - 4 = r--

#### 5. **Windows (OI)(CI) bei icacls**
> **"O-tto I-sst C-urry I-mmer!"**  
> **(O)bject (I)nherit** = Dateien erben  
> **(C)ontainer (I)nherit** = Unterordner erben  
> Beides zusammen: (OI)(CI) = Alles erbt!

#### 6. **Gruppen-Mitgliedschaft Neuanmeldung**
> **"Neues Token? Neuanmelden!"**  
> Windows/Linux: Gruppen-Mitgliedschaft wird nur bei LOGIN in Token geschrieben.  
> Änderung → User MUSS sich ab-/anmelden!

#### 7. **sudo vs. su**
> **"sudo = SuperUser DO one command!"**  
> `sudo` = ein Befehl als root, dann zurück.  
> `su -` = dauerhaft root (gefährlich!).  
> Merke: sudo ist SICHERER!

#### 8. **NTFS-Berechtigungen Hierarchie**
> **"Vollzugriff > Ändern > Schreiben > Lesen > Nichts"**  
> - Full Control (F) = ALLES + Berechtigungen ändern
> - Modify (M) = Lesen + Schreiben + Löschen
> - Write (W) = Nur Schreiben
> - Read (R) = Nur Lesen

---

**Abschluss:** Rechteverwaltung ist das Rückgrat JEDER IT-Infrastruktur. Wer Berechtigungen falsch setzt, riskiert Datenlecks (DSGVO-Strafe!), Chaos (jeder löscht alles) und Support-Albtraum. Verstehe Least Privilege, nutze Gruppen, deaktiviere Vererbung bei sensiblen Ordnern – und du bist in der AP1 unschlagbar!
