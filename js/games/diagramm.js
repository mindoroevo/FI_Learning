/**
 * Diagramm-Trainer – JSON-basierte Engine
 * Modi: mc (Multiple Choice), gap (Lücken füllen), build (Diagramm bauen)
 */

import { shuffleArray } from "../utils.js";
import { launchEditor, cleanupEditor } from "./diagramm-editor.js";

let _container = null;
let _onBack = null;
let dg = null;

// ─────────────────────────────────────────────────────────────
// EDITOR AUFGABEN
// ─────────────────────────────────────────────────────────────
const EDITOR_TASKS = [

  // ── UML KLASSENDIAGRAMME ───────────────────────────────────────────────────

  {
    id: 1, icon: "📦", diagramType: "klasse", difficulty: "★☆☆",
    title: "Vererbung: Tier & Hund",
    description: "Erstelle ein Klassendiagramm mit 'Tier' (- name: String, + lautGeben(): void) und 'Hund', die von 'Tier' erbt und zusätzlich + apportieren(): void hat.",
    hints: ["Vererbungspfeil von Hund → Tier", "Attribut mit Minus = privat", "Methode mit Plus = public"],
    checks: [
      { type: "nodeName", name: "Tier",  label: "Klasse 'Tier' vorhanden" },
      { type: "nodeName", name: "Hund",  label: "Klasse 'Hund' vorhanden" },
      { type: "nodeAttr", value: "name", label: "Attribut 'name' vorhanden" },
      { type: "edgeType", relType: "inherit", min: 1, label: "Vererbungsbeziehung vorhanden" },
    ],
  },
  {
    id: 2, icon: "📦", diagramType: "klasse", difficulty: "★★☆",
    title: "Komposition: Auto & Motor",
    description: "Ein 'Auto' besteht aus einem 'Motor' (Komposition – Motor kann nicht ohne Auto existieren). Auto: - marke: String, + fahren(): void. Motor: - leistung: int, + starten(): boolean.",
    hints: ["Kompositionsraute auf der Auto-Seite", "ausgefüllte Raute = Komposition", "Motor-Klasse braucht Attribute und Methode"],
    checks: [
      { type: "nodeName", name: "Auto",  label: "Klasse 'Auto' vorhanden" },
      { type: "nodeName", name: "Motor", label: "Klasse 'Motor' vorhanden" },
      { type: "nodeAttr", value: "marke", label: "Attribut 'marke' im Auto" },
      { type: "edgeType", relType: "compose", min: 1, label: "Kompositionsbeziehung vorhanden" },
    ],
  },
  {
    id: 3, icon: "📦", diagramType: "klasse", difficulty: "★★☆",
    title: "Aggregation: Universität & Professor",
    description: "Eine 'Universitaet' hat mehrere 'Professor'-Objekte (Aggregation – Professoren können auch ohne Uni existieren). Uni: - name: String, - ort: String. Professor: - name: String, - fachgebiet: String.",
    hints: ["Aggregation = offene/hohle Raute auf der Uni-Seite", "Aggregation vs. Komposition: Teile überleben das Ganze"],
    checks: [
      { type: "nodeName", name: "Universitaet", label: "Klasse 'Universitaet' vorhanden" },
      { type: "nodeName", name: "Professor",    label: "Klasse 'Professor' vorhanden" },
      { type: "nodeAttr", value: "fachgebiet",  label: "Attribut 'fachgebiet' vorhanden" },
      { type: "edgeType", relType: "aggregate", min: 1, label: "Aggregationsbeziehung vorhanden" },
    ],
  },
  {
    id: 4, icon: "📦", diagramType: "klasse", difficulty: "★★☆",
    title: "Interface: Druckbar",
    description: "Erstelle ein Interface 'Druckbar' mit der Methode + drucken(): void. Die Klassen 'Dokument' und 'Bild' implementieren dieses Interface.",
    hints: ["Interface als Klasse mit Stereotyp «interface»", "Realisierungspfeil (gestrichelt) von Dokument/Bild → Druckbar", "Beide Klassen brauchen zusätzliche eigene Attribute"],
    checks: [
      { type: "nodeName", name: "Druckbar",  label: "Klasse/Interface 'Druckbar'" },
      { type: "nodeName", name: "Dokument",  label: "Klasse 'Dokument' vorhanden" },
      { type: "nodeName", name: "Bild",      label: "Klasse 'Bild' vorhanden" },
      { type: "edgeType", relType: "implement", min: 2, label: "Mind. 2 Realisierungspfeile" },
    ],
  },
  {
    id: 5, icon: "📦", diagramType: "klasse", difficulty: "★★★",
    title: "Vererbungshierarchie: Fahrzeuge",
    description: "Baue eine 3-stufige Vererbungshierarchie: 'Fahrzeug' (abstrakt, + bewegen(): void) → 'Landfahrzeug' (+ anzahlRaeder: int) und 'Wasserfahrzeug' (+ tiefgang: float) → 'PKW' erbt von 'Landfahrzeug'.",
    hints: ["3 Ebenen der Vererbung", "PKW → Landfahrzeug → Fahrzeug", "Wasserfahrzeug erbt auch von Fahrzeug"],
    checks: [
      { type: "nodeName", name: "Fahrzeug",       label: "Klasse 'Fahrzeug' vorhanden" },
      { type: "nodeName", name: "Landfahrzeug",   label: "Klasse 'Landfahrzeug' vorhanden" },
      { type: "nodeName", name: "Wasserfahrzeug", label: "Klasse 'Wasserfahrzeug' vorhanden" },
      { type: "nodeName", name: "PKW",            label: "Klasse 'PKW' vorhanden" },
      { type: "edgeType", relType: "inherit", min: 3, label: "Mind. 3 Vererbungspfeile" },
      { type: "minNodes", min: 4, label: "Mind. 4 Klassen" },
    ],
  },
  {
    id: 6, icon: "📦", diagramType: "klasse", difficulty: "★★★",
    title: "Design Pattern: Singleton",
    description: "Modelliere das Singleton-Pattern: Klasse 'Konfiguration' mit - instanz: Konfiguration (statisch, privat), - einstellungen: Map, + getInstance(): Konfiguration (statisch), - Konfiguration() (privater Konstruktor), + getWert(key: String): String.",
    hints: ["Privater Konstruktor = - Konfiguration()", "Statische Methode: + getInstance(): Konfiguration", "Assoziation zu sich selbst (Selbstreferenz)"],
    checks: [
      { type: "nodeName",  name: "Konfiguration",  label: "Klasse 'Konfiguration' vorhanden" },
      { type: "nodeAttr",  value: "instanz",        label: "Attribut 'instanz' (Selbstreferenz)" },
      { type: "nodeMethod",value: "getInstance",    label: "Methode 'getInstance()' vorhanden" },
      { type: "minNodes",  min: 1,                  label: "Mind. 1 Klasse" },
    ],
  },
  {
    id: 7, icon: "📦", diagramType: "klasse", difficulty: "★★★",
    title: "Design Pattern: Observer",
    description: "Implementiere das Observer-Pattern: Interface 'Beobachter' (+ aktualisieren(): void), Interface 'Subjekt' (+ anmelden(b: Beobachter): void, + benachrichtigen(): void), Klasse 'Wetterstation' implementiert 'Subjekt', Klasse 'Anzeige' implementiert 'Beobachter'.",
    hints: ["2 Interfaces + 2 implementierende Klassen", "Realisierungspfeile von Wetterstation → Subjekt und Anzeige → Beobachter", "Wetterstation hat Assoziation zu Beobachter (Liste)"],
    checks: [
      { type: "nodeName", name: "Beobachter",   label: "Interface 'Beobachter' vorhanden" },
      { type: "nodeName", name: "Subjekt",      label: "Interface 'Subjekt' vorhanden" },
      { type: "nodeName", name: "Wetterstation",label: "Klasse 'Wetterstation' vorhanden" },
      { type: "nodeName", name: "Anzeige",      label: "Klasse 'Anzeige' vorhanden" },
      { type: "edgeType", relType: "implement", min: 2, label: "Mind. 2 Realisierungspfeile" },
      { type: "minEdges", min: 3, label: "Mind. 3 Verbindungen gesamt" },
    ],
  },
  {
    id: 8, icon: "📦", diagramType: "klasse", difficulty: "★★★",
    title: "Bibliotheksverwaltung (komplex)",
    description: "Modelliere ein Bibliothekssystem: 'Person' (abstrakt) → 'Mitglied' und 'Bibliothekar'. 'Buch': - isbn: String, - titel: String, - verfuegbar: boolean. 'Ausleihe' verbindet Mitglied und Buch (Assoziation, 1:n). Bibliothekar verwaltet Buecher (Aggregation).",
    hints: ["Person als abstrakte Basisklasse", "Ausleihe als eigene Klasse (Assoziationsklasse)", "Mind. 5 Klassen und 5 Beziehungen"],
    checks: [
      { type: "nodeName", name: "Person",       label: "Klasse 'Person' vorhanden" },
      { type: "nodeName", name: "Mitglied",     label: "Klasse 'Mitglied' vorhanden" },
      { type: "nodeName", name: "Buch",         label: "Klasse 'Buch' vorhanden" },
      { type: "nodeName", name: "Ausleihe",     label: "Klasse 'Ausleihe' vorhanden" },
      { type: "edgeType", relType: "inherit",   min: 2, label: "Mind. 2 Vererbungspfeile" },
      { type: "minEdges", min: 5, label: "Mind. 5 Beziehungen" },
      { type: "minNodes", min: 5, label: "Mind. 5 Klassen" },
    ],
  },

  // ── ER-DIAGRAMME ──────────────────────────────────────────────────────────

  {
    id: 9, icon: "🗃️", diagramType: "er", difficulty: "★☆☆",
    title: "ER: Kunde & Bestellung",
    description: "Ein 'Kunde' gibt mehrere 'Bestellungen' auf (1:n). Verbinde beide Entities über eine Beziehungsraute 'aufgegeben' mit korrekter Kardinalität.",
    hints: ["Entity = Rechteck, Beziehung = Raute", "1:n: ein Kunde → viele Bestellungen", "Verbinde Entity → Raute → Entity"],
    checks: [
      { type: "nodeName", name: "Kunde",      label: "Entity 'Kunde' vorhanden" },
      { type: "nodeName", name: "Bestellung", label: "Entity 'Bestellung' vorhanden" },
      { type: "nodeType", nodeType: "errel",  min: 1, label: "ER-Beziehungsraute vorhanden" },
      { type: "edgeType", relType: "1:n",     min: 1, label: "1:n Kardinalität gesetzt" },
    ],
  },
  {
    id: 10, icon: "🗃️", diagramType: "er", difficulty: "★★☆",
    title: "ER: Schule (Lehrer, Schüler, Kurs)",
    description: "Modelliere: 'Lehrer' unterrichtet 'Kurs' (1:n). 'Schueler' belegt 'Kurs' (m:n). Alle drei als Entities, zwei Beziehungsrauten ('unterrichtet', 'belegt').",
    hints: ["m:n = viele zu viele, z.B. ein Schüler belegt mehrere Kurse", "Zwei separate Rauten für zwei Beziehungen", "Mind. 4 Verbindungen gesamt"],
    checks: [
      { type: "nodeName", name: "Lehrer",   label: "Entity 'Lehrer' vorhanden" },
      { type: "nodeName", name: "Schueler", label: "Entity 'Schueler' vorhanden" },
      { type: "nodeName", name: "Kurs",     label: "Entity 'Kurs' vorhanden" },
      { type: "nodeType", nodeType: "errel", min: 2, label: "Mind. 2 ER-Beziehungsrauten" },
      { type: "edgeType", relType: "m:n",   min: 1, label: "m:n Kardinalität vorhanden" },
      { type: "minEdges", min: 4, label: "Mind. 4 Verbindungen" },
    ],
  },
  {
    id: 11, icon: "🗃️", diagramType: "er", difficulty: "★★☆",
    title: "ER: Online-Shop Produktkatalog",
    description: "Modelliere: 'Produkt' gehört zu 'Kategorie' (m:n). 'Lieferant' liefert 'Produkt' (1:n). 'Produkt' hat Attribute: produktnr, bezeichnung, preis.",
    hints: ["3 Entities + 2 Beziehungsrauten", "Produkt ist zentrale Entity", "m:n zwischen Produkt und Kategorie"],
    checks: [
      { type: "nodeName", name: "Produkt",   label: "Entity 'Produkt' vorhanden" },
      { type: "nodeName", name: "Kategorie", label: "Entity 'Kategorie' vorhanden" },
      { type: "nodeName", name: "Lieferant", label: "Entity 'Lieferant' vorhanden" },
      { type: "nodeType", nodeType: "errel", min: 2, label: "Mind. 2 Beziehungsrauten" },
      { type: "edgeType", relType: "m:n",   min: 1, label: "m:n Beziehung vorhanden" },
      { type: "edgeType", relType: "1:n",   min: 1, label: "1:n Beziehung vorhanden" },
    ],
  },
  {
    id: 12, icon: "🗃️", diagramType: "er", difficulty: "★★★",
    title: "ER: Krankenhaus (komplex)",
    description: "Modelliere ein Krankenhaussystem: 'Patient' wird behandelt von 'Arzt' (m:n, Beziehung 'behandelt'). 'Arzt' gehört zu 'Abteilung' (n:1). 'Patient' liegt in 'Zimmer' (1:1). Mind. 4 Entities, 3 Beziehungsrauten.",
    hints: ["4 Entities: Patient, Arzt, Abteilung, Zimmer", "1:1 zwischen Patient und Zimmer", "m:n zwischen Patient und Arzt"],
    checks: [
      { type: "nodeName", name: "Patient",   label: "Entity 'Patient' vorhanden" },
      { type: "nodeName", name: "Arzt",      label: "Entity 'Arzt' vorhanden" },
      { type: "nodeName", name: "Abteilung", label: "Entity 'Abteilung' vorhanden" },
      { type: "nodeName", name: "Zimmer",    label: "Entity 'Zimmer' vorhanden" },
      { type: "nodeType", nodeType: "errel", min: 3, label: "Mind. 3 Beziehungsrauten" },
      { type: "edgeType", relType: "m:n",   min: 1, label: "m:n Beziehung vorhanden" },
      { type: "edgeType", relType: "1:1",   min: 1, label: "1:1 Beziehung vorhanden" },
      { type: "minEdges", min: 6, label: "Mind. 6 Verbindungen" },
    ],
  },
  {
    id: 13, icon: "🗃️", diagramType: "er", difficulty: "★★★",
    title: "ER: Flughafen-Buchungssystem",
    description: "Modelliere: 'Passagier' bucht 'Flug' (m:n, Beziehung 'bucht'). 'Flug' bedient 'Route' (n:1). 'Route' verbindet zwei 'Flughafen'-Entities (start, ziel). 'Flugzeug' führt 'Flug' durch (1:n).",
    hints: ["'Flughafen' erscheint logisch zweimal (als Start und Ziel)", "Central Entity: Flug", "Mind. 5 Entities, 4 Beziehungsrauten"],
    checks: [
      { type: "nodeName", name: "Passagier", label: "Entity 'Passagier' vorhanden" },
      { type: "nodeName", name: "Flug",      label: "Entity 'Flug' vorhanden" },
      { type: "nodeName", name: "Flugzeug",  label: "Entity 'Flugzeug' vorhanden" },
      { type: "nodeName", name: "Flughafen", label: "Entity 'Flughafen' vorhanden" },
      { type: "nodeType", nodeType: "errel", min: 4, label: "Mind. 4 Beziehungsrauten" },
      { type: "edgeType", relType: "m:n",   min: 1, label: "m:n Beziehung vorhanden" },
      { type: "minNodes", min: 5, label: "Mind. 5 Entities" },
      { type: "minEdges", min: 8, label: "Mind. 8 Verbindungen" },
    ],
  },

  // ── USE-CASE-DIAGRAMME ────────────────────────────────────────────────────

  {
    id: 14, icon: "👤", diagramType: "usecase", difficulty: "★☆☆",
    title: "Use-Case: Onlineshop Basis",
    description: "Erstelle ein Use-Case-Diagramm. Akteur 'Kunde': 'Artikel suchen', 'Bestellung aufgeben'. 'Bestellung aufgeben' schließt 'Zahlung durchführen' ein (include).",
    hints: ["Systemgrenze als Rechteck", "include = Pflichtbeziehung", "Gestrichelter Pfeil mit «include»"],
    checks: [
      { type: "nodeName", name: "Kunde",              label: "Akteur 'Kunde' vorhanden" },
      { type: "nodeName", name: "Artikel suchen",     label: "Use-Case 'Artikel suchen'" },
      { type: "nodeName", name: "Bestellung aufgeben",label: "Use-Case 'Bestellung aufgeben'" },
      { type: "edgeType", relType: "include", min: 1, label: "«include»-Beziehung vorhanden" },
    ],
  },
  {
    id: 15, icon: "👤", diagramType: "usecase", difficulty: "★★☆",
    title: "Use-Case: ATM Geldautomat",
    description: "Akteur 'Bankkunde': 'Karte einführen', 'PIN eingeben', 'Geld abheben', 'Kontostand abfragen'. 'Geld abheben' includes 'PIN eingeben'. 'Geld abheben' kann optional 'Quittung drucken' (extend). Akteur 'Techniker': 'Gerät warten'.",
    hints: ["2 Akteure", "include von 'Geld abheben' → 'PIN eingeben'", "extend = optionale Erweiterung"],
    checks: [
      { type: "nodeName", name: "Bankkunde",        label: "Akteur 'Bankkunde' vorhanden" },
      { type: "nodeName", name: "Techniker",        label: "Akteur 'Techniker' vorhanden" },
      { type: "nodeName", name: "Geld abheben",     label: "Use-Case 'Geld abheben'" },
      { type: "nodeName", name: "PIN eingeben",     label: "Use-Case 'PIN eingeben'" },
      { type: "nodeName", name: "Quittung drucken", label: "Use-Case 'Quittung drucken'" },
      { type: "edgeType", relType: "include", min: 1, label: "«include»-Beziehung vorhanden" },
      { type: "edgeType", relType: "extend",  min: 1, label: "«extend»-Beziehung vorhanden" },
      { type: "nodeType", nodeType: "actor",  min: 2, label: "Mind. 2 Akteure" },
    ],
  },
  {
    id: 16, icon: "👤", diagramType: "usecase", difficulty: "★★☆",
    title: "Use-Case: Lernplattform",
    description: "Akteur 'Student': 'Kurs belegen', 'Quiz lösen', 'Zertifikat herunterladen'. 'Zertifikat herunterladen' requires include von 'Quiz lösen'. Akteur 'Dozent': 'Kurs erstellen', 'Fragen hinzufügen'. Akteur 'Administrator': Erbt von 'Dozent' (Generalisierung).",
    hints: ["3 Akteure", "Akteur-Generalisierung: gestrichelter Pfeil Admin → Dozent", "Systemgrenze für alle Kursfunktionen"],
    checks: [
      { type: "nodeName", name: "Student",                  label: "Akteur 'Student' vorhanden" },
      { type: "nodeName", name: "Dozent",                   label: "Akteur 'Dozent' vorhanden" },
      { type: "nodeName", name: "Administrator",            label: "Akteur 'Administrator' vorhanden" },
      { type: "nodeName", name: "Kurs erstellen",           label: "Use-Case 'Kurs erstellen'" },
      { type: "nodeName", name: "Zertifikat herunterladen", label: "Use-Case 'Zertifikat herunterladen'" },
      { type: "edgeType", relType: "include", min: 1, label: "«include»-Beziehung vorhanden" },
      { type: "nodeType", nodeType: "actor",  min: 3, label: "Mind. 3 Akteure" },
      { type: "minNodes", min: 7, label: "Mind. 7 Elemente" },
    ],
  },
  {
    id: 17, icon: "👤", diagramType: "usecase", difficulty: "★★★",
    title: "Use-Case: Krankenhaus-System",
    description: "Akteure: 'Patient', 'Arzt', 'Pflegepersonal', 'Rezeptionist' (erbt von Systembenutzer). Use-Cases: 'Termin buchen', 'Termin bestätigen' (include), 'Befund einsehen', 'Medikament verabreichen', 'Rechnung erstellen', 'Notaufnahme' (extend von 'Termin buchen'). Systemgrenze: 'Krankenhaus-Verwaltungssystem'.",
    hints: ["4 Akteure", "Notaufnahme extends Termin buchen", "Mind. 6 Use-Cases, 3 Beziehungstypen"],
    checks: [
      { type: "nodeName", name: "Patient",                label: "Akteur 'Patient' vorhanden" },
      { type: "nodeName", name: "Arzt",                   label: "Akteur 'Arzt' vorhanden" },
      { type: "nodeName", name: "Termin buchen",          label: "Use-Case 'Termin buchen'" },
      { type: "nodeName", name: "Medikament verabreichen",label: "Use-Case 'Medikament verabreichen'" },
      { type: "edgeType", relType: "include", min: 1, label: "«include»-Beziehung vorhanden" },
      { type: "edgeType", relType: "extend",  min: 1, label: "«extend»-Beziehung vorhanden" },
      { type: "nodeType", nodeType: "actor",  min: 4, label: "Mind. 4 Akteure" },
      { type: "minNodes", min: 9, label: "Mind. 9 Elemente" },
      { type: "minEdges", min: 7, label: "Mind. 7 Verbindungen" },
    ],
  },

  // ── AKTIVITÄTSDIAGRAMME ───────────────────────────────────────────────────

  {
    id: 18, icon: "🔄", diagramType: "activity", difficulty: "★☆☆",
    title: "Aktivität: Login-Prozess",
    description: "Start → 'Zugangsdaten eingeben' → [Korrekt?] → Ja: 'Dashboard anzeigen' → Ende. Nein: 'Fehlermeldung anzeigen' → zurück zu 'Zugangsdaten eingeben'. Max. 3 Fehlversuche: 'Account sperren' → Ende.",
    hints: ["1 Start, 1 Ende", "1 Entscheidungsknoten für Korrekt?", "Rückschleife bei falschem Login"],
    checks: [
      { type: "nodeType", nodeType: "start",    min: 1, label: "Start-Knoten vorhanden" },
      { type: "nodeType", nodeType: "end",      min: 1, label: "End-Knoten vorhanden" },
      { type: "nodeType", nodeType: "action",   min: 2, label: "Mind. 2 Aktions-Knoten" },
      { type: "nodeType", nodeType: "decision", min: 1, label: "Entscheidungsknoten vorhanden" },
      { type: "minEdges", min: 4, label: "Mind. 4 Verbindungen" },
    ],
  },
  {
    id: 19, icon: "🔄", diagramType: "activity", difficulty: "★★☆",
    title: "Aktivität: Online-Bestellung",
    description: "Start → 'Artikel in Warenkorb legen' → 'Zur Kasse' → [Angemeldet?] → Nein: 'Einloggen' → Ja/danach: 'Adresse eingeben' → 'Zahlungsmethode wählen' → [Zahlung OK?] → Ja: 'Bestellung bestätigen' → 'Versandbenachrichtigung senden' → Ende. Nein: 'Zahlung fehlgeschlagen' → Ende.",
    hints: ["2 Entscheidungsknoten", "Mind. 6 Aktionen", "Zwei unterschiedliche Endpfade"],
    checks: [
      { type: "nodeType", nodeType: "start",    min: 1, label: "Start-Knoten vorhanden" },
      { type: "nodeType", nodeType: "end",      min: 1, label: "End-Knoten vorhanden" },
      { type: "nodeType", nodeType: "action",   min: 5, label: "Mind. 5 Aktions-Knoten" },
      { type: "nodeType", nodeType: "decision", min: 2, label: "Mind. 2 Entscheidungsknoten" },
      { type: "minEdges", min: 8, label: "Mind. 8 Verbindungen" },
    ],
  },
  {
    id: 20, icon: "🔄", diagramType: "activity", difficulty: "★★☆",
    title: "Aktivität: Build-Pipeline (CI/CD)",
    description: "Start → 'Code pushen' → 'Tests ausführen' → [Tests bestanden?] → Nein: 'Entwickler benachrichtigen' → Ende(Fehler). Ja: 'Code kompilieren' → 'Docker-Image bauen' → Fork: parallel 'Security-Scan' und 'Performance-Test' → Join → 'In Staging deployen' → 'Smoke-Test' → [OK?] → Ja: 'In Produktion deployen' → Ende. Nein: 'Rollback' → Ende.",
    hints: ["Fork/Join für parallele Schritte", "Mind. 2 End-Knoten (Fehler + Erfolg)", "Fork = Balken für parallele Ausführung"],
    checks: [
      { type: "nodeType", nodeType: "start",    min: 1, label: "Start-Knoten vorhanden" },
      { type: "nodeType", nodeType: "end",      min: 1, label: "End-Knoten vorhanden" },
      { type: "nodeType", nodeType: "action",   min: 6, label: "Mind. 6 Aktions-Knoten" },
      { type: "nodeType", nodeType: "decision", min: 2, label: "Mind. 2 Entscheidungsknoten" },
      { type: "nodeType", nodeType: "fork",     min: 1, label: "Fork/Join-Knoten vorhanden" },
      { type: "minEdges", min: 10, label: "Mind. 10 Verbindungen" },
    ],
  },
  {
    id: 21, icon: "🔄", diagramType: "activity", difficulty: "★★★",
    title: "Aktivität: Reklamationsprozess",
    description: "Start → 'Reklamation einreichen' → 'Reklamation prüfen' → [Berechtigt?] → Nein: 'Ablehnung senden' → Ende. Ja: [Typ?] → 'Rückerstattung' oder 'Ersatzprodukt' oder 'Reparatur'. Alle drei → Join → 'Kundenzufriedenheit prüfen' → [Zufrieden?] → Ja: 'Akte schließen' → Ende. Nein: 'Eskalieren' → 'Vorgesetzte informieren' → 'Erneut bearbeiten' → Ende.",
    hints: ["3-Wege-Entscheidung beim Typ", "Fork/Join für die 3 Lösungswege", "Mind. 3 Entscheidungsknoten"],
    checks: [
      { type: "nodeType", nodeType: "start",    min: 1, label: "Start-Knoten vorhanden" },
      { type: "nodeType", nodeType: "end",      min: 1, label: "End-Knoten vorhanden" },
      { type: "nodeType", nodeType: "action",   min: 7, label: "Mind. 7 Aktions-Knoten" },
      { type: "nodeType", nodeType: "decision", min: 3, label: "Mind. 3 Entscheidungsknoten" },
      { type: "minEdges", min: 12, label: "Mind. 12 Verbindungen" },
      { type: "minNodes", min: 12, label: "Mind. 12 Knoten gesamt" },
    ],
  },

  // ── MIXED / KREATIVAUFGABEN ────────────────────────────────────────────────

  {
    id: 22, icon: "🏆", diagramType: "klasse", difficulty: "★★★",
    title: "Social Media App (Klassendiagramm)",
    description: "Modelliere eine Social-Media-App: 'Benutzer' (- id: int, - username: String, + posten(): void) kann 'Beitrag' erstellen (1:n Komposition). 'Beitrag' kann 'Kommentar' haben (1:n Aggregation). 'Benutzer' kann anderen 'Benutzer' folgen (Assoziation zu sich selbst, m:n). 'Admin' erbt von 'Benutzer'.",
    hints: ["Selbstassoziation bei 'folgen' (Benutzer → Benutzer, m:n)", "5 Klassen mindestens", "Komposition vs. Aggregation beachten"],
    checks: [
      { type: "nodeName", name: "Benutzer",  label: "Klasse 'Benutzer' vorhanden" },
      { type: "nodeName", name: "Beitrag",   label: "Klasse 'Beitrag' vorhanden" },
      { type: "nodeName", name: "Kommentar", label: "Klasse 'Kommentar' vorhanden" },
      { type: "nodeName", name: "Admin",     label: "Klasse 'Admin' vorhanden" },
      { type: "edgeType", relType: "inherit",   min: 1, label: "Admin erbt von Benutzer" },
      { type: "edgeType", relType: "compose",   min: 1, label: "Kompositionsbeziehung vorhanden" },
      { type: "edgeType", relType: "aggregate", min: 1, label: "Aggregationsbeziehung vorhanden" },
      { type: "minEdges", min: 4, label: "Mind. 4 Beziehungen" },
    ],
  },
  {
    id: 23, icon: "🏆", diagramType: "er", difficulty: "★★★",
    title: "Streaming-Plattform (ER-Diagramm)",
    description: "Modelliere Netflix-ähnliches System: 'Abonnent' hat 'Abonnement' (1:1). 'Abonnement' ermöglicht Zugriff auf 'Inhalt' (m:n). 'Inhalt' ist entweder 'Film' oder 'Serie'. 'Serie' hat 'Episoden' (1:n). 'Regisseur' produziert 'Film' (1:n). Mind. 6 Entities.",
    hints: ["Abonnent 1:1 Abonnement", "Inhalt als zentrale Entity", "Serie 1:n Episoden"],
    checks: [
      { type: "nodeName", name: "Abonnent",   label: "Entity 'Abonnent' vorhanden" },
      { type: "nodeName", name: "Inhalt",     label: "Entity 'Inhalt' vorhanden" },
      { type: "nodeName", name: "Serie",      label: "Entity 'Serie' vorhanden" },
      { type: "nodeName", name: "Regisseur",  label: "Entity 'Regisseur' vorhanden" },
      { type: "nodeType", nodeType: "errel",  min: 4, label: "Mind. 4 Beziehungsrauten" },
      { type: "edgeType", relType: "m:n",    min: 1, label: "m:n Beziehung vorhanden" },
      { type: "edgeType", relType: "1:1",    min: 1, label: "1:1 Beziehung vorhanden" },
      { type: "minNodes", min: 6, label: "Mind. 6 Entities" },
      { type: "minEdges", min: 8, label: "Mind. 8 Verbindungen" },
    ],
  },
  {
    id: 24, icon: "🏆", diagramType: "usecase", difficulty: "★★★",
    title: "Banksystem (Use-Case)",
    description: "Akteure: 'Kunde', 'Bankberater', 'System' (automatisch). Kunde: 'Konto eröffnen' (include: 'Identität prüfen'), 'Überweisung tätigen' (include: 'Deckung prüfen'), 'Kredit beantragen' (extend: 'Schufa-Auskunft'). Bankberater: 'Kundenakte verwalten', 'Kreditentscheidung treffen'. System: 'Zinsen berechnen', 'Kontoauszug generieren' (extend von 'Überweisung').",
    hints: ["3 Akteure + System als Akteur", "Mind. 3 include-Beziehungen", "Kredit extend → Schufa"],
    checks: [
      { type: "nodeName", name: "Kunde",            label: "Akteur 'Kunde' vorhanden" },
      { type: "nodeName", name: "Bankberater",      label: "Akteur 'Bankberater' vorhanden" },
      { type: "nodeName", name: "Kredit beantragen",label: "Use-Case 'Kredit beantragen'" },
      { type: "nodeName", name: "Identität prüfen", label: "Use-Case 'Identität prüfen'" },
      { type: "edgeType", relType: "include", min: 2, label: "Mind. 2 «include»-Beziehungen" },
      { type: "edgeType", relType: "extend",  min: 1, label: "«extend»-Beziehung vorhanden" },
      { type: "nodeType", nodeType: "actor",  min: 3, label: "Mind. 3 Akteure" },
      { type: "minNodes", min: 10, label: "Mind. 10 Elemente" },
      { type: "minEdges", min: 8,  label: "Mind. 8 Verbindungen" },
    ],
  },
  {
    id: 25, icon: "🏆", diagramType: "activity", difficulty: "★★★",
    title: "Software-Release-Prozess",
    description: "Modelliere einen vollständigen Release-Prozess: Start → 'Feature-Freeze' → Fork: parallel 'Dokumentation erstellen' und 'Release Notes schreiben' und 'Testplan ausführen' → Join → [Alle Tests grün?] → Nein: 'Bugs beheben' → 'Erneut testen' → zurück zur Entscheidung. Ja: 'Release-Kandidat erstellen' → 'Code-Review' → [Genehmigt?] → Nein: 'Änderungen einarbeiten' → zurück. Ja: 'Deployment vorbereiten' → Fork: 'Stage deployen' + 'Monitoring aktivieren' → Join → 'Produktions-Deployment' → 'Go-Live Ankündigung' → Ende.",
    hints: ["2 Fork/Join Paare für parallele Aktivitäten", "Rückschleifen bei Ablehnung", "Mind. 4 Entscheidungsknoten"],
    checks: [
      { type: "nodeType", nodeType: "start",    min: 1,  label: "Start-Knoten vorhanden" },
      { type: "nodeType", nodeType: "end",      min: 1,  label: "End-Knoten vorhanden" },
      { type: "nodeType", nodeType: "action",   min: 8,  label: "Mind. 8 Aktions-Knoten" },
      { type: "nodeType", nodeType: "decision", min: 2,  label: "Mind. 2 Entscheidungsknoten" },
      { type: "nodeType", nodeType: "fork",     min: 2,  label: "Mind. 2 Fork/Join-Knoten" },
      { type: "minEdges", min: 15, label: "Mind. 15 Verbindungen" },
      { type: "minNodes", min: 14, label: "Mind. 14 Knoten gesamt" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
export async function launchDiagramm(container, onBack) {
  _container = container;
  _onBack = onBack;
  dg = null;

  let allQuestions;
  try {
    const res = await fetch("./js/games/diagramm.quiz.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    allQuestions = data.questions || [];
  } catch (err) {
    container.innerHTML = `<div style="padding:2rem;color:#ef4444">Fehler beim Laden der Fragen: ${err.message}</div>`;
    return;
  }

  showSetup(allQuestions);
}

export function cleanupDiagramm() {
  cleanupEditor();
  dg = null;
  _container = null;
  _onBack = null;
}

// ─────────────────────────────────────────────────────────────
// SETUP SCREEN
// ─────────────────────────────────────────────────────────────
function showSetup(allQuestions) {
  const counts = {
    alle: allQuestions.length,
    klasse: allQuestions.filter(q => q.type === "klasse").length,
    er: allQuestions.filter(q => q.type === "er").length,
    usecase: allQuestions.filter(q => q.type === "usecase").length,
  };

  _container.innerHTML = `
    <div class="dg-game">
      <div class="dg-header">
        <button class="dg-back-btn" id="dgBackBtn">← Zurück</button>
        <h2 class="dg-title">📐 Diagramm-Trainer</h2>
      </div>
      <div class="dg-setup">
        <p class="dg-setup-info">Wähle den Bereich, den du üben möchtest:</p>
        <div class="dg-type-grid">
          <button class="dg-type-btn dg-type-all" data-type="alle">
            <span class="dg-type-icon">🔀</span>
            <span class="dg-type-label">Alle</span>
            <span class="dg-type-count">${counts.alle} Fragen</span>
          </button>
          <button class="dg-type-btn" data-type="klasse">
            <span class="dg-type-icon">📦</span>
            <span class="dg-type-label">UML Klasse</span>
            <span class="dg-type-count">${counts.klasse} Fragen</span>
          </button>
          <button class="dg-type-btn" data-type="er">
            <span class="dg-type-icon">🗃️</span>
            <span class="dg-type-label">ER-Diagramm</span>
            <span class="dg-type-count">${counts.er} Fragen</span>
          </button>
          <button class="dg-type-btn" data-type="usecase">
            <span class="dg-type-icon">👤</span>
            <span class="dg-type-label">Use-Case</span>
            <span class="dg-type-count">${counts.usecase} Fragen</span>
          </button>
        </div>
        <div class="dg-editor-promo">
          <div class="dg-editor-promo-text">
            <span class="dg-editor-promo-icon">🖊</span>
            <div>
              <strong>Freier Editor</strong>
              <p>Zeichne eigene Diagramme von Grund auf – wie draw.io</p>
            </div>
          </div>
          <button class="dg-editor-launch-btn" id="dgLaunchEditor">Editor öffnen →</button>
        </div>

        <div class="dg-tasks-section">
          <div class="dg-tasks-title">📋 Aufgaben</div>
          <p class="dg-tasks-info">Löse Aufgaben im Editor – nach deiner Zeichnung wird die Lösung automatisch geprüft.</p>
          <div class="dg-tasks-grid">
            ${EDITOR_TASKS.map(t => `
              <button class="dg-task-card" data-task-id="${t.id}">
                <span class="dg-task-card-icon">${t.icon}</span>
                <div class="dg-task-card-info">
                  <span class="dg-task-card-title">${t.title}</span>
                  <span class="dg-task-card-checks">${t.difficulty || ""} · ${t.checks.length} Kriterien</span>
                </div>
                <span class="dg-task-card-arrow">→</span>
              </button>`).join("")}
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById("dgBackBtn").addEventListener("click", () => _onBack && _onBack());
  _container.querySelectorAll(".dg-type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      const filtered = type === "alle" ? allQuestions : allQuestions.filter(q => q.type === type);
      startGame(shuffleArray([...filtered]), type);
    });
  });

  document.getElementById("dgLaunchEditor").addEventListener("click", () => {
    launchEditor(_container, () => showSetup(allQuestions));
  });

  _container.querySelectorAll(".dg-task-card").forEach(card => {
    card.addEventListener("click", () => {
      const taskId = parseInt(card.dataset.taskId);
      const task = EDITOR_TASKS.find(t => t.id === taskId);
      if (task) launchEditor(_container, () => showSetup(allQuestions), task);
    });
  });
}

// ─────────────────────────────────────────────────────────────
// GAME STATE
// ─────────────────────────────────────────────────────────────
function startGame(questions, typeLabel) {
  dg = {
    questions,
    typeLabel,
    index: 0,
    score: 0,
    answered: false,
    // gap mode
    gapFilled: {},
    gapActive: null,
    // build mode
    buildSequence: [],
    buildChecked: false,
    buildWordBank: [],
    // draw mode
    drawElements: [],
    drawConnections: [],
    drawCounter: 0,
  };
  renderQuestion();
}

// ─────────────────────────────────────────────────────────────
// QUESTION RENDERER
// ─────────────────────────────────────────────────────────────
function renderQuestion() {
  const q = dg.questions[dg.index];
  const total = dg.questions.length;
  const progPct = Math.round((dg.index / total) * 100);

  const modeBadge = { mc: "MC", gap: "Lücken", build: "Bauen", draw: "Zeichnen" }[q.mode] || q.mode;

  _container.innerHTML = `
    <div class="dg-game">
      <div class="dg-header">
        <button class="dg-back-btn" id="dgBackBtn">← Zurück</button>
        <h2 class="dg-title">📐 Diagramm-Trainer</h2>
        <span class="dg-score-badge">⭐ ${dg.score}</span>
      </div>

      <div class="dg-progress-bar-wrap">
        <div class="dg-progress-bar" style="width:${progPct}%"></div>
      </div>
      <div class="dg-progress-info">${dg.index + 1} / ${total} &nbsp;·&nbsp;
        <span class="dg-mode-tag">${q.icon || ""} ${q.type === "klasse" ? "UML" : q.type === "er" ? "ER" : "Use-Case"} – ${modeBadge}</span>
      </div>

      <div class="dg-question-text">${q.question}</div>

      ${q.diagramDef ? `<div class="dg-diagram-box">${renderDiagramDef(q.diagramDef)}</div>` : ""}

      <div id="dgInteraction"></div>

      <div id="dgExplanation"></div>
      <div id="dgNextWrap"></div>
    </div>`;

  document.getElementById("dgBackBtn").addEventListener("click", () => _onBack && _onBack());

  // render mode-specific interaction
  if (q.mode === "mc") renderMcInteraction(q);
  else if (q.mode === "gap") renderGapInteraction(q);
  else if (q.mode === "build") renderBuildInteraction(q);
  else if (q.mode === "draw") renderDrawInteraction(q);
}

// ─────────────────────────────────────────────────────────────
// DIAGRAM DEF RENDERER
// ─────────────────────────────────────────────────────────────
function renderDiagramDef(def) {
  if (!def) return "";
  switch (def.type) {
    case "relation":    return renderRelation(def);
    case "erRow":       return renderErRow(def);
    case "erEntity":    return renderErEntity(def);
    case "erAttr":      return renderErAttr(def);
    case "gapClass":    return renderGapClass(def);
    case "gapErRow":    return renderGapErRow(def);
    case "gapUcRel":    return renderGapUcRel(def);
    case "ucActors":    return renderUcActors(def);
    case "ucBoundary":  return renderUcBoundary(def);
    case "ucRel":       return renderUcRel(def);
    default: return `<pre class="dg-raw">${JSON.stringify(def, null, 2)}</pre>`;
  }
}

function arrowSymbol(arrowType, error) {
  const cls = error ? " dg-arrow-error" : "";
  const symbols = {
    inherit:   { line: "──────", tip: "▷", label: "erbt von" },
    implement: { line: "╌╌╌╌╌╌", tip: "▷", label: "implementiert" },
    compose:   { line: "──────", tip: "◆", label: "ist Teil von (Komposition)" },
    aggregate: { line: "──────", tip: "◇", label: "ist Teil von (Aggregation)" },
    assoc:     { line: "──────", tip: "→", label: "ist assoziiert mit" },
  };
  const s = symbols[arrowType] || symbols.assoc;
  return `<div class="dg-arrow${cls}">
    <span class="dg-arrow-tip-l ${error ? "dg-fehler-start" : ""}">${error ? "❌" : ""}</span>
    <span class="dg-arrow-line">${s.line}</span>
    <span class="dg-arrow-tip">${s.tip}</span>
    <span class="dg-arrow-label">${s.label}</span>
  </div>`;
}

function renderRelation(def) {
  const s = {
    inherit:   { line: "──────", tip: "▷", label: "erbt von" },
    implement: { line: "╌╌╌╌╌╌", tip: "▷", label: "implements" },
    compose:   { line: "──────", tip: "◆", label: "Komposition" },
    aggregate: { line: "──────", tip: "◇", label: "Aggregation" },
  }[def.arrow] || { line: "──────", tip: "→", label: "" };

  const hasError = !!def.errorHint;
  const cardLeft  = def.cardLeft  ? `<span class="dg-card">${def.cardLeft}</span>`  : "";
  const cardRight = def.cardRight ? `<span class="dg-card">${def.cardRight}</span>` : "";

  return `<div class="dg-rel-diagram">
    <div class="dg-class-sm ${hasError && def.errorSide === "left" ? "dg-fehler-box" : ""}">${def.left.replace(/\n/g, "<br>")}</div>
    ${cardLeft}
    <div class="dg-arrow dg-arrow-rel ${def.arrow === "implement" ? "dg-arrow-dashed" : ""}">
      <span class="dg-arrow-line">${s.line}</span>
      <span class="dg-arrow-tip">${s.tip}</span>
    </div>
    ${cardRight}
    <div class="dg-class-sm ${hasError && def.errorSide === "right" ? "dg-fehler-box" : ""}">${def.right.replace(/\n/g, "<br>")}</div>
    ${hasError ? `<div class="dg-error-hint">⚠️ ${def.errorHint}</div>` : ""}
  </div>`;
}

function renderErRow(def) {
  const hasError = !!def.errorHint;
  const cardL = def.cardLeft  ? `<span class="dg-er-card ${hasError && def.errorSide === "left"  ? "dg-fehler-card" : ""}">${def.cardLeft}</span>`  : "";
  const cardR = def.cardRight ? `<span class="dg-er-card ${hasError && def.errorSide === "right" ? "dg-fehler-card" : ""}">${def.cardRight}</span>` : "";
  return `<div class="dg-er-row">
    <div class="dg-er-entity">${def.left}</div>
    ${cardL}
    <div class="dg-er-rel">◇ ${def.rel}</div>
    ${cardR}
    <div class="dg-er-entity">${def.right}</div>
    ${hasError ? `<div class="dg-error-hint">⚠️ ${def.errorHint}</div>` : ""}
  </div>`;
}

function renderErEntity(def) {
  return `<div class="dg-er-entity-only">${def.name}</div>`;
}

function renderErAttr(def) {
  return `<div class="dg-er-attr-wrap">
    <div class="dg-er-entity">${def.entity}</div>
    <div class="dg-er-line"></div>
    <div class="dg-er-attr ${def.isKey ? "dg-er-attr-key" : ""}">${def.attr}</div>
  </div>`;
}

function renderGapClass(def) {
  const rows = def.rows.map(row => {
    if (row.sep) return `<div class="dg-class-sep"></div>`;
    if (row.fixed !== undefined) return `<div class="dg-class-row"><span class="dg-vis-badge">${row.fixed}</span> ${row.text}</div>`;
    if (row.slot !== undefined) return `<div class="dg-class-row">
      <span class="dg-gap-slot" data-slot="${row.slot}" id="dgSlot${row.slot}">&nbsp;&nbsp;&nbsp;</span>
      ${row.text}
    </div>`;
    return "";
  }).join("");
  return `<div class="dg-class">
    <div class="dg-class-name">${def.name}</div>
    <div class="dg-class-body">${rows}</div>
  </div>`;
}

function renderGapErRow(def) {
  return `<div class="dg-er-row">
    <div class="dg-er-entity">${def.left}</div>
    <span class="dg-gap-slot" data-slot="${def.slotLeft}" id="dgSlot${def.slotLeft}">&nbsp;&nbsp;</span>
    <div class="dg-er-rel">◇ ${def.rel}</div>
    <span class="dg-gap-slot" data-slot="${def.slotRight}" id="dgSlot${def.slotRight}">&nbsp;&nbsp;</span>
    <div class="dg-er-entity">${def.right}</div>
  </div>`;
}

function renderGapUcRel(def) {
  return `<div class="dg-uc-rel-wrap">
    <div class="dg-uc-case">${def.from}</div>
    <div class="dg-uc-arrow-gap">
      ╌╌ <span class="dg-gap-slot" data-slot="${def.slot}" id="dgSlot${def.slot}">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> ╌╌▷
    </div>
    <div class="dg-uc-case">${def.to}</div>
  </div>`;
}

function renderUcActors(def) {
  const actors = def.actors.map(a => `<div class="dg-uc-actor">${a.icon}<br><span>${a.name}</span></div>`).join("");
  return `<div class="dg-uc-actors">${actors}</div>`;
}

function renderUcBoundary(def) {
  const cases = def.cases.map(c => `<div class="dg-uc-case">${c}</div>`).join("");
  return `<div class="dg-uc-boundary"><div class="dg-uc-boundary-label">${def.label}</div>${cases}</div>`;
}

function renderUcRel(def) {
  const hasError = !!def.error;
  return `<div class="dg-uc-rel-wrap ${hasError ? "dg-fehler-box" : ""}">
    <div class="dg-uc-case">${def.from}</div>
    <div class="dg-uc-arrow">╌╌ «${def.relType}» ╌╌▷</div>
    <div class="dg-uc-case">${def.to}</div>
    ${hasError ? `<div class="dg-error-hint">⚠️ ${def.errorHint || "Beziehungsart prüfen"}</div>` : ""}
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// MC MODE
// ─────────────────────────────────────────────────────────────
function renderMcInteraction(q) {
  const wrap = document.getElementById("dgInteraction");
  const opts = q.options.map((opt, i) =>
    `<button class="dg-option" data-idx="${i}">${opt}</button>`
  ).join("");
  wrap.innerHTML = `<div class="dg-options">${opts}</div>`;

  wrap.querySelectorAll(".dg-option").forEach(btn => {
    btn.addEventListener("click", () => {
      if (dg.answered) return;
      dg.answered = true;
      const chosen = parseInt(btn.dataset.idx);
      const correct = chosen === q.correct;
      if (correct) dg.score++;

      wrap.querySelectorAll(".dg-option").forEach((b, i) => {
        b.disabled = true;
        if (i === q.correct) b.classList.add("dg-option-correct");
        else if (i === chosen && !correct) b.classList.add("dg-option-wrong");
      });

      showExplanation(correct, q.explanation);
      showNextBtn();
    });
  });
}

// ─────────────────────────────────────────────────────────────
// GAP MODE
// ─────────────────────────────────────────────────────────────
function renderGapInteraction(q) {
  dg.gapFilled = {};
  dg.gapActive = null;

  const wrap = document.getElementById("dgInteraction");
  const words = q.wordBank.map(w =>
    `<button class="dg-word-chip" data-word="${w}">${w}</button>`
  ).join("");
  wrap.innerHTML = `
    <div class="dg-gap-hint">💡 Klicke auf einen Slot im Diagramm, dann auf ein Wort.</div>
    <div class="dg-wordbank" id="dgWordBank">${words}</div>
    <button class="dg-check-btn" id="dgCheckGap" disabled>Prüfen ✓</button>`;

  // Attach slot listeners (they are in .dg-diagram-box, already rendered)
  attachSlotListeners(q);

  wrap.querySelectorAll(".dg-word-chip").forEach(chip => {
    chip.addEventListener("click", () => fillSlot(chip.dataset.word, q));
  });

  document.getElementById("dgCheckGap").addEventListener("click", () => checkGap(q));
}

function attachSlotListeners(q) {
  document.querySelectorAll(".dg-gap-slot").forEach(slot => {
    slot.addEventListener("click", () => {
      if (dg.answered) return;
      document.querySelectorAll(".dg-gap-slot").forEach(s => s.classList.remove("dg-slot-active"));
      dg.gapActive = parseInt(slot.dataset.slot);
      slot.classList.add("dg-slot-active");
    });
  });
}

function fillSlot(word, q) {
  if (dg.answered || dg.gapActive === null) return;
  const slotId = dg.gapActive;
  const slot = document.getElementById("dgSlot" + slotId);
  if (!slot) return;

  dg.gapFilled[slotId] = word;
  slot.textContent = word;
  slot.classList.remove("dg-slot-active");
  dg.gapActive = null;

  // Enable check if all slots filled
  const slotCount = document.querySelectorAll(".dg-gap-slot").length;
  const filledCount = Object.keys(dg.gapFilled).length;
  const checkBtn = document.getElementById("dgCheckGap");
  if (checkBtn) checkBtn.disabled = filledCount < slotCount;
}

function checkGap(q) {
  if (dg.answered) return;
  dg.answered = true;

  let allCorrect = true;
  document.querySelectorAll(".dg-gap-slot").forEach(slot => {
    const slotId = parseInt(slot.dataset.slot);
    const correctVal = q.solution[slotId];
    const given = dg.gapFilled[slotId];
    if (given === correctVal) {
      slot.classList.add("dg-slot-correct");
    } else {
      slot.classList.add("dg-slot-wrong");
      slot.textContent = `${given || "–"} (✓${correctVal})`;
      allCorrect = false;
    }
  });

  if (allCorrect) dg.score++;
  showExplanation(allCorrect, q.explanation);
  showNextBtn();
  document.getElementById("dgCheckGap").disabled = true;
}

// ─────────────────────────────────────────────────────────────
// BUILD MODE
// ─────────────────────────────────────────────────────────────
function renderBuildInteraction(q) {
  dg.buildSequence = [];
  dg.buildChecked = false;
  dg.buildWordBank = [...q.wordBank];

  const wrap = document.getElementById("dgInteraction");
  wrap.innerHTML = `
    <div class="dg-build-hint">💡 ${q.buildHint || "Klicke die Elemente in der richtigen Reihenfolge."}</div>
    <div class="dg-build-canvas" id="dgBuildCanvas">
      <span class="dg-build-placeholder">Hier erscheinen deine gewählten Elemente…</span>
    </div>
    <div class="dg-wordbank" id="dgBuildBank"></div>
    <button class="dg-check-btn" id="dgCheckBuild" disabled>Prüfen ✓</button>`;

  renderBuildBank(q);
  document.getElementById("dgCheckBuild").addEventListener("click", () => checkBuild(q));
}

function renderBuildBank(q) {
  const bank = document.getElementById("dgBuildBank");
  if (!bank) return;
  bank.innerHTML = dg.buildWordBank.map(w =>
    `<button class="dg-word-chip" data-word="${w}">${w}</button>`
  ).join("");
  bank.querySelectorAll(".dg-word-chip").forEach(chip => {
    chip.addEventListener("click", () => addToBuild(chip.dataset.word, q));
  });
}

function addToBuild(word, q) {
  if (dg.answered) return;
  dg.buildSequence.push(word);
  // Remove first occurrence from bank
  const idx = dg.buildWordBank.indexOf(word);
  if (idx !== -1) dg.buildWordBank.splice(idx, 1);

  renderBuildCanvas(q);
  renderBuildBank(q);

  const btn = document.getElementById("dgCheckBuild");
  if (btn) btn.disabled = dg.buildSequence.length === 0;
}

function renderBuildCanvas(q) {
  const canvas = document.getElementById("dgBuildCanvas");
  if (!canvas) return;

  if (dg.buildSequence.length === 0) {
    canvas.innerHTML = `<span class="dg-build-placeholder">Hier erscheinen deine gewählten Elemente…</span>`;
    return;
  }

  canvas.innerHTML = dg.buildSequence.map((w, i) =>
    `<span class="dg-build-unit">
      <button class="dg-build-chip" data-idx="${i}">${w}</button>${i < dg.buildSequence.length - 1 ? '<span class="dg-build-sep">→</span>' : ""}
    </span>`
  ).join("");

  canvas.querySelectorAll(".dg-build-chip").forEach(chip => {
    chip.addEventListener("click", () => removeFromBuild(parseInt(chip.dataset.idx), q));
  });
}

function removeFromBuild(idx, q) {
  if (dg.answered) return;
  const word = dg.buildSequence.splice(idx, 1)[0];
  dg.buildWordBank.push(word);
  renderBuildCanvas(q);
  renderBuildBank(q);

  const btn = document.getElementById("dgCheckBuild");
  if (btn) btn.disabled = dg.buildSequence.length === 0;
}

function checkBuild(q) {
  if (dg.answered) return;
  dg.answered = true;

  // Check if sequence matches solution (partial match: sequence length must equal solution or user
  // can provide a solution that is a prefix)
  const sol = q.solution;
  let correct = dg.buildSequence.length === sol.length &&
    dg.buildSequence.every((w, i) => w === sol[i]);

  if (correct) dg.score++;

  renderBuildCanvasFeedback(q, sol, correct);
  showExplanation(correct, q.explanation);
  showNextBtn();
  document.getElementById("dgCheckBuild").disabled = true;
}

function renderBuildCanvasFeedback(q, sol, correct) {
  const canvas = document.getElementById("dgBuildCanvas");
  if (!canvas) return;

  const chipUnits = (arr, cls) => arr.map((w, i) =>
    `<span class="dg-build-unit"><span class="dg-build-chip ${typeof cls === "function" ? cls(i) : cls}">${w}</span>${i < arr.length - 1 ? '<span class="dg-build-sep">→</span>' : ""}</span>`
  ).join("");

  if (correct) {
    canvas.innerHTML = chipUnits(dg.buildSequence, "dg-chip-correct");
  } else {
    const userHtml = chipUnits(dg.buildSequence, i => sol[i] === dg.buildSequence[i] ? "dg-chip-correct" : "dg-chip-wrong");
    const solHtml  = chipUnits(sol, "dg-chip-solution");
    canvas.innerHTML = `<div class="dg-build-row">${userHtml}</div>
      <div class="dg-solution-row">✓ Lösung: ${solHtml}</div>`;
  }
}

// ─────────────────────────────────────────────────────────────
// DRAW MODE
// ─────────────────────────────────────────────────────────────
function renderDrawInteraction(q) {
  const task = q.drawTask;
  dg.drawElements = [];
  dg.drawConnections = [];
  dg.drawCounter = 0;

  const paletteMap = {
    klasse:  [{ kind: "class",   label: "📦 Klasse" }],
    er:      [{ kind: "entity",  label: "▭ Entity" }, { kind: "rel", label: "◇ Beziehung" }],
    usecase: [{ kind: "actor",   label: "🧍 Akteur" }, { kind: "usecase", label: "⬭ Use-Case" }],
  };
  const palette = (paletteMap[task.diagramType] || paletteMap.klasse)
    .map(p => `<button class="dg-draw-pal-btn" data-kind="${p.kind}">${p.label}</button>`).join("");

  const relOptGroups = {
    klasse:  ["inherit|◁── erbt von","implement|◁╌╌ implementiert","compose|◆── Komposition","aggregate|◇── Aggregation","assoc|──→ Assoziation"],
    er:      ["1:1|Kardinalität 1:1","1:n|Kardinalität 1:n","m:n|Kardinalität m:n"],
    usecase: ["include|«include» (Pflicht)","extend|«extend» (optional)","assoc|── Assoziation"],
  };
  const relOptHtml = (relOptGroups[task.diagramType] || relOptGroups.klasse)
    .map(r => { const [v, l] = r.split("|"); return `<option value="${v}">${l}</option>`; }).join("");

  const wrap = document.getElementById("dgInteraction");
  wrap.innerHTML = `
    <div class="dg-draw-container">
      <div class="dg-draw-hint">💡 Füge Elemente hinzu und verbinde sie dann unten.</div>
      <div class="dg-draw-toolbar">${palette}</div>
      <div class="dg-draw-add-row" id="dgDrawAddRow" style="display:none">
        <input class="dg-draw-name-input" id="dgDrawNameInput" placeholder="Name eingeben…" maxlength="30">
        <button class="dg-draw-confirm-btn" id="dgDrawConfirmAdd">✓ Hinzufügen</button>
        <button class="dg-draw-cancel-btn" id="dgDrawCancelAdd">✕</button>
      </div>
      <div class="dg-draw-canvas" id="dgDrawCanvas">
        <div class="dg-draw-canvas-empty">Noch keine Elemente – nutze die Palette oben ↑</div>
      </div>
      <div class="dg-draw-conn-section">
        <div class="dg-draw-conn-title">🔗 Beziehung hinzufügen</div>
        <div class="dg-draw-conn-row">
          <select class="dg-draw-sel" id="dgConnFrom"><option value="">Von…</option></select>
          <select class="dg-draw-sel dg-draw-sel-type" id="dgConnType">${relOptHtml}</select>
          <select class="dg-draw-sel" id="dgConnTo"><option value="">Nach…</option></select>
          <button class="dg-draw-conn-add" id="dgConnAddBtn" title="Beziehung hinzufügen">＋</button>
        </div>
        <div class="dg-draw-conn-list" id="dgConnList">
          <span class="dg-draw-conn-empty">Noch keine Beziehungen</span>
        </div>
      </div>
    </div>
    <button class="dg-check-btn" id="dgCheckDraw" disabled>Prüfen ✓</button>`;

  let pendingKind = null;

  wrap.querySelectorAll(".dg-draw-pal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      pendingKind = btn.dataset.kind;
      const row = document.getElementById("dgDrawAddRow");
      row.style.display = "flex";
      const inp = document.getElementById("dgDrawNameInput");
      inp.value = "";
      inp.placeholder = `Name für ${btn.textContent.replace(/[📦▭◇🧍⬭]/g, "").trim()}…`;
      inp.focus();
    });
  });

  document.getElementById("dgDrawConfirmAdd").addEventListener("click", () => {
    const name = document.getElementById("dgDrawNameInput").value.trim();
    if (!name || !pendingKind) return;
    dg.drawElements.push({ id: "el_" + (++dg.drawCounter), name, kind: pendingKind });
    document.getElementById("dgDrawAddRow").style.display = "none";
    pendingKind = null;
    refreshDrawCanvas();
    refreshConnDropdowns();
    updateDrawCheckBtn();
  });

  document.getElementById("dgDrawNameInput").addEventListener("keydown", e => {
    if (e.key === "Enter")  document.getElementById("dgDrawConfirmAdd").click();
    if (e.key === "Escape") document.getElementById("dgDrawCancelAdd").click();
  });

  document.getElementById("dgDrawCancelAdd").addEventListener("click", () => {
    document.getElementById("dgDrawAddRow").style.display = "none";
    pendingKind = null;
  });

  document.getElementById("dgConnAddBtn").addEventListener("click", () => {
    const fromId  = document.getElementById("dgConnFrom").value;
    const toId    = document.getElementById("dgConnTo").value;
    const relType = document.getElementById("dgConnType").value;
    if (!fromId || !toId || fromId === toId) return;
    if (dg.drawConnections.some(c => c.fromId === fromId && c.toId === toId && c.relType === relType)) return;
    dg.drawConnections.push({ fromId, toId, relType });
    refreshConnList();
    updateDrawCheckBtn();
  });

  document.getElementById("dgCheckDraw").addEventListener("click", () => checkDraw(q));
}

function refreshDrawCanvas() {
  const canvas = document.getElementById("dgDrawCanvas");
  if (!canvas) return;
  if (dg.drawElements.length === 0) {
    canvas.innerHTML = `<div class="dg-draw-canvas-empty">Noch keine Elemente – nutze die Palette oben ↑</div>`;
    return;
  }
  const ICONS = { class: "📦", entity: "▭", rel: "◇", actor: "🧍", usecase: "⬭" };
  canvas.innerHTML = dg.drawElements.map(el => `
    <div class="dg-draw-element dg-draw-el-${el.kind}" data-id="${el.id}">
      <span class="dg-draw-el-icon">${ICONS[el.kind] || "▪"}</span>
      <span class="dg-draw-el-name">${el.name}</span>
      <button class="dg-draw-el-del" data-id="${el.id}" title="Entfernen">✕</button>
    </div>`).join("");
  canvas.querySelectorAll(".dg-draw-el-del").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      dg.drawElements    = dg.drawElements.filter(e => e.id !== id);
      dg.drawConnections = dg.drawConnections.filter(c => c.fromId !== id && c.toId !== id);
      refreshDrawCanvas();
      refreshConnDropdowns();
      refreshConnList();
      updateDrawCheckBtn();
    });
  });
}

