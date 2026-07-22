import { runInPyodideWorker, TIMEOUT_MESSAGE } from "./pyodideWorkerClient";

// Run one code submission against MANY input-sets in a single server process.
// Returns { stdouts: string[], files } or null if batch mode is unavailable
// (older server, production build, network error), callers must fall back to
// per-test runPythonReal calls.
export async function runPythonRealBatch(code, initialFiles = {}, trackedFiles = [], batchInputs = []) {
  // Production (Vercel static) has no /api server — POSTing there just returns
  // 405 and clutters the console. Skip straight to the per-test Pyodide path.
  if (import.meta.env.PROD) return null;
  try {
    const res = await fetch("/api/run-python", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, initialFiles, trackedFiles, batchInputs }),
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const result = await res.json();
    if (result.error) throw new Error(result.error);
    if (!Array.isArray(result.stdouts)) throw new Error("server has no batch support");
    result.stdouts = result.stdouts.map((s) => (s || "").replace(/\r\n/g, "\n"));
    result.source = "server-batch";
    return result;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[runner] batch run unavailable, falling back to per-test runs:", e);
    }
    return null;
  }
}

export async function runPythonReal(code, initialFiles = {}, trackedFiles = [], inputs = []) {
  // On production there is no /api/run-python server, so skip the always-failing
  // POST (a 405 the browser logs to the console) and run in-browser Pyodide
  // directly. In dev, try the server first and fall back to Pyodide on failure.
  if (!import.meta.env.PROD) {
    try {
      const res = await fetch("/api/run-python", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, initialFiles, trackedFiles, inputs }),
      });

      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const result = await res.json();
      result.stdout = (result.stdout || "").replace(/\r\n/g, "\n");
      result.source = "server";
      if (result.error && import.meta.env.DEV) {
        console.warn("[runner] server reported an error:", result.error);
      }
      return result;
    } catch (fallbackReason) {
      if (import.meta.env.DEV) {
        console.warn("[runner] /api/run-python unavailable, falling back to in-browser Pyodide:", fallbackReason);
      }
    }
  }

  try {
    const { stdout, files } = await runInPyodideWorker(code, { initialFiles, trackedFiles, inputs });
    return { stdout, files, source: "pyodide-fallback" };
  } catch (workerErr) {
    if (workerErr.message === "TIMEOUT") {
      return { stdout: TIMEOUT_MESSAGE, files: {}, source: "pyodide-fallback", error: "timeout" };
    }
    return { stdout: `[runner error] ${workerErr.message}`, files: {}, source: "pyodide-fallback", error: String(workerErr) };
  }
}
