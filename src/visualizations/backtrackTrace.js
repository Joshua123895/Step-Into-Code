import { traceRun, buildSettraceHarness, detectCalledFn } from "./traceRun";

// Runs the student's real backtracking code and animates the actual
// explore -> solution -> backtrack rhythm by watching the partial-solution list
// grow/shrink and the results list collect. The recursion is usually in a
// nested helper, so we trace the self-recursive function (whose closure vars
// path/result appear in its locals). Falls back to backtrackInterp.js.

function detectProblem(code) {
  if (/combination_sum|def\s+\w*combo|remaining\s*[<=]=?\s*0/.test(code) && /start/.test(code)) return "combination_sum";
  if (/permutation|remaining/i.test(code)) return "permutations";
  return "subsets";
}

// The function that calls itself inside its own body.
function detectRecursiveFn(code) {
  const lines = code.split("\n");
  const indentOf = (s) => s.length - s.trimStart().length;
  const found = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)def\s+(\w+)\s*\(/);
    if (!m) continue;
    const base = m[1].length;
    const name = m[2];
    let body = "";
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].trim() === "") continue;
      if (indentOf(lines[j]) <= base) break;
      body += lines[j] + "\n";
    }
    if (new RegExp("\\b" + name + "\\s*\\(").test(body)) found.push(name);
  }
  return found.length ? found[found.length - 1] : null;
}

const isArr = Array.isArray;
const isFlat = (v) => isArr(v) && v.every((x) => typeof x === "number" || typeof x === "string");
const isAoA = (v) => isArr(v) && v.length > 0 && v.every((x) => isArr(x));

export function backtrackTraceToStates(snaps, problem) {
  if (!isArr(snaps) || snaps.length === 0) return [];
  const line = snaps.filter((s) => !(s && "__return__" in s));

  // resultKey ever holds a list-of-lists; pathKey is the flat list whose length
  // varies the most (the input array stays constant, so it loses).
  let resultKey = null;
  const flat = {};
  for (const s of line) {
    for (const [k, v] of Object.entries(s)) {
      if (!resultKey && isAoA(v)) resultKey = k;
      if (isFlat(v)) {
        const f = (flat[k] ||= { min: Infinity, max: -Infinity });
        f.min = Math.min(f.min, v.length);
        f.max = Math.max(f.max, v.length);
      }
    }
  }
  let pathKey = null;
  let bestVar = 0;
  for (const [k, f] of Object.entries(flat)) {
    if (k === resultKey) continue;
    const variation = f.max - f.min;
    if (variation > bestVar) { bestVar = variation; pathKey = k; }
  }
  // The path list must actually grow and shrink; a constant list (the input
  // array) is not it.
  if (!pathKey) return [];

  const getResult = (s) => (isAoA(s[resultKey]) ? s[resultKey] : []);
  const getPath = (s) => (isFlat(s[pathKey]) ? s[pathKey] : []);

  const states = [{ problem, current: [], action: "start", solutions: [], justFound: false, pruned: false }];
  let prevPath = [];
  let prevResLen = 0;
  const fmt = (a) => `[${a.join(", ")}]`;

  for (const s of line) {
    const path = getPath(s);
    const result = getResult(s);
    const solutions = result.map((x) => [...x]);

    if (result.length > prevResLen) {
      states.push({ problem, current: [...path], action: `✓ solution ${fmt(path)}`, solutions, justFound: true, pruned: false });
      prevResLen = result.length;
      prevPath = path;
      continue;
    }
    if (path.length > prevPath.length) {
      states.push({ problem, current: [...path], action: `add ${path[path.length - 1]}`, solutions, justFound: false, pruned: false });
    } else if (path.length < prevPath.length) {
      states.push({ problem, current: [...path], action: "backtrack", solutions, justFound: false, pruned: false });
    }
    prevPath = path;
  }
  return states;
}

export async function runBacktrackViz(code) {
  const fn = detectRecursiveFn(code) || detectCalledFn(code);
  if (!fn) return null;
  const snaps = await traceRun(buildSettraceHarness(code, fn));
  const states = backtrackTraceToStates(snaps, detectProblem(code));
  return states.length > 1 ? states : null;
}
