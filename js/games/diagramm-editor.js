/**
 * Diagramm-Editor  freier draw.io-ähnlicher Editor
 * v3  vollständig überarbeitet, alle Bugs behoben
 */

//  Modul-State 
let _ec  = null;   // container element
let _eb  = null;   // onBack callback
let ed   = null;   // editor state
let _keyH = null;  // keydown handler ref (für cleanup)
let _lastPinch = null; // two-finger pinch tracking

//  PUBLIC API 
export function launchEditor(container, onBack, task = null) {
  _ec = container;
  _eb = onBack;
  ed = {
    nodes: [],
    edges: [],
    mode: "select",
    selectedId: null,
    connectFrom: null,
    drag: null,
    pan: null,
    _wasDragging: false,
    _wasPanning: false,
    nextId: 1,
    history: [],
    historyIndex: -1,
    vp: { scale: 1.0, tx: 0, ty: 0 },
    task: task || null,
  };
  renderEditorUI();
  saveHistory();
}

export function cleanupEditor() {
  if (_keyH) { window.removeEventListener("keydown", _keyH); _keyH = null; }
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup",   onMouseUp);
  window.removeEventListener("touchmove", onTouchMove);
  window.removeEventListener("touchend",  onTouchEnd);
  _ec = _eb = ed = null;
}

//  HTML TEMPLATE 
function renderEditorUI() {
  _ec.innerHTML = `
<div class="ded-shell">

  <!-- Task Panel (hidden when no task) -->
  <div class="ded-task-panel" id="dedTaskPanel" style="display:none">
    <div class="ded-task-header" id="dedTaskHeader">
      <span class="ded-task-icon">📋</span>
      <div class="ded-task-header-text">
        <span class="ded-task-badge">Aufgabe</span>
        <span class="ded-task-title" id="dedTaskTitle"></span>
      </div>
      <button class="ded-task-check-btn" id="dedTaskCheck">✓ Prüfen</button>
      <button class="ded-task-toggle" id="dedTaskToggle">▼</button>
    </div>
    <div class="ded-task-body" id="dedTaskBody">
      <p class="ded-task-desc" id="dedTaskDesc"></p>
      <div class="ded-task-hints" id="dedTaskHints"></div>
      <div class="ded-task-result" id="dedTaskResult"></div>
    </div>
  </div>

  <!-- Top Bar -->
  <div class="ded-topbar">
    <button class="ded-back" id="dedBack">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span class="ded-btn-label">Zurück</span>
    </button>
    <span class="ded-title">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19 3 20l.9-4 12.6-12.5z"/></svg>
      Diagramm-Editor
    </span>
    <div class="ded-topbar-actions">
      <button class="ded-action-btn" id="dedUndo" title="Rückgängig (Strg+Z)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M3 13C4.6 8.4 9 5 14 5a11 11 0 010 22 11 11 0 01-9.3-5"/></svg>
        <span class="ded-btn-label">Undo</span>
      </button>
      <button class="ded-action-btn" id="dedRedo" title="Wiederholen (Strg+Y)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M21 13C19.4 8.4 15 5 10 5a11 11 0 000 22 11 11 0 009.3-5"/></svg>
        <span class="ded-btn-label">Redo</span>
      </button>
      <button class="ded-action-btn ded-export" id="dedExport" title="Als Text exportieren">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span class="ded-btn-label">Export</span>
      </button>
      <button class="ded-action-btn ded-danger" id="dedClear" title="Alles löschen">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
    </div>
  </div>

  <!-- Mobile Tool Bar -->
  <div class="ded-mobile-bar" id="dedMobileBar">
    <div class="ded-mobile-scroll">
      <!-- Werkzeug -->
      <button class="ded-mtool active" data-mode="select" title="Auswählen">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 0l16 10-7 2-4 8z"/></svg>
        <span class="ded-mtool-lbl">Auswahl</span>
      </button>
      <button class="ded-mtool" data-mode="connect" title="Verbinden">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="12" r="3"/><circle cx="19" cy="12" r="3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        <span class="ded-mtool-lbl">Verbinden</span>
      </button>
      <button class="ded-mtool ded-mtool-del" data-mode="delete" title="Löschen">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
        <span class="ded-mtool-lbl">Löschen</span>
      </button>
      <div class="ded-mbar-sep"></div>
      <!-- Elemente hinzufügen -->
      <button class="ded-mtool" data-mode="add-class" title="+ Klasse">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
        <span class="ded-mtool-lbl">Klasse</span>
      </button>
      <button class="ded-mtool" data-mode="add-entity" title="+ Entity">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/></svg>
        <span class="ded-mtool-lbl">Entity</span>
      </button>
      <button class="ded-mtool" data-mode="add-errel" title="+ ER-Beziehung">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2,22 12,12 22,2 12"/></svg>
        <span class="ded-mtool-lbl">ER-Rel.</span>
      </button>
      <button class="ded-mtool" data-mode="add-actor" title="+ Akteur">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/></svg>
        <span class="ded-mtool-lbl">Akteur</span>
      </button>
      <button class="ded-mtool" data-mode="add-usecase" title="+ Use-Case">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="10" ry="6"/></svg>
        <span class="ded-mtool-lbl">Use-Case</span>
      </button>
      <button class="ded-mtool" data-mode="add-boundary" title="+ Systemgrenze">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"><rect x="2" y="2" width="20" height="20" rx="3"/></svg>
        <span class="ded-mtool-lbl">Grenze</span>
      </button>
      <div class="ded-mbar-sep"></div>
      <!-- Aktivitätsdiagramm -->
      <button class="ded-mtool" data-mode="add-action" title="+ Aktion">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="5"/></svg>
        <span class="ded-mtool-lbl">Aktion</span>
      </button>
      <button class="ded-mtool" data-mode="add-decision" title="+ Entscheidung">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2,22 12,12 22,2 12"/></svg>
        <span class="ded-mtool-lbl">Entscheid.</span>
      </button>
      <button class="ded-mtool" data-mode="add-start" title="+ Start">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"/></svg>
        <span class="ded-mtool-lbl">Start</span>
      </button>
      <button class="ded-mtool" data-mode="add-end" title="+ Ende">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>
        <span class="ded-mtool-lbl">Ende</span>
      </button>
      <button class="ded-mtool" data-mode="add-fork" title="+ Fork/Join">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="1" y="9" width="22" height="6" rx="1"/></svg>
        <span class="ded-mtool-lbl">Fork</span>
      </button>
      <button class="ded-mtool" data-mode="add-note" title="+ Notiz">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h12l4 4v12H4z"/><path d="M16 4v4h4"/></svg>
        <span class="ded-mtool-lbl">Notiz</span>
      </button>
      <div class="ded-mbar-sep"></div>
      <!-- Undo / Redo auf Mobile -->
      <button class="ded-mtool" id="dedMUndo" title="Rückgängig">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M3 13C4.6 8.4 9 5 14 5a11 11 0 010 22 11 11 0 01-9.3-5"/></svg>
        <span class="ded-mtool-lbl">Undo</span>
      </button>
      <button class="ded-mtool" id="dedMRedo" title="Wiederholen">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M21 13C19.4 8.4 15 5 10 5a11 11 0 000 22 11 11 0 009.3-5"/></svg>
        <span class="ded-mtool-lbl">Redo</span>
      </button>
    </div>
  </div>

  <!-- Status Pill -->
  <div class="ded-status-pill" id="dedStatus"> Auswahl</div>

  <!-- Body -->
  <div class="ded-body">
    <!-- Desktop Sidebar -->
    <aside class="ded-sidebar">
      <div class="ded-tool-group">
        <div class="ded-tool-label">Werkzeug</div>
        <button class="ded-tool active" data-mode="select">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4 0l16 10-7 2-4 8z"/></svg>
          Auswahl
        </button>
        <button class="ded-tool" data-mode="connect">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="12" r="3"/><circle cx="19" cy="12" r="3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          Verbinden
        </button>
        <button class="ded-tool ded-tool-danger" data-mode="delete">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          Löschen
        </button>
      </div>
      <div class="ded-tool-sep"></div>
      <div class="ded-tool-group">
        <div class="ded-tool-label">UML</div>
        <button class="ded-tool" data-mode="add-class">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          + Klasse
        </button>
      </div>
      <div class="ded-tool-sep"></div>
      <div class="ded-tool-group">
        <div class="ded-tool-label">ER-Diagramm</div>
        <button class="ded-tool" data-mode="add-entity">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/></svg>
          + Entity
        </button>
        <button class="ded-tool" data-mode="add-errel">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2,22 12,12 22,2 12"/></svg>
          + Beziehung
        </button>
      </div>
      <div class="ded-tool-sep"></div>
      <div class="ded-tool-group">
        <div class="ded-tool-label">Use-Case</div>
        <button class="ded-tool" data-mode="add-actor">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/></svg>
          + Akteur
        </button>
        <button class="ded-tool" data-mode="add-usecase">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="10" ry="6"/></svg>
          + Use-Case
        </button>
        <button class="ded-tool" data-mode="add-boundary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"><rect x="2" y="2" width="20" height="20" rx="3"/></svg>
          + Systemgrenze
        </button>
      </div>
      <div class="ded-tool-sep"></div>
      <div class="ded-tool-group">
        <div class="ded-tool-label">Aktivität</div>
        <button class="ded-tool" data-mode="add-action">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="5"/></svg>
          + Aktion
        </button>
        <button class="ded-tool" data-mode="add-decision">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2,22 12,12 22,2 12"/></svg>
          + Entscheidung
        </button>
        <button class="ded-tool" data-mode="add-start">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"/></svg>
          + Start
        </button>
        <button class="ded-tool" data-mode="add-end">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>
          + Ende
        </button>
        <button class="ded-tool" data-mode="add-fork">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="1" y="9" width="22" height="6" rx="1"/></svg>
          + Fork/Join
        </button>
        <button class="ded-tool" data-mode="add-note">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h12l4 4v12H4z"/><path d="M16 4v4h4"/></svg>
          + Notiz
        </button>
      </div>
    </aside>

    <!-- Canvas -->
    <div class="ded-canvas-wrap" id="dedCanvasWrap">
      <div class="ded-canvas" id="dedCanvas">
        <svg class="ded-svg" id="dedSvg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arr-end-default"   markerWidth="10" markerHeight="8"  refX="9"  refY="4" orient="auto"><path d="M0,0 L9,4 L0,8" fill="none" stroke="#64748b" stroke-width="1.5"/></marker>
            <marker id="arr-end-inherit"   markerWidth="12" markerHeight="10" refX="11" refY="5" orient="auto"><polygon points="0 0,11 5,0 10" fill="none" stroke="#94a3b8" stroke-width="1.5"/></marker>
            <marker id="arr-end-implement" markerWidth="12" markerHeight="10" refX="11" refY="5" orient="auto"><polygon points="0 0,11 5,0 10" fill="none" stroke="#94a3b8" stroke-width="1.5"/></marker>
            <marker id="arr-end-compose"   markerWidth="14" markerHeight="10" refX="13" refY="5" orient="auto"><polygon points="0 5,6 0,12 5,6 10" fill="#94a3b8"/></marker>
            <marker id="arr-start-compose" markerWidth="14" markerHeight="10" refX="1"  refY="5" orient="auto-start-reverse"><polygon points="0 5,6 0,12 5,6 10" fill="#94a3b8"/></marker>
            <marker id="arr-end-aggregate" markerWidth="14" markerHeight="10" refX="13" refY="5" orient="auto"><polygon points="0 5,6 0,12 5,6 10" fill="var(--panel,#1e293b)" stroke="#94a3b8" stroke-width="1.5"/></marker>
            <marker id="arr-start-aggregate" markerWidth="14" markerHeight="10" refX="1" refY="5" orient="auto-start-reverse"><polygon points="0 5,6 0,12 5,6 10" fill="var(--panel,#1e293b)" stroke="#94a3b8" stroke-width="1.5"/></marker>
            <marker id="arr-end-assoc"     markerWidth="10" markerHeight="8"  refX="9"  refY="4" orient="auto"><path d="M0,0 L9,4 L0,8" fill="none" stroke="#64748b" stroke-width="1.5"/></marker>
            <marker id="arr-end-dep"       markerWidth="10" markerHeight="8"  refX="9"  refY="4" orient="auto"><path d="M0,0 L9,4 L0,8" fill="none" stroke="#64748b" stroke-width="1.5"/></marker>
            <marker id="arr-end-include"   markerWidth="10" markerHeight="8"  refX="9"  refY="4" orient="auto"><path d="M0,0 L9,4 L0,8" fill="none" stroke="#6366f1" stroke-width="1.5"/></marker>
            <marker id="arr-end-extend"    markerWidth="10" markerHeight="8"  refX="9"  refY="4" orient="auto"><path d="M0,0 L9,4 L0,8" fill="none" stroke="#f59e0b" stroke-width="1.5"/></marker>
            <marker id="arr-end-flow"      markerWidth="10" markerHeight="8"  refX="8"  refY="4" orient="auto"><path d="M0,0 L9,4 L0,8 Z" fill="#94a3b8"/></marker>
          </defs>
        </svg>
      </div>
      <div class="ded-empty-hint" id="dedEmptyHint">
        <div class="ded-empty-icon"></div>
        <p>Werkzeug wählen und auf die Fläche klicken</p>
      </div>
      <!-- Zoom controls overlay -->
      <div class="ded-zoom-controls">
        <button class="ded-zoom-btn" id="dedZoomIn"    title="Zoom +">+</button>
        <span   class="ded-zoom-label" id="dedZoomLabel">100%</span>
        <button class="ded-zoom-btn" id="dedZoomOut"   title="Zoom −">−</button>
        <button class="ded-zoom-btn" id="dedZoomReset" title="Zurücksetzen">⊡</button>
      </div>
    </div>

    <!-- Desktop Props Panel -->
    <aside class="ded-props" id="dedProps">
      <div class="ded-props-empty" id="dedPropsEmpty">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Element auswählen</span>
      </div>
      <div class="ded-props-content" id="dedPropsContent" style="display:none"></div>
    </aside>
  </div>

  <!-- Mobile Slide-Up Drawer -->
  <div class="ded-drawer" id="dedDrawer">
    <div class="ded-drawer-handle" id="dedDrawerHandle"></div>
    <div class="ded-drawer-header">
      <span class="ded-drawer-title" id="dedDrawerTitle">Eigenschaften</span>
      <button class="ded-drawer-close-btn" id="dedDrawerCloseBtn">&#x2715;</button>
    </div>
    <div class="ded-drawer-body" id="dedDrawerBody"></div>
  </div>
  <div class="ded-drawer-backdrop" id="dedDrawerBackdrop"></div>

  <!-- Edge Type Modal -->
  <div class="ded-edge-modal" id="dedEdgeModal" style="display:none">
    <div class="ded-edge-modal-box">
      <div class="ded-edge-modal-title" id="dedEdgeModalTitle">Beziehungstyp wählen</div>
      <div class="ded-edge-options" id="dedEdgeOptions"></div>
      <button class="ded-edge-cancel" id="dedEdgeCancel">Abbrechen</button>
    </div>
  </div>

</div>`;

  attachEditorEvents();
  redrawAll();
  // Setup task panel if task given
  if (ed.task) initTaskPanel();
}

