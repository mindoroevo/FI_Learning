# 004 – Betriebssysteme, Benutzer & Rechte

## Lernzeit & Zielniveau
- **Empfohlene Lernzeit:** ca. 3 - 4 Stunden (inkl. Übungen)
- **Zielniveau:** Du verstehst tiefgreifend die Architektur moderner Betriebssysteme (Kernel/Shell), kannst Dateisysteme (Journaling, Inodes) detailliert unterscheiden und beherrscht die Linux-Rechteverwaltung (rwx, SUID, Oktal) sicher für komplexe Szenarien. Du kannst CLI-Befehle sicher anwenden und Ausgaben interpretieren.

---

## Kapitelübersicht
1.  **Was ist ein Betriebssystem? (Die 4 Verwalter)**
2.  **Architektur: Kernel vs. Shell (Ring-Modell)**
3.  **Dateisysteme im Detail (NTFS, EXT4, FAT32)**
4.  **Benutzer & Gruppen (Die Linux-Logik)**
5.  **Rechteverwaltung Deep Dive (chmod, chown, Oktal-Code)**
6.  **Prozessverwaltung & Scheduling**
7.  **Wichtige CLI-Befehle (Command Line)**
8.  **Praxisbeispiele & Typische Prüfungsfallen**

---

## 1. Was ist ein Betriebssystem? (Die 4 Verwalter)

Ein Computer ohne Betriebssystem (OS) ist nur ein "toter" Haufen Elektronik. Das OS ist der **Vermittler** zwischen der Hardware (unten) und den Anwendungen (oben). Es abstrahiert die komplexe Hardware, sodass Programmierer nicht direkt mit Speicheradressen oder Festplattensektoren hantieren müssen.

In der Prüfung wird oft nach den **Kernaufgaben** gefragt. Merke dir das Modell der "4 Verwalter":

### 1.1 Der Prozess-Verwalter (Scheduler)
**Wer darf wann auf die CPU?**
-   Ein moderner PC hat hunderte Prozesse gleichzeitig offen (Browser, Spotify, Systemdienste).
-   Eine CPU hat aber nur wenige Kerne (z.B. 8).
-   **Der Scheduler** entscheidet blitzschnell (in Millisekunden), wer gerade rechnen darf ("Context Switch"). Er sorgt für **Fairness** und **Effizienz**.
-   Er verhindert, dass ein abgestürztes Programm den ganzen PC einfriert (Preemptive Multitasking).

### 1.2 Der Speicher-Verwalter (Memory Manager)
**Wer bekommt wie viel RAM?**
-   Jedes Programm "denkt", es hätte den ganzen RAM für sich allein (**Virtueller Speicher**).
-   Das OS übersetzt diese virtuellen Adressen in echte physische Adressen (MMU - Memory Management Unit).
-   **Wichtig für AP1:** Wenn der RAM voll ist, lagert das OS inkompatible Daten auf die Festplatte aus (**Swapping** / **Pagefile**). Das macht den PC extrem langsam, da Festplatten viel langsamer als RAM sind ("Thrashing").

### 1.3 Der Datei-Verwalter (File System)
**Wie werden Nullen und Einsen zu "Bachelorarbeit.docx"?**
-   Die Festplatte speichert nur rohe Datenblöcke (Sektoren/Cluster).
-   Das Dateisystem (z.B. NTFS, EXT4) führt Buch darüber, welcher Block zu welcher Datei gehört, wie sie heißt, wer sie öffnen darf und wo sie physisch liegt.
-   Es stellt die hierarchische Ordnerstruktur bereit.

### 1.4 Der Geräte-Verwalter (I/O Manager)
**Wie bewege ich die Maus?**
-   Hardware ist extrem vielfältig. Jeder Hersteller baut seine Chips anders.
-   Das OS nutzt **Treiber**, um eine einheitliche Schnittstelle (API) zu bieten.
-   Für Word ist es egal, ob du eine HP-Maus oder eine Logitech-Maus hast – das OS (und der Treiber) kümmert sich um die Unterschiede.

