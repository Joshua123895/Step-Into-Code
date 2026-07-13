import { ensurePyodide } from "./pyodide";

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
    return result;
  } catch {
    const pyodide = await ensurePyodide();

    let stdout = "";
    let inputIndex = 0;

    pyodide.setStdout({ write: (buf) => { stdout += new TextDecoder().decode(buf); return buf.length; }, isatty: true });
    pyodide.setStderr({ write: (buf) => { stdout += new TextDecoder().decode(buf); return buf.length; }, isatty: true });
    pyodide.setStdin({
      stdin: () => {
        if (inputIndex < inputs.length) {
          return inputs[inputIndex++];
        }
        return "";
      },
    });

    for (const [name, content] of Object.entries(initialFiles || {})) {
      const parts = name.split("/");
      let path = "";
      for (let i = 0; i < parts.length - 1; i++) {
        path += "/" + parts[i];
        try { pyodide.FS.mkdir(path); } catch { /* exists */ }
      }
      pyodide.FS.writeFile("/" + name, content);
    }

    try {
      await pyodide.runPythonAsync(code);
    } catch (e) {
      const msg = String(e);
      if (!stdout.includes(msg)) {
        stdout += "\n" + msg;
      }
    }

    const files = {};
    for (const name of trackedFiles || []) {
      try {
        files[name] = pyodide.FS.readFile("/" + name, { encoding: "utf8" });
      } catch { /* file doesn't exist */ }
    }

    return { stdout, files };
  }
}