//  VIEWPORT: ZOOM + PAN 
function applyViewport() {
  const canvas = document.getElementById("dedCanvas");
  if (canvas) canvas.style.transform =
    `translate(${ed.vp.tx}px,${ed.vp.ty}px) scale(${ed.vp.scale})`;
  const lbl = document.getElementById("dedZoomLabel");
  if (lbl) lbl.textContent = Math.round(ed.vp.scale * 100) + "%";
}

/** Convert screen client coords → canvas logical coords */
function screenToCanvas(cx, cy) {
  const wrap = document.getElementById("dedCanvasWrap");
  const r = wrap.getBoundingClientRect();
  return {
    x: (cx - r.left - ed.vp.tx) / ed.vp.scale,
    y: (cy - r.top  - ed.vp.ty) / ed.vp.scale,
  };
}

/** Zoom by factor around screen point (sx, sy) */
function zoomAt(sx, sy, factor) {
  const wrap = document.getElementById("dedCanvasWrap");
  const r = wrap.getBoundingClientRect();
  const newScale = Math.min(4, Math.max(0.12, ed.vp.scale * factor));
  const lx = sx - r.left, ly = sy - r.top;
  ed.vp.tx = lx - (lx - ed.vp.tx) * (newScale / ed.vp.scale);
  ed.vp.ty = ly - (ly - ed.vp.ty) * (newScale / ed.vp.scale);
  ed.vp.scale = newScale;
  applyViewport();
}

function wrapCenter() {
  const w = document.getElementById("dedCanvasWrap");
  const r = w.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Center the canvas in the wrap at scale 1.0 */
function centerViewport() {
  if (!ed) return;
  const wrap = document.getElementById("dedCanvasWrap");
  const canvas = document.getElementById("dedCanvas");
  if (!wrap || !canvas) return;
  const wr = wrap.getBoundingClientRect();
  const cw = canvas.offsetWidth;
  const ch = canvas.offsetHeight;
  ed.vp.scale = 1.0;
  ed.vp.tx = Math.round((wr.width  - cw) / 2);
  ed.vp.ty = Math.round((wr.height - ch) / 2);
  applyViewport();
}

/** Zoom to fit all nodes in view (or center if empty) */
function fitAll() {
  if (!ed.nodes.length) { centerViewport(); return; }
  const wrap = document.getElementById("dedCanvasWrap");
  if (!wrap) return;
  const wr = wrap.getBoundingClientRect();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  ed.nodes.forEach(n => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + (n.w || 160));
    maxY = Math.max(maxY, n.y + 130);
  });
  const pad = 60;
  const bw = (maxX - minX) + pad * 2;
  const bh = (maxY - minY) + pad * 2;
  const scale = Math.min(1.5, Math.max(0.3, Math.min(wr.width / bw, wr.height / bh)));
  ed.vp.scale = scale;
  ed.vp.tx = Math.round((wr.width  - (maxX - minX) * scale) / 2 - minX * scale);
  ed.vp.ty = Math.round((wr.height - (maxY - minY) * scale) / 2 - minY * scale);
  applyViewport();
}

/** Returns canvas coords of the current visible center */
function visibleCenter() {
  const wrap = document.getElementById("dedCanvasWrap");
  if (!wrap) return { x: 200, y: 200 };
  const r = wrap.getBoundingClientRect();
  return screenToCanvas(r.left + r.width / 2, r.top + r.height / 2);
}

