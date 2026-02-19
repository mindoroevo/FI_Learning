export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeAttr(text) {
  return escapeHtml(text).replace(/"/g, "&quot;");
}

export function inlineMd(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

export function generateTocId(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-äöüß]/g, "")
    .replace(/\s+/g, "-");
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function arraysEqual(first, second) {
  if (first.length !== second.length) return false;
  return first.every((value, index) => value === second[index]);
}
