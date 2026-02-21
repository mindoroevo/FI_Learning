/**
 * Binär-Trainer – Interaktives Zahlensystem-Lernspiel
 * Fragetypen:
 *   dec_to_bin   – Dezimal → Binär (Bit-Pad)
 *   bin_to_dec   – Binär → Dezimal (Num-Pad)
 *   dec_to_hex   – Dezimal → Hex (Hex-Pad)
 *   hex_to_dec   – Hex → Dezimal (Num-Pad)
 *   bin_to_hex   – Binär → Hex (Hex-Pad)
 *   hex_to_bin   – Hex → Binär (Bit-Pad)
 *   bitwise_and  – A AND B = ? (Num-Pad, dezimal)
 *   bitwise_or   – A OR B = ? (Num-Pad, dezimal)
 *   bit_count    – Wie viele Bits sind gesetzt? (Num-Pad)
 */

import { escapeHtml } from "../utils.js";

let _container = null;
let _onBack    = null;
let bn         = null;

// ─── Math helpers ─────────────────────────────────────────────────────────────

function toBin8(n)  { return (n >>> 0).toString(2).padStart(8, "0"); }
function toBin16(n) { return (n >>> 0).toString(2).padStart(16, "0"); }
function toHex(n, bits = 8) { return n.toString(16).toUpperCase().padStart(bits / 4, "0"); }
function countBits(n) { let c = 0; while (n) { c += n & 1; n >>>= 1; } return c; }

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function randomByte(diff) {
  if (diff === "nibble") {
    // Focus on nibble values + common subnet values
    const pool = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
                  128,192,224,240,248,252,254,255];
    return pool[rnd(0, pool.length - 1)];
  }
  if (diff === "profi") return rnd(0, 65535);
  return rnd(0, 255); // byte
}

// ─── Question Generators ──────────────────────────────────────────────────────

function genDecToBin(diff) {
  const n   = randomByte(diff);
  const is16 = diff === "profi" && n > 255;
  const bin = is16 ? toBin16(n) : toBin8(n);
  return {
    type: "dec_to_bin",
    inputMode: "bitpad",
    bits: is16 ? 16 : 8,
    prompt: `Dezimal <strong>${n}</strong> in Binär (${is16 ? 16 : 8} Bit)?`,
    answer: bin,
    display: { dec: n, hex: toHex(n, is16 ? 16 : 8) },
    explanation: buildBinExpl(n, is16 ? 16 : 8),
  };
}

function genBinToDec(diff) {
  const n   = randomByte(diff);
  const is16 = diff === "profi" && n > 255;
  const bin = is16 ? toBin16(n) : toBin8(n);
  return {
    type: "bin_to_dec",
    inputMode: "numpad",
    prompt: `Binär <strong class="bn-code">${bin}</strong> in Dezimal?`,
    answer: String(n),
    display: { hex: toHex(n, is16 ? 16 : 8) },
    explanation: buildBinExpl(n, is16 ? 16 : 8),
  };
}

function genDecToHex(diff) {
  const n   = randomByte(diff);
  const is16 = diff === "profi" && n > 255;
  const hex = toHex(n, is16 ? 16 : 8);
  return {
    type: "dec_to_hex",
    inputMode: "hexpad",
    hexDigits: is16 ? 4 : 2,
    prompt: `Dezimal <strong>${n}</strong> in Hexadezimal?`,
    answer: hex,
    display: { bin: is16 ? toBin16(n) : toBin8(n) },
    explanation: buildHexExpl(n, is16 ? 16 : 8),
  };
}

function genHexToDec(diff) {
  const n   = randomByte(diff);
  const is16 = diff === "profi" && n > 255;
  const hex = toHex(n, is16 ? 16 : 8);
  return {
    type: "hex_to_dec",
    inputMode: "numpad",
    prompt: `Hex <strong class="bn-code">0x${hex}</strong> in Dezimal?`,
    answer: String(n),
    display: { bin: is16 ? toBin16(n) : toBin8(n) },
    explanation: buildHexExpl(n, is16 ? 16 : 8),
  };
}

function genBinToHex(diff) {
  const n   = diff === "nibble" ? rnd(0, 15) : rnd(0, 255);
  const bin = diff === "nibble" ? n.toString(2).padStart(4, "0") : toBin8(n);
  const hex = toHex(n, diff === "nibble" ? 4 : 8);
  return {
    type: "bin_to_hex",
    inputMode: "hexpad",
    hexDigits: diff === "nibble" ? 1 : 2,
    prompt: `Binär <strong class="bn-code">${bin}</strong> in Hex?`,
    answer: hex,
    display: { dec: n },
    explanation: buildHexExpl(n, diff === "nibble" ? 4 : 8),
  };
}

function genHexToBin(diff) {
  const n   = diff === "nibble" ? rnd(0, 15) : rnd(0, 255);
  const bin = diff === "nibble" ? n.toString(2).padStart(4, "0") : toBin8(n);
  const hex = toHex(n, diff === "nibble" ? 4 : 8);
  return {
    type: "hex_to_bin",
    inputMode: "bitpad",
    bits: diff === "nibble" ? 4 : 8,
    prompt: `Hex <strong class="bn-code">0x${hex}</strong> in Binär?`,
    answer: bin,
    display: { dec: n },
    explanation: buildBinExpl(n, diff === "nibble" ? 4 : 8),
  };
}

