import { traceRun, TRACE_START, TRACE_END } from "./traceRun";

// Runs the student's actual sorting code and captures every list read/write,
// then turns that into the bar animation. Because it executes their real
// Python (in Pyodide), it handles ANY way they wrote the algorithm — optimized
// bubble sort with a `swapped` flag, odd variable names, early `break`, etc. —
// which the pattern-matching interpreter in sortInterp.js could not.

// Find the sort function to call and the array literal to feed it.
export function detectSortTarget(code) {
  const defs = [...code.matchAll(/^\s*def\s+(\w+)\s*\(/gm)].map((m) => m[1]);
  if (defs.length === 0) return null;
  const nums = (s) => s.split(",").map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x));

  // Inline literal: e.g. print(bubble_sort([5, 2, 9, 1, 5, 6]))
  const inlineCall = code.match(/(\w+)\s*\(\s*\[\s*(-?\d+(?:\s*,\s*-?\d+)*)\s*\]\s*\)/);
  if (inlineCall && defs.includes(inlineCall[1])) {
    return { fn: inlineCall[1], array: nums(inlineCall[2]) };
  }
  // Named array: nums = [..]  then  sort_fn(nums)
  const arrDef = code.match(/(\w+)\s*=\s*\[\s*(-?\d+(?:\s*,\s*-?\d+)*)\s*\]/);
  if (arrDef) {
    const array = nums(arrDef[2]);
    const call = code.match(new RegExp(`(\\w+)\\s*\\(\\s*${arrDef[1]}\\s*\\)`));
    if (call && defs.includes(call[1])) return { fn: call[1], array };
    return { fn: defs[0], array };
  }
  return null;
}

export function buildSortHarness(code) {
  const target = detectSortTarget(code);
  if (!target || target.array.length === 0) return null;
  // The student's code runs first (its own driver print is harmless). Then we
  // re-run the detected sort on an instrumented copy of the array so every
  // in-place read/write is recorded.
  const harness = `import json
${code}

_VT = []
class _VL(list):
    def __getitem__(self, _i):
        _r = list.__getitem__(self, _i)
        if isinstance(_i, int):
            _VT.append([0, _i, list(self)])
        return _r
    def __setitem__(self, _i, _v):
        list.__setitem__(self, _i, _v)
        if isinstance(_i, int):
            _VT.append([1, _i, list(self)])

_va = _VL(${JSON.stringify(target.array)})
try:
    ${target.fn}(_va)
except Exception:
    pass
print("${TRACE_START}" + json.dumps(_VT) + "${TRACE_END}")
`;
  return { harness, array: target.array };
}

// Trace events are [op, index, arraySnapshot] with op 0=read, 1=write.
// Reads are paired into "compare" frames (the dominant arr[j] vs arr[j+1]
// shape); consecutive writes are merged into one "swap"/"write" frame.
export function sortTraceToStates(trace, initialArray) {
  const mk = (arr) => arr.map((v, i) => ({ value: String(v), _id: i }));
  const states = [{ items: mk(initialArray), highlight: null }];
  let readBuf = [];
  let writeBuf = null;

  const flushReads = () => {
    if (readBuf.length === 0) return;
    const indices = [...new Set(readBuf.map((r) => r[1]))];
    states.push({ items: mk(readBuf[readBuf.length - 1][2]), highlight: { type: "compare", indices } });
    readBuf = [];
  };
  const flushWrites = () => {
    if (!writeBuf) return;
    const indices = [...writeBuf.indices];
    states.push({ items: mk(writeBuf.arr), highlight: { type: indices.length >= 2 ? "swap" : "write", indices } });
    writeBuf = null;
  };

  for (const ev of trace) {
    if (ev[0] === 0) {
      flushWrites();
      readBuf.push(ev);
      if (readBuf.length === 2) flushReads();
    } else {
      flushReads();
      if (!writeBuf) writeBuf = { indices: new Set(), arr: ev[2] };
      writeBuf.indices.add(ev[1]);
      writeBuf.arr = ev[2];
    }
  }
  flushReads();
  flushWrites();
  return states;
}

// Returns animation states from real execution, or null if the code can't be
// instrumented this way (caller then falls back to the JS interpreter).
export async function runSortViz(code) {
  const built = buildSortHarness(code);
  if (!built) return null;
  const trace = await traceRun(built.harness);
  if (!Array.isArray(trace) || trace.length === 0) return null;
  return sortTraceToStates(trace, built.array);
}
