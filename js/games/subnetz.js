/**
 * Subnetz-Trainer – Interaktives IPv4-Subnetting-Spiel
 * Question types:
 *   netz_broadcast  – Given IP/CIDR → Netzadresse + Broadcastadresse
 *   first_last_host – Given IP/CIDR → first + last usable host
 *   hosts           – Given /CIDR   → usable hosts
 *   needed_prefix   – Given N hosts → minimum /CIDR
 *   wildcard_mask   – Given /CIDR   → wildcard mask
 *   cidr_to_mask    – Given /CIDR   → subnet mask
 *   mask_to_cidr    – Given mask    → /CIDR prefix
 *   subnets_count   – Given /base split to /new → how many subnets?
 *   same_net        – Two IPs + CIDR → same subnet? (ja/nein)
 */

import { escapeHtml } from "../utils.js";

let _container = null;
let _onBack    = null;
let sn         = null;

// ─── Subnet Math ──────────────────────────────────────────────────────────────

function cidrToMaskNum(cidr) { return cidr === 0 ? 0 : ((~0 << (32 - cidr)) >>> 0); }
function cidrToMaskStr(cidr) { return numToIp(cidrToMaskNum(cidr)); }
function wildcardStr(cidr)   { return numToIp((~cidrToMaskNum(cidr)) >>> 0); }
function ipToNum(ip) {
  const p = ip.split(".").map(Number);
  return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
}
function numToIp(n) { return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join("."); }
function networkAddr(ip, cidr) {
  return numToIp((ipToNum(ip) & cidrToMaskNum(cidr)) >>> 0);
}
function broadcastAddr(ip, cidr) {
  const net  = (ipToNum(ip) & cidrToMaskNum(cidr)) >>> 0;
  const wild = (~cidrToMaskNum(cidr)) >>> 0;
  return numToIp((net | wild) >>> 0);
}
function firstHost(ip, cidr) {
  if (cidr >= 31) return networkAddr(ip, cidr);
  return numToIp(((ipToNum(ip) & cidrToMaskNum(cidr)) >>> 0) + 1);
}
function lastHost(ip, cidr) {
  if (cidr >= 31) return broadcastAddr(ip, cidr);
  const bcast = ((ipToNum(ip) & cidrToMaskNum(cidr)) >>> 0) | ((~cidrToMaskNum(cidr)) >>> 0);
  return numToIp((bcast - 1) >>> 0);
}
function usableHosts(cidr) {
  if (cidr >= 31) return cidr === 31 ? 2 : 1;
  return Math.pow(2, 32 - cidr) - 2;
}
function maskToCidr(mask) {
  let n = ipToNum(mask), c = 0;
  while (n & 0x80000000) { c++; n = (n << 1) >>> 0; }
  return c;
}
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomIp() {
  const f = randomInt(1, 223);
  if (f === 127) return randomIp();
  return `${f}.${randomInt(0,255)}.${randomInt(0,255)}.${randomInt(1,254)}`;
}
function isValidIp(s) {
  const p = s.trim().split(".");
  if (p.length !== 4) return false;
  return p.every(x => /^\d+$/.test(x) && Number(x) >= 0 && Number(x) <= 255);
}
function isValidSubnetMask(mask) {
  if (!isValidIp(mask)) return false;
  const n = ipToNum(mask) >>> 0;
  if (n === 0 || n === 0xffffffff) return true; // /0 and /32
  const inv = (~n) >>> 0;
  // Valid if inverse has contiguous 1-bits from LSB only (000..0011..11)
  return ((inv + 1) & inv) === 0;
}

// ─── Difficulty ranges ────────────────────────────────────────────────────────

const DIFFICULTY_RANGES = {
  easy:   { min: 24, max: 24 },
  medium: { min: 20, max: 28 },
  hard:   { min: 8,  max: 30 },
  profi:  { min: 1,  max: 30 },
};

// ─── Question Generators ──────────────────────────────────────────────────────

function genNetzBroadcast(diff) {
  const { min, max } = DIFFICULTY_RANGES[diff];
  const cidr = randomInt(min, max);
  const ip   = randomIp();
  const net  = networkAddr(ip, cidr);
  const bcast = broadcastAddr(ip, cidr);
  return {
    type: "netz_broadcast",
    prompt: `IP: <strong>${escapeHtml(ip)}/${cidr}</strong>`,
    fields: [
      { label: "Netzadresse",      key: "net",   answer: net   },
      { label: "Broadcastadresse", key: "bcast", answer: bcast },
    ],
    explanation:
      `<strong>Schritt 1 – Subnetzmaske:</strong> /${cidr} → <strong>${cidrToMaskStr(cidr)}</strong><br>` +
      `<strong>Schritt 2 – Netzadresse:</strong> IP AND Maske = <strong>${net}</strong><br>` +
      `<strong>Schritt 3 – Broadcast:</strong> Netz OR Wildcard (${wildcardStr(cidr)}) = <strong>${bcast}</strong><br>` +
      `<strong>Nutzbare Hosts:</strong> 2<sup>${32-cidr}</sup> − 2 = <strong>${usableHosts(cidr).toLocaleString()}</strong>`,
  };
}

function genFirstLastHost(diff) {
  const { min, max } = DIFFICULTY_RANGES[diff];
  const cidr  = randomInt(Math.max(min,1), Math.min(max,30));
  const ip    = randomIp();
  const net   = networkAddr(ip, cidr);
  const bcast = broadcastAddr(ip, cidr);
  const fh    = firstHost(ip, cidr);
  const lh    = lastHost(ip, cidr);
  return {
    type: "first_last_host",
    prompt: `IP: <strong>${escapeHtml(ip)}/${cidr}</strong>`,
    fields: [
      { label: "Erster nutzbarer Host", key: "first", answer: fh },
      { label: "Letzter nutzbarer Host", key: "last",  answer: lh },
    ],
    explanation:
      `Netzadresse: <strong>${net}</strong> (nicht nutzbar)<br>` +
      `Broadcastadresse: <strong>${bcast}</strong> (nicht nutzbar)<br>` +
      `Erster Host = Netzadresse + 1 = <strong>${fh}</strong><br>` +
      `Letzter Host = Broadcast − 1 = <strong>${lh}</strong>`,
  };
}

function genHosts(diff) {
  const { min, max } = DIFFICULTY_RANGES[diff];
  const cidr  = randomInt(min, max);
  const hosts = usableHosts(cidr);
  return {
    type: "hosts",
    prompt: `Wie viele nutzbare Hosts hat ein <strong>/${cidr}</strong>-Netz?`,
    fields: [{ label: "Anzahl Hosts", key: "hosts", answer: String(hosts) }],
    explanation:
      `Formel: 2<sup>${32-cidr}</sup> − 2 = ${Math.pow(2,32-cidr)} − 2 = <strong>${hosts.toLocaleString()}</strong><br>` +
      `(${32-cidr} Host-Bits; minus Netz- und Broadcastadresse)`,
  };
}