function genBitwiseAnd(diff) {
  const a = rnd(0, 255), b = rnd(0, 255);
  const r = (a & b) >>> 0;
  return {
    type: "bitwise_and",
    inputMode: "numpad",
    prompt:
      `<span class="bn-table-wrap">`+
      `<table class="bn-bitwise-table">`+
      `<tr><td class="bn-bt-label">A</td><td class="bn-bt-val">${a}</td><td class="bn-bt-bin">${toBin8(a)}</td></tr>`+
      `<tr><td class="bn-bt-label">B</td><td class="bn-bt-val">${b}</td><td class="bn-bt-bin">${toBin8(b)}</td></tr>`+
      `<tr class="bn-bt-op"><td>AND</td><td class="bn-bt-ans">?</td><td></td></tr>`+
      `</table></span>`,
    answer: String(r),
    display: { bin: toBin8(r), hex: toHex(r) },
    explanation:
      `A = <code>${toBin8(a)}</code> (${a})<br>`+
      `B = <code>${toBin8(b)}</code> (${b})<br>`+
      `AND: Jedes Bit ist 1, wenn BEIDE Bits 1 sind.<br>`+
      `A AND B = <code>${toBin8(r)}</code> = <strong>${r}</strong>`,
  };
}

function genBitwiseOr(diff) {
  const a = rnd(0, 255), b = rnd(0, 255);
  const r = (a | b) >>> 0;
  return {
    type: "bitwise_or",
    inputMode: "numpad",
    prompt:
      `<span class="bn-table-wrap">`+
      `<table class="bn-bitwise-table">`+
      `<tr><td class="bn-bt-label">A</td><td class="bn-bt-val">${a}</td><td class="bn-bt-bin">${toBin8(a)}</td></tr>`+
      `<tr><td class="bn-bt-label">B</td><td class="bn-bt-val">${b}</td><td class="bn-bt-bin">${toBin8(b)}</td></tr>`+
      `<tr class="bn-bt-op"><td>OR</td><td class="bn-bt-ans">?</td><td></td></tr>`+
      `</table></span>`,
    answer: String(r),
    display: { bin: toBin8(r), hex: toHex(r) },
    explanation:
      `A = <code>${toBin8(a)}</code> (${a})<br>`+
      `B = <code>${toBin8(b)}</code> (${b})<br>`+
      `OR: Jedes Bit ist 1, wenn MINDESTENS EINES der Bits 1 ist.<br>`+
      `A OR B = <code>${toBin8(r)}</code> = <strong>${r}</strong>`,
  };
}

function genBitCount(diff) {
  const n = rnd(0, 255);
  const c = countBits(n);
  const bin = toBin8(n);
  return {
    type: "bit_count",
    inputMode: "numpad",
    prompt: `Wie viele Bits sind in <strong class="bn-code">${bin}</strong> (Dezimal ${n}) gesetzt?`,
    answer: String(c),
    display: { hex: toHex(n) },
    explanation:
      `<code>${bin}</code><br>`+
      `Markierte Einsen: <strong>${[...bin].map((b,i)=>b==="1"?`Bit ${7-i}`:null).filter(Boolean).join(", ") || "keine"}</strong><br>`+
      `Anzahl gesetzter Bits: <strong>${c}</strong>`,
  };
}

// ─── Explanation builders ─────────────────────────────────────────────────────

function buildBinExpl(n, bits) {
  const positions = Array.from({length: bits}, (_, i) => bits - 1 - i);
  const setBits   = positions.filter(p => (n >> p) & 1);
  const pows      = setBits.map(p => `2<sup>${p}</sup> = ${Math.pow(2, p)}`);
  return (
    `<strong>${n}</strong> in Binär:<br>`+
    `Positionen: ${positions.map(p => `<span class="bn-e-bit ${(n>>p)&1 ? 'bn-e-set':'bn-e-clr'}">${(n>>p)&1}</span>`).join(" ")}<br>`+
    (setBits.length ? `Summe: ${pows.join(" + ")} = <strong>${n}</strong>` : `Kein Bit gesetzt (= 0)`)
  );
}

function buildHexExpl(n, bits) {
  const hex  = toHex(n, bits);
  const nibbles = [...hex].map(h => ({
    h,
    dec: parseInt(h, 16),
    bin: parseInt(h, 16).toString(2).padStart(4, "0"),
  }));
  return (
    `<strong>${n} → 0x${hex}</strong><br>`+
    `Jede Hex-Stelle = 4 Bit (ein Nibble):<br>`+
    nibbles.map(({h, dec, bin}) =>
      `<code>${h}</code> = ${dec} = <code>${bin}</code>`
    ).join(" &nbsp;│&nbsp; ")
  );
}

// ─── How-to content ───────────────────────────────────────────────────────────

