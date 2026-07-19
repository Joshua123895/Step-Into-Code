import { ensurePyodide } from "./pyodide";

// Run one code submission against MANY input-sets in a single server process.
// Returns { stdouts: string[], files } or null if batch mode is unavailable
// (older server, production build, network error) — callers must fall back to
// per-test runPythonReal calls.
export async function runPythonRealBatch(code, initialFiles = {}, trackedFiles = [], batchInputs = []) {
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
    const pyodide = await ensurePyodide();

    let stdout = "";

    pyodide.setStdout({ write: (buf) => { stdout += new TextDecoder().decode(buf); return buf.length; }, isatty: true });
    pyodide.setStderr({ write: (buf) => { stdout += new TextDecoder().decode(buf); return buf.length; }, isatty: true });

    for (const [name, content] of Object.entries(initialFiles || {})) {
      const parts = name.split("/");
      let path = "";
      for (let i = 0; i < parts.length - 1; i++) {
        path += "/" + parts[i];
        try { pyodide.FS.mkdir(path); } catch { /* exists */ }
      }
      pyodide.FS.writeFile("/" + name, content);
    }

    const inputShim = inputs.length > 0
      ? `import sys, builtins
sys.stdout.reconfigure(write_through=True)
_inputs = ${JSON.stringify(inputs)}
_input_index = 0
def _input(prompt=""):
    global _input_index
    if _input_index < len(_inputs):
        line = _inputs[_input_index]
        _input_index += 1
    else:
        line = ""
    return line
builtins.input = _input
`
      : `import sys
sys.stdout.reconfigure(write_through=True)
`;

    try {
      await pyodide.runPythonAsync(inputShim + code);
    } catch (e) {
      const msg = String(e);
      const cleaned = msg.startsWith("PythonError: Traceback (most recent call last):")
        ? msg.trim().split("\n").at(-1).trim()
        : msg;
      if (!stdout.includes(cleaned)) {
        stdout += "\n" + cleaned;
      }
    }

    const files = {};
    for (const name of trackedFiles || []) {
      try {
        files[name] = pyodide.FS.readFile("/" + name, { encoding: "utf8" });
      } catch { /* file doesn't exist */ }
    }

    return { stdout, files, source: "pyodide-fallback" };
  }
}