//  EVENTS 
function attachEditorEvents() {
  document.getElementById("dedBack").addEventListener("click", () => _eb && _eb());

  _ec.querySelectorAll("[data-mode]").forEach(btn =>
    btn.addEventListener("click", () => setMode(btn.dataset.mode))
  );

  const canvas = document.getElementById("dedCanvas");
  canvas.addEventListener("click",      onCanvasClick);
  canvas.addEventListener("mousedown",  onMouseDown);
  canvas.addEventListener("touchstart", onTouchStart, { passive: false });

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup",   onMouseUp);
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend",  onTouchEnd);

  document.getElementById("dedUndo").addEventListener("click", undoEditor);
  document.getElementById("dedRedo").addEventListener("click", redoEditor);
  document.getElementById("dedMUndo")?.addEventListener("click", undoEditor);
  document.getElementById("dedMRedo")?.addEventListener("click", redoEditor);
  document.getElementById("dedClear").addEventListener("click", () => {
    if (!ed.nodes.length && !ed.edges.length) return;
    if (!confirm("Gesamtes Diagramm löschen?")) return;
    ed.nodes = []; ed.edges = [];
    ed.selectedId = null; ed.connectFrom = null;
    saveHistory(); redrawAll(); showPropsEmpty();
  });
  document.getElementById("dedExport").addEventListener("click", exportDiagram);
  document.getElementById("dedEdgeCancel").addEventListener("click", cancelConnect);
  document.getElementById("dedDrawerHandle")?.addEventListener("click", closeDrawer);
  document.getElementById("dedDrawerCloseBtn")?.addEventListener("click", closeDrawer);
  document.getElementById("dedDrawerBackdrop")?.addEventListener("click", closeDrawer);

  // Swipe-down-to-close the drawer
  let _swipeStartY = 0;
  const drawerEl = document.getElementById("dedDrawer");
  drawerEl?.addEventListener("touchstart", ev => {
    _swipeStartY = ev.touches[0].clientY;
  }, { passive: true });
  drawerEl?.addEventListener("touchend", ev => {
    if (ev.changedTouches[0].clientY - _swipeStartY > 55) closeDrawer();
  }, { passive: true });

  _keyH = e => {
    if (!ed) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undoEditor(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Z")) { e.preventDefault(); redoEditor(); }
    if (e.key === "Escape") cancelConnect();
    if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
    // Keyboard zoom
    if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) { e.preventDefault(); const c = wrapCenter(); zoomAt(c.x, c.y, 1/0.8); }
    if ((e.ctrlKey || e.metaKey) && e.key === "-")                     { e.preventDefault(); const c = wrapCenter(); zoomAt(c.x, c.y, 0.8); }
    if ((e.ctrlKey || e.metaKey) && e.key === "0")                     { e.preventDefault(); fitAll(); }
  };
  window.addEventListener("keydown", _keyH);

  // Zoom control buttons
  document.getElementById("dedZoomIn")   ?.addEventListener("click", () => { const c = wrapCenter(); zoomAt(c.x, c.y, 1/0.8); });
  document.getElementById("dedZoomOut")  ?.addEventListener("click", () => { const c = wrapCenter(); zoomAt(c.x, c.y, 0.8); });
  document.getElementById("dedZoomReset")?.addEventListener("click", fitAll);

  // Wheel zoom (desktop)
  const wrapEl = document.getElementById("dedCanvasWrap");
  wrapEl.addEventListener("wheel", ev => {
    ev.preventDefault();
    const factor = ev.deltaY < 0 ? 1/0.9 : 0.9;
    zoomAt(ev.clientX, ev.clientY, factor);
  }, { passive: false });

  // Left-click OR middle-click on empty canvas → pan
  wrapEl.addEventListener("mousedown", ev => {
    if (ev.target.closest(".ded-node") || ev.target.closest(".ded-zoom-controls") || ev.target.closest(".ded-task-panel")) return;
    // left button: only pan when in select mode (not add/connect/delete)
    if (ev.button === 0 && (ed.mode === "select" || ev.altKey)) {
      ed.pan = { startX: ev.clientX, startY: ev.clientY, origTx: ed.vp.tx, origTy: ed.vp.ty };
      wrapEl.classList.add("ded-panning");
    } else if (ev.button === 1) {
      ev.preventDefault();
      ed.pan = { startX: ev.clientX, startY: ev.clientY, origTx: ed.vp.tx, origTy: ed.vp.ty };
      wrapEl.classList.add("ded-panning");
    }
  });

  // Center the canvas in the viewport once DOM is laid out
  requestAnimationFrame(centerViewport);
}

//  MODE 
const MODE_LABELS = {
  "select":       " Auswahl – tippen/klicken oder Fläche ziehen zum Verschieben",
  "connect":      " Verbinden: erstes Element klicken",
  "delete":       " Löschen: Element oder Linie klicken",
  "add-class":    " Klasse: auf Fläche klicken",
  "add-entity":   " Entity: auf Fläche klicken",
  "add-errel":    " ER-Beziehung: auf Fläche klicken",
  "add-actor":    " Akteur: auf Fläche klicken",
  "add-usecase":  " Use-Case: auf Fläche klicken",
  "add-boundary": " Systemgrenze: auf Fläche klicken",
};

function setMode(mode) {
  if (!ed) return;
  ed.mode = mode;
  ed.connectFrom = null;
  clearConnectHighlight();
  _ec.querySelectorAll("[data-mode]").forEach(b =>
    b.classList.toggle("active", b.dataset.mode === mode)
  );
  const st = document.getElementById("dedStatus");
  if (st) st.textContent = MODE_LABELS[mode] || mode;
  const canvas = document.getElementById("dedCanvas");
  if (canvas) {
    canvas.className = "ded-canvas" +
      (mode === "connect" ? " ded-mode-connect" : "") +
      (mode === "delete"  ? " ded-mode-delete"  : "") +
      (mode.startsWith("add-") ? " ded-mode-add" : "");
  }
  // Visual indicator on canvas wrap when in add-mode
  const wrap = document.getElementById("dedCanvasWrap");
  if (wrap) wrap.classList.toggle("ded-adding", mode.startsWith("add-"));
  // Haptic
  if (navigator.vibrate && mode !== "select") navigator.vibrate(6);
}

function cancelConnect() {
  document.getElementById("dedEdgeModal").style.display = "none";
  ed.connectFrom = null;
  clearConnectHighlight();
  if (ed.mode === "connect") {
    const st = document.getElementById("dedStatus");
    if (st) st.textContent = MODE_LABELS["connect"];
  } else {
    setMode("select");
  }
}

function deleteSelected() {
  if (!ed.selectedId) return;
  const isNode = ed.nodes.some(n => n.id === ed.selectedId);
  if (isNode) {
    ed.nodes = ed.nodes.filter(n  => n.id !== ed.selectedId);
    ed.edges = ed.edges.filter(eg => eg.fromId !== ed.selectedId && eg.toId !== ed.selectedId);
  } else {
    ed.edges = ed.edges.filter(eg => eg.id !== ed.selectedId);
  }
  ed.selectedId = null;
  saveHistory(); redrawAll(); showPropsEmpty();
}

//  CANVAS CLICK 
function onCanvasClick(e) {
  if (ed._wasDragging) { ed._wasDragging = false; return; }
  if (ed._wasPanning)  { ed._wasPanning  = false; return; }
  if (ed.mode === "select") {
    // Tapping empty canvas → deselect
    if (!e.target.closest(".ded-node")) {
      ed.selectedId = null;
      refreshNodeClasses();
      showPropsEmpty();
    }
    return;
  }
  if (!ed.mode.startsWith("add-")) return;
  const pt = screenToCanvas(e.clientX, e.clientY);
  addNode(ed.mode.replace("add-", ""), Math.max(8, pt.x - 8), Math.max(8, pt.y - 8));
  setMode("select");
}

//  NODE DEFAULTS 
const NODE_DEFAULTS = {
  "class":    { name: "Klasse",       attrs: ["- attribut: Typ"], methods: ["+ methode(): void"], w: 165 },
  "entity":   { name: "Entity",       w: 130 },
  "errel":    { name: "hat",           w: 110 },
  "actor":    { name: "Akteur",        w: 80  },
  "usecase":  { name: "Use-Case",      w: 148 },
  "boundary": { name: "System",        w: 240 },
  "action":   { name: "Aktion",        w: 150 },
  "decision": { name: "[Bedingung?]",  w: 120 },
  "start":    { name: "",              w: 40  },
  "end":      { name: "",              w: 40  },
  "fork":     { name: "",              w: 180 },
  "note":     { name: "Notiz ...",     w: 140 },
};

function addNode(type, x, y) {
  // If no position given, place at visible center
  if (x === undefined || y === undefined) {
    const vc = visibleCenter();
    x = Math.max(8, Math.round(vc.x - 80));
    y = Math.max(8, Math.round(vc.y - 40));
  }
  const def  = NODE_DEFAULTS[type] || { name: type, w: 120 };
  const data = Object.assign({}, def);
  if (data.attrs)   data.attrs   = [...data.attrs];
  if (data.methods) data.methods = [...data.methods];
  const node = { id: "n" + (ed.nextId++), type, x, y, w: def.w, data };
  delete node.data.w;
  ed.nodes.push(node);
  saveHistory(); redrawAll(); selectNode(node.id);
  if (navigator.vibrate) navigator.vibrate(8);
}