function refreshConnDropdowns() {
  ["dgConnFrom", "dgConnTo"].forEach((selId, i) => {
    const sel = document.getElementById(selId);
    if (!sel) return;
    const placeholder = i === 0 ? "Von…" : "Nach…";
    sel.innerHTML = `<option value="">${placeholder}</option>` +
      dg.drawElements.map(e => `<option value="${e.id}">${e.name}</option>`).join("");
  });
}

function refreshConnList() {
  const list = document.getElementById("dgConnList");
  if (!list) return;
  if (dg.drawConnections.length === 0) {
    list.innerHTML = `<span class="dg-draw-conn-empty">Noch keine Beziehungen</span>`;
    return;
  }
  list.innerHTML = dg.drawConnections.map((c, i) => {
    const from = dg.drawElements.find(e => e.id === c.fromId);
    const to   = dg.drawElements.find(e => e.id === c.toId);
    if (!from || !to) return "";
    return `<div class="dg-draw-conn-chip">
      <span class="dg-draw-conn-node">${from.name}</span>
      <span class="dg-draw-conn-arrow">${c.relType}</span>
      <span class="dg-draw-conn-node">${to.name}</span>
      <button class="dg-draw-conn-del" data-idx="${i}">✕</button>
    </div>`;
  }).join("");
  list.querySelectorAll(".dg-draw-conn-del").forEach(btn => {
    btn.addEventListener("click", () => {
      dg.drawConnections.splice(parseInt(btn.dataset.idx), 1);
      refreshConnList();
    });
  });
}