---

## 2. Architektur: Kernel vs. Shell (Das Ring-Modell)

Eine klassische Prüfungsfrage (und wichtiges Sicherheitskonzept) ist die Unterscheidung zwischen **Kernel-Mode** und **User-Mode**.

### 2.1 Der Kernel (Ring 0)
-   Der **Kern** des Betriebssystems.
-   Er hat **vollen Zugriff** auf die gesamte Hardware (CPU-Befehle, RAM-Adressen, I/O-Ports).
-   Fehler hier sind fatal: Das System stürzt komplett ab -> **Blue Screen of Death (BSOD)** (Windows) oder **Kernel Panic** (Linux/macOS).
-   Hier laufen kritische Treiber und die Speicherverwaltung.

### 2.2 Die Shell & User-Space (Ring 3)
-   Die **Schale** um den Kern.
-   Hier laufen deine Programme (Word, Browser) und die Benutzeroberfläche (GUI oder CLI).
-   Programme im User-Space haben **keinen** direkten Zugriff auf Hardware. Sie müssen den Kernel höflich bitten, etwas zu tun (z.B. "Bitte lies Datei X" oder "Bitte sende Daten ins Netzwerk"). Dieser Vorgang heißt **System Call**.
-   **Vorteil:** Wenn Word abstürzt, reißt es nicht das ganze System mit, weil es isoliert im Ring 3 läuft. Der Kernel beendet einfach den fehlerhaften Prozess.

> **Merke:** Die Shell (z.B. Bash, PowerShell, Explorer) nimmt deine Befehle entgegen und übersetzt sie in System Calls für den Kernel.

---

## 3. Dateisysteme im Detail – Mehr als nur Formatieren

In der AP1 musst du oft entscheiden, welches Dateisystem für einen bestimmten Einsatzzweck (USB-Stick, Server, Windows-System) geeignet ist.

| Merkmal | **FAT32** | **NTFS** | **EXT4** |
| :--- | :--- | :--- | :--- |
| **Einsatzgebiet** | Universell (Kamera, USB-Stick, TV) | Windows Systempartition | Linux Standard |
| **Max. Dateigröße** | **4 GB** (Limit!) ⚠️ | 16 Exabyte (riesig) | 16 Terabyte |
| **Rechteverwaltung** | Nein (Jeder darf alles) | Ja (ACLs - Access Control Lists) | Ja (Unix-Rechte - rwx) |
| **Journaling** | Nein | Ja | Ja |
| **Kompatibilität** | Fast alle Geräte | Windows (Linux r/w, macOS r) | Linux (Windows nur mit Tools) |

### Deep Dive: Was ist "Journaling"?
Stell dir vor, du kopierst 1000 Dateien auf einen Server. Bei Datei 500 fällt plötzlich der Strom aus.

-   **Ohne Journaling (FAT32/ext2):** Das Dateisystem weiß beim Neustart nicht, was gerade passiert ist. Einträge in der Dateitabelle könnten korrupt sein. Der ganze Datenträger muss mühsam gescannt werden (`chkdsk` / `fsck`), was bei großen Platten Stunden dauert. Datenverlust ist wahrscheinlich.
-   **Mit Journaling (NTFS/EXT3/EXT4):** Das OS führt ein "Tagebuch" (Journal). Bevor es die Datei schreibt, notiert es im Journal: *"Ich habe vor, Datei X an Stelle Y zu schreiben"*. Erst dann schreibt es die Daten.
-   **Nach dem Neustart:** Das OS schaut ins Journal: *"Aha, der Job war nicht als 'erledigt' markiert"*. Es kann die Änderung blitzschnell sauber rückgängig machen (Rollback) oder abschließen.
-   **Vorteil:** Enorme Datensicherheit und sehr schneller Neustart nach Abstürzen.