//  NODE / EDGE CLICK 
function onNodeClick(e, nodeId) {
  e.stopPropagation();
  if (ed._suppressNextClick) { ed._suppressNextClick = false; return; }

  if (ed.mode === "delete") {
    ed.nodes = ed.nodes.filter(n  => n.id !== nodeId);
    ed.edges = ed.edges.filter(eg => eg.fromId !== nodeId && eg.toId !== nodeId);
    ed.selectedId = null;
    saveHistory(); redrawAll(); showPropsEmpty();
    return;
  }

  if (ed.mode === "connect") {
    if (!ed.connectFrom) {
      ed.connectFrom = nodeId;
      refreshNodeClasses();
      const st = document.getElementById("dedStatus");
      if (st) st.textContent = "🔗 Zweites Element wählen … (Esc = abbrechen)";
      if (navigator.vibrate) navigator.vibrate([6, 30, 6]);
    } else if (ed.connectFrom === nodeId) {
      cancelConnect();
    } else {
      promptEdgeType(ed.connectFrom, nodeId);
    }
    return;
  }

  // Single tap/click just selects the node.
  // To open the edit drawer use the ⚙ gear button on the node.
  selectNode(nodeId);
}

function onEdgeClick(e, edgeId) {
  e.stopPropagation();
  if (ed.mode === "delete") {
    ed.edges = ed.edges.filter(eg => eg.id !== edgeId);
    saveHistory(); redrawAll();
    return;
  }
  ed.selectedId = edgeId;
  renderEdgeProps(ed.edges.find(eg => eg.id === edgeId));
  refreshNodeClasses();
}

function selectNode(id) {
  ed.selectedId = id;
  refreshNodeClasses();
  renderProps();
}

//  DRAG: MOUSE 
function onMouseDown(e) {
  // Drag is initiated from each node's own mousedown listener (createNodeEl)
}
function onMouseMove(e) {
  if (!ed) return;
  if (ed.pan) {
    const dx = e.clientX - ed.pan.startX;
    const dy = e.clientY - ed.pan.startY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) ed._wasPanning = true;
    ed.vp.tx = ed.pan.origTx + dx;
    ed.vp.ty = ed.pan.origTy + dy;
    applyViewport();
    return;
  }
  if (ed.drag) moveDrag(e.clientX, e.clientY);
}
function onMouseUp() {
  if (!ed) return;
  if (ed.pan) {
    ed.pan = null;
    document.getElementById("dedCanvasWrap")?.classList.remove("ded-panning");
    return;
  }
  if (ed.drag) endDrag();
}

//  DRAG: TOUCH 
function onTouchStart(e) {
  if (!ed) return;
  // Two-finger: pinch + pan
  if (e.touches.length === 2) {
    e.preventDefault();
    ed.drag = null; ed._wasDragging = false;
    const t1 = e.touches[0], t2 = e.touches[1];
    _lastPinch = {
      cx: (t1.clientX + t2.clientX) / 2,
      cy: (t1.clientY + t2.clientY) / 2,
      dist: Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY),
    };
    return;
  }
  // single-finger on empty canvas in select mode = pan
  if (e.touches.length === 1 && ed.mode === "select" && !e.target.closest(".ded-node") && !e.target.closest(".ded-zoom-controls")) {
    const t = e.touches[0];
    ed.pan = { startX: t.clientX, startY: t.clientY, origTx: ed.vp.tx, origTy: ed.vp.ty };
    return;
  }
  // Node drag is initiated from each node's own touchstart listener (createNodeEl)
  if (!ed.mode.startsWith("add-")) return;
  const nodeEl = e.target.closest(".ded-node");
  if (nodeEl) return;
  e.preventDefault();
  const t = e.touches[0];
  const pt = screenToCanvas(t.clientX, t.clientY);
  addNode(ed.mode.replace("add-", ""), Math.max(8, pt.x - 8), Math.max(8, pt.y - 8));
  setMode("select");
}
function onTouchMove(e) {
  if (!ed) return;
  // Two-finger pinch + pan
  if (e.touches.length === 2 && _lastPinch) {
    e.preventDefault();
    const t1 = e.touches[0], t2 = e.touches[1];
    const cx   = (t1.clientX + t2.clientX) / 2;
    const cy   = (t1.clientY + t2.clientY) / 2;
    const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    // Pan delta
    ed.vp.tx += cx - _lastPinch.cx;
    ed.vp.ty += cy - _lastPinch.cy;
    // Pinch zoom around midpoint
    if (_lastPinch.dist > 1 && dist > 1) {
      const factor   = dist / _lastPinch.dist;
      const newScale = Math.min(4, Math.max(0.12, ed.vp.scale * factor));
      const wrap = document.getElementById("dedCanvasWrap");
      const r = wrap.getBoundingClientRect();
      const lx = cx - r.left, ly = cy - r.top;
      ed.vp.tx = lx - (lx - ed.vp.tx) * (newScale / ed.vp.scale);
      ed.vp.ty = ly - (ly - ed.vp.ty) * (newScale / ed.vp.scale);
      ed.vp.scale = newScale;
    }
    _lastPinch = { cx, cy, dist };
    applyViewport();
    return;
  }
  // One-finger pan
  if (e.touches.length === 1 && ed.pan && !ed.drag) {
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - ed.pan.startX;
    const dy = t.clientY - ed.pan.startY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) ed._wasPanning = true;
    ed.vp.tx = ed.pan.origTx + dx;
    ed.vp.ty = ed.pan.origTy + dy;
    applyViewport();
    return;
  }
  if (!ed.drag) return;
  e.preventDefault();
  const t = e.touches[0];
  moveDrag(t.clientX, t.clientY);
}
function onTouchEnd() {
  _lastPinch = null;
  if (!ed) return;
  if (ed.pan) { ed.pan = null; return; }
  if (ed.drag) endDrag();
}

function startDrag(nodeId, cx, cy) {
  const node = ed.nodes.find(n => n.id === nodeId);
  if (!node) return;
  ed.drag = { nodeId, startX: cx, startY: cy, origX: node.x, origY: node.y };
  ed._wasDragging = false;
  // Do NOT call selectNode here — let click/touchend handle selection so that
  // first tap = select, second tap = open props (not pre-triggered by drag start)
}
function moveDrag(cx, cy) {
  const d  = ed.drag;
  const dx = (cx - d.startX) / ed.vp.scale;
  const dy = (cy - d.startY) / ed.vp.scale;
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
    ed._wasDragging = true;
    // Visually mark as selected while dragging (without opening props)
    if (ed.selectedId !== d.nodeId) { ed.selectedId = d.nodeId; refreshNodeClasses(); }
  }
  const node = ed.nodes.find(n => n.id === d.nodeId);
  if (!node) return;
  node.x = Math.max(0, d.origX + dx);
  node.y = Math.max(0, d.origY + dy);
  const el = document.querySelector(`.ded-node[data-id="${d.nodeId}"]`);
  if (el) { el.style.left = node.x + "px"; el.style.top = node.y + "px"; }
  redrawEdges();
}
function endDrag() {
  if (ed._wasDragging) {
    saveHistory();
    // Only highlight the node visually — do NOT call selectNode() because on
    // mobile that calls renderProps() which opens the drawer immediately.
    ed.selectedId = ed.drag.nodeId;
    refreshNodeClasses();
    ed._suppressNextClick = true; // suppress the click event that fires after mouseup
    resizeCanvas(); // canvas may need to grow if node was dragged to new area
  }
  ed.drag = null;
  ed._wasDragging = false;
}

//  EDGE TYPE PROMPT 
const EDGE_TYPES = {
  class: [
    { type: "inherit",   sym: "",  label: "Vererbung (erbt von)" },
    { type: "implement", sym: "",  label: "Realisierung (implementiert)" },
    { type: "compose",   sym: "",  label: "Komposition" },
    { type: "aggregate", sym: "",  label: "Aggregation" },
    { type: "assoc",     sym: "", label: "Assoziation" },
    { type: "1:1",       sym: "1:1", label: "Assoz. 1 zu 1" },
    { type: "1:n",       sym: "1:n", label: "Assoz. 1 zu n" },
    { type: "m:n",       sym: "m:n", label: "Assoz. m zu n" },
    { type: "dep",       sym: "",  label: "Abhängigkeit" },
  ],
  er: [
    { type: "1:1",  sym: "1 : 1", label: "1 zu 1" },
    { type: "1:n",  sym: "1 : n", label: "1 zu n" },
    { type: "m:n",  sym: "m : n", label: "m zu n" },
    { type: "link", sym: "",   label: "Verbindung" },
  ],
  usecase: [
    { type: "assoc",   sym: "",       label: "Assoziation" },
    { type: "include", sym: "include", label: "Include (Pflicht)" },
    { type: "extend",  sym: "extend",  label: "Extend (optional)" },
    { type: "inherit", sym: "",       label: "Generalisierung" },
  ],
  activity: [
    { type: "flow",  sym: "→",     label: "Kontrollfluss" },
    { type: "guard", sym: "[x]→",  label: "Bedingter Fluss" },
  ],
};

