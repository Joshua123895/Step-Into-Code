import { traceRun, buildSettraceHarness, detectCalledFn } from "./traceRun";

// Runs the student's real greedy code and animates the actual execution.
// Activity Selection, Greedy Coin Change and Jump Game are three different
// shapes, so this detects which one (same signal as greedyInterp) and captures
// the relevant locals from the trace. Falls back to greedyInterp.js otherwise.

function detectProblem(code) {
  if (/activity_selection|last_end/.test(code)) return "activity";
  if (/greedy_coin_change|while\s+amount\s*>=/.test(code)) return "coins";
  return "jump";
}

const isNum = (x) => typeof x === "number";
const is2D = (v) => Array.isArray(v) && v.length > 0 && v.every((x) => Array.isArray(x) && x.length === 2);

function splitRuns(snaps) {
  const runs = [];
  let cur = [];
  for (const s of snaps) {
    if (s && "__return__" in s) { runs.push({ snaps: cur, ret: s.__return__ }); cur = []; }
    else cur.push(s);
  }
  if (cur.length) runs.push({ snaps: cur, ret: undefined });
  return runs;
}

// -------- Activity Selection: re-derive kept from the real sorted list --------
function activityStates(snaps) {
  let sorted = null;
  for (let i = snaps.length - 1; i >= 0; i--) {
    for (const v of Object.values(snaps[i])) {
      if (is2D(v)) { sorted = v.map((p) => [Number(p[0]), Number(p[1])]); break; }
    }
    if (sorted) break;
  }
  if (!sorted || sorted.length === 0) return [];

  const states = [{ problem: "activity", activities: sorted, current: -1, kept: [], lastEnd: null, count: 0 }];
  let lastEnd = sorted[0][1];
  const kept = [0];
  states.push({ problem: "activity", activities: sorted, current: 0, kept: [...kept], lastEnd, count: 1 });
  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i];
    const keep = start >= lastEnd;
    if (keep) { kept.push(i); lastEnd = end; }
    states.push({ problem: "activity", activities: sorted, current: i, kept: [...kept], lastEnd, count: kept.length, skipped: !keep });
  }
  return states;
}

// -------- Coin Change: watch the picked list grow, amount shrink --------
function coinsStates(snaps) {
  const line = snaps.filter((s) => !(s && "__return__" in s));
  // picked = a list that starts empty and grows; amount = a scalar that shrinks.
  let pickedKey = null;
  const growth = {};
  for (const s of line) {
    for (const [k, v] of Object.entries(s)) {
      if (Array.isArray(v) && v.every(isNum)) {
        if (!(k in growth)) growth[k] = { first: v.length, max: v.length };
        growth[k].max = Math.max(growth[k].max, v.length);
      }
    }
  }
  for (const [k, g] of Object.entries(growth)) {
    if (g.first === 0 && g.max > 0) { pickedKey = k; break; }
  }
  if (!pickedKey) return [];

  // amount: the scalar with the largest starting value that decreases over time.
  let amountKey = null;
  let amountFirst = -Infinity;
  for (const s of line) {
    for (const [k, v] of Object.entries(s)) {
      if (isNum(v) && !(k in growth)) {
        if (amountKey === null && v > amountFirst) { amountKey = k; amountFirst = v; }
      }
    }
    if (amountKey) break;
  }
  const original = amountKey ? Number(line.find((s) => amountKey in s)[amountKey]) : 0;

  const states = [{ problem: "coins", coins: [], amount: original, remaining: original, picked: [], currentCoin: null }];
  let prevLen = 0;
  for (const s of line) {
    const picked = Array.isArray(s[pickedKey]) ? s[pickedKey] : [];
    if (picked.length > prevLen) {
      states.push({
        problem: "coins",
        coins: [],
        amount: original,
        remaining: amountKey && isNum(s[amountKey]) ? Number(s[amountKey]) : original - picked.reduce((a, b) => a + Number(b), 0),
        picked: picked.map(Number),
        currentCoin: Number(picked[picked.length - 1]),
      });
      prevLen = picked.length;
    }
  }
  return states;
}

// -------- Jump Game: farthest-reachable tracker, per call (run) --------
function jumpStates(snaps) {
  const runs = splitRuns(snaps);
  let firstNums = [];
  for (const s of runs[0]?.snaps || []) {
    for (const v of Object.values(s)) { if (Array.isArray(v) && v.every(isNum)) { firstNums = v.map(Number); break; } }
    if (firstNums.length) break;
  }
  const states = [{ problem: "jump", nums: firstNums, index: null, farthest: 0, stuck: false, result: null, run: 1 }];

  runs.forEach((run, ri) => {
    let nums = [];
    for (const s of run.snaps) {
      for (const v of Object.values(s)) { if (Array.isArray(v) && v.every(isNum)) { nums = v.map(Number); break; } }
      if (nums.length) break;
    }
    if (!nums.length) return;
    // For each index, take the last snapshot (farthest fully updated).
    const perIndex = new Map();
    for (const s of run.snaps) {
      const iKey = ["i", "idx", "index", "j"].find((n) => Number.isInteger(s[n]) && s[n] >= 0 && s[n] < nums.length);
      if (iKey === undefined) continue;
      const i = s[iKey];
      const fKey = ["farthest", "reach", "max_reach", "maxReach"].find((n) => Number.isInteger(s[n]));
      perIndex.set(i, fKey !== undefined ? s[fKey] : (perIndex.get(i) ?? 0));
    }
    const indices = [...perIndex.keys()].sort((a, b) => a - b);
    const stuckRun = run.ret === false;
    indices.forEach((i, k) => {
      const isLast = k === indices.length - 1;
      states.push({
        problem: "jump",
        nums,
        index: i,
        farthest: perIndex.get(i),
        stuck: stuckRun && isLast,
        result: isLast ? (stuckRun ? false : true) : null,
        run: ri + 1,
      });
    });
  });
  return states;
}

export function greedyTraceToStates(snaps, problem) {
  if (!Array.isArray(snaps) || snaps.length === 0) return [];
  if (problem === "activity") return activityStates(snaps);
  if (problem === "coins") return coinsStates(snaps);
  return jumpStates(snaps);
}

export async function runGreedyViz(code) {
  const fn = detectCalledFn(code);
  if (!fn) return null;
  const snaps = await traceRun(buildSettraceHarness(code, fn));
  const states = greedyTraceToStates(snaps, detectProblem(code));
  return states.length > 1 ? states : null;
}
