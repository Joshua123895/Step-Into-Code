import { ensurePyodide } from "./pyodide";

// Runs `code` with the given already-known input values. If the script calls
// input() more times than there are values in `inputs`, execution stops early
// (via a sentinel exception) and `needsInput: true` is returned instead of
// silently feeding it "" — the caller is expected to prompt for one more
// value, append it to `inputs`, and call this again (see CodeEditorContainer,
// which reruns from scratch each time to simulate a live console since Pyodide
// on the main thread can't block synchronously on user input).
export async function runPythonWithIO(code, inputs = []) {
  const pyodide = await ensurePyodide();

  let stdout = "";

  pyodide.setStdout({ write: (buf) => { stdout += new TextDecoder().decode(buf); return buf.length; }, isatty: true });
  pyodide.setStderr({ write: (buf) => { stdout += new TextDecoder().decode(buf); return buf.length; }, isatty: true });

  const inputWrapper = `
import sys, builtins
sys.stdout.reconfigure(write_through=True)
class _NeedMoreInput(BaseException):
    pass
_inputs = ${JSON.stringify(inputs)}
_input_index = 0
def _input(prompt=""):
    global _input_index
    if prompt:
        sys.stdout.write(str(prompt))
        sys.stdout.flush()
    if _input_index >= len(_inputs):
        raise _NeedMoreInput()
    line = _inputs[_input_index]
    _input_index += 1
    sys.stdout.write(str(line) + "\\n")
    sys.stdout.flush()
    return line
builtins.input = _input
`;

  const wrappedCode = inputWrapper + "\n" + code;

  let needsInput = false;
  try {
    await pyodide.runPythonAsync(wrappedCode);
  } catch (e) {
    const msg = String(e);
    if (msg.includes("_NeedMoreInput")) {
      needsInput = true;
    } else {
      const cleaned = msg.startsWith("PythonError: Traceback (most recent call last):")
        ? msg.trim().split("\n").at(-1).trim()
        : msg;
      if (!stdout.includes(cleaned)) {
        stdout += "\n" + cleaned;
      }
    }
  }

  return { stdout: stdout.replace(/\r\n/g, "\n"), needsInput };
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