function genNeededPrefix(diff) {
  const { min, max } = DIFFICULTY_RANGES[diff];
  const cidr  = randomInt(Math.max(min,2), Math.min(max,30));
  const hosts = usableHosts(cidr);
  const needed = cidr <= 2 ? hosts : randomInt(Math.max(1, usableHosts(cidr+1)+1), hosts);
  let answerCidr = 1;
  for (let x = 30; x >= 1; x--) {
    if (usableHosts(x) >= needed) { answerCidr = x; break; }
  }
  return {
    type: "needed_prefix",
    prompt: `Ein Netz soll <strong>${needed.toLocaleString()}</strong> nutzbare Hosts haben.<br>Welcher ist der <em>groesste</em> CIDR-Präfix (= kleinstes Netz), der ausreicht?`,
    fields: [{ label: "CIDR-Präfix (nur Zahl)", key: "cidr", answer: String(answerCidr) }],
    explanation:
      `Formel: 2<sup>(32 − Präfix)</sup> − 2 ≥ ${needed.toLocaleString()}<br>` +
      `/${answerCidr}: 2<sup>${32-answerCidr}</sup> − 2 = <strong>${usableHosts(answerCidr).toLocaleString()}</strong> ≥ ${needed} ✅<br>` +
      (answerCidr < 30 ? `/${answerCidr+1}: 2<sup>${32-answerCidr-1}</sup> − 2 = ${usableHosts(answerCidr+1).toLocaleString()} < ${needed} ❌` : ""),
  };
}

function genWildcardMask(diff) {
  const pool = {
    easy:  [24, 16],
    medium:[20,22,25,26,27,28],
    hard:  [8,10,12,18,29,30],
    profi: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
  };
  const list = pool[diff] || pool.medium;
  const cidr = list[randomInt(0, list.length-1)];
  const wc   = wildcardStr(cidr);
  return {
    type: "wildcard_mask",
    prompt: `Was ist die <strong>Wildcard-Maske</strong> für <strong>/${cidr}</strong>?`,
    fields: [{ label: "Wildcard-Maske", key: "wildcard", answer: wc }],
    explanation:
      `Subnetzmaske für /${cidr}: <strong>${cidrToMaskStr(cidr)}</strong><br>` +
      `Wildcard = 255.255.255.255 − ${cidrToMaskStr(cidr)} = <strong>${wc}</strong><br>` +
      `(bitweises NOT der Subnetzmaske – wird z.B. in ACLs und OSPF verwendet)`,
  };
}

function genCidrToMask(diff) {
  const pool = {
    easy:  [24,16],
    medium:[20,22,25,26,27,28],
    hard:  [8,10,12,18,29,30],
    profi: [1,2,4,8,12,16,18,20,22,24,25,26,27,28,29,30],
  };
  const list = pool[diff] || pool.medium;
  const cidr = list[randomInt(0, list.length-1)];
  const mask = cidrToMaskStr(cidr);
  return {
    type: "cidr_to_mask",
    prompt: `Was ist die Subnetzmaske für <strong>/${cidr}</strong>?`,
    fields: [{ label: "Subnetzmaske", key: "mask", answer: mask }],
    explanation:
      `/${cidr} → ${cidr} führende Einsen, ${32-cidr} Nullen<br>` +
      `Dezimal: <strong>${mask}</strong>`,
  };
}

function genMaskToCidr(diff) {
  const pool = {
    easy:  [24,16],
    medium:[20,22,25,26,27,28],
    hard:  [8,10,12,18,29,30],
    profi: [1,2,4,8,16,20,22,24,25,26,27,28,29,30],
  };
  const list = pool[diff] || pool.medium;
  const cidr = list[randomInt(0, list.length-1)];
  const mask = cidrToMaskStr(cidr);
  return {
    type: "mask_to_cidr",
    prompt: `Subnetzmaske: <strong>${mask}</strong><br>Welcher CIDR-Präfix?`,
    fields: [{ label: "Präfix (nur Zahl)", key: "cidr", answer: String(cidr) }],
    explanation:
      `${mask} hat <strong>${cidr}</strong> führende Einsen → <strong>/${cidr}</strong>`,
  };
}

function genSubnetsCount(diff) {
  const ranges = {
    easy:   { base: [8,16,24],       delta: [2,4,8] },
    medium: { base: [16,20,24],      delta: [2,3,4,5,6,7,8] },
    hard:   { base: [8,12,16,20,24], delta: [2,3,4,5,6,7,8,9,10] },
    profi:  { base: [4,8,12,16,20],  delta: [2,3,4,5,6,7,8,9,10,11,12] },
  };
  const r = ranges[diff] || ranges.medium;
  const base  = r.base[randomInt(0, r.base.length-1)];
  const delta = r.delta[randomInt(0, r.delta.length-1)];
  const newPrefix = base + delta;
  if (newPrefix > 30) return genSubnetsCount(diff);
  const count = Math.pow(2, delta);
  return {
    type: "subnets_count",
    prompt:
      `Ein <strong>/${base}</strong>-Netz wird in <strong>/${newPrefix}</strong>-Subnetze aufgeteilt.<br>` +
      `Wie viele Subnetze entstehen?`,
    fields: [{ label: "Anzahl Subnetze", key: "count", answer: String(count) }],
    explanation:
      `Bits für Subnetze = neuer Präfix − alter Präfix = ${newPrefix} − ${base} = <strong>${delta}</strong><br>` +
      `Anzahl = 2<sup>${delta}</sup> = <strong>${count}</strong><br>` +
      `Jedes Subnetz hat ${usableHosts(newPrefix).toLocaleString()} nutzbare Hosts.`,
  };
}

function genSameNet(diff) {
  const { min, max } = DIFFICULTY_RANGES[diff];
  const cidr = randomInt(min, max);
  const ip1  = randomIp();
  const net1 = networkAddr(ip1, cidr);
  const sameNetwork = Math.random() < 0.5;
  let ip2;
  if (sameNetwork) {
    const net1Num = ipToNum(net1);
    const bcast1  = ipToNum(broadcastAddr(ip1, cidr));
    let candidate, tries = 0;
    do { candidate = numToIp(randomInt(net1Num+1, bcast1-1) >>> 0); tries++; }
    while (candidate === ip1 && tries < 20);
    ip2 = candidate;
  } else {
    let candidate, tries = 0;
    do { candidate = randomIp(); tries++; }
    while (networkAddr(candidate, cidr) === net1 && tries < 30);
    ip2 = candidate;
  }
  const answer = sameNetwork ? "ja" : "nein";
  return {
    type: "same_net",
    prompt:
      `IP 1: <strong>${escapeHtml(ip1)}</strong><br>` +
      `IP 2: <strong>${escapeHtml(ip2)}</strong><br>` +
      `Präfix: <strong>/${cidr}</strong><br>Sind beide im gleichen Subnetz?`,
    answer,
    net1,
    net2: networkAddr(ip2, cidr),
    explanation:
      `Netz von IP 1: <strong>${net1}/${cidr}</strong><br>` +
      `Netz von IP 2: <strong>${networkAddr(ip2, cidr)}/${cidr}</strong><br>` +
      (sameNetwork ? `→ <strong>Ja</strong>, selbes Subnetz.` : `→ <strong>Nein</strong>, unterschiedliche Subnetze.`),
  };
}

