// Shared helpers for the tiny line-based Python-subset parsers that drive the
// data-structure visualizations. These parsers work one physical line at a
// time, so `a = 1; b = 2` silently loses everything after the first `;`
// unless it's expanded into separate lines first.
export function splitStatements(code) {
  const lines = code.split("\n");
  const result = [];

  for (const line of lines) {
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch[1];
    const rest = line.slice(indent.length);

    if (!rest.includes(";")) {
      result.push(line);
      continue;
    }

    const parts = [];
    let cur = "";
    let inStr = null;
    for (let i = 0; i < rest.length; i++) {
      const ch = rest[i];
      if (inStr) {
        cur += ch;
        if (ch === inStr && rest[i - 1] !== "\\") inStr = null;
      } else if (ch === '"' || ch === "'") {
        inStr = ch;
        cur += ch;
      } else if (ch === ";") {
        parts.push(cur);
        cur = "";
      } else if (ch === "#") {
        cur += rest.slice(i);
        break;
      } else {
        cur += ch;
      }
    }
    parts.push(cur);

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed) result.push(indent + trimmed);
    }
  }

  return result;
}
