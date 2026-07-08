// Extract hardcoded TRACKS from git's tracks.js and convert to YAML
import { dump } from 'js-yaml';
import fs from 'fs';
import { execSync } from 'child_process';

// Get old tracks.js and mock SVG imports
const oldContent = execSync('git show HEAD:src/data/tracks.js', { encoding: 'utf-8' });

// Replace SVG imports with mock string variables
const mocked = oldContent
  .replace(/import (\w+) from ["'].*?\.svg["'];/g, 'const $1 = "$1";');

// Write temp file and import it
fs.writeFileSync('./scripts/_temp_convert.mjs', mocked, 'utf-8');

const { TRACKS } = await import('./_temp_convert.mjs');

// Convert to plain objects
const clean = TRACKS.map(track => ({
  ...track,
  chapters: track.chapters.map(ch => ({
    ...ch,
    levels: ch.levels.map(lv => {
      const cleanLv = { ...lv };
      if (cleanLv.maxLines !== undefined || cleanLv.maxTime !== undefined) {
        const lines = cleanLv.maxLines ?? '';
        const time = cleanLv.maxTime ?? '';
        cleanLv.max = String(lines) + '/' + String(time);
        delete cleanLv.maxLines;
        delete cleanLv.maxTime;
      }
      // Convert objective array to simple string
      if (Array.isArray(cleanLv.objective)) {
        cleanLv.obj = cleanLv.objective.map(p => p.type === 'code' ? `\`${p.value}\`` : p.value).join('');
        delete cleanLv.objective;
      }
      // Convert explanation
      if (Array.isArray(cleanLv.explanation)) {
        cleanLv.expl = cleanLv.explanation.map(p => p.type === 'code' ? `\`${p.value}\`` : p.value).join('');
        delete cleanLv.explanation;
      }
      // Convert hint
      if (Array.isArray(cleanLv.hint)) {
        cleanLv.hint = cleanLv.hint.map(p => p.type === 'code' ? `\`${p.value}\`` : p.value).join('');
      }
      // Rename properties
      if (cleanLv.solution !== undefined) { cleanLv.sol = cleanLv.solution; delete cleanLv.solution; }
      if (cleanLv.startingCode !== undefined) { cleanLv.start = cleanLv.startingCode; delete cleanLv.startingCode; }
      // Convert tests
      if (Array.isArray(cleanLv.tests)) {
        cleanLv.tests = cleanLv.tests.map(t => {
          if (typeof t === 'string') return { exp: t };
          const ct = {};
          if (t.input !== undefined) ct.in = t.input;
          if (t.expected !== undefined) ct.exp = t.expected;
          if (t.expectAnyOf !== undefined) ct.any = t.expectAnyOf;
          if (t.expectMatch !== undefined) ct.match = t.expectMatch;
          return ct;
        });
      }
      // Convert sourceChecks
      if (Array.isArray(cleanLv.sourceChecks)) {
        cleanLv.sourceChecks = cleanLv.sourceChecks.map(sc => {
          const cs = {};
          if (sc.className !== undefined) cs.cls = sc.className;
          if (sc.funcName !== undefined) cs.fn = sc.funcName;
          if (sc.inheritsFrom !== undefined) cs.inh = sc.inheritsFrom;
          if (sc.notPattern !== undefined) cs.not = sc.notPattern;
          return cs;
        });
      }
      // Initial files
      if (Array.isArray(cleanLv.initialFiles)) {
        cleanLv.init = cleanLv.initialFiles;
        delete cleanLv.initialFiles;
      }
      return cleanLv;
    })
  }))
}));

const yaml = dump(clean, { indent: 2, lineWidth: 120, noRefs: true, quotingType: "'" });
fs.writeFileSync('./src/data/tracks.yaml', yaml, 'utf-8');
console.log('Conversion complete');

// Cleanup
fs.unlinkSync('./scripts/_temp_convert.mjs');
