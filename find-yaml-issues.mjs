import fs from 'fs';
const lines = fs.readFileSync('./src/data/tracks.yaml', 'utf-8').split('\n');
let found = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/^(\s*)(hint|obj|expl): (.+)$/);
  if (m) {
    const val = m[3];
    if (val.includes(': ') && !val.startsWith("'") && !val.startsWith('"') && !val.startsWith('|')) {
      console.log('Line ' + (i + 1) + ': ' + line);
      found = true;
    }
  }
}
if (!found) console.log('No issues found');