const HOWTO = {
  dec_to_bin: `
    <p><strong>Methode: Division durch 2</strong></p>
    <p>Teile die Zahl wiederholt durch 2 und notiere die Reste von unten nach oben.</p>
    <p>Beispiel: 13<br>
    13 ÷ 2 = 6 Rest <b>1</b><br>
    6 ÷ 2 = 3 Rest <b>0</b><br>
    3 ÷ 2 = 1 Rest <b>1</b><br>
    1 ÷ 2 = 0 Rest <b>1</b><br>
    → von unten: <strong>1101</strong> = 0000<strong>1101</strong></p>
    <p>Oder: Subtrahiere Zweierpotenzen von links (128, 64, 32, 16, 8, 4, 2, 1).</p>`,

  bin_to_dec: `
    <p><strong>Methode: Zweierpotenz-Summe</strong></p>
    <p>Multipliziere jedes Bit mit seiner Zweierpotenz und addiere.</p>
    <table class="sn-ref-table" style="margin-top:6px">
      <tr><th>Bit 7</th><th>6</th><th>5</th><th>4</th><th>3</th><th>2</th><th>1</th><th>0</th></tr>
      <tr><td>128</td><td>64</td><td>32</td><td>16</td><td>8</td><td>4</td><td>2</td><td>1</td></tr>
    </table>
    <p>Beispiel: <code>10110100</code><br>
    128+0+32+16+0+4+0+0 = <strong>180</strong></p>`,

  dec_to_hex: `
    <p><strong>Methode: Division durch 16</strong></p>
    <p>Teile die Zahl durch 16, Rest ergibt letztes Hex-Zeichen.<br>
    10=A, 11=B, 12=C, 13=D, 14=E, 15=F</p>
    <p>Beispiel: 186 ÷ 16 = 11 Rest 10 → <strong>BA</strong></p>
    <p>Oder: 8-Bit-Zahl = 2 Nibbles (je 4 Bit).<br>
    Oberes Nibble (Bit 7–4) und unteres Nibble (Bit 3–0) separat umrechnen.</p>`,

  hex_to_dec: `
    <p><strong>Methode: Hex-Stellen × Sechzehnerpotenz</strong></p>
    <p>Beispiel: 0xBA<br>
    B = 11, A = 10<br>
    11 × 16 + 10 = 176 + 10 = <strong>186</strong></p>
    <table class="sn-ref-table" style="margin-top:6px">
      <tr><th>Hex</th><th>Dez</th><th>Hex</th><th>Dez</th></tr>
      <tr><td>A</td><td>10</td><td>B</td><td>11</td></tr>
      <tr><td>C</td><td>12</td><td>D</td><td>13</td></tr>
      <tr><td>E</td><td>14</td><td>F</td><td>15</td></tr>
    </table>`,

  bin_to_hex: `
    <p><strong>Methode: Nibble-weise umrechnen</strong></p>
    <p>Teile die Binärzahl in 4-Bit-Gruppen (Nibbles) von rechts:</p>
    <p>Beispiel: <code>10111010</code><br>
    1011 = 11 = B<br>
    1010 = 10 = A<br>
    → <strong>0xBA</strong></p>
    <table class="sn-ref-table" style="margin-top:6px">
      <tr><th>Bin</th><th>Hex</th><th>Bin</th><th>Hex</th></tr>
      <tr><td>0000</td><td>0</td><td>1000</td><td>8</td></tr>
      <tr><td>0001</td><td>1</td><td>1001</td><td>9</td></tr>
      <tr><td>0010</td><td>2</td><td>1010</td><td>A</td></tr>
      <tr><td>0011</td><td>3</td><td>1011</td><td>B</td></tr>
      <tr><td>0100</td><td>4</td><td>1100</td><td>C</td></tr>
      <tr><td>0101</td><td>5</td><td>1101</td><td>D</td></tr>
      <tr><td>0110</td><td>6</td><td>1110</td><td>E</td></tr>
      <tr><td>0111</td><td>7</td><td>1111</td><td>F</td></tr>
    </table>`,

  hex_to_bin: `
    <p><strong>Methode: Jede Hex-Stelle = 4 Bit</strong></p>
    <p>Wandle jede Hex-Stelle einzeln in 4 Bit um:</p>
    <p>Beispiel: 0xBA<br>
    B = 1011, A = 1010 → <strong>10111010</strong></p>`,

  bitwise_and: `
    <p><strong>AND-Verknüpfung:</strong> Bit ist 1 nur wenn BEIDE Bits 1 sind.</p>
    <table class="sn-ref-table" style="margin-top:6px">
      <tr><th>A</th><th>B</th><th>A AND B</th></tr>
      <tr><td>0</td><td>0</td><td>0</td></tr>
      <tr><td>0</td><td>1</td><td>0</td></tr>
      <tr><td>1</td><td>0</td><td>0</td></tr>
      <tr><td>1</td><td>1</td><td>1</td></tr>
    </table>
    <p>Anwendung: Subnetzberechnung (IP AND Maske = Netzadresse)</p>`,

  bitwise_or: `
    <p><strong>OR-Verknüpfung:</strong> Bit ist 1 wenn MINDESTENS EINES 1 ist.</p>
    <table class="sn-ref-table" style="margin-top:6px">
      <tr><th>A</th><th>B</th><th>A OR B</th></tr>
      <tr><td>0</td><td>0</td><td>0</td></tr>
      <tr><td>0</td><td>1</td><td>1</td></tr>
      <tr><td>1</td><td>0</td><td>1</td></tr>
      <tr><td>1</td><td>1</td><td>1</td></tr>
    </table>
    <p>Anwendung: Broadcastberechnung (Netz OR Wildcard = Broadcast)</p>`,

  bit_count: `
    <p><strong>Einfach alle Einsen zählen.</strong></p>
    <p>Tipp: Zähle die 1-Bits in der Binärdarstellung.<br>
    Diese Zahl nennt man auch <em>Hamming-Gewicht</em> oder <em>Population Count</em>.</p>
    <p>Anwendung: Subnetzmaske bestimmen (= Anzahl gesetzter Bits = CIDR-Präfix)</p>`,
};

// ─── Stats ────────────────────────────────────────────────────────────────────

const BN_STATS_KEY = "fiae_bn_stats";

function loadStats() {
  try { return JSON.parse(localStorage.getItem(BN_STATS_KEY) || "null") || {}; }
  catch { return {}; }
}

function saveStats(score) {
  const s = loadStats();
  const answered = score.correct + score.wrong;
  const pct = answered ? Math.round(score.correct / answered * 100) : 0;
  s.games        = (s.games        || 0) + 1;
  s.totalCorrect = (s.totalCorrect || 0) + score.correct;
  s.totalWrong   = (s.totalWrong   || 0) + score.wrong;
  if (pct             > (s.bestPct    || 0)) s.bestPct    = pct;
  if (score.maxStreak > (s.bestStreak || 0)) s.bestStreak = score.maxStreak;
  localStorage.setItem(BN_STATS_KEY, JSON.stringify(s));
  document.dispatchEvent(new CustomEvent("fiae:gameEnd", { detail: { game: "binary", stats: { correct: score.correct, wrong: score.wrong, maxStreak: score.maxStreak } } }));
  return { ...s, thisPct: pct };
}

