import fs from 'fs';
const fp = './src/data/tracks.yaml';
let content = fs.readFileSync(fp, 'utf-8');
const lines = content.split('\n');

function needsQuoting(val) {
  if (!val) return false;
  if (val.startsWith('|') || val.startsWith("'") || val.startsWith('"')) return false;
  if (val.startsWith('>')) return false;
  // Check for YAML-intrusive patterns
  if (val.includes(': ')) return true;
  if (val.includes("'") && (val.includes(': ') || val.startsWith('{'))) return true;
  if (val.startsWith('{') || val.startsWith('[')) return true;
  // Check for YAML special chars
  if (/[#!%&*+,|>?@`$]/.test(val)) return true;
  return false;
}

function quoteYAML(val) {
  if (val.includes('"') && !val.includes("'")) {
    return "'" + val.replace(/'/g, "''") + "'";
  }
  if (val.includes("'") && !val.includes('"')) {
    return '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
  if (val.includes("'") && val.includes('"')) {
    return '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
  // Prefer single quotes
  return "'" + val.replace(/'/g, "''") + "'";
}

function isAlreadyProperlyQuoted(val) {
  if (val.startsWith("'") && val.endsWith("'")) {
    // Check no unescaped single quotes inside
    const inner = val.slice(1, -1);
    if (!inner.includes("'")) return true;
    // If it has doubled single quotes, it's fine
    let i = 0;
    while (i < inner.length) {
      if (inner[i] === "'") {
        if (i + 1 < inner.length && inner[i + 1] === "'") {
          i += 2;
          continue;
        }
        return false;
      }
      i++;
    }
    return true;
  }
  if (val.startsWith('"') && val.endsWith('"')) {
    // Check no unescaped double quotes inside
    const inner = val.slice(1, -1);
    let i = 0;
    while (i < inner.length) {
      if (inner[i] === '\\') {
        i += 2;
        continue;
      }
      if (inner[i] === '"') return false;
      i++;
    }
    return true;
  }
  return false;
}

const fixed = lines.map((line, i) => {
  const m = line.match(/^(\s*)(hint|obj|expl): (.+)$/);
  if (m) {
    const val = m[3];
    if (!needsQuoting(val) && isAlreadyProperlyQuoted(val)) return line;
    if (!needsQuoting(val) && !/[#]/.test(val)) return line;
    const quoted = quoteYAML(val);
    console.log('Line ' + (i + 1) + ': was: ' + line.substring(0, 80) + '...');
    console.log('     now: ' + (m[1] + m[2] + ': ' + quoted).substring(0, 80) + '...');
    return m[1] + m[2] + ': ' + quoted;
  }
  return line;
});

fs.writeFileSync(fp, fixed.join('\n'));
console.log('\nFixed', fixed.filter((l, i) => l !== lines[i]).length, 'lines');