function genIpClass(diff) {
  const ip   = randomIp();
  const octs = ip.split(".").map(Number);
  const f1   = octs[0], f2 = octs[1];
  let cls;
  if (f1 < 128) cls = "A";
  else if (f1 < 192) cls = "B";
  else cls = "C"; // randomIp caps first octet at 223

  const isPrivate =
    (f1 === 10) ||
    (f1 === 172 && f2 >= 16 && f2 <= 31) ||
    (f1 === 192 && f2 === 168);
  const addrType = isPrivate ? "privat" : "öffentlich";

  const clsInfo = {
    A: `1–126 (Standard-Maske /8, erste Hälfte des Adressraums)`,
    B: `128–191 (Standard-Maske /16)`,
    C: `192–223 (Standard-Maske /24, kleinster Klassiker-Block)`,
  };
  const privNote = isPrivate
    ? `Liegt in einem RFC-1918-Bereich: 10.0.0.0/8 · 172.16.0.0/12 · 192.168.0.0/16`
    : `Liegt NICHT in den privaten RFC-1918-Bereichen → öffentlich routbar.`;

  return {
    type: "ip_class",
    prompt: `IP: <strong>${escapeHtml(ip)}</strong>`,
    fields: [
      { label: "IP-Klasse", key: "cls", answer: cls, choices: ["A", "B", "C"] },
      { label: "Adresstyp", key: "addrtype", answer: addrType, choices: ["privat", "öffentlich"] },
    ],
    explanation:
      `Erstes Oktett <strong>${f1}</strong> → Klasse <strong>${cls}</strong>: ${clsInfo[cls]}<br>` +
      `Adresstyp: <strong>${addrType}</strong> – ${privNote}`,
  };
}

function genBinaryOctet(diff) {
  const pools = {
    easy:   [0, 128, 192, 224, 240, 248, 252, 254, 255],
    medium: [0, 128, 192, 224, 240, 248, 252, 254, 255, 10, 172, 168],
    hard:   Array.from({length: 16}, (_, i) => randomInt(1, 254)),
    profi:  Array.from({length: 16}, (_, i) => randomInt(0, 255)),
  };
  const list = pools[diff] || pools.medium;
  const dec  = list[randomInt(0, list.length - 1)];
  const bin  = dec.toString(2).padStart(8, "0");

  // Generate 3 wrong answers – different binary strings
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const w = randomInt(0, 255);
    if (w !== dec) wrongs.add(w);
  }
  const choices = [bin, ...[...wrongs].map(w => w.toString(2).padStart(8, "0"))]
    .sort(() => Math.random() - 0.5);

  return {
    type: "binary_octet",
    prompt: `Dezimal <strong>${dec}</strong> in Binär (8 Bit)?`,
    fields: [
      { label: "Binärdarstellung", key: "bin", answer: bin, choices },
    ],
    explanation:
      `${dec} = ${bin.split("").map((b,i) => `${b}·2<sup>${7-i}</sup>`).filter((_,i)=>bin[i]==="1").join(" + ") || "0"}<br>` +
      `Ergebnis: <strong>${bin}</strong> (dezimal ${parseInt(bin,2)})`,
  };
}

const GENERATORS = {
  netz_broadcast:  genNetzBroadcast,
  first_last_host: genFirstLastHost,
  hosts:           genHosts,
  needed_prefix:   genNeededPrefix,
  wildcard_mask:   genWildcardMask,
  cidr_to_mask:    genCidrToMask,
  mask_to_cidr:    genMaskToCidr,
  subnets_count:   genSubnetsCount,
  same_net:        genSameNet,
  ip_class:        genIpClass,
  binary_octet:    genBinaryOctet,
};

function generateQuestion(diff, allowedTypes) {
  const pool = allowedTypes.map(t => GENERATORS[t]).filter(Boolean);
  const gen  = pool[Math.floor(Math.random() * pool.length)];
  return gen(diff);
}

// Keys whose answer is an IP address (→ rendered as 4 octet inputs on mobile)
const IP_KEYS = new Set(["net", "bcast", "first", "last", "mask", "wildcard"]);

// ─── localStorage Stats ─────────────────────────────────────────────────────────────────────────────

const SN_STATS_KEY = "fiae_sn_stats";

function loadStats() {
  try { return JSON.parse(localStorage.getItem(SN_STATS_KEY) || "null") || {}; }
  catch { return {}; }
}

function saveStats(score, total) {
  const s = loadStats();
  const answered = score.correct + score.wrong;
  const pct = answered ? Math.round(score.correct / answered * 100) : 0;
  s.games        = (s.games        || 0) + 1;
  s.totalCorrect = (s.totalCorrect || 0) + score.correct;
  s.totalWrong   = (s.totalWrong   || 0) + score.wrong;
  if (pct            > (s.bestPct    || 0)) s.bestPct    = pct;
  if (score.maxStreak > (s.bestStreak || 0)) s.bestStreak = score.maxStreak;
  localStorage.setItem(SN_STATS_KEY, JSON.stringify(s));
  document.dispatchEvent(new CustomEvent("fiae:gameEnd", { detail: { game: "subnetz", stats: { correct: score.correct, wrong: score.wrong, maxStreak: score.maxStreak } } }));
  return { ...s, thisPct: pct };
}