//  EDGE TYPE PROMPT HELPERS 
const EDGE_DESC = {
  inherit:   "Subklasse erbt von Superklasse",
  implement: "Klasse realisiert ein Interface",
  compose:   "Teil existiert nur im Ganzen (stark)",
  aggregate: "Teil ist eigenständig (schwach)",
  assoc:     "Objekte kennen sich gegenseitig",
  dep:       "Kurzfristige Nutzung / Import",
  "1:1":     "Genau einer zu genau einem",
  "1:n":     "Einer zu vielen",
  "m:n":     "Viele zu vielen",
  link:      "Verbindung ohne Kardinalität",
  include:   "Use Case immer eingebunden",
  extend:    "Use Case optional erweitert",
  flow:      "Nächste Aktivität nach Ausführung",
  guard:     "Bedingter Übergang [Bedingung]",
};
const CTX_INFO = {
  class:    { label: "Klassendiagramm",      color: "#818cf8" },
  er:       { label: "ER-Diagramm",          color: "#4ade80" },
  usecase:  { label: "Use-Case-Diagramm",    color: "#fb923c" },
  activity: { label: "Aktivitätsdiagramm",  color: "#38bdf8" },
};

function edgePreviewSVG(type) {
  const s = EDGE_STYLE[type] || { color: "#64748b", dashed: false };
  const c = s.color;
  const dash = s.dashed ? `stroke-dasharray="6 3"` : "";
  const W = 80; const y = 15;
  switch (type) {
    case "assoc":
    case "dep":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30" viewBox="0 0 ${W} 30">
        <line x1="8" y1="${y}" x2="60" y2="${y}" stroke="${c}" stroke-width="2" ${dash}/>
        <path d="M53,${y-5} L62,${y} L53,${y+5}" stroke="${c}" stroke-width="2" fill="none"/>
      </svg>`;
    case "inherit":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30" viewBox="0 0 ${W} 30">
        <line x1="6" y1="${y}" x2="56" y2="${y}" stroke="${c}" stroke-width="2"/>
        <polygon points="56,${y-7} 70,${y} 56,${y+7}" stroke="${c}" stroke-width="2" fill="none"/>
      </svg>`;
    case "implement":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30" viewBox="0 0 ${W} 30">
        <line x1="6" y1="${y}" x2="56" y2="${y}" stroke="${c}" stroke-width="2" stroke-dasharray="6 3"/>
        <polygon points="56,${y-7} 70,${y} 56,${y+7}" stroke="${c}" stroke-width="2" fill="none"/>
      </svg>`;
    case "compose":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30" viewBox="0 0 ${W} 30">
        <polygon points="6,${y} 14,${y-6} 22,${y} 14,${y+6}" stroke="${c}" stroke-width="1.5" fill="${c}"/>
        <line x1="22" y1="${y}" x2="62" y2="${y}" stroke="${c}" stroke-width="2"/>
        <path d="M55,${y-5} L63,${y} L55,${y+5}" stroke="${c}" stroke-width="2" fill="none"/>
      </svg>`;
    case "aggregate":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30" viewBox="0 0 ${W} 30">
        <polygon points="6,${y} 14,${y-6} 22,${y} 14,${y+6}" stroke="${c}" stroke-width="1.5" fill="none"/>
        <line x1="22" y1="${y}" x2="62" y2="${y}" stroke="${c}" stroke-width="2"/>
        <path d="M55,${y-5} L63,${y} L55,${y+5}" stroke="${c}" stroke-width="2" fill="none"/>
      </svg>`;
    case "1:1": case "1:n": case "m:n":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30" viewBox="0 0 ${W} 30">
        <line x1="6" y1="${y}" x2="${W-6}" y2="${y}" stroke="${c}" stroke-width="2"/>
        <text x="${W/2}" y="${y-3}" text-anchor="middle" font-size="9" fill="${c}" font-family="monospace" font-weight="bold">${type}</text>
      </svg>`;
    case "link":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30" viewBox="0 0 ${W} 30">
        <line x1="6" y1="${y}" x2="${W-6}" y2="${y}" stroke="${c}" stroke-width="2"/>
      </svg>`;
    case "include":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30" viewBox="0 0 ${W} 30">
        <line x1="4" y1="${y}" x2="54" y2="${y}" stroke="${c}" stroke-width="2" stroke-dasharray="5 3"/>
        <path d="M48,${y-5} L58,${y} L48,${y+5}" stroke="${c}" stroke-width="2" fill="none"/>
        <text x="28" y="${y-3}" text-anchor="middle" font-size="7" fill="${c}" font-family="serif">«incl»</text>
      </svg>`;
    case "extend":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30" viewBox="0 0 ${W} 30">
        <line x1="4" y1="${y}" x2="54" y2="${y}" stroke="${c}" stroke-width="2" stroke-dasharray="5 3"/>
        <path d="M48,${y-5} L58,${y} L48,${y+5}" stroke="${c}" stroke-width="2" fill="none"/>
        <text x="28" y="${y-3}" text-anchor="middle" font-size="7" fill="${c}" font-family="serif">«ext»</text>
      </svg>`;
    case "flow":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30" viewBox="0 0 ${W} 30">
        <line x1="6" y1="${y}" x2="60" y2="${y}" stroke="${c}" stroke-width="2"/>
        <path d="M52,${y-5} L62,${y} L52,${y+5} Z" fill="${c}"/>
      </svg>`;
    case "guard":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30" viewBox="0 0 ${W} 30">
        <line x1="6" y1="${y}" x2="60" y2="${y}" stroke="${c}" stroke-width="2"/>
        <path d="M52,${y-5} L62,${y} L52,${y+5} Z" fill="${c}"/>
        <text x="30" y="${y-3}" text-anchor="middle" font-size="8" fill="${c}" font-family="monospace">[cond]</text>
      </svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="30" viewBox="0 0 ${W} 30">
        <line x1="6" y1="${y}" x2="${W-6}" y2="${y}" stroke="${c}" stroke-width="2"/>
      </svg>`;
  }
}

function promptEdgeType(fromId, toId) {
  const fromNode = ed.nodes.find(n => n.id === fromId);
  const toNode   = ed.nodes.find(n => n.id === toId);
  if (!fromNode || !toNode) return;
  const types = new Set([fromNode.type, toNode.type]);
  let ctx = "class";
  if (types.has("entity") || types.has("errel")) ctx = "er";
  if (types.has("actor")  || types.has("usecase") || types.has("boundary")) ctx = "usecase";
  if (types.has("start")  || types.has("end") || types.has("action") ||
      types.has("decision") || types.has("fork") || types.has("note")) ctx = "activity";
  const opts = EDGE_TYPES[ctx] || EDGE_TYPES.class;
  const ci   = CTX_INFO[ctx];

  const modal = document.getElementById("dedEdgeModal");
  document.getElementById("dedEdgeModalTitle").innerHTML =
    `Beziehungstyp wählen <span class="ded-edge-ctx-badge" style="background:${ci.color}22;color:${ci.color};border-color:${ci.color}55">${ci.label}</span>`;

  const box = document.getElementById("dedEdgeOptions");
  box.innerHTML = `<div class="ded-edge-grid" data-ctx="${ctx}" style="--ctx-clr:${ci.color}">` +
    opts.map(o =>
      `<button class="ded-edge-card" data-type="${o.type}">
        <div class="ded-edge-card-preview">${edgePreviewSVG(o.type)}</div>
        <div class="ded-edge-card-info">
          <div class="ded-edge-card-name">${o.label}</div>
          <div class="ded-edge-card-desc">${EDGE_DESC[o.type] || ""}</div>
        </div>
      </button>`
    ).join("") +
    `</div>`;

  box.querySelectorAll(".ded-edge-card").forEach(btn => {
    btn.addEventListener("click", () => {
      modal.style.display = "none";
      const existing = ed.edges.find(eg =>
        (eg.fromId === fromId && eg.toId === toId) ||
        (eg.fromId === toId   && eg.toId === fromId)
      );
      if (existing) {
        existing.relType = btn.dataset.type;
      } else {
        ed.edges.push({ id: "e" + (ed.nextId++), fromId, toId, relType: btn.dataset.type, label: "" });
      }
      ed.connectFrom = null;
      clearConnectHighlight();
      saveHistory(); redrawAll();
      setMode("connect");
    });
  });
  modal.style.display = "flex";
}

//  REDRAW 
const CANVAS_MARGIN = 600; // extra space beyond last node (px)
const CANVAS_MIN_W  = 1600;
const CANVAS_MIN_H  = 1200;

function resizeCanvas() {
  const canvas = document.getElementById("dedCanvas");
  if (!canvas) return;
  if (!ed.nodes.length) {
    canvas.style.width  = CANVAS_MIN_W + "px";
    canvas.style.height = CANVAS_MIN_H + "px";
    return;
  }
  let maxX = 0, maxY = 0;
  ed.nodes.forEach(n => {
    const el = canvas.querySelector(`.ded-node[data-id="${n.id}"]`);
    const h  = el ? el.offsetHeight : 100;
    maxX = Math.max(maxX, n.x + (n.w || 160));
    maxY = Math.max(maxY, n.y + h);
  });
  canvas.style.width  = Math.max(CANVAS_MIN_W, maxX + CANVAS_MARGIN) + "px";
  canvas.style.height = Math.max(CANVAS_MIN_H, maxY + CANVAS_MARGIN) + "px";
}

function redrawAll() {
  const canvas = document.getElementById("dedCanvas");
  if (!canvas) return;
  canvas.querySelectorAll(".ded-node").forEach(el => el.remove());
  ed.nodes.forEach(node => canvas.appendChild(createNodeEl(node)));
  redrawEdges();
  refreshNodeClasses();
  resizeCanvas();
  updateEmptyHint();
}

function nodeCenter(node) {
  const el = document.querySelector(`.ded-node[data-id="${node.id}"]`);
  const h  = el ? el.offsetHeight : 52;
  return { x: node.x + node.w / 2, y: node.y + h / 2, w: node.w, h };
}

function borderPoint(cx, cy, targetCx, targetCy, hw, hh) {
  const dx = targetCx - cx;
  const dy = targetCy - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const scaleX = hw / Math.abs(dx || 0.001);
  const scaleY = hh / Math.abs(dy || 0.001);
  const scale  = Math.min(scaleX, scaleY);
  return { x: cx + dx * scale, y: cy + dy * scale };
}

function redrawEdges() {
  const svg = document.getElementById("dedSvg");
  if (!svg) return;
  svg.querySelectorAll(".ded-edge-g").forEach(el => el.remove());

  ed.edges.forEach(edge => {
    const from = ed.nodes.find(n => n.id === edge.fromId);
    const to   = ed.nodes.find(n => n.id === edge.toId);
    if (!from || !to) return;

    const fc = nodeCenter(from);
    const tc = nodeCenter(to);
    const fp = borderPoint(fc.x, fc.y, tc.x, tc.y, fc.w / 2 + 4, fc.h / 2 + 4);
    const tp = borderPoint(tc.x, tc.y, fc.x, fc.y, tc.w / 2 + 4, tc.h / 2 + 4);
    const mx  = (fp.x + tp.x) / 2;
    const my  = (fp.y + tp.y) / 2;
    const ndx = -(tp.y - fp.y) * 0.12;
    const ndy =  (tp.x - fp.x) * 0.12;

    const style = EDGE_STYLE[edge.relType] || EDGE_STYLE.assoc;
    const d = `M${fp.x},${fp.y} Q${mx + ndx},${my + ndy} ${tp.x},${tp.y}`;
    const isSelected = ed.selectedId === edge.id;

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.classList.add("ded-edge-g");
    if (isSelected) g.classList.add("ded-edge-selected");
    g.dataset.id = edge.id;

    if (isSelected) {
      const hi = document.createElementNS("http://www.w3.org/2000/svg", "path");
      hi.setAttribute("d", d); hi.setAttribute("stroke", "var(--accent)");
      hi.setAttribute("stroke-width", "5"); hi.setAttribute("fill", "none"); hi.setAttribute("opacity", "0.3");
      g.appendChild(hi);
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("stroke", style.color);
    path.setAttribute("stroke-width", isSelected ? "2.5" : "2");
    path.setAttribute("fill", "none");
    if (style.dashed)      path.setAttribute("stroke-dasharray", "7,4");
    if (style.markerEnd)   path.setAttribute("marker-end",   `url(#arr-end-${style.markerEnd})`);
    if (style.markerStart) path.setAttribute("marker-start", `url(#arr-start-${style.markerStart})`);
    g.appendChild(path);

    const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
    hit.setAttribute("d", d); hit.setAttribute("stroke", "transparent");
    hit.setAttribute("stroke-width", "16"); hit.setAttribute("fill", "none");
    hit.style.cursor = "pointer";
    g.appendChild(hit);

    // Edge label: custom label takes priority over style default
    const lbl = edge.label || style.label;
    if (lbl) {
      const tx = mx + ndx, ty = my + ndy;
      const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bg.setAttribute("x", tx - 30); bg.setAttribute("y", ty - 14);
      bg.setAttribute("width", "60"); bg.setAttribute("height", "16");
      bg.setAttribute("rx", "3"); bg.setAttribute("fill", "var(--panel,#1e293b)"); bg.setAttribute("opacity", "0.9");
      g.appendChild(bg);
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", tx); text.setAttribute("y", ty - 2);
      text.setAttribute("text-anchor", "middle"); text.setAttribute("font-size", "11");
      text.setAttribute("fill", style.color); text.setAttribute("font-family", "'Courier New', monospace");
      text.textContent = lbl;
      g.appendChild(text);
    }

    g.addEventListener("click", ev => onEdgeClick(ev, edge.id));
    svg.appendChild(g);
  });
}

