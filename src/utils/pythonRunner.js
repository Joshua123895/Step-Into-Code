import { ensurePyodide } from "./pyodide";

export async function runPythonWithIO(code, inputs = []) {
  const pyodide = await ensurePyodide();

  let stdout = "";
  let inputIndex = 0;

  pyodide.setStdout({ batched: (text) => { stdout += text; } });
  pyodide.setStderr({ batched: (text) => { stdout += text; } });
  pyodide.setStdin({
    stdin: () => {
      if (inputIndex < inputs.length) {
        return inputs[inputIndex++];
      }
      return "";
    },
  });

  try {
    await pyodide.runPythonAsync(code);
  } catch (e) {
    const msg = String(e);
    if (!stdout.includes(msg)) {
      stdout += "\n" + msg;
    }
  }

  return stdout.replace(/\r\n/g, "\n");
}

export async function runPython(code, onInput, onOutput) {
  try {
    const streamRes = await fetch("/api/run-python-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!streamRes.ok) throw new Error(`API returned ${streamRes.status}`);

    const { streamId } = await streamRes.json();

    return new Promise((resolve) => {
      const evtSource = new EventSource(`/api/run-python-events/${streamId}`);
      let resolved = false;

      evtSource.addEventListener("output", (e) => {
        const text = JSON.parse(e.data);
        if (onOutput) onOutput(text);
      });

      evtSource.addEventListener("input-request", (e) => {
        const { prompt } = JSON.parse(e.data);
        if (prompt && onOutput) onOutput(prompt);
        if (onInput) {
          onInput((value) => {
            fetch(`/api/run-python-input/${streamId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ input: value }),
            });
          });
        }
      });

      evtSource.addEventListener("done", (e) => {
        const { error } = JSON.parse(e.data);
        if (error && onOutput) onOutput("\n" + error);
        evtSource.close();
        if (!resolved) { resolved = true; resolve(); }
      });

      evtSource.onerror = () => {
        evtSource.close();
        if (!resolved) { resolved = true; resolve(); }
      };
    });
  } catch {
    const pyodide = await ensurePyodide();

    let stdout = "";

    pyodide.setStdout({ batched: (text) => { stdout += text; if (onOutput) onOutput(text); } });
    pyodide.setStderr({ batched: (text) => { stdout += text; if (onOutput) onOutput(text); } });
    pyodide.setStdin({
      stdin: () => "",
    });

    try {
      await pyodide.runPythonAsync(code);
    } catch (e) {
      const msg = String(e);
      if (onOutput) onOutput("\n" + msg);
    }
  }
}