function updateDrawCheckBtn() {
  const btn = document.getElementById("dgCheckDraw");
  if (btn) btn.disabled = dg.drawElements.length === 0;
}

function checkDraw(q) {
  if (dg.answered) return;
  dg.answered = true;
  const task = q.drawTask;
  const errors = [];

  for (const req of task.elements) {
    const found = dg.drawElements.some(e =>
      e.name.trim().toLowerCase() === req.name.toLowerCase() && e.kind === req.kind
    );
    if (!found) errors.push(`Element fehlt: „${req.name}"`);
  }

  for (const req of task.relations) {
    const fromEl = dg.drawElements.find(e => e.name.trim().toLowerCase() === req.from.toLowerCase());
    const toEl   = dg.drawElements.find(e => e.name.trim().toLowerCase() === req.to.toLowerCase());
    if (!fromEl || !toEl) continue;
    const found = dg.drawConnections.some(c =>
      c.fromId === fromEl.id && c.toId === toEl.id && c.relType === req.type
    );
    if (!found) errors.push(`Beziehung fehlt: ${req.from} –(${req.type})→ ${req.to}`);
  }

  const correct = errors.length === 0;
  if (correct) dg.score++;

  const canvas = document.getElementById("dgDrawCanvas");
  if (canvas) {
    canvas.querySelectorAll(".dg-draw-element").forEach(el => {
      const elem = dg.drawElements.find(e => e.id === el.dataset.id);
      if (!elem) return;
      const needed = task.elements.some(r =>
        r.name.toLowerCase() === elem.name.trim().toLowerCase() && r.kind === elem.kind
      );
      el.classList.add(needed ? "dg-draw-el-ok" : "dg-draw-el-extra");
    });
  }

  if (!correct) {
    const connSection = document.querySelector(".dg-draw-conn-section");
    if (connSection) {
      connSection.insertAdjacentHTML("afterend",
        errors.map(e => `<div class="dg-draw-error-item">❌ ${e}</div>`).join("")
      );
    }
  }

  const ICONS = { class: "📦", entity: "▭", rel: "◇", actor: "🧍", usecase: "⬭" };
  const solHtml = correct ? "" : `<div class="dg-draw-solution">
    <strong>Elemente:</strong> ${task.elements.map(e => `<span class="dg-build-chip dg-chip-solution">${ICONS[e.kind] || ""} ${e.name}</span>`).join(" ")}
    <br><strong>Beziehungen:</strong> ${task.relations.map(r => `<span class="dg-build-chip dg-chip-solution">${r.from} –(${r.type})→ ${r.to}</span>`).join(" ")}
  </div>`;

  showExplanation(correct, q.explanation + solHtml);
  showNextBtn();
  document.getElementById("dgCheckDraw").disabled = true;
}

