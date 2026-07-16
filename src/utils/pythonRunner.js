import { ensurePyodide } from "./pyodide";

export async function runPythonWithIO(code, inputs = [], quiet = false) {
  const pyodide = await ensurePyodide();

  let stdout = "";

  pyodide.setStdout({ write: (buf) => { stdout += new TextDecoder().decode(buf); return buf.length; }, isatty: true });
  pyodide.setStderr({ write: (buf) => { stdout += new TextDecoder().decode(buf); return buf.length; }, isatty: true });

  const inputWrapper = quiet ? `
import sys, builtins
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
` : `
import sys, builtins
_orig_input = builtins.input
_inputs = ${JSON.stringify(inputs)}
_input_index = 0
def _input(prompt=""):
    global _input_index
    if prompt:
        sys.stdout.write(prompt)
        sys.stdout.flush()
    if _input_index < len(_inputs):
        line = _inputs[_input_index]
        _input_index += 1
    else:
        line = ""
    sys.stdout.write(line + "\\n")
    sys.stdout.flush()
    return line
builtins.input = _input
`;

  const wrappedCode = inputWrapper + "\n" + code;

  try {
    await pyodide.runPythonAsync(wrappedCode);
  } catch (e) {
    const msg = String(e);
    const cleaned = msg.startsWith("PythonError: Traceback (most recent call last):")
      ? msg.trim().split("\n").at(-1).trim()
      : msg;
    if (!stdout.includes(cleaned)) {
      stdout += "\n" + cleaned;
    }
  }

  return stdout.replace(/\r\n/g, "\n");
}

export async function runPython(code, onInput, onOutput) {
  const streamRes = await fetch("/api/run-python-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!streamRes.ok) throw new Error("Streaming API unavailable");

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
      evtSource.close();
      if (!resolved) { resolved = true; resolve(); }
    });

    evtSource.onerror = () => {
      evtSource.close();
      if (!resolved) { resolved = true; resolve(); }
    };
  });
}