function renderStatsCard() {
  const s = loadStats();
  if (!s.games) return "";
  const total   = (s.totalCorrect || 0) + (s.totalWrong || 0);
  const overall = total ? Math.round(s.totalCorrect / total * 100) : 0;
  return `
  <div class="sn-stats-card">
    <h3>📊 Meine Statistiken</h3>
    <div class="sn-stats-grid">
      <div class="sn-stat-item"><span class="sn-stat-num">${s.games}</span><span class="sn-stat-lbl">Runden gespielt</span></div>
      <div class="sn-stat-item"><span class="sn-stat-num">${overall}%</span><span class="sn-stat-lbl">Gesamt-Genauigkeit</span></div>
      <div class="sn-stat-item"><span class="sn-stat-num">${s.bestPct || 0}%</span><span class="sn-stat-lbl">Bester Score</span></div>
      <div class="sn-stat-item"><span class="sn-stat-num">${s.bestStreak || 0}</span><span class="sn-stat-lbl">Bester Streak</span></div>
    </div>
  </div>`;
}

// ─── Generators map ───────────────────────────────────────────────────────────

const GENERATORS = {
  dec_to_bin:  genDecToBin,
  bin_to_dec:  genBinToDec,
  dec_to_hex:  genDecToHex,
  hex_to_dec:  genHexToDec,
  bin_to_hex:  genBinToHex,
  hex_to_bin:  genHexToBin,
  bitwise_and: genBitwiseAnd,
  bitwise_or:  genBitwiseOr,
  bit_count:   genBitCount,
};

function generateQuestion(diff, types) {
  const pool = types.map(t => GENERATORS[t]).filter(Boolean);
  return pool[Math.floor(Math.random() * pool.length)](diff);
}

// ─── State ────────────────────────────────────────────────────────────────────

function freshState() {
  return {
    phase:         "setup",
    difficulty:    "byte",
    allowedTypes:  Object.keys(GENERATORS),
    totalCount:    10,
    timeLimit:     0,
    timerInterval: null,
    index:         0,
    currentQ:      null,
    score:         { correct: 0, wrong: 0, maxStreak: 0 },
    streak:        0,
    userInput:     "",   // accumulated input for numpad/hexpad
  };
}

// ─── Render: Setup ────────────────────────────────────────────────────────────

function renderSetup() {
  return `
  <div class="sn-wrap sn-setup">
    <div class="sn-page-header">
      <button class="bk-back-link" id="bnBack">← Zurück</button>
      <div>
        <h2 class="sn-title">🔢 Binär-Trainer</h2>
        <p class="bk-subtitle">Zahlensysteme & Bitoperationen üben</p>
      </div>
    </div>

    ${renderStatsCard()}

    <div class="sn-config-card">
      <div class="bk-config-section">
        <h3>Schwierigkeit</h3>
        <div class="bk-pills" id="bnDiffPills">
          <button class="bk-pill active" data-diff="nibble">🟢 Nibble <small>0–15 + Masken</small></button>
          <button class="bk-pill" data-diff="byte">🟡 Byte <small>0–255</small></button>
          <button class="bk-pill" data-diff="profi">🔴 Profi <small>0–65535</small></button>
        </div>
      </div>

      <div class="bk-config-section">
        <h3>Fragetypen (Mehrfachauswahl)</h3>
        <div class="bk-pills" id="bnTypePills">
          <button class="bk-pill active" data-type="dec_to_bin">🔵 Dez → Bin</button>
          <button class="bk-pill active" data-type="bin_to_dec">🔵 Bin → Dez</button>
          <button class="bk-pill active" data-type="dec_to_hex">🟣 Dez → Hex</button>
          <button class="bk-pill active" data-type="hex_to_dec">🟣 Hex → Dez</button>
          <button class="bk-pill active" data-type="bin_to_hex">🔗 Bin → Hex</button>
          <button class="bk-pill active" data-type="hex_to_bin">🔗 Hex → Bin</button>
          <button class="bk-pill active" data-type="bitwise_and">⚙️ AND</button>
          <button class="bk-pill active" data-type="bitwise_or">⚙️ OR</button>
          <button class="bk-pill active" data-type="bit_count">1️⃣ Bits zählen</button>
        </div>
      </div>

      <div class="bk-config-section">
        <h3>Anzahl Fragen</h3>
        <div class="bk-pills" id="bnCountPills">
          <button class="bk-pill" data-count="5">5</button>
          <button class="bk-pill active" data-count="10">10</button>
          <button class="bk-pill" data-count="20">20</button>
          <button class="bk-pill" data-count="50">50</button>
          <button class="bk-pill" data-count="999">∞ Endlos</button>
        </div>
      </div>

      <div class="bk-config-section">
        <h3>⏱️ Zeitlimit pro Frage</h3>
        <div class="bk-pills" id="bnTimePills">
          <button class="bk-pill active" data-time="0">Kein Limit</button>
          <button class="bk-pill" data-time="30">30 Sek</button>
          <button class="bk-pill" data-time="20">20 Sek</button>
          <button class="bk-pill" data-time="10">10 Sek</button>
        </div>
      </div>

      <div class="bk-start-area">
        <div class="bk-count-preview">
          <span class="bk-count-num" id="bnCountPreview">10</span>
          <span class="bk-count-label">Fragen</span>
        </div>
        <button class="bk-start-btn" id="bnStartBtn">Starten →</button>
      </div>
    </div>

    <div class="sn-info-section">
      <button class="sn-info-toggle" id="bnRefToggle" type="button" aria-expanded="false">
        📖 Referenztabellen &amp; Umrechnung <span class="sgt-arrow">▾</span>
      </button>
      <div class="sn-info-body hidden" id="bnRefBody">
        <h4>Zweierpotenz-Tabelle (Byte)</h4>
        <table class="sn-ref-table">
          <tr><th>Bit</th><th>7</th><th>6</th><th>5</th><th>4</th><th>3</th><th>2</th><th>1</th><th>0</th></tr>
          <tr><th>Wert</th><td>128</td><td>64</td><td>32</td><td>16</td><td>8</td><td>4</td><td>2</td><td>1</td></tr>
        </table>
        <h4>Nibble-Tabelle (Hex ↔ Bin ↔ Dez)</h4>
        <table class="sn-ref-table">
          <tr><th>Hex</th><th>Bin</th><th>Dez</th><th>Hex</th><th>Bin</th><th>Dez</th></tr>
          <tr><td>0</td><td>0000</td><td>0</td><td>8</td><td>1000</td><td>8</td></tr>
          <tr><td>1</td><td>0001</td><td>1</td><td>9</td><td>1001</td><td>9</td></tr>
          <tr><td>2</td><td>0010</td><td>2</td><td>A</td><td>1010</td><td>10</td></tr>
          <tr><td>3</td><td>0011</td><td>3</td><td>B</td><td>1011</td><td>11</td></tr>
          <tr><td>4</td><td>0100</td><td>4</td><td>C</td><td>1100</td><td>12</td></tr>
          <tr><td>5</td><td>0101</td><td>5</td><td>D</td><td>1101</td><td>13</td></tr>
          <tr><td>6</td><td>0110</td><td>6</td><td>E</td><td>1110</td><td>14</td></tr>
          <tr><td>7</td><td>0111</td><td>7</td><td>F</td><td>1111</td><td>15</td></tr>
        </table>
        <h4>Häufige Byte-Werte (Subnetzmasken)</h4>
        <table class="sn-ref-table">
          <tr><th>Dez</th><th>Binär</th><th>Hex</th><th>Gesetzte Bits</th></tr>
          <tr><td>128</td><td>10000000</td><td>80</td><td>1</td></tr>
          <tr><td>192</td><td>11000000</td><td>C0</td><td>2</td></tr>
          <tr><td>224</td><td>11100000</td><td>E0</td><td>3</td></tr>
          <tr><td>240</td><td>11110000</td><td>F0</td><td>4</td></tr>
          <tr><td>248</td><td>11111000</td><td>F8</td><td>5</td></tr>
          <tr><td>252</td><td>11111100</td><td>FC</td><td>6</td></tr>
          <tr><td>254</td><td>11111110</td><td>FE</td><td>7</td></tr>
          <tr><td>255</td><td>11111111</td><td>FF</td><td>8</td></tr>
        </table>
      </div>
    </div>
  </div>`;
}

