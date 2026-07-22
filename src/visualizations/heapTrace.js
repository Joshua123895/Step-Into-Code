import { traceRun } from "./traceRun";
import { buildStructHarness } from "./stackTrace";

// Runs the student's real heap code and snapshots the heap list after each
// statement. Item ids are matched by value across snapshots (a heap reorders on
// sift), so persisting values keep identity while pushes/pops add/remove it.
// With heapq the sift is C-internal, so we show the heap after each push/pop;
// a hand-written sift shows each step. Falls back to HeapViz's interpreter.

export function heapTraceToStates(snaps) {
  if (!Array.isArray(snaps)) return [];
  let name = null;
  for (const snap of snaps) {
    const k = Object.keys(snap)[0];
    if (k) { name = k; break; }
  }
  if (!name) return [];

  let itemId = 0;
  let prevItems = [];
  const states = [];
  let prevKey = null;
  for (const snap of snaps) {
    const vals = (snap[name] || []).map(String);
    const pool = {};
    for (const it of prevItems) (pool[it.value] ||= []).push(it._id);
    const items = vals.map((v) => {
      if (pool[v] && pool[v].length) return { value: v, _id: pool[v].shift() };
      return { value: v, _id: itemId++ };
    });
    prevItems = items;
    const key = JSON.stringify(items.map((x) => [x.value, x._id]));
    if (key !== prevKey) {
      states.push(items.map((x) => ({ ...x })));
      prevKey = key;
    }
  }
  return states;
}

export async function runHeapViz(code) {
  const snaps = await traceRun(buildStructHarness(code));
  const states = heapTraceToStates(snaps);
  return states.length > 1 ? states : null;
}
