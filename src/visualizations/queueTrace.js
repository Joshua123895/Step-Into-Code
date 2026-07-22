import { traceRun } from "./traceRun";
import { buildStructHarness } from "./stackTrace";

// Runs the student's real queue/deque code and snapshots each queue per line
// (list-based, collections.deque, or a class wrapping one). Infers each item's
// enter side (front vs back) by comparing consecutive snapshots, so the
// enqueue/dequeue animation is faithful. Falls back to the QueueViz interpreter.

const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

// Align the new value list to the previous items, preserving ids for items that
// stayed and tagging any new item's side (left = added at front, right = back).
function reconcile(prev, vals) {
  const prevVals = prev.map((p) => p.val);
  const n = prevVals.length;
  const m = vals.length;
  if (eq(prevVals, vals)) return prev;
  if (m === n + 1) {
    if (eq(prevVals, vals.slice(0, n))) return [...prev, { val: vals[n], side: "right", _id: null }];
    if (eq(prevVals, vals.slice(1))) return [{ val: vals[0], side: "left", _id: null }, ...prev];
  }
  if (m === n - 1) {
    if (eq(vals, prevVals.slice(1))) return prev.slice(1); // popleft / dequeue
    if (eq(vals, prevVals.slice(0, n - 1))) return prev.slice(0, n - 1); // pop
  }
  return vals.map((v) => ({ val: v, side: "right", _id: null }));
}

export function queueTraceToStates(snaps) {
  if (!Array.isArray(snaps) || snaps.length === 0) return [];
  const idState = {};
  let itemId = 0;
  const states = [];
  let prevKey = null;

  for (const snap of snaps) {
    const out = {};
    for (const [name, vals] of Object.entries(snap)) {
      const reconciled = reconcile(idState[name] || [], vals.map(String));
      const items = reconciled.map((it) => (it._id === null ? { ...it, _id: itemId++ } : it));
      idState[name] = items;
      out[name] = items.map((x) => ({ ...x }));
    }
    const key = JSON.stringify(out);
    if (key !== prevKey) {
      states.push(out);
      prevKey = key;
    }
  }
  return states;
}

export async function runQueueViz(code) {
  const snaps = await traceRun(buildStructHarness(code));
  const states = queueTraceToStates(snaps);
  return states.some((s) => Object.keys(s).length > 0) && states.length > 1 ? states : null;
}