// ─── Render: Question ─────────────────────────────────────────────────────────

function renderInputArea(q) {
  if (q.inputMode === "bitpad") {
    const bits = q.bits || 8;
    const labels = Array.from({length: bits}, (_, i) => bits - 1 - i);
    const groups = bits === 16
      ? [labels.slice(0, 8), labels.slice(8)]
      : [labels];
    return `
      <div class="bn-bitpad" id="bnBitPad" data-bits="${bits}">
        ${groups.map((grp, gi) => `
          <div class="bn-bit-group">
            ${grp.map(pos => `
              <div class="bn-bit-col">
                <span class="bn-bit-pos">${pos}</span>
                <button class="bn-bit-btn" data-pos="${pos}" data-val="0" type="button">0</button>
                <span class="bn-bit-weight">${Math.pow(2,pos)}</span>
              </div>`).join("")}
          </div>`).join(`<div class="bn-bit-separator"></div>`)
        }
      </div>
      <div class="bn-bitpad-display" id="bnBitDisplay">
        <span class="bn-bd-label">Dez:</span><span id="bnBdDec">0</span>
        <span class="bn-bd-label">Hex:</span><span id="bnBdHex">00</span>
      </div>
      <button class="bn-pad-btn bn-pad-ok bn-bitpad-submit" id="bnBitSubmit" type="button" style="max-width:280px;width:100%;margin-top:4px">✓ Bestätigen</button>`;
  }

  if (q.inputMode === "hexpad") {
    const digits = q.hexDigits || 2;
    const placeholders = Array.from({length: digits}, (_, i) => `_`).join("");
    return `
      <div class="bn-display-input" id="bnHexDisplay">0x<span id="bnInputVal">${placeholders}</span></div>
      <div class="bn-hexpad" id="bnHexPad">
        ${["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"].map(h =>
          `<button class="bn-pad-btn" data-hex="${h}" type="button">${h}</button>`
        ).join("")}
        <button class="bn-pad-btn bn-pad-del" id="bnHexDel" type="button">⌫</button>
        <button class="bn-pad-btn bn-pad-ok" id="bnHexOk" type="button">✓</button>
      </div>`;
  }

  // numpad
  return `
    <div class="bn-display-input" id="bnNumDisplay"><span id="bnInputVal">_</span></div>
    <div class="bn-numpad" id="bnNumPad">
      ${["7","8","9","4","5","6","1","2","3"].map(d =>
        `<button class="bn-pad-btn" data-num="${d}" type="button">${d}</button>`
      ).join("")}
      <button class="bn-pad-btn bn-pad-del" id="bnNumDel" type="button">⌫</button>
      <button class="bn-pad-btn" data-num="0" type="button">0</button>
      <button class="bn-pad-btn bn-pad-ok" id="bnNumOk" type="button">✓</button>
    </div>`;
}