function renderStatsCard() {
  const s = loadStats();
  if (!s.games) return "";
  const total    = (s.totalCorrect || 0) + (s.totalWrong || 0);
  const overall  = total ? Math.round(s.totalCorrect / total * 100) : 0;
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

// ─── Explanation + Calculator HTML ───────────────────────────────────────────

const EXPLANATION_HTML = `
<div class="sn-info-section">
  <button class="sn-info-toggle" id="snInfoToggle" type="button" aria-expanded="false">
    📖 Subnetting erklärt &amp; Referenz <span class="sgt-arrow">▾</span>
  </button>
  <div class="sn-info-body hidden" id="snInfoBody">
    <h4>Was ist ein Subnetz?</h4>
    <p>Ein CIDR-Präfix (z.B. <code>/24</code>) teilt eine IP in Netz-Anteil und Host-Anteil.
    Die ersten <em>n</em> Bits gehören zum Netz, der Rest zu den Hosts.</p>
    <h4>Wichtige Formeln</h4>
    <table class="sn-ref-table">
      <tr><th>Begriff</th><th>Berechnung</th></tr>
      <tr><td>Subnetzmaske</td><td>n führende Einsen → z.B. /24 = 255.255.255.0</td></tr>
      <tr><td>Wildcard-Maske</td><td>255.255.255.255 − Subnetzmaske</td></tr>
      <tr><td>Netzadresse</td><td>IP <strong>AND</strong> Subnetzmaske</td></tr>
      <tr><td>Broadcast</td><td>Netzadresse <strong>OR</strong> Wildcard</td></tr>
      <tr><td>Erster Host</td><td>Netzadresse + 1</td></tr>
      <tr><td>Letzter Host</td><td>Broadcast − 1</td></tr>
      <tr><td>Nutzbare Hosts</td><td>2<sup>(32 − Präfix)</sup> − 2</td></tr>
      <tr><td>Anzahl Subnetze</td><td>2<sup>(neuer Präfix − alter Präfix)</sup></td></tr>
    </table>
    <h4>Häufige Masken</h4>
    <table class="sn-ref-table">
      <tr><th>CIDR</th><th>Maske</th><th>Hosts</th></tr>
      <tr><td>/8</td> <td>255.0.0.0</td>        <td>16.777.214</td></tr>
      <tr><td>/16</td><td>255.255.0.0</td>      <td>65.534</td></tr>
      <tr><td>/24</td><td>255.255.255.0</td>    <td>254</td></tr>
      <tr><td>/25</td><td>255.255.255.128</td>  <td>126</td></tr>
      <tr><td>/26</td><td>255.255.255.192</td>  <td>62</td></tr>
      <tr><td>/27</td><td>255.255.255.224</td>  <td>30</td></tr>
      <tr><td>/28</td><td>255.255.255.240</td>  <td>14</td></tr>
      <tr><td>/29</td><td>255.255.255.248</td>  <td>6</td></tr>
      <tr><td>/30</td><td>255.255.255.252</td>  <td>2</td></tr>
    </table>
    <h4>Rechenbeispiel: 192.168.10.130/26</h4>
    <ol>
      <li>Maske: /26 → <strong>255.255.255.192</strong></li>
      <li>Netzadresse: 192.168.10.130 AND 255.255.255.192 = <strong>192.168.10.128</strong></li>
      <li>Wildcard: 0.0.0.63</li>
      <li>Broadcast: 192.168.10.128 OR 0.0.0.63 = <strong>192.168.10.191</strong></li>
      <li>Hosts: 2<sup>6</sup> − 2 = <strong>62</strong></li>
      <li>Erster Host: <strong>192.168.10.129</strong>, Letzter: <strong>192.168.10.190</strong></li>
    </ol>
  </div>
</div>`;

const CALCULATOR_HTML = `
<div class="sn-info-section">
  <button class="sn-info-toggle" id="snCalcToggle" type="button" aria-expanded="false">
    🧮 Subnet-Rechner <span class="sgt-arrow">▾</span>
  </button>
  <div class="sn-info-body hidden" id="snCalcBody">
    <div class="sn-calc-inputs">
      <div class="sn-input-row">
        <label class="sn-label">IP-Adresse</label>
        <input type="text" id="calcIp" class="sn-input" placeholder="z.B. 192.168.1.100"
               autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
      </div>
      <div class="sn-input-row">
        <label class="sn-label">CIDR-Präfix oder Subnetzmaske</label>
        <input type="text" id="calcCidr" class="sn-input" placeholder="z.B. 24 oder 255.255.255.0"
               autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
      </div>
    </div>
    <div class="sn-calc-result hidden" id="snCalcResult"></div>
  </div>
</div>`;

// ─── Per-question how-to panels ─────────────────────────────────────────────

function getHowToHtml(q) {
  const cidrMatch = q.prompt.match(/\/(\d+)/);
  const cidr = cidrMatch ? Number(cidrMatch[1]) : null;

  const content = {
    netz_broadcast: `
      <p><strong>Schritt 1 – Subnetzmaske bestimmen</strong><br>
      CIDR-Präfix → n führende Einsen.<br>
      z.B. /26 → 255.255.255.192</p>
      <p><strong>Schritt 2 – Netzadresse</strong><br>
      IP <code>AND</code> Subnetzmaske (bitweise UND jedes Oktetts)<br>
      z.B. 192.168.1.130 AND 255.255.255.192 = <strong>192.168.1.128</strong></p>
      <p><strong>Schritt 3 – Broadcastadresse</strong><br>
      Netzadresse <code>OR</code> Wildcard (= 255.255.255.255 − Maske)<br>
      z.B. 192.168.1.128 OR 0.0.0.63 = <strong>192.168.1.191</strong></p>`,

    first_last_host: `
      <p><strong>Erster nutzbarer Host</strong><br>
      = Netzadresse + 1<br>
      z.B. Netz 192.168.1.128 → erster Host: <strong>192.168.1.129</strong></p>
      <p><strong>Letzter nutzbarer Host</strong><br>
      = Broadcastadresse − 1<br>
      z.B. Broadcast 192.168.1.191 → letzter Host: <strong>192.168.1.190</strong></p>
      <p>Tipp: Berechne erst Netz- und Broadcastadresse (IP AND Maske / Netz OR Wildcard).</p>`,

    hosts: `
      <p><strong>Formel für nutzbare Hosts:</strong><br>
      2<sup>(32 − Präfix)</sup> − 2</p>
      <p>Die −2 steht für Netzadresse und Broadcastadresse, die nicht vergeben werden.</p>
      <table class="sn-ref-table" style="margin-top:8px">
        <tr><th>CIDR</th><th>Hosts</th></tr>
        <tr><td>/24</td><td>254</td></tr>
        <tr><td>/25</td><td>126</td></tr>
        <tr><td>/26</td><td>62</td></tr>
        <tr><td>/27</td><td>30</td></tr>
        <tr><td>/28</td><td>14</td></tr>
        <tr><td>/29</td><td>6</td></tr>
        <tr><td>/30</td><td>2</td></tr>
      </table>`,

    needed_prefix: `
      <p><strong>Gesucht: größter Präfix x (= kleinstes Netz) mit</strong><br>
      2<sup>(32 − x)</sup> − 2 ≥ benötigte Hosts</p>
      <p>Strategie: Starte bei /30 und gehe rückwärts, bis die Formel ausreicht.<br>
      Oder: Berechne 2<sup>n</sup> ≥ (Hosts + 2), dann Präfix = 32 − n.</p>
      <table class="sn-ref-table" style="margin-top:8px">
        <tr><th>Hosts ben.</th><th>Min. Präfix</th><th>Hosts verf.</th></tr>
        <tr><td>1–2</td>   <td>/30</td><td>2</td></tr>
        <tr><td>3–6</td>   <td>/29</td><td>6</td></tr>
        <tr><td>7–14</td>  <td>/28</td><td>14</td></tr>
        <tr><td>15–30</td> <td>/27</td><td>30</td></tr>
        <tr><td>31–62</td> <td>/26</td><td>62</td></tr>
        <tr><td>63–126</td><td>/25</td><td>126</td></tr>
        <tr><td>127–254</td><td>/24</td><td>254</td></tr>
      </table>`,

    wildcard_mask: `
      <p><strong>Wildcard-Maske = 255.255.255.255 − Subnetzmaske</strong></p>
      <p>Oder: bitweises NOT der Subnetzmaske.<br>
      Die Wildcard zeigt die Host-Bits (1 = variabel, 0 = fest).</p>
      <p>Beispiel: /26 → Maske 255.255.255.192<br>
      255.255.255.255 − 255.255.255.192 = <strong>0.0.0.63</strong></p>
      <table class="sn-ref-table" style="margin-top:8px">
        <tr><th>CIDR</th><th>Wildcard</th></tr>
        <tr><td>/24</td><td>0.0.0.255</td></tr>
        <tr><td>/25</td><td>0.0.0.127</td></tr>
        <tr><td>/26</td><td>0.0.0.63</td></tr>
        <tr><td>/27</td><td>0.0.0.31</td></tr>
        <tr><td>/28</td><td>0.0.0.15</td></tr>
        <tr><td>/29</td><td>0.0.0.7</td></tr>
        <tr><td>/30</td><td>0.0.0.3</td></tr>
      </table>`,

    cidr_to_mask: `
      <p><strong>Methode:</strong> Schreibe n Einsen, dann (32−n) Nullen in 4 Oktetts.</p>
      <p>Konvertiere jedes Oktett von Binär nach Dezimal:</p>
      <table class="sn-ref-table" style="margin-top:8px">
        <tr><th>Binär</th><th>Dezimal</th></tr>
        <tr><td>11111111</td><td>255</td></tr>
        <tr><td>11111110</td><td>254</td></tr>
        <tr><td>11111100</td><td>252</td></tr>
        <tr><td>11111000</td><td>248</td></tr>
        <tr><td>11110000</td><td>240</td></tr>
        <tr><td>11100000</td><td>224</td></tr>
        <tr><td>11000000</td><td>192</td></tr>
        <tr><td>10000000</td><td>128</td></tr>
        <tr><td>00000000</td><td>0</td></tr>
      </table>`,

    mask_to_cidr: `
      <p><strong>Methode:</strong> Zähle alle führenden Einsen im Binärformat.</p>
      <p>Oder: Subtrahiere das letzte variable Oktett von 256 und schaue in der Tabelle nach.</p>
      <table class="sn-ref-table" style="margin-top:8px">
        <tr><th>Letztes Oktett</th><th>CIDR-Bits im Oktett</th></tr>
        <tr><td>128</td><td>/1 im Oktett → z.B. /25</td></tr>
        <tr><td>192</td><td>/2 → z.B. /26</td></tr>
        <tr><td>224</td><td>/3 → z.B. /27</td></tr>
        <tr><td>240</td><td>/4 → z.B. /28</td></tr>
        <tr><td>248</td><td>/5 → z.B. /29</td></tr>
        <tr><td>252</td><td>/6 → z.B. /30</td></tr>
        <tr><td>0</td>  <td>/0 → ganzes Oktett Netz</td></tr>
      </table>`,

    subnets_count: `
      <p><strong>Formel:</strong> 2<sup>(neuer Präfix − alter Präfix)</sup></p>
      <p>Die Differenz ergibt die Anzahl der Subnetz-Bits.</p>
      <p>Beispiel: /<sup>16</sup> in /<sup>20</sup> aufteilen<br>
      20 − 16 = 4 Bits → 2<sup>4</sup> = <strong>16 Subnetze</strong></p>
      <table class="sn-ref-table" style="margin-top:8px">
        <tr><th>Bits-Diff</th><th>Subnetze</th></tr>
        <tr><td>1</td><td>2</td></tr>
        <tr><td>2</td><td>4</td></tr>
        <tr><td>3</td><td>8</td></tr>
        <tr><td>4</td><td>16</td></tr>
        <tr><td>5</td><td>32</td></tr>
        <tr><td>6</td><td>64</td></tr>
        <tr><td>8</td><td>256</td></tr>
      </table>`,

    same_net: `
      <p><strong>Methode: Netzadresse beider IPs berechnen</strong></p>
      <p>1. Subnetzmaske aus CIDR bestimmen<br>
      2. IP 1 AND Maske → Netzadresse 1<br>
      3. IP 2 AND Maske → Netzadresse 2<br>
      4. Gleich? → Gleiches Subnetz. Verschieden? → Nicht gleich.</p>
      <p>Tipp: Im letzten (variablen) Oktett reicht oft ein Blick:<br>
      Liegen beide IPs im selben Block der Maskengröße?</p>`,

    ip_class: `
      <p><strong>IP-Klassen nach erstem Oktett:</strong></p>
      <table class="sn-ref-table" style="margin-top:8px">
        <tr><th>Klasse</th><th>1. Oktett</th><th>Standard-Maske</th></tr>
        <tr><td>A</td><td>1 – 126</td><td>/8 (255.0.0.0)</td></tr>
        <tr><td>B</td><td>128 – 191</td><td>/16 (255.255.0.0)</td></tr>
        <tr><td>C</td><td>192 – 223</td><td>/24 (255.255.255.0)</td></tr>
        <tr><td>D</td><td>224 – 239</td><td>Multicast</td></tr>
        <tr><td>E</td><td>240 – 255</td><td>Reserviert</td></tr>
      </table>
      <p><strong>Private Bereiche (RFC 1918):</strong><br>
      10.0.0.0 – 10.255.255.255 (Klasse A)<br>
      172.16.0.0 – 172.31.255.255 (Klasse B)<br>
      192.168.0.0 – 192.168.255.255 (Klasse C)</p>`,

    binary_octet: `
      <p><strong>Dezimal → Binär: Positions-Werte von links nach rechts</strong></p>
      <table class="sn-ref-table" style="margin-top:8px">
        <tr><th>Bit</th><th>7</th><th>6</th><th>5</th><th>4</th><th>3</th><th>2</th><th>1</th><th>0</th></tr>
        <tr><th>Wert</th><td>128</td><td>64</td><td>32</td><td>16</td><td>8</td><td>4</td><td>2</td><td>1</td></tr>
      </table>
      <p>Strategie: Subtraktion von links.<br>
      z.B. 192: 192−128=64 →1 | 64−64=0 →1 | Rest 0 → <strong>11000000</strong></p>
      <p>Häufige Werte: 128=10000000 · 192=11000000 · 224=11100000 · 240=11110000 · 248=11111000 · 252=11111100 · 255=11111111</p>`,
  };

  return content[q.type] || `<p>Nutze die Formeln aus der Übersicht auf der Startseite.</p>`;
}

// ─── Render helpers ───────────────────────────────────────────────────────────

function renderSetup() {
  return `
  <div class="sn-wrap sn-setup">
    <div class="sn-page-header">
      <button class="bk-back-link" id="snBack">← Zurück</button>
      <div>
        <h2 class="sn-title">🌐 Subnetz-Trainer</h2>
        <p class="bk-subtitle">IPv4-Subnetting interaktiv üben</p>
      </div>
    </div>

    ${renderStatsCard()}

    <div class="sn-config-card">
      <div class="bk-config-section">
        <h3>Schwierigkeit</h3>
        <div class="bk-pills" id="snDiffPills">
          <button class="bk-pill active" data-diff="easy">😊 Einfach <small>/24</small></button>
          <button class="bk-pill" data-diff="medium">🧠 Mittel <small>/20–/28</small></button>
          <button class="bk-pill" data-diff="hard">🔥 Schwer <small>/8–/30</small></button>
          <button class="bk-pill" data-diff="profi">💀 Profi <small>/1–/30</small></button>
        </div>
      </div>

      <div class="bk-config-section">
        <h3>Fragetypen (Mehrfachauswahl)</h3>
        <div class="bk-pills" id="snTypePills">
          <button class="bk-pill active" data-type="netz_broadcast">📡 Netz &amp; Broadcast</button>
          <button class="bk-pill active" data-type="first_last_host">🏠 Erster &amp; Letzter Host</button>
          <button class="bk-pill active" data-type="hosts">📊 Host-Anzahl</button>
          <button class="bk-pill active" data-type="needed_prefix">🎯 Benötigter Präfix</button>
          <button class="bk-pill active" data-type="wildcard_mask">🃏 Wildcard-Maske</button>
          <button class="bk-pill active" data-type="cidr_to_mask">🔢 CIDR → Maske</button>
          <button class="bk-pill active" data-type="mask_to_cidr">🔢 Maske → CIDR</button>
          <button class="bk-pill active" data-type="subnets_count">✂️ Subnetz-Aufteilung</button>
          <button class="bk-pill active" data-type="same_net">🔍 Gleiches Netz?</button>
          <button class="bk-pill active" data-type="ip_class">🏷️ IP-Klasse</button>
          <button class="bk-pill active" data-type="binary_octet">01 Binär-Oktett</button>
        </div>
      </div>

      <div class="bk-config-section">
        <h3>Anzahl Fragen</h3>
        <div class="bk-pills" id="snCountPills">
          <button class="bk-pill" data-count="5">5</button>
          <button class="bk-pill active" data-count="10">10</button>
          <button class="bk-pill" data-count="20">20</button>
          <button class="bk-pill" data-count="50">50</button>
          <button class="bk-pill" data-count="999">∞ Endlos</button>
        </div>
      </div>

      <div class="bk-config-section">
        <h3>⏱️ Zeitlimit pro Frage</h3>
        <div class="bk-pills" id="snTimePills">
          <button class="bk-pill active" data-time="0">Kein Limit</button>
          <button class="bk-pill" data-time="30">30 Sek</button>
          <button class="bk-pill" data-time="20">20 Sek</button>
          <button class="bk-pill" data-time="10">10 Sek</button>
        </div>
      </div>

      <div class="bk-start-area">
        <div class="bk-count-preview">
          <span class="bk-count-num" id="snCountPreview">10</span>
          <span class="bk-count-label">Fragen</span>
        </div>
        <button class="bk-start-btn" id="snStartBtn">Starten →</button>
      </div>
    </div>

    ${EXPLANATION_HTML}
    ${CALCULATOR_HTML}
  </div>`;
}

function renderQuestion(q, index, total, score, streak) {
  const isEndless = total === 999;
  const progressPct = isEndless ? 0 : Math.round((index / total) * 100);
  const streakBadge = streak >= 3 ? ` &nbsp; 🔥<span class="sn-streak-num">${streak}</span>` : "";

  let answerArea = "";
  if (q.type === "same_net") {
    answerArea = `
      <div class="sn-yesno">
        <button class="sn-yn-btn sn-yes" data-answer="ja">✅ Ja, gleiches Netz</button>
        <button class="sn-yn-btn sn-no"  data-answer="nein">❌ Nein, anderes Netz</button>
      </div>`;
  } else {
    answerArea = q.fields.map(f => {
      const isIp = IP_KEYS.has(f.key);
      let inputHtml;
      if (f.choices) {
        inputHtml = `<div class="sn-mc-group" data-field="${escapeHtml(f.key)}">${
          f.choices.map(c =>
            `<button class="sn-mc-btn" type="button" data-field="${escapeHtml(f.key)}" data-choice="${escapeHtml(c)}">${escapeHtml(c)}</button>`
          ).join("")
        }</div>`;
      } else if (isIp) {
        inputHtml = `<div class="sn-ip-input" data-key="${escapeHtml(f.key)}">
             <input class="sn-octet" type="text" inputmode="numeric" maxlength="3" placeholder="0" autocomplete="off">
             <span class="sn-dot">.</span>
             <input class="sn-octet" type="text" inputmode="numeric" maxlength="3" placeholder="0" autocomplete="off">
             <span class="sn-dot">.</span>
             <input class="sn-octet" type="text" inputmode="numeric" maxlength="3" placeholder="0" autocomplete="off">
             <span class="sn-dot">.</span>
             <input class="sn-octet" type="text" inputmode="numeric" maxlength="3" placeholder="0" autocomplete="off">
           </div>`;
      } else {
        inputHtml = `<input type="text" class="sn-input" data-key="${escapeHtml(f.key)}"
               inputmode="numeric" pattern="[0-9]*"
               placeholder="${f.key === 'hosts' || f.key === 'count' ? 'z.B. 254' : 'z.B. 24'}"
               autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />`;
      }
      return `
      <div class="sn-input-row">
        <label class="sn-label">${escapeHtml(f.label)}</label>
        ${inputHtml}
      </div>`;
    }).join("");
    answerArea += `
      <div class="sn-actions">
        <button class="sn-check-btn" id="snCheckBtn">Prüfen</button>
        <button class="sn-hint-btn"  id="snHintBtn">💡 Hinweis</button>
      </div>`;
  }

  const timerHtml = sn.timeLimit > 0 ? `
    <div class="sn-timer-wrap">
      <div class="sn-timer-bar"><div class="sn-timer-fill" id="snTimerFill"></div></div>
      <span class="sn-timer-count" id="snTimerCount">${sn.timeLimit}</span>
    </div>` : "";

  return `
  <div class="sn-wrap sn-playing">
    <div class="sn-topbar">
      <button class="bk-icon-btn" id="snBack" title="Abbrechen">✕</button>
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
      <div class="sn-answer-area" id="snAnswerArea">
        ${answerArea}
      </div>
      <div class="sn-howto">
        <button class="sn-howto-toggle" id="snHowtoToggle" type="button" aria-expanded="false">
          📐 Wie berechne ich das? <span class="sgt-arrow">▾</span>
        </button>
        <div class="sn-howto-body hidden" id="snHowtoBody">${getHowToHtml(q)}</div>
      </div>
      <div class="sn-feedback hidden" id="snFeedback"></div>
    </div>

    <button class="sn-next-btn hidden" id="snNextBtn">Weiter →</button>
  </div>`;
}

function renderDone(score, total) {
  const pct = total === 999
    ? Math.round((score.correct / Math.max(score.correct + score.wrong, 1)) * 100)
    : Math.round((score.correct / total) * 100);
  const isEndless = total === 999;
  const emoji = pct >= 90 ? "🎉" : pct >= 70 ? "💪" : pct >= 50 ? "📚" : "🔁";

  const saved = saveStats(score, total);
  const isNewBestPct    = saved.bestPct    === saved.thisPct && saved.thisPct > 0;
  const isNewBestStreak = saved.bestStreak === score.maxStreak && score.maxStreak > 0;

  return `
  <div class="sn-wrap sn-done bk-done">
    <div class="bk-done-emoji">${emoji}</div>
    <h2 class="bk-done-title">Trainingsrunde beendet!</h2>
    <p class="bk-done-msg">${isEndless ? score.correct + score.wrong : total} Fragen · ${pct}% richtig
      ${isNewBestPct ? ' <span class="sn-new-best">🏆 Bester Score!</span>' : ''}
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
        <div class="bk-result-num">${score.maxStreak}${isNewBestStreak ? ' 🏆' : ''}</div>
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
      <button class="bk-start-btn"          id="snRestart">Nochmal spielen</button>
      <button class="bk-start-btn bk-secondary" id="snBack">← Zurück zur Lernapp</button>
    </div>
  </div>`;
}

// ─── State & lifecycle ────────────────────────────────────────────────────────

function freshSnState() {
  return {
    phase:         "setup",
    difficulty:    "easy",
    allowedTypes:  Object.keys(GENERATORS),
    totalCount:    10,
    timeLimit:     0,
    timerInterval: null,
    index:         0,
    currentQ:      null,
    score:         { correct: 0, wrong: 0, maxStreak: 0 },
    streak:        0,
  };
}

function paint(html) {
  if (!_container) return;
  _container.innerHTML = html;
  bindEvents();
}

// ─── Live subnet calculator ───────────────────────────────────────────────────

function runCalc() {
  const ipEl   = document.getElementById("calcIp");
  const cidrEl = document.getElementById("calcCidr");
  const res    = document.getElementById("snCalcResult");
  if (!ipEl || !cidrEl || !res) return;

  const ipRaw   = ipEl.value.trim();
  const cidrRaw = cidrEl.value.trim();
  if (!ipRaw || !cidrRaw) { res.classList.add("hidden"); return; }

  if (!isValidIp(ipRaw)) {
    res.innerHTML = `<div class="sn-calc-error">Ungültige IP-Adresse</div>`;
    res.classList.remove("hidden"); return;
  }

  let cidr;
  if (/^\d+$/.test(cidrRaw)) {
    cidr = Number(cidrRaw);
  } else if (isValidIp(cidrRaw)) {
    if (!isValidSubnetMask(cidrRaw)) {
      res.innerHTML = `<div class="sn-calc-error">Ungültige Subnetzmaske (Bits müssen zusammenhängend sein)</div>`;
      res.classList.remove("hidden"); return;
    }
    cidr = maskToCidr(cidrRaw);
  } else {
    res.innerHTML = `<div class="sn-calc-error">Ungültige Maske / Präfix</div>`;
    res.classList.remove("hidden"); return;
  }

  if (cidr < 0 || cidr > 32) {
    res.innerHTML = `<div class="sn-calc-error">Präfix muss zwischen 0 und 32 liegen</div>`;
    res.classList.remove("hidden"); return;
  }

  const net   = networkAddr(ipRaw, cidr);
  const bcast = broadcastAddr(ipRaw, cidr);
  const mask  = cidrToMaskStr(cidr);
  const wc    = wildcardStr(cidr);
  const fh    = cidr <= 30 ? firstHost(ipRaw, cidr) : "–";
  const lh    = cidr <= 30 ? lastHost(ipRaw, cidr)  : "–";
  const h     = usableHosts(cidr);

  res.innerHTML = `
    <table class="sn-ref-table sn-calc-table">
      <tr><th>Feld</th>              <th>Wert</th></tr>
      <tr><td>Eingabe</td>           <td><strong>${escapeHtml(ipRaw)}/${cidr}</strong></td></tr>
      <tr><td>Subnetzmaske</td>      <td>${mask}</td></tr>
      <tr><td>Wildcard-Maske</td>    <td>${wc}</td></tr>
      <tr><td>Netzadresse</td>       <td><strong>${net}</strong></td></tr>
      <tr><td>Erster Host</td>       <td>${fh}</td></tr>
      <tr><td>Letzter Host</td>      <td>${lh}</td></tr>
      <tr><td>Broadcastadresse</td>  <td><strong>${bcast}</strong></td></tr>
      <tr><td>Nutzbare Hosts</td>    <td><strong>${h.toLocaleString()}</strong></td></tr>
    </table>`;
  res.classList.remove("hidden");
}

// ─── Timer ─────────────────────────────────────────────────────────────────────────────────

function clearTimer() {
  if (sn?.timerInterval) { clearInterval(sn.timerInterval); sn.timerInterval = null; }
}

function startTimer() {
  clearTimer();
  if (!sn || !sn.timeLimit) return;
  let remaining = sn.timeLimit;
  const updateBar = () => {
    const fill  = document.getElementById("snTimerFill");
    const count = document.getElementById("snTimerCount");
    const pct   = Math.max(0, (remaining / sn.timeLimit) * 100);
    if (fill) {
      fill.style.width = pct + "%";
      fill.className = "sn-timer-fill" +
        (remaining <= 5 ? " sn-timer-crit" : remaining <= Math.ceil(sn.timeLimit / 3) ? " sn-timer-warn" : "");
    }
    if (count) count.textContent = remaining;
  };
  updateBar();
  sn.timerInterval = setInterval(() => {
    remaining--;
    updateBar();
    if (remaining > 0) return;
    clearTimer();
    // auto-submit on timeout
    const q = sn.currentQ;
    if (q.type === "same_net") {
      document.querySelectorAll(".sn-yn-btn").forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.answer === q.answer) btn.classList.add("sn-yn-correct");
      });
      showFeedback(false, q.explanation);
      recordResult(false);
    } else {
      q.fields.forEach(f => {
        const ipc = document.querySelector(`.sn-ip-input[data-key="${f.key}"]`);
        if (ipc) { ipc.querySelectorAll(".sn-octet").forEach(i => { i.classList.add("sn-input-wrong"); i.disabled = true; }); ipc.classList.add("sn-input-wrong"); }
        const inp = document.querySelector(`.sn-input[data-key="${f.key}"]`);
        if (inp) { inp.classList.add("sn-input-wrong"); inp.disabled = true; }
        document.querySelectorAll(`.sn-mc-btn[data-field="${f.key}"]`).forEach(b => {
          b.disabled = true;
          if (b.dataset.choice === f.answer) b.classList.add("sn-mc-correct");
        });
      });
      showFeedback(false, q.explanation, q.fields.map(f => ({ ok: false, correct: f.answer })));
      recordResult(false);
    }
  }, 1000);
}