// ─────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────
function showExplanation(correct, text) {
  const el = document.getElementById("dgExplanation");
  if (!el) return;
  el.className = "dg-explanation " + (correct ? "dg-expl-correct" : "dg-expl-wrong");
  el.innerHTML = `<strong>${correct ? "✅ Richtig!" : "❌ Falsch!"}</strong> ${text}`;
}

function showNextBtn() {
  const wrap = document.getElementById("dgNextWrap");
  if (!wrap) return;
  const last = dg.index >= dg.questions.length - 1;
  wrap.innerHTML = `<button class="dg-next-btn" id="dgNextBtn">${last ? "Auswertung →" : "Weiter →"}</button>`;
  document.getElementById("dgNextBtn").addEventListener("click", () => {
    dg.index++;
    dg.answered = false;
    dg.gapFilled = {};
    dg.gapActive = null;
    dg.buildSequence = [];
    dg.buildChecked = false;
    dg.buildWordBank = [];
    dg.drawElements = [];
    dg.drawConnections = [];
    dg.drawCounter = 0;
    if (dg.index >= dg.questions.length) showResult();
    else renderQuestion();
  });
}

// ─────────────────────────────────────────────────────────────
// RESULT SCREEN
// ─────────────────────────────────────────────────────────────
function showResult() {
  const total = dg.questions.length;
  const pct = Math.round((dg.score / total) * 100);
  const medal = pct >= 80 ? "🥇" : pct >= 60 ? "🥈" : "📚";
  const note = pct >= 80 ? "Sehr gut!" : pct >= 60 ? "Gut – weiter üben!" : "Mehr Übung empfohlen.";

  _container.innerHTML = `
    <div class="dg-game">
      <div class="dg-header">
        <button class="dg-back-btn" id="dgBackBtn">← Zurück</button>
        <h2 class="dg-title">📐 Diagramm-Trainer</h2>
      </div>
      <div class="dg-result">
        <div class="dg-result-medal">${medal}</div>
        <div class="dg-result-score">${dg.score} / ${total} richtig</div>
        <div class="dg-result-pct">${pct}%</div>
        <div class="dg-result-note">${note}</div>
        <div class="dg-result-btns">
          <button class="dg-next-btn" id="dgRetryBtn">🔄 Nochmal</button>
          <button class="dg-back-btn" id="dgHomeBtn">🏠 Startmenü</button>
        </div>
      </div>
    </div>`;

  document.getElementById("dgBackBtn").addEventListener("click", () => _onBack && _onBack());
  document.getElementById("dgHomeBtn").addEventListener("click", () => _onBack && _onBack());
  document.getElementById("dgRetryBtn").addEventListener("click", () => {
    const questions = shuffleArray([...dg.questions]);
    startGame(questions, dg.typeLabel);
  });
}