function renderQuestion(q, index, total, score, streak) {
  const isEndless   = total === 999;
  const progressPct = isEndless ? 0 : Math.round((index / total) * 100);
  const streakBadge = streak >= 3 ? ` &nbsp; 🔥<span class="sn-streak-num">${streak}</span>` : "";

  // Display hints (other representations)
  const hints = Object.entries(q.display || {}).map(([k, v]) => {
    const labels = { dec: "Dez", hex: "Hex", bin: "Bin" };
    return `<span class="bn-hint-chip">${labels[k] ?? k}: <strong>${v}</strong></span>`;
  }).join(" ");

  const timerHtml = bn.timeLimit > 0 ? `
    <div class="sn-timer-wrap">
      <div class="sn-timer-bar"><div class="sn-timer-fill" id="snTimerFill"></div></div>
      <span class="sn-timer-count" id="snTimerCount">${bn.timeLimit}</span>
    </div>` : "";

  return `
  <div class="sn-wrap sn-playing">
    <div class="sn-topbar">
      <button class="bk-icon-btn" id="bnBack" title="Abbrechen">✕</button>
      <div class="bk-progress-group">
        ${isEndless
          ? `<div class="bk-progress-label">Frage ${index + 1} · unbegrenzt</div>`
          : `<div class="bk-progress-bar"><div class="bk-progress-fill" style="width:${progressPct}%"></div></div>
             <div class="bk-progress-label">Frage ${index + 1} / ${total}</div>`
        }
      </div>
      <div class="sn-score-badge">✅ ${score.correct} &nbsp; ❌ ${score.wrong}${streakBadge}</div>
    </div>
    ${timerHtml}
    <div class="sn-card">
      <div class="sn-question-text">${q.prompt}</div>
      ${hints ? `<div class="bn-hints">${hints}</div>` : ""}
      <div id="bnInputArea">
        ${renderInputArea(q)}
      </div>
      <div class="sn-howto">
        <button class="sn-howto-toggle" id="bnHowtoToggle" type="button" aria-expanded="false">
          📐 Wie berechne ich das? <span class="sgt-arrow">▾</span>
        </button>
        <div class="sn-howto-body hidden" id="bnHowtoBody">${HOWTO[q.type] || ""}</div>
      </div>
      <div class="sn-feedback hidden" id="bnFeedback"></div>
    </div>
    <button class="sn-next-btn hidden" id="bnNextBtn">Weiter →</button>
  </div>`;
}

function renderDone(score, total) {
  const pct = total === 999
    ? Math.round((score.correct / Math.max(score.correct + score.wrong, 1)) * 100)
    : Math.round((score.correct / total) * 100);
  const emoji = pct >= 90 ? "🎉" : pct >= 70 ? "💪" : pct >= 50 ? "📚" : "🔁";
  const saved = saveStats(score);
  const isNewBestPct    = saved.bestPct    === saved.thisPct && saved.thisPct > 0;
  const isNewBestStreak = saved.bestStreak === score.maxStreak && score.maxStreak > 0;

  return `
  <div class="sn-wrap sn-done bk-done">
    <div class="bk-done-emoji">${emoji}</div>
    <h2 class="bk-done-title">Trainingsrunde beendet!</h2>
    <p class="bk-done-msg">
      ${total === 999 ? score.correct + score.wrong : total} Fragen · ${pct}% richtig
      ${isNewBestPct ? '<span class="sn-new-best">🏆 Bester Score!</span>' : ""}
    </p>
    <div class="bk-result-grid">
      <div class="bk-result-box good">
        <div class="bk-result-num">${score.correct}</div>
        <div class="bk-result-lbl">Richtig</div>
      </div>
      <div class="bk-result-box bad">
        <div class="bk-result-num">${score.wrong}</div>
        <div class="bk-result-lbl">Falsch</div>
      </div>
      <div class="bk-result-box streak">
        <div class="bk-result-num">${score.maxStreak}${isNewBestStreak ? " 🏆" : ""}</div>
        <div class="bk-result-lbl">Max. Streak</div>
      </div>
    </div>
    <div class="bk-score-bar-wrap">
      <div class="bk-score-bar">
        <div class="bk-score-fill" style="width:0%" data-pct="${pct}"></div>
      </div>
      <div class="bk-score-pct">${pct}%</div>
    </div>
    <div class="sn-alltime-stats">
      <span>🎮 ${saved.games || 1} Runden gespielt</span>
      <span>★ Bester Score: ${saved.bestPct || pct}%</span>
      <span>🔥 Bester Streak: ${saved.bestStreak || score.maxStreak}</span>
    </div>
    <div class="bk-done-actions">
      <button class="bk-start-btn" id="bnRestart">Nochmal spielen</button>
      <button class="bk-start-btn bk-secondary" id="bnBack">← Zurück</button>
    </div>
  </div>`;
}

// ─── Paint ────────────────────────────────────────────────────────────────────

