# Kapitel 6: Mobile & PWA (Offline-Fähigkeit)

In diesem Kapitel beschreiben wir, wie die App auf verschiedenen Geräten funktioniert und wie sie offline nutzbar bleibt.

---

## 6.1 Progressive Web App (PWA)

Eine PWA ist im Grunde eine Webseite, die Superkräfte bekommt und sich wie eine echte App verhält.

### Die drei Säulen unserer PWA:

1.  **HTTPS (Sicherheit)**: PWAs funktionieren nur über sichere Verbindungen (oder localhost).
2.  **Manifest (`manifest.json`)**: Der "Ausweis" der App. Er sagt dem Smartphone:
    *   "So heiße ich: FIAE Lernapp"
    *   "Das ist mein Icon."
    *   "Bitte starte mich im Vollbild ohne Browserleiste (`display: standalone`)."
    *   "Meine Farbe ist Dunkelgrau (`theme_color`)."

3.  **Service Worker (`sw.js`)**: Der heimliche Held im Hintergrund (siehe unten).

---

## 6.2 Der Service Worker (`sw.js`)

Der Service Worker ist ein Skript, das **getrennt** von der Webseite im Hintergrund läuft. Er ist wie ein Proxy-Server (Vermittler) direkt auf dem Handy des Nutzers.

### Wie er Offline-Fähigkeit schafft:

1.  **Install (`install`-Event)**:
    Beim allerersten Öffnen der Seite wacht der Service Worker auf und "klaut" sich eine Kopie aller wichtigen Dateien (`index.html`, `app.css`, `app.js`...). Er speichert sie in einem speziellen Cache (`Cache Storage`).

2.  **Abfangen (`fetch`-Event)**:
    Jedes Mal, wenn die App eine Datei laden will (z.B. ein Bild oder ein Quiz), stellt sich der Service Worker dazwischen.
    *   Er fragt: "Habe ich das schon im Cache?"
    *   **JA:** Er liefert die Datei sofort aus dem Cache. Das geht blitzschnell und **ohne Internet**.
    *   **NEIN:** Er holt sie aus dem Internet.

Das bedeutet: Einmal geladen, können Sie in den Flugzeugmodus gehen und weiterlernen.

---

## 6.3 Responsive Design (Mobile First)

Die App passt sich jedem Bildschirm an. Das passiert fast ausschließlich über CSS (`app.css`) und sogenannte **Media Queries**.

### Wichtige Techniken:

*   **Responsive Grid**: Auf dem PC ist das Layout zweigeteilt (`grid-template-columns: 320px 1fr`). Auf dem Handy wird es einspaltig (`1fr`).
*   **Sticky Sidebar vs. Drawer**:
    *   **PC:** Die Sidebar "klebt" links an der Seite (`position: sticky`).
    *   **Handy:** Die Sidebar ist versteckt (`left: -100%`) und wird per JavaScript (`toggleSidebar`) wie eine Schublade hereingeschoben (`left: 0`).
*   **Touch Targets**:
    Buttons sind auf dem Handy größer (mind. 44x44 Pixel), damit man sie mit dem Daumen gut trifft.
*   **Stapeln**:
    Komplexe Elemente wie Zuordnungs-Fragen (Match) ordnen sich auf dem Handy untereinander anstatt nebeneinander an, damit nichts abgeschnitten wird.

### JavaScript-Helfer

In `js/app.js` reagieren wir auf Touch-Events:
*   Ein Klick auf den "Hamburger-Button" (☰) öffnet das Menü.
*   Ein Klick auf den dunklen Hintergrund (`overlay`) schließt es wieder.
*   Wird ein Modul angeklickt, schließt sich das Menü automatisch, damit man den Inhalt sieht.