---

## 4. Benutzer & Rechteverwaltung (Fokus Linux)

Warum Linux? Weil IT-Infrastrukturen (Server, Cloud, Docker) überwiegend auf Linux basieren und das Rechtesystem dort logischer und prüfungsrelevanter ist.

### Das Prinzip der Drei: U-G-O
Jede Datei und jeder Ordner gehört unter Linux genau einem User (Besitzer) und einer Gruppe.
1.  **User (u):** Der Besitzer (Owner). Meist derjenige, der die Datei erstellt hat. Er kann (meistens) auch die Rechte ändern (`chmod`).
2.  **Group (g):** Eine definierte Gruppe von Usern (z.B. "Developers" oder "Admins"). Alle User in dieser Gruppe teilen sich die Gruppenrechte.
3.  **Others (o):** Der ganze Rest der Welt. Alle User, die nicht der Besitzer sind und nicht in der Gruppe sind.

### Die drei Aktionen: r-w-x
Die Berechtigungen werden für jede der drei Kategorien (u, g, o) separat vergeben.

-   **r (read):**
    -   **Datei:** Inhalt ansehen/öffnen.
    -   **Ordner:** Den *Inhalt auflisten* (`ls` ist erlaubt).
-   **w (write):**
    -   **Datei:** Inhalt ändern oder die Datei löschen.
    -   **Ordner:** In diesem Ordner *neue Dateien anlegen*, *bestehende löschen* oder *umbenennen*. (Vorsicht: Wer Schreibrechte auf den Ordner hat, kann deine Dateien löschen, auch wenn er keine Schreibrechte auf die Datei selbst hat!)
-   **x (execute):**
    -   **Datei:** Die Datei als Programm/Skript ausführen.
    -   **Ordner:** In den Ordner *hineinwechseln* (`cd`). **Wichtig:** Ohne 'x' auf dem Ordner nützt dir 'r' auf der Datei darin nichts, da du den Pfad nicht durchschreiten darfst!

---

## 5. Rechteverwaltung Deep Dive – Der Oktal-Code

Computer speichern diese Rechte intern als Bits. 1 = Ja (Recht vorhanden), 0 = Nein (Recht fehlt).
Das ergibt 3 Bit pro Gruppe (r, w, x).

### Die "Heilige Dreifaltigkeit" der Rechtewerte

| Recht | Buchstabe | Binär | Wertigkeit (Dezimal) |
| :--- | :--- | :--- | :--- |
| Lesen | **r** | 100 | **4** |
| Schreiben | **w** | 010 | **2** |
| Ausführen | **x** | 001 | **1** |
| Nichts | **-** | 000 | **0** |

### Rechnen für Profis (und die Prüfung)
Du addierst einfach die Zahlenwerte für die gewünschte Kombination.

-   **Vollzugriff (rwx)**: 4 + 2 + 1 = **7**
-   **Lesen & Schreiben (rw-)**: 4 + 2 = **6**
-   **Lesen & Ausführen (r-x)**: 4 + 1 = **5**
-   **Nur Lesen (r--)**: **4**
-   **Gar nichts (---)**: **0**

### Ein typisches Szenario erklären: `chmod 750`
Ein Admin führt den Befehl `chmod 750 geheim.sh` aus. Was bedeutet das?

-   Ziffer 1 (**7**) -> **User**: 4+2+1 -> **rwx** (Darf alles: lesen, schreiben, ausführen)
-   Ziffer 2 (**5**) -> **Group**: 4+0+1 -> **r-x** (Darf lesen und ausführen, aber *nicht* ändern)
-   Ziffer 3 (**0**) -> **Others**: 0+0+0 -> **---** (Darf gar nichts, Zugriff verweigert)

