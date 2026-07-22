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
