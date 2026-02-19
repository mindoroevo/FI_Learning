import { escapeHtml, inlineMd, generateTocId } from "./utils.js";

function renderTable(rows) {
  if (rows.length < 2) return "";

  const parseRow = (row) => {
    return row
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell, idx, arr) => idx !== 0 && idx !== arr.length - 1);
  };

  const headerCells = parseRow(rows[0]);
  const bodyRows = rows.slice(2);

  let html = '<table class="md-table"><thead><tr>';
  for (const cell of headerCells) {
    html += `<th>${inlineMd(cell)}</th>`;
  }
  html += "</tr></thead><tbody>";

  for (const row of bodyRows) {
    const cells = parseRow(row);
    html += "<tr>";
    for (const cell of cells) {
      html += `<td>${inlineMd(cell)}</td>`;
    }
    html += "</tr>";
  }

  html += "</tbody></table>";
  return html;
}

export function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  const tocEntries = [];
  let inUl = false;
  let inCode = false;
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (!inCode) {
        inCode = true;
        out.push("<pre><code>");
      } else {
        inCode = false;
        out.push("</code></pre>");
      }
      continue;
    }

    if (inCode) {
      out.push(escapeHtml(line));
      continue;
    }

    if (line.trim().startsWith("|") && (line.includes("-") || inTable || line.includes("|"))) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
      continue;
    } else {
      if (inTable) {
        inTable = false;
        out.push(renderTable(tableRows));
      }
    }

    if (line.trim().startsWith("- ")) {
      if (!inUl) {
        inUl = true;
        out.push("<ul>");
      }
      out.push(`<li>${inlineMd(line.substring(2))}</li>`);
      continue;
    } else {
      if (inUl) {
        inUl = false;
        out.push("</ul>");
      }
    }

    if (/^####\s+/.test(line)) {
      const text = line.replace(/^####\s+/, "");
      const id = generateTocId(text);
      tocEntries.push({ level: 4, text, id });
      out.push(`<h4 id="${id}">${inlineMd(text)}</h4>`);
    } else if (/^###\s+/.test(line)) {
      const text = line.replace(/^###\s+/, "");
      const id = generateTocId(text);
      tocEntries.push({ level: 3, text, id });
      out.push(`<h3 id="${id}">${inlineMd(text)}</h3>`);
    } else if (/^##\s+/.test(line)) {
      const text = line.replace(/^##\s+/, "");
      const id = generateTocId(text);
      tocEntries.push({ level: 2, text, id });
      out.push(`<h2 id="${id}">${inlineMd(text)}</h2>`);
    } else if (/^#\s+/.test(line)) {
      const text = line.replace(/^#\s+/, "");
      const id = generateTocId(text);
      tocEntries.push({ level: 1, text, id });
      out.push(`<h1 id="${id}">${inlineMd(text)}</h1>`);
    } else if (/^---\s*$/.test(line)) {
      out.push("<hr />");
    } else if (line.trim() === "") {
      out.push("");
    } else {
      out.push(`<p>${inlineMd(line)}</p>`);
    }
  }

  if (inUl) out.push("</ul>");
  if (inTable && tableRows.length > 0) out.push(renderTable(tableRows));

  // Generate TOC
  let tocHtml = "";
  if (tocEntries.length > 0) {
    tocHtml = '<div class="toc-container"><div class="toc-header">📚 Inhaltsverzeichnis</div><nav class="toc">';
    for (const entry of tocEntries) {
      if (entry.level <= 3) {
        const indent = entry.level === 1 ? "" : entry.level === 2 ? "toc-l2" : "toc-l3";
        // Avoid undefined id
        const curId = entry.id || ""; 
        tocHtml += `<a href="#${curId}" class="toc-link ${indent}">${escapeHtml(entry.text)}</a>`;
      }
    }
    tocHtml += "</nav></div>";
  }

  return { html: out.join("\n"), toc: tocHtml };
}