> **Praxis-Tipp:**
> `chmod 777` (Jeder darf alles) ist in der Praxis fast immer ein massives Sicherheitsrisiko ("World Writable") und in Prüfungen meist die **falsche** Antwort, außer es wird explizit nach einem öffentlichen Temporär-Ordner gefragt (und selbst dann nutzt man oft das "Sticky Bit").

### Sonderrechte (Special Permissions) - Advanced
Für die Note 1 solltest du diese Begriffe kennen:
-   **SUID (Set User ID):** Führt eine Datei mit den Rechten des *Besitzers* aus, nicht mit den Rechten des Ausführenden (z.B. beim Befehl `passwd`, um das eigene Passwort zu ändern, was Root-Rechte benötigt).
-   **Sticky Bit:** Bei Ordnern: Nur der Besitzer einer Datei darf sie löschen (selbst wenn andere Schreibrechte im Ordner haben). Standard-Einsatz: `/tmp` Verzeichnis.

---

## 6. Wichtige Befehle für die Kommandozeile (CLI)

Du musst kein Linux-Guru sein, aber diese Befehle sind Standard in der AP1:

| Befehl | Erklärung | Beispiel |
| :--- | :--- | :--- |
| `ls -l` | Zeigt Dateien **l**ang (mit Rechten, User, Größe, Datum) | `drwxr-xr-x 2 root root ...` |
| `pwd` | Wo bin ich? (Print Working Directory) | `/home/schueler` |
| `cd` | Verzeichnis wechseln (Change Directory) | `cd /var/log` |
| `chmod` | Ändert Rechte (Change Mode) | `chmod 755 skript.sh` oder `chmod +x skript.sh` |
| `chown` | Ändert Besitzer (Change Owner) | `chown max:developers datei.txt` |
| `sudo` | Mach das als Admin (Superuser Do) | `sudo apt-get update` |
| `su` | Benutzer wechseln (Switch User) | `su root` (wechselt zum Admin) |
| `top` / `htop` | Task-Manager (Prozesse live anzeigen) | - |
| `ps aux` | Zeigt ALLE momentan laufenden Prozesse an (Snapshot) | - |
| `kill` | Beendet Prozess (via PID) | `kill 1234` |
| `grep` | Sucht Text in Dateien | `grep "Error" logfile.txt` |
| `man` | Zeigt das Handbuch (Manual) zu einem Befehl | `man ls` |

---

## 7. Typische Prüfungsfallen & Zusammenfassung

### Falle 1: Groß-/Kleinschreibung (Case Sensitivity)
-   **Windows:** `Datei.txt` ist das Gleiche wie `datei.txt`.
-   **Linux:** `Datei.txt` und `datei.txt` sind **zwei völlig verschiedene Dateien**!
-   *Prüfungstipp:* Achte bei Fehlersuch-Aufgaben penibel auf Tippfehler in Dateinamen.

### Falle 2: Der "Alles-Lösch"-Befehl
-   `rm -rf /`
-   `rm` (remove), `-r` (rekursiv, alle Unterordner), `-f` (force, ohne Nachfrage), `/` (Wurzelverzeichnis).
-   Dieser Befehl löscht das gesamte Betriebssystem. In Prüfungen oft als "Sabotage"-Beispiel oder "Gefährlichster Befehl" genannt.

### Falle 3: Root darf alles
-   Auch wenn eine Datei die Rechte `000` (---) hat – der **Root-User** kann sie trotzdem lesen und ändern. Das Rechtesystem gilt für normale Nutzer, nicht für den Systemadministrator (Root).

### Zusammenfassung
-   Ein OS verwaltet CPU (Scheduler), RAM (Memory Manager), Dateien (FS) und Geräte (I/O).
-   Kernel (Ring 0) ist Hardware-nah, Shell (Ring 3) ist User-nah.
-   Journaling-Dateisysteme (NTFS, EXT4) schützen vor Datenverlusten bei Abstürzen.
-   Linux-Rechte basieren auf User/Group/Others und r/w/x (Oktal: 4/2/1).