// ─── Event binding ────────────────────────────────────────────────────────────

function bindEvents() {
  const el = id => document.getElementById(id);

  document.querySelectorAll("#snBack").forEach(btn =>
    btn.addEventListener("click", () => { sn = null; _onBack && _onBack(); })
  );

  // Collapsible explanation
  el("snInfoToggle")?.addEventListener("click", () => {
    const body = el("snInfoBody");
    const open = body.classList.toggle("hidden");
    el("snInfoToggle").setAttribute("aria-expanded", String(!open));
    el("snInfoToggle").querySelector(".sgt-arrow").style.transform = open ? "" : "rotate(180deg)";
  });

  // Collapsible calculator
  el("snCalcToggle")?.addEventListener("click", () => {
    const body = el("snCalcBody");
    const open = body.classList.toggle("hidden");
    el("snCalcToggle").setAttribute("aria-expanded", String(!open));
    el("snCalcToggle").querySelector(".sgt-arrow").style.transform = open ? "" : "rotate(180deg)";
    if (!open) setTimeout(() => el("calcIp")?.focus(), 80);
  });

  el("calcIp")?.addEventListener("input", runCalc);
  el("calcCidr")?.addEventListener("input", runCalc);

  if (sn?.phase === "setup") {
    el("snDiffPills")?.addEventListener("click", e => {
      const b = e.target.closest("[data-diff]");
      if (!b) return;
      el("snDiffPills").querySelectorAll(".bk-pill").forEach(p => p.classList.remove("active"));
      b.classList.add("active");
      sn.difficulty = b.dataset.diff;
    });

    el("snTypePills")?.addEventListener("click", e => {
      const b = e.target.closest("[data-type]");
      if (!b) return;
      const selected = [...el("snTypePills").querySelectorAll(".bk-pill.active")];
      if (b.classList.contains("active") && selected.length <= 1) return;
      b.classList.toggle("active");
      sn.allowedTypes = [...el("snTypePills").querySelectorAll(".bk-pill.active")]
        .map(p => p.dataset.type);
    });

    el("snCountPills")?.addEventListener("click", e => {
      const b = e.target.closest("[data-count]");
      if (!b) return;
      el("snCountPills").querySelectorAll(".bk-pill").forEach(p => p.classList.remove("active"));
      b.classList.add("active");
      sn.totalCount = Number(b.dataset.count);
      const prev = el("snCountPreview");
      if (prev) prev.textContent = sn.totalCount === 999 ? "∞" : sn.totalCount;
    });

    el("snTimePills")?.addEventListener("click", e => {
      const b = e.target.closest("[data-time]");
      if (!b) return;
      el("snTimePills").querySelectorAll(".bk-pill").forEach(p => p.classList.remove("active"));
      b.classList.add("active");
      sn.timeLimit = Number(b.dataset.time);
    });

    el("snStartBtn")?.addEventListener("click", startGame);
  }

  if (sn?.phase === "playing") {
    const q = sn.currentQ;

    document.querySelectorAll(".sn-yn-btn").forEach(btn =>
      btn.addEventListener("click", () => submitSameNet(btn.dataset.answer))
    );

    document.querySelectorAll(".sn-input").forEach(inp =>
      inp.addEventListener("keydown", e => { if (e.key === "Enter") checkTextAnswer(); })
    );

    // Octet inputs: auto-advance + backspace navigation
    document.querySelectorAll(".sn-ip-input").forEach(container => {
      const octs = [...container.querySelectorAll(".sn-octet")];
      octs.forEach((inp, i) => {
        inp.addEventListener("input", () => {
          // strip non-digits
          inp.value = inp.value.replace(/\D/g, "");
          if (inp.value.length === 3 || (inp.value.length > 0 && Number(inp.value) > 25)) {
            octs[i + 1]?.focus();
          }
        });
        inp.addEventListener("keydown", e => {
          if (e.key === "Enter") checkTextAnswer();
          if (e.key === "Backspace" && inp.value === "") octs[i - 1]?.focus();
          if (e.key === ".") { e.preventDefault(); octs[i + 1]?.focus(); }
        });
      });
    });

    el("snCheckBtn")?.addEventListener("click", checkTextAnswer);

    // Multiple-choice buttons (ip_class, binary_octet)
    document.querySelectorAll(".sn-mc-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        document.querySelectorAll(`.sn-mc-btn[data-field="${btn.dataset.field}"]`)
          .forEach(b => b.classList.remove("sn-mc-selected"));
        btn.classList.add("sn-mc-selected");
        // auto-submit when every mc-group has a selection and no text fields remain
        const allGroups   = [...document.querySelectorAll(".sn-mc-group")];
        const allSelected = allGroups.length > 0 && allGroups.every(g => g.querySelector(".sn-mc-selected"));
        const hasText     = document.querySelector(".sn-input:not(:disabled), .sn-octet:not(:disabled)");
        if (allSelected && !hasText) checkTextAnswer();
      });
    });

    // Collapsible how-to panel on question card
    el("snHowtoToggle")?.addEventListener("click", () => {
      const body = el("snHowtoBody");
      const open = body.classList.toggle("hidden");
      el("snHowtoToggle").setAttribute("aria-expanded", String(!open));
      el("snHowtoToggle").querySelector(".sgt-arrow").style.transform = open ? "" : "rotate(180deg)";
    });

    el("snHintBtn")?.addEventListener("click", () => {
      // Expand the how-to panel and scroll to it
      const body = el("snHowtoBody");
      const toggle = el("snHowtoToggle");
      if (!body) return;
      body.classList.remove("hidden");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "true");
        const arrow = toggle.querySelector(".sgt-arrow");
        if (arrow) arrow.style.transform = "rotate(180deg)";
      }
      body.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    el("snNextBtn")?.addEventListener("click", nextQuestion);
  }

  if (sn?.phase === "done") {
    el("snRestart")?.addEventListener("click", () => {
      sn = freshSnState();
      sn.phase = "setup";
      paint(renderSetup());
    });
  }
}