function paint(html) {
  if (!_container) return;
  _container.innerHTML = html;
  bindEvents();
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function clearTimer() {
  if (bn?.timerInterval) { clearInterval(bn.timerInterval); bn.timerInterval = null; }
}

function startTimer() {
  clearTimer();
  if (!bn?.timeLimit) return;
  let remaining = bn.timeLimit;
  const upd = () => {
    const fill  = document.getElementById("snTimerFill");
    const count = document.getElementById("snTimerCount");
    const pct   = Math.max(0, remaining / bn.timeLimit * 100);
    if (fill) {
      fill.style.width = pct + "%";
      fill.className = "sn-timer-fill" +
        (remaining <= 5 ? " sn-timer-crit" : remaining <= Math.ceil(bn.timeLimit / 3) ? " sn-timer-warn" : "");
    }
    if (count) count.textContent = remaining;
  };
  upd();
  bn.timerInterval = setInterval(() => {
    remaining--;
    upd();
    if (remaining > 0) return;
    clearTimer();
    submitAnswer("__timeout__");
  }, 1000);
}

// ─── Input state helpers ──────────────────────────────────────────────────────

function getBitpadValue() {
  const bits = bn.currentQ?.bits || 8;
  let val = 0;
  document.querySelectorAll(".bn-bit-btn").forEach(btn => {
    if (btn.dataset.val === "1") val |= (1 << parseInt(btn.dataset.pos));
  });
  return val >>> 0;
}

function updateBitDisplay() {
  const val = getBitpadValue();
  const bits = bn.currentQ?.bits || 8;
  const decEl = document.getElementById("bnBdDec");
  const hexEl = document.getElementById("bnBdHex");
  if (decEl) decEl.textContent = val;
  if (hexEl) hexEl.textContent = toHex(val, bits);
}

function updatePadDisplay(val) {
  const el = document.getElementById("bnInputVal");
  if (!el) return;
  const q = bn.currentQ;
  if (q.inputMode === "hexpad") {
    const d = q.hexDigits || 2;
    const padded = val.padStart(d, "_");
    el.textContent = "0x" === el.parentElement?.textContent.slice(0, 2)
      ? padded
      : padded;
    el.textContent = padded;
  } else {
    el.textContent = val || "_";
  }
}

// ─── Answer submission ────────────────────────────────────────────────────────

function normalize(s) { return s.trim().replace(/\s+/g, "").toUpperCase(); }

function submitAnswer(userRaw) {
  const q = bn.currentQ;
  clearTimer();

  let userVal;
  if (userRaw === "__timeout__") {
    userVal = "";
  } else if (q.inputMode === "bitpad") {
    userVal = Array.from({length: q.bits || 8}, (_, i) => {
      const pos = (q.bits || 8) - 1 - i;
      const btn = document.querySelector(`.bn-bit-btn[data-pos="${pos}"]`);
      return btn?.dataset.val || "0";
    }).join("");
  } else {
    userVal = userRaw || bn.userInput;
  }

  const ok = normalize(userVal) === normalize(q.answer);

  // Disable inputs
  document.querySelectorAll(".bn-bit-btn, .bn-pad-btn").forEach(b => { b.disabled = true; });

  // Show result on bitpad
  if (q.inputMode === "bitpad") {
    const ansArr = [...q.answer];
    document.querySelectorAll(".bn-bit-btn").forEach(btn => {
      const pos    = parseInt(btn.dataset.pos);
      const bits   = q.bits || 8;
      const idx    = bits - 1 - pos;
      const correct = ansArr[idx];
      const isRight = btn.dataset.val === correct;
      btn.classList.toggle("bn-bit-correct", isRight);
      btn.classList.toggle("bn-bit-wrong", !isRight);
      btn.textContent = correct; // show correct value
    });
  }

  showFeedback(ok, q.explanation, !ok ? q.answer : null);
  recordResult(ok);
}

function showFeedback(ok, explanation, correctAnswer) {
  const fb = document.getElementById("bnFeedback");
  if (!fb) return;
  const badge = ok
    ? `<span class="sn-fb-badge sn-fb-correct">✅ Richtig!</span>`
    : `<span class="sn-fb-badge sn-fb-wrong">❌ Falsch</span>`;
  const corrHtml = (!ok && correctAnswer)
    ? `<div class="sn-fb-correct-val">Richtige Antwort: <strong>${escapeHtml(correctAnswer)}</strong></div>`
    : "";
  fb.innerHTML = `
    <div class="sn-fb-inner">
      ${badge}${corrHtml}
      <div class="sn-fb-expl">${explanation}</div>
    </div>`;
  fb.classList.remove("hidden");
  document.getElementById("bnNextBtn")?.classList.remove("hidden");
}

function recordResult(ok) {
  if (ok) {
    bn.score.correct++;
    bn.streak++;
    if (bn.streak > bn.score.maxStreak) bn.score.maxStreak = bn.streak;
  } else {
    bn.score.wrong++;
    bn.streak = 0;
  }
}

function nextQuestion() {
  bn.index++;
  bn.userInput = "";
  const done = bn.totalCount !== 999 && bn.index >= bn.totalCount;
  if (done) {
    bn.phase = "done";
    paint(renderDone(bn.score, bn.totalCount));
    setTimeout(() => {
      const fill = document.querySelector(".bk-score-fill");
      if (fill) fill.style.width = fill.dataset.pct + "%";
    }, 80);
    return;
  }
  bn.currentQ = generateQuestion(bn.difficulty, bn.allowedTypes);
  paint(renderQuestion(bn.currentQ, bn.index, bn.totalCount, bn.score, bn.streak));
  setTimeout(startTimer, 80);
}

function startGame() {
  bn.phase    = "playing";
  bn.index    = 0;
  bn.userInput = "";
  bn.score    = { correct: 0, wrong: 0, maxStreak: 0 };
  bn.streak   = 0;
  bn.currentQ = generateQuestion(bn.difficulty, bn.allowedTypes);
  paint(renderQuestion(bn.currentQ, bn.index, bn.totalCount, bn.score, bn.streak));
  setTimeout(startTimer, 80);
}

// ─── Event binding ────────────────────────────────────────────────────────────

function bindEvents() {
  const el = id => document.getElementById(id);

  document.querySelectorAll("#bnBack").forEach(btn =>
    btn.addEventListener("click", () => { cleanupBinary(); _onBack && _onBack(); })
  );

  // Setup phase
  if (bn?.phase === "setup") {
    el("bnRefToggle")?.addEventListener("click", () => {
      const body = el("bnRefBody");
      const open = body.classList.toggle("hidden");
      el("bnRefToggle").setAttribute("aria-expanded", String(!open));
      el("bnRefToggle").querySelector(".sgt-arrow").style.transform = open ? "" : "rotate(180deg)";
    });

    el("bnDiffPills")?.addEventListener("click", e => {
      const b = e.target.closest("[data-diff]");
      if (!b) return;
      el("bnDiffPills").querySelectorAll(".bk-pill").forEach(p => p.classList.remove("active"));
      b.classList.add("active");
      bn.difficulty = b.dataset.diff;
    });

    el("bnTypePills")?.addEventListener("click", e => {
      const b = e.target.closest("[data-type]");
      if (!b) return;
      const active = [...el("bnTypePills").querySelectorAll(".bk-pill.active")];
      if (b.classList.contains("active") && active.length <= 1) return;
      b.classList.toggle("active");
      bn.allowedTypes = [...el("bnTypePills").querySelectorAll(".bk-pill.active")].map(p => p.dataset.type);
    });

    el("bnCountPills")?.addEventListener("click", e => {
      const b = e.target.closest("[data-count]");
      if (!b) return;
      el("bnCountPills").querySelectorAll(".bk-pill").forEach(p => p.classList.remove("active"));
      b.classList.add("active");
      bn.totalCount = Number(b.dataset.count);
      const prev = el("bnCountPreview");
      if (prev) prev.textContent = bn.totalCount === 999 ? "∞" : bn.totalCount;
    });

    el("bnTimePills")?.addEventListener("click", e => {
      const b = e.target.closest("[data-time]");
      if (!b) return;
      el("bnTimePills").querySelectorAll(".bk-pill").forEach(p => p.classList.remove("active"));
      b.classList.add("active");
      bn.timeLimit = Number(b.dataset.time);
    });

    el("bnStartBtn")?.addEventListener("click", startGame);
    return;
  }

  if (bn?.phase === "done") {
    el("bnRestart")?.addEventListener("click", () => {
      bn = freshState();
      paint(renderSetup());
    });
    return;
  }

  // Playing phase
  const q = bn.currentQ;

  // How-to toggle
  el("bnHowtoToggle")?.addEventListener("click", () => {
    const body = el("bnHowtoBody");
    const open = body.classList.toggle("hidden");
    el("bnHowtoToggle").setAttribute("aria-expanded", String(!open));
    el("bnHowtoToggle").querySelector(".sgt-arrow").style.transform = open ? "" : "rotate(180deg)";
  });

  // Next question
  el("bnNextBtn")?.addEventListener("click", nextQuestion);

  if (q.inputMode === "bitpad") {
    // Bit toggle buttons
    document.querySelectorAll(".bn-bit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        const newVal = btn.dataset.val === "0" ? "1" : "0";
        btn.dataset.val  = newVal;
        btn.textContent  = newVal;
        btn.classList.toggle("bn-bit-active", newVal === "1");
        updateBitDisplay();
      });
    });

    // Keyboard support (desktop)
    const handleKey = (e) => {
      if (e.key === "Enter") {
        const currentVal = Array.from({length: q.bits || 8}, (_, i) => {
          const pos = (q.bits || 8) - 1 - i;
          return document.querySelector(`.bn-bit-btn[data-pos="${pos}"]`)?.dataset.val || "0";
        }).join("");
        submitAnswer(currentVal);
        document.removeEventListener("keydown", handleKey);
      }
    };
    document.addEventListener("keydown", handleKey);

    // Submit via a button we render below the pad (only after first toggle)
    const submitBitBtn = document.getElementById("bnBitSubmit");
    submitBitBtn?.addEventListener("click", () => {
      const val = Array.from({length: q.bits || 8}, (_, i) => {
        const pos = (q.bits || 8) - 1 - i;
        return document.querySelector(`.bn-bit-btn[data-pos="${pos}"]`)?.dataset.val || "0";
      }).join("");
      submitAnswer(val);
    });

  } else if (q.inputMode === "hexpad") {
    const maxDigits = q.hexDigits || 2;
    let buf = "";

    const refresh = () => updatePadDisplay(buf);

    el("bnHexPad")?.addEventListener("click", e => {
      const btn = e.target.closest("[data-hex]");
      if (btn && buf.length < maxDigits) {
        buf += btn.dataset.hex;
        refresh();
      }
      if (e.target.id === "bnHexDel" || e.target.closest("#bnHexDel")) {
        buf = buf.slice(0, -1);
        refresh();
      }
      if (e.target.id === "bnHexOk" || e.target.closest("#bnHexOk")) {
        if (buf.length > 0) submitAnswer(buf.padStart(maxDigits, "0"));
      }
    });

    document.addEventListener("keydown", function hexKey(e) {
      if (document.getElementById("bnHexPad")) {
        const k = e.key.toUpperCase();
        if (/^[0-9A-F]$/.test(k) && buf.length < maxDigits) { buf += k; refresh(); }
        if (e.key === "Backspace") { buf = buf.slice(0, -1); refresh(); }
        if (e.key === "Enter" && buf.length > 0) {
          submitAnswer(buf.padStart(maxDigits, "0"));
          document.removeEventListener("keydown", hexKey);
        }
      } else {
        document.removeEventListener("keydown", hexKey);
      }
    });

  } else {
    // numpad
    let buf = "";

    const refresh = () => {
      const el2 = document.getElementById("bnInputVal");
      if (el2) el2.textContent = buf || "_";
    };

    el("bnNumPad")?.addEventListener("click", e => {
      const btn = e.target.closest("[data-num]");
      if (btn && buf.length < 6) { buf += btn.dataset.num; refresh(); }
      if (e.target.id === "bnNumDel" || e.target.closest("#bnNumDel")) { buf = buf.slice(0, -1); refresh(); }
      if (e.target.id === "bnNumOk"  || e.target.closest("#bnNumOk"))  { if (buf.length > 0) submitAnswer(buf); }
    });

    document.addEventListener("keydown", function numKey(e) {
      if (document.getElementById("bnNumPad")) {
        if (/^\d$/.test(e.key) && buf.length < 6) { buf += e.key; refresh(); }
        if (e.key === "Backspace") { buf = buf.slice(0, -1); refresh(); }
        if (e.key === "Enter" && buf.length > 0) {
          submitAnswer(buf);
          document.removeEventListener("keydown", numKey);
        }
      } else {
        document.removeEventListener("keydown", numKey);
      }
    });
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function launchBinary(container, onBack) {
  _container = container;
  _onBack    = onBack;
  bn         = freshState();
  paint(renderSetup());
}

export function cleanupBinary() {
  clearTimer();
  bn = null;
}