const EDGE_STYLE = {
  inherit:   { color: "#94a3b8", markerEnd: "inherit",   dashed: false, label: "" },
  implement: { color: "#94a3b8", markerEnd: "implement",  dashed: true,  label: "" },
  compose:   { color: "#94a3b8", markerEnd: "compose",    dashed: false, label: "" },
  aggregate: { color: "#94a3b8", markerEnd: "aggregate",  dashed: false, label: "" },
  assoc:     { color: "#64748b", markerEnd: "assoc",      dashed: false, label: "" },
  dep:       { color: "#64748b", markerEnd: "dep",        dashed: true,  label: "" },
  include:   { color: "#6366f1", markerEnd: "include",    dashed: true,  label: "include" },
  extend:    { color: "#f59e0b", markerEnd: "extend",     dashed: true,  label: "extend"  },
  "1:1":     { color: "#22c55e", markerEnd: "assoc",      dashed: false, label: "1:1" },
  "1:n":     { color: "#22c55e", markerEnd: "assoc",      dashed: false, label: "1:n" },
  "m:n":     { color: "#22c55e", markerEnd: "assoc",      dashed: false, label: "m:n" },
  link:      { color: "#64748b", markerEnd: null,          dashed: false, label: "" },
  flow:      { color: "#38bdf8", markerEnd: "flow",        dashed: false, label: "" },
  guard:     { color: "#38bdf8", markerEnd: "flow",        dashed: false, label: "" },
};

//  NODE ELEMENT 
function createNodeEl(node) {
  const el = document.createElement("div");
  el.className = `ded-node ded-node-${node.type}`;
  el.dataset.id = node.id;
  el.style.left  = node.x + "px";
  el.style.top   = node.y + "px";
  el.style.width = node.w + "px";
  const contentDiv = document.createElement("div");
  contentDiv.className = "ded-node-content";
  contentDiv.innerHTML = nodeInnerHTML(node);
  el.appendChild(contentDiv);
  const gearBtn = document.createElement("button");
  gearBtn.className = "ded-node-edit-btn";
  gearBtn.title = "Bearbeiten";
  gearBtn.innerHTML = `<svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>`;
  gearBtn.addEventListener("click", ev => { ev.stopPropagation(); selectNode(node.id); renderProps(true); });
  gearBtn.addEventListener("touchstart", ev => { ev.stopPropagation(); }, { passive: true });
  gearBtn.addEventListener("touchend", ev => { ev.stopPropagation(); ev.preventDefault(); selectNode(node.id); renderProps(true); });
  el.appendChild(gearBtn);
  el.addEventListener("click",      ev => onNodeClick(ev, node.id));
  el.addEventListener("dblclick",   ev => { ev.stopPropagation(); selectNode(node.id); renderProps(true); });
  el.addEventListener("mousedown", ev => {
    if (ed.mode !== "select") return;
    ev.preventDefault(); ev.stopPropagation();
    startDrag(node.id, ev.clientX, ev.clientY);
  });
  // Touch: always preventDefault to suppress synthetic click; tap handled in touchend
  el.addEventListener("touchstart", ev => {
    ev.stopPropagation();
    ev.preventDefault();
    if (ed.mode === "select") {
      startDrag(node.id, ev.touches[0].clientX, ev.touches[0].clientY);
    }
  }, { passive: false });
  el.addEventListener("touchend", ev => {
    ev.stopPropagation();
    if (ed.mode === "select") {
      // Tap: just select the node. Editing is done via the ⚙ gear button.
      if (!ed._wasDragging) selectNode(node.id);
    } else {
      // delete / connect modes: any tap = interact
      onNodeClick(ev, node.id);
    }
  });
  return el;
}