function startGame() {
  sn.phase    = "playing";
  sn.index    = 0;
  sn.score    = { correct: 0, wrong: 0, maxStreak: 0 };
  sn.streak   = 0;
  sn.currentQ = generateQuestion(sn.difficulty, sn.allowedTypes);
  paint(renderQuestion(sn.currentQ, sn.index, sn.totalCount, sn.score, sn.streak));
  setTimeout(() => {
    (document.querySelector(".sn-octet") || document.querySelector(".sn-input"))?.focus();
    startTimer();
  }, 80);
}

function normalize(val) { return val.trim().replace(/\s+/g, "").toLowerCase(); }

function checkTextAnswer() {
  const q = sn.currentQ;
  let allCorrect = true;
  const results = [];
  q.fields.forEach(f => {
    // Multiple-choice field
    if (f.choices) {
      const selBtn = document.querySelector(`.sn-mc-btn.sn-mc-selected[data-field="${f.key}"]`);
      const userVal = selBtn ? selBtn.dataset.choice : "";
      const ok = normalize(userVal) === normalize(f.answer);
      if (!ok) allCorrect = false;
      results.push({ ok, correct: f.answer });
      document.querySelectorAll(`.sn-mc-btn[data-field="${f.key}"]`).forEach(b => {
        b.disabled = true;
        if (b.dataset.choice === f.answer) b.classList.add("sn-mc-correct");
        else if (b.classList.contains("sn-mc-selected") && !ok) b.classList.add("sn-mc-wrong");
      });
      return;
    }
    const ipContainer = document.querySelector(`.sn-ip-input[data-key="${f.key}"]`);
    if (ipContainer) {
      const octets = [...ipContainer.querySelectorAll(".sn-octet")].map(i => i.value.trim() || "0");
      const userValue = octets.join(".");
      const ok = normalize(userValue) === normalize(f.answer);
      if (!ok) allCorrect = false;
      results.push({ ok, correct: f.answer });
      ipContainer.querySelectorAll(".sn-octet").forEach(i => {
        i.classList.toggle("sn-input-correct", ok);
        i.classList.toggle("sn-input-wrong", !ok);
        i.disabled = true;
      });
      ipContainer.classList.toggle("sn-input-correct", ok);
      ipContainer.classList.toggle("sn-input-wrong", !ok);
    } else {
      const inp = document.querySelector(`.sn-input[data-key="${f.key}"]`);
      if (!inp) return;
      const ok = normalize(inp.value) === normalize(f.answer);
      if (!ok) allCorrect = false;
      results.push({ inp, ok, correct: f.answer });
      inp.classList.toggle("sn-input-correct", ok);
      inp.classList.toggle("sn-input-wrong",   !ok);
      inp.disabled = true;
    }
  });
  showFeedback(allCorrect, q.explanation, results);
  recordResult(allCorrect);
}

