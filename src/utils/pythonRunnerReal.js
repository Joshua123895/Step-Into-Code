import { runPythonWithIO } from "./pythonRunner";
import { buildFileSetup, buildFileTeardown, parseFileCaptures, stripFileCaptures } from "./fileManager";

export async function runPythonReal(code, initialFiles = {}, trackedFiles = [], inputs = []) {
  try {
    const res = await fetch('/api/run-python', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, initialFiles, trackedFiles, inputs }),
    });

    if (!res.ok) throw new Error(`API returned ${res.status}`);

    return await res.json();
  } catch {
    // Fall back to Skulpt (in-browser Python) when the API is unavailable
    const setup = buildFileSetup(initialFiles);
    const teardown = trackedFiles.length > 0 ? buildFileTeardown(trackedFiles) : "";
    const wrapped = setup + code + teardown;
    const stdout = await runPythonWithIO(wrapped, inputs);
    const files = parseFileCaptures(stdout);
    return { stdout: stripFileCaptures(stdout), files };
  }
}