function nodeInnerHTML(node) {
  const n = node.data.name || "";
  switch (node.type) {
    case "class": {
      const attrs   = node.data.attrs   || [];
      const methods = node.data.methods || [];
      return `
        <div class="ded-class-hd">
          <div class="ded-class-stereotype">class</div>
          <div class="ded-class-name">${escHtml(n)}</div>
        </div>
        <div class="ded-class-section">
          ${attrs.length
            ? attrs.filter(Boolean).map(a=>`<div class="ded-class-row">${escHtml(a)}</div>`).join("")
            : `<div class="ded-class-row ded-placeholder"> Attribute</div>`}
        </div>
        <div class="ded-class-section ded-class-last">
          ${methods.length
            ? methods.filter(Boolean).map(m=>`<div class="ded-class-row">${escHtml(m)}</div>`).join("")
            : `<div class="ded-class-row ded-placeholder">+ Methoden</div>`}
        </div>`;
    }
    case "entity":
      return `<div class="ded-entity-name">${escHtml(n)}</div>`;
    case "errel":
      return `<svg class="ded-errel-svg" viewBox="0 0 110 66" xmlns="http://www.w3.org/2000/svg" width="100%" height="66">
        <polygon points="55,4 106,33 55,62 4,33" fill="none" stroke="currentColor" stroke-width="2"/>
        <text x="55" y="38" text-anchor="middle" font-size="13" fill="currentColor" font-family="inherit">${escHtml(n)}</text>
      </svg>`;
    case "actor":
      return `
        <svg class="ded-actor-svg" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
          <line x1="20" y1="18" x2="20" y2="36" stroke="currentColor" stroke-width="2"/>
          <line x1="4"  y1="26" x2="36" y2="26" stroke="currentColor" stroke-width="2"/>
          <line x1="20" y1="36" x2="8"  y2="50" stroke="currentColor" stroke-width="2"/>
          <line x1="20" y1="36" x2="32" y2="50" stroke="currentColor" stroke-width="2"/>
        </svg>
        <div class="ded-actor-name">${escHtml(n)}</div>`;
    case "usecase":
      return `<div class="ded-usecase-name">${escHtml(n)}</div>`;
    case "boundary":
      return `<div class="ded-boundary-label">${escHtml(n)}</div>`;
    case "start":
      return `<svg class="ded-start-svg" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
        <circle cx="20" cy="20" r="16" fill="currentColor"/>
      </svg>`;
    case "end":
      return `<svg class="ded-end-svg" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
        <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" stroke-width="2.5"/>
        <circle cx="20" cy="20" r="10" fill="currentColor"/>
      </svg>`;
    case "action":
      return `<div class="ded-action-name">${escHtml(n)}</div>`;
    case "decision":
      return `<svg class="ded-errel-svg" viewBox="0 0 120 72" xmlns="http://www.w3.org/2000/svg" width="100%" height="72">
        <polygon points="60,4 116,36 60,68 4,36" fill="none" stroke="currentColor" stroke-width="2"/>
        <text x="60" y="41" text-anchor="middle" font-size="11" fill="currentColor" font-family="inherit">${escHtml(n)}</text>
      </svg>`;
    case "fork":
      return `<svg class="ded-fork-svg" viewBox="0 0 180 20" xmlns="http://www.w3.org/2000/svg" width="100%" height="20">
        <rect x="0" y="3" width="180" height="14" rx="2" fill="currentColor"/>
      </svg>`;
    case "note":
      return `<div class="ded-note-corner"></div><div class="ded-note-text">${escHtml(n)}</div>`;
    default:
      return `<div style="padding:8px;font-size:.82rem">${escHtml(n)}</div>`;
  }
}

