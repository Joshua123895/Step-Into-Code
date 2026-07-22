import { traceRun, buildSettraceHarness, detectCalledFn, asDict } from "./traceRun";
import { detectDPType } from "./dpInterp";

// Runs the student's real Fibonacci DP code and animates the table/cache filling
// from actual execution: tabulation watches the list grow left-to-right,
// memoization watches the cache fill in true recursion order. Falls back to
// dpInterp.js if it can't be traced.

const mkCellsFactory = (filled, valueAt, n) => () => {
  const cells = [];
  for (let i = 0; i <= n; i++) cells.push({ index: i, value: filled.has(i) ? valueAt.get(i) : null });
  return cells;
};

function tabulationStates(snaps, listKey, type) {
  let finalList = null;
  for (let i = snaps.length - 1; i >= 0; i--) {
    if (Array.isArray(snaps[i][listKey])) { finalList = snaps[i][listKey]; break; }
  }
  if (!finalList || finalList.length < 2) return [];
  const n = finalList.length - 1;
  const filled = new Set([0, 1]);
  const valueAt = new Map([[0, Number(finalList[0])], [1, Number(finalList[1])]]);
  const mkCells = mkCellsFactory(filled, valueAt, n);

  const states = [{ type, n, cells: mkCells(), current: null, deps: [], formula: "base cases: f(0)=0, f(1)=1", result: null }];
  for (const s of snaps) {
    const list = s[listKey];
    if (!Array.isArray(list)) continue;
    for (let i = 2; i < list.length; i++) {
      const v = Number(list[i]);
      if (!filled.has(i) && v !== 0 && v === Number(list[i - 1]) + Number(list[i - 2])) {
        filled.add(i);
        valueAt.set(i, v);
        const a = Number(list[i - 1]);
        const b = Number(list[i - 2]);
        states.push({
          type, n, cells: mkCells(), current: i, deps: [i - 1, i - 2],
          formula: `f(${i}) = f(${i - 1}) + f(${i - 2}) = ${a} + ${b} = ${a + b}`,
          result: i === n ? v : null,
        });
      }
    }
  }
  return states;
}

function memoStates(snaps, dictKey, type) {
  let n = 1;
  for (const s of snaps) {
    const d = asDict(s[dictKey]);
    if (d) for (const [k] of d) n = Math.max(n, Number(k));
  }
  const filled = new Set([0, 1]);
  const valueAt = new Map([[0, 0], [1, 1]]);
  const mkCells = mkCellsFactory(filled, valueAt, n);

  const states = [{ type, n, cells: mkCells(), current: null, deps: [], formula: "base cases: f(0)=0, f(1)=1", result: null }];
  for (const s of snaps) {
    const d = asDict(s[dictKey]);
    if (!d) continue;
    for (const [k, v] of d) {
      const key = Number(k);
      if (!filled.has(key)) {
        filled.add(key);
        valueAt.set(key, Number(v));
        const a = valueAt.get(key - 1);
        const b = valueAt.get(key - 2);
        states.push({
          type, n, cells: mkCells(), current: key, deps: [key - 1, key - 2],
          formula: a !== undefined && b !== undefined
            ? `f(${key}) = f(${key - 1}) + f(${key - 2}) = ${a} + ${b} = ${a + b}`
            : `f(${key}) = ${v}`,
          result: key === n ? Number(v) : null,
        });
      }
    }
  }
  return states;
}

export function dpTraceToStates(snaps, type) {
  if (!Array.isArray(snaps) || snaps.length === 0) return [];
  const lineSnaps = snaps.filter((s) => !(s && "__return__" in s));

  let listKey = null;
  let listLen = 0;
  let dictKey = null;
  for (const s of lineSnaps) {
    for (const [k, v] of Object.entries(s)) {
      if (Array.isArray(v) && v.length > listLen) { listKey = k; listLen = v.length; }
      if (!dictKey && asDict(v)) dictKey = k;
    }
  }
  if (listKey) return tabulationStates(lineSnaps, listKey, type);
  if (dictKey) return memoStates(lineSnaps, dictKey, type);
  return [];
}

export async function runDPViz(code) {
  const fn = detectCalledFn(code);
  if (!fn) return null;
  const snaps = await traceRun(buildSettraceHarness(code, fn));
  const states = dpTraceToStates(snaps, detectDPType(code));
  return states.length > 1 ? states : null;
}
