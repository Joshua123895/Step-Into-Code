import { runInPyodideWorker } from "../utils/pyodideWorkerClient";

const START = "@@VIZTRACE@@";
const END = "@@ENDTRACE@@";

// Runs an instrumented Python harness in the shared Pyodide worker and returns
// the JSON trace it printed between the sentinels. This is what lets a
// visualization animate the student's REAL code (any variable names, any
// optimization, any early-exit) instead of a JS interpreter's guess at it.
//
// Throws if no valid trace came back (syntax error, timeout, unexpected shape)
// so each viz can fall back to its legacy JS interpreter and never show a
// blank/broken panel.
export async function traceRun(harnessCode) {
  const { stdout } = await runInPyodideWorker(harnessCode, {});
  const s = stdout.indexOf(START);
  const e = stdout.indexOf(END);
  if (s === -1 || e === -1 || e < s) throw new Error("viz trace not produced");
  return JSON.parse(stdout.slice(s + START.length, e));
}

export { START as TRACE_START, END as TRACE_END };

// The def the driver actually calls (the last call to a defined function).
export function detectCalledFn(code) {
  const defs = [...code.matchAll(/^\s*def\s+(\w+)\s*\(/gm)].map((m) => m[1]);
  if (defs.length === 0) return null;
  let last = null;
  const callRe = /(\w+)\s*\(/g;
  let m;
  while ((m = callRe.exec(code)) !== null) {
    if (defs.includes(m[1])) last = m[1];
  }
  return last || defs[defs.length - 1];
}

// A shared sys.settrace harness: runs the student's real code and records, for
// every line executed inside the target function, a snapshot of its local
// variables (scalars, flat lists, and flat dicts). Dicts are serialized as
// {"__dict__": [[k, v], ...]} to preserve insertion order. The return value is
// appended as {"__return__": v}. Each viz's converter turns these real
// snapshots into its own animation states.
export function buildSettraceHarness(code, targetFn) {
  const indented = code.split("\n").map((l) => "    " + l).join("\n");
  return `import json, sys

def _ser(v):
    if isinstance(v, bool) or isinstance(v, (int, float, str)):
        return v
    if isinstance(v, list) and len(v) <= 200:
        try:
            return list(v) if all(isinstance(x, (int, float, str, bool)) for x in v) else None
        except Exception:
            return None
    if isinstance(v, dict) and len(v) <= 200:
        try:
            ok = all(isinstance(k, (int, float, str, bool)) and isinstance(val, (int, float, str, bool)) for k, val in v.items())
            return {"__dict__": [[k, val] for k, val in v.items()]} if ok else None
        except Exception:
            return None
    return None

_SNAPS = []
_TARGET = ${JSON.stringify(targetFn)}
def _tr(frame, event, arg):
    if frame.f_code.co_name != _TARGET:
        return None
    if event == 'line':
        _loc = {}
        for _k, _v in list(frame.f_locals.items()):
            _s = _ser(_v)
            if _s is not None:
                _loc[_k] = _s
        _SNAPS.append(_loc)
    elif event == 'return':
        _SNAPS.append({"__return__": _ser(arg)})
    return _tr
sys.settrace(_tr)
try:
${indented}
except Exception:
    pass
sys.settrace(None)
print("${START}" + json.dumps(_SNAPS) + "${END}")
`;
}

// Helpers for converters: pull a serialized dict back into [[k, v], ...].
export function asDict(v) {
  return v && typeof v === "object" && !Array.isArray(v) && Array.isArray(v.__dict__) ? v.__dict__ : null;
}