function escHtml(s) {
  return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

//  NODE CLASS REFRESH 
function refreshNodeClasses() {
  if (!ed) return;
  document.querySelectorAll(".ded-node").forEach(el => {
    el.classList.toggle("ded-selected",     el.dataset.id === ed.selectedId);
    el.classList.toggle("ded-connect-from", el.dataset.id === ed.connectFrom);
  });
}
function clearConnectHighlight() {
  document.querySelectorAll(".ded-connect-from").forEach(el => el.classList.remove("ded-connect-from"));
}
function updateEmptyHint() {
  const h = document.getElementById("dedEmptyHint");
  if (h) h.style.display = ed.nodes.length ? "none" : "";
}

//  PROPS 
function isMobile() { return window.innerWidth <= 640; }

function showPropsEmpty() {
  const empty   = document.getElementById("dedPropsEmpty");
  const content = document.getElementById("dedPropsContent");
  if (empty)   empty.style.display   = "";
  if (content) content.style.display = "none";
  closeDrawer();
}

function renderProps(focusFirst = false) {
  const node = ed.nodes.find(n => n.id === ed.selectedId);
  if (!node) { showPropsEmpty(); return; }
  const html   = buildPropsHTML(node);
  const wireFn = root => wireProps(root, node, focusFirst);
  if (isMobile()) {
    openDrawer(nodeTypeLabel(node.type), html, wireFn);
  } else {
    const empty   = document.getElementById("dedPropsEmpty");
    const content = document.getElementById("dedPropsContent");
    if (!empty || !content) return;
    empty.style.display   = "none";
    content.style.display = "";
    content.innerHTML = html;
    wireFn(content);
  }
}

function renderEdgeProps(edge) {
  if (!edge) return;
  const ctx  = detectCtx(edge);
  const sym  = (EDGE_TYPES[ctx] || []).find(o => o.type === edge.relType)?.sym || edge.relType;
  const html = `
    <div class="ded-prop-title"> Verbindung</div>
    <div class="ded-prop-badge">${escHtml(sym)}&nbsp; ${escHtml(edge.relType)}</div>
    <label class="ded-prop-label">Beschriftung <span class="ded-prop-hint">(leer = Standard)</span></label>
    <input class="ded-prop-input ded-prop-elabel" value="${escHtml(edge.label||"")}" placeholder="eigene Beschriftung …" autocomplete="off">
    <label class="ded-prop-label">Typ ändern</label>
    <select class="ded-prop-input ded-prop-retype">
      ${(EDGE_TYPES[ctx] || EDGE_TYPES.class).map(o =>
        `<option value="${o.type}" ${o.type===edge.relType?"selected":""}>${o.sym} ${o.label}</option>`
      ).join("")}
    </select>
    <button class="ded-prop-del">🗑 Verbindung löschen</button>`;

  const wireFn = root => {
    root.querySelector(".ded-prop-elabel")?.addEventListener("input", ev => {
      edge.label = ev.target.value; redrawEdges();
    });
    root.querySelector(".ded-prop-elabel")?.addEventListener("change", () => saveHistory());
    root.querySelector(".ded-prop-retype")?.addEventListener("change", ev => {
      edge.relType = ev.target.value; saveHistory(); redrawEdges();
    });
    root.querySelector(".ded-prop-del")?.addEventListener("click", () => {
      ed.edges = ed.edges.filter(eg => eg.id !== edge.id);
      ed.selectedId = null; saveHistory(); redrawAll(); showPropsEmpty();
    });
  };
  if (isMobile()) openDrawer("Verbindung", html, wireFn);
  else {
    const empty   = document.getElementById("dedPropsEmpty");
    const content = document.getElementById("dedPropsContent");
    if (!empty || !content) return;
    empty.style.display = "none"; content.style.display = "";
    content.innerHTML = html; wireFn(content);
  }
}

function detectCtx(edge) {
  const from = ed.nodes.find(n => n.id === edge.fromId);
  const to   = ed.nodes.find(n => n.id === edge.toId);
  if (!from || !to) return "class";
  const types = new Set([from.type, to.type]);
  if (types.has("entity") || types.has("errel")) return "er";
  if (types.has("actor")  || types.has("usecase") || types.has("boundary")) return "usecase";
  if (types.has("start")  || types.has("end") || types.has("action") ||
      types.has("decision") || types.has("fork") || types.has("note")) return "activity";
  return "class";
}

function buildPropsHTML(node) {
  const noName  = ["start", "end", "fork"].includes(node.type);
  const isClass = node.type === "class";
  const isNote  = node.type === "note";
  let extra = "";
  if (isClass) {
    extra = `
      <label class="ded-prop-label">Attribute <span class="ded-prop-hint">je Zeile</span></label>
      <textarea class="ded-prop-ta ded-prop-attrs" rows="4" spellcheck="false" autocorrect="off">${escHtml((node.data.attrs||[]).join("\n"))}</textarea>
      <label class="ded-prop-label">Methoden <span class="ded-prop-hint">je Zeile</span></label>
      <textarea class="ded-prop-ta ded-prop-methods" rows="3" spellcheck="false" autocorrect="off">${escHtml((node.data.methods||[]).join("\n"))}</textarea>`;
  } else if (isNote) {
    extra = `
      <label class="ded-prop-label">Text</label>
      <textarea class="ded-prop-ta ded-prop-notetext" rows="4" spellcheck="false">${escHtml(node.data.name||"")}</textarea>`;
  }
  const nameRow = noName ? "" : `
    <label class="ded-prop-label">Name</label>
    <input class="ded-prop-input ded-prop-name" value="${escHtml(node.data.name)}" placeholder="Name" autocomplete="off" autocorrect="off" spellcheck="false">`;
  return `
    <div class="ded-prop-title">${nodeTypeLabel(node.type)}</div>
    ${nameRow}
    ${extra}
    <label class="ded-prop-label">Breite <small class="ded-prop-hint" id="dedWidthHint">${node.w}px</small></label>
    <input type="range" class="ded-prop-resize-w" min="30" max="400" step="10" value="${node.w}">
    <button class="ded-prop-del">🗑 Element löschen</button>`;
}

function wireProps(root, node, focusFirst = false) {
  const nameIn = root.querySelector(".ded-prop-name");
  if (nameIn) {
    nameIn.addEventListener("input", () => { node.data.name = nameIn.value; updateNodeEl(node); });
    nameIn.addEventListener("change", () => saveHistory());
    if (focusFirst) { nameIn.focus(); nameIn.select(); }
  }
  // Note: text edited via textarea aliased to name
  const noteIn = root.querySelector(".ded-prop-notetext");
  if (noteIn) {
    noteIn.addEventListener("input", () => { node.data.name = noteIn.value; updateNodeEl(node); });
    noteIn.addEventListener("change", () => saveHistory());
    if (focusFirst) { noteIn.focus(); }
  }
  if (node.type === "class") {
    root.querySelector(".ded-prop-attrs")?.addEventListener("input", ev => {
      node.data.attrs = ev.target.value.split("\n"); updateNodeEl(node);
    });
    root.querySelector(".ded-prop-attrs")?.addEventListener("change", () => saveHistory());
    root.querySelector(".ded-prop-methods")?.addEventListener("input", ev => {
      node.data.methods = ev.target.value.split("\n"); updateNodeEl(node);
    });
    root.querySelector(".ded-prop-methods")?.addEventListener("change", () => saveHistory());
  }
  const rw = root.querySelector(".ded-prop-resize-w");
  if (rw) {
    rw.addEventListener("input", ev => {
      node.w = Math.max(80, parseInt(ev.target.value) || 120);
      const el = document.querySelector(`.ded-node[data-id="${node.id}"]`);
      if (el) el.style.width = node.w + "px";
      const hint = root.querySelector("#dedWidthHint");
      if (hint) hint.textContent = node.w + "px";
      redrawEdges();
    });
    rw.addEventListener("change", () => saveHistory());
  }
  root.querySelector(".ded-prop-del")?.addEventListener("click", () => {
    ed.nodes = ed.nodes.filter(n  => n.id !== node.id);
    ed.edges = ed.edges.filter(eg => eg.fromId !== node.id && eg.toId !== node.id);
    ed.selectedId = null;
    closeDrawer(); saveHistory(); redrawAll(); showPropsEmpty();
  });
}

function updateNodeEl(node) {
  const el = document.querySelector(`.ded-node[data-id="${node.id}"]`);
  if (el) {
    const content = el.querySelector(".ded-node-content");
    if (content) content.innerHTML = nodeInnerHTML(node);
    else { el.innerHTML = nodeInnerHTML(node); } // fallback
    redrawEdges();
  }
}

// ─── TASK / AUFGABENMODUS ────────────────────────────────────
function initTaskPanel() {
  const task = ed.task;
  const panel = document.getElementById("dedTaskPanel");
  if (!panel || !task) return;
  panel.style.display = "";

  document.getElementById("dedTaskTitle").textContent = task.title || "Aufgabe";
  document.getElementById("dedTaskDesc").textContent  = task.description || "";

  const hintsEl = document.getElementById("dedTaskHints");
  if (task.hints && task.hints.length) {
    hintsEl.innerHTML = `<div class=\"ded-task-hints-title\">💡 Tipps:</div>` +
      task.hints.map(h => `<div class=\"ded-task-hint\">${escHtml(h)}</div>`).join("");
  }

  // Toggle body open/closed
  let open = true;
  const toggleBtn = document.getElementById("dedTaskToggle");
  const bodyEl    = document.getElementById("dedTaskBody");
  toggleBtn?.addEventListener("click", () => {
    open = !open;
    bodyEl.style.display   = open ? "" : "none";
    toggleBtn.textContent  = open ? "▲" : "▼";
  });

  document.getElementById("dedTaskCheck")?.addEventListener("click", () => checkTask());
}

function checkTask() {
  const task = ed.task;
  if (!task) return;
  const resultEl = document.getElementById("dedTaskResult");
  if (!resultEl) return;

  const results = (task.checks || []).map(chk => {
    let pass = false;
    const label = chk.label || chk.type;
    switch (chk.type) {
      case "nodeType": {
        const count = ed.nodes.filter(n => n.type === chk.nodeType).length;
        pass = count >= (chk.min || 1);
        break;
      }
      case "nodeName": {
        pass = ed.nodes.some(n => (n.data.name || "").trim().toLowerCase() === chk.name.toLowerCase());
        break;
      }
      case "edgeType": {
        const count = ed.edges.filter(e => e.relType === chk.relType).length;
        pass = count >= (chk.min || 1);
        break;
      }
      case "nodeAttr": {
        pass = ed.nodes.some(n =>
          (n.data.attrs || []).some(a => a.toLowerCase().includes(chk.value.toLowerCase()))
        );
        break;
      }
      case "nodeMethod": {
        pass = ed.nodes.some(n =>
          (n.data.methods || []).some(m => m.toLowerCase().includes(chk.value.toLowerCase()))
        );
        break;
      }
      case "minNodes": {
        pass = ed.nodes.length >= (chk.min || 1);
        break;
      }
      case "minEdges": {
        pass = ed.edges.length >= (chk.min || 1);
        break;
      }
    }
    return { pass, label };
  });

  const allPass = results.length > 0 && results.every(r => r.pass);
  const checksHtml = results.map(r =>
    `<div class="ded-task-check-row ${r.pass ? "ded-check-ok" : "ded-check-fail"}">
      <span class="ded-check-icon">${r.pass ? "✅" : "❌"}</span>
      <span class="ded-check-label">${escHtml(r.label)}</span>
    </div>`
  ).join("");

  resultEl.innerHTML = `
    <div class="ded-task-result-box ${allPass ? "ded-result-win" : "ded-result-partial"}">
      <div class="ded-task-result-title">${allPass ? "🎉 Aufgabe gelöst!" : "Noch nicht ganz…"}</div>
      <div class="ded-task-checks">${checksHtml}</div>
    </div>`;

  // Open body to show result
  const bodyEl = document.getElementById("dedTaskBody");
  if (bodyEl) bodyEl.style.display = "";
  const toggleBtn = document.getElementById("dedTaskToggle");
  if (toggleBtn) toggleBtn.textContent = "▲";
}

function nodeTypeLabel(type) {
  return {
    class:    "📦 Klasse",   entity:   "▭ Entity",    errel: "◇ ER-Beziehung",
    actor:    "🧍 Akteur",   usecase:  "⯯ Use-Case",  boundary: "⬜ Systemgrenze",
    action:   "▢ Aktion",    decision: "◆ Entscheidung",
    start:    "● Start",     end:      "⧉ Ende",       fork: "═ Fork/Join",
    note:     "📌 Notiz",
  }[type] || type;
}

// ─── DRAWER ──────────────────────────────────────────────────
function openDrawer(title, html, wireFn) {
  const drawer   = document.getElementById("dedDrawer");
  const backdrop = document.getElementById("dedDrawerBackdrop");
  const titleEl  = document.getElementById("dedDrawerTitle");
  const body     = document.getElementById("dedDrawerBody");
  if (!drawer) return;
  if (titleEl) titleEl.textContent = title;
  body.innerHTML = html;
  if (wireFn) wireFn(body);
  drawer.classList.add("open");
  backdrop.classList.add("open");
  // Focus first input for quicker editing
  setTimeout(() => body.querySelector("input, textarea")?.focus(), 280);
}
function closeDrawer() {
  document.getElementById("dedDrawer")?.classList.remove("open");
  document.getElementById("dedDrawerBackdrop")?.classList.remove("open");
}

// ─── HISTORY ─────────────────────────────────────────────────
function saveHistory() {
  if (!ed) return;
  const snap = JSON.stringify({ nodes: ed.nodes, edges: ed.edges });
  if (ed.historyIndex < ed.history.length - 1)
    ed.history = ed.history.slice(0, ed.historyIndex + 1);
  if (ed.history[ed.historyIndex] === snap) return;
  ed.history.push(snap);
  if (ed.history.length > 60) ed.history.shift(); else ed.historyIndex = ed.history.length - 1;
  updateUndoRedoBtns();
}
function undoEditor() {
  if (!ed || ed.historyIndex < 1) return;
  ed.historyIndex--; restoreHistory();
}
function redoEditor() {
  if (!ed || ed.historyIndex >= ed.history.length - 1) return;
  ed.historyIndex++; restoreHistory();
}
function restoreHistory() {
  const snap = JSON.parse(ed.history[ed.historyIndex]);
  ed.nodes = snap.nodes; ed.edges = snap.edges;
  ed.selectedId = null; ed.connectFrom = null;
  redrawAll(); showPropsEmpty(); updateUndoRedoBtns();
}
function updateUndoRedoBtns() {
  const undo = document.getElementById("dedUndo");
  const redo = document.getElementById("dedRedo");
  if (undo) undo.disabled = !ed || ed.historyIndex < 1;
  if (redo) redo.disabled = !ed || ed.historyIndex >= ed.history.length - 1;
}

// ─── EXPORT ──────────────────────────────────────────────────
function exportDiagram() {
  const lines = ["╔══════════════════════════╗", "║   Diagramm-Export        ║", "╚══════════════════════════╝", ""];
  ed.nodes.forEach(n => {
    if (n.type === "class") {
      lines.push(`┌ [Klasse] ${n.data.name}`);
      (n.data.attrs   ||[]).filter(Boolean).forEach(a => lines.push(`│  ${a}`));
      (n.data.methods ||[]).filter(Boolean).forEach(m => lines.push(`│  ${m}`));
      lines.push("└");
    } else {
      lines.push(`[${n.type}] ${n.data.name}`);
    }
  });
  if (ed.edges.length) {
    lines.push("", "── Beziehungen ──");
    ed.edges.forEach(eg => {
      const f = ed.nodes.find(n => n.id === eg.fromId);
      const t = ed.nodes.find(n => n.id === eg.toId);
      if (f && t) lines.push(`${f.data.name}  ──[${eg.relType}]──▶  ${t.data.name}${eg.label ? " [" + eg.label + "]" : ""}`);
    });
  }
  const blob = new Blob([lines.join("\n")], { type:"text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "diagramm.txt"; a.click();
  URL.revokeObjectURL(url);
}