function submitSameNet(userAnswer) {
  const q = sn.currentQ;
  const ok = userAnswer === q.answer;
  document.querySelectorAll(".sn-yn-btn").forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.answer === q.answer) btn.classList.add("sn-yn-correct");
    else if (btn.dataset.answer === userAnswer && !ok) btn.classList.add("sn-yn-wrong");
  });
  showFeedback(ok, q.explanation);
  recordResult(ok);
}

function showFeedback(ok, explanation, fieldResults) {
  const fb = document.getElementById("snFeedback");
  if (!fb) return;
  const badge = ok
    ? `<span class="sn-fb-badge sn-fb-correct">✅ Richtig!</span>`
    : `<span class="sn-fb-badge sn-fb-wrong">❌ Falsch</span>`;
  const wrongAnswers = (fieldResults || [])
    .filter(r => !r.ok)
    .map(r => `Richtige Antwort: <strong>${escapeHtml(r.correct)}</strong>`)
    .join("<br>");
  fb.innerHTML = `
    <div class="sn-fb-inner">
      ${badge}
      ${wrongAnswers ? `<div class="sn-fb-correct-val">${wrongAnswers}</div>` : ""}
      <div class="sn-fb-expl">${explanation}</div>
    </div>`;
  fb.classList.remove("hidden");
  document.getElementById("snNextBtn")?.classList.remove("hidden");
  const act = document.querySelector(".sn-actions");
  if (act) act.style.display = "none";
  clearTimer();
}

function recordResult(ok) {
  if (ok) { sn.score.correct++; sn.streak++; if (sn.streak > sn.score.maxStreak) sn.score.maxStreak = sn.streak; }
  else    { sn.score.wrong++;   sn.streak = 0; }
}

function nextQuestion() {
  sn.index++;
  const done = sn.totalCount !== 999 && sn.index >= sn.totalCount;
  if (done) {
    sn.phase = "done";
    paint(renderDone(sn.score, sn.totalCount));
    setTimeout(() => { const fill = document.querySelector(".bk-score-fill"); if (fill) fill.style.width = fill.dataset.pct + "%"; }, 80);
    return;
  }
  sn.currentQ = generateQuestion(sn.difficulty, sn.allowedTypes);
  paint(renderQuestion(sn.currentQ, sn.index, sn.totalCount, sn.score, sn.streak));
  setTimeout(() => {
    (document.querySelector(".sn-octet") || document.querySelector(".sn-input"))?.focus();
    startTimer();
  }, 80);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function launchSubnetz(container, onBack) {
  _container = container;
  _onBack    = onBack;
  sn         = freshSnState();
  paint(renderSetup());
}

export function cleanupSubnetz() { clearTimer(); sn = null; }
