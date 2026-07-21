// Main-thread RPC wrapper around pyodideWorker.js. A timeout here isn't a
// vague "give up and hope" — calling worker.terminate() on a genuinely stuck
// worker actually kills the OS-level thread running the infinite loop,
// which a Promise.race timeout alone could never do (the main thread would
// just be waiting on a message that's never coming because the worker's own
// event loop is wedged inside synchronous Wasm execution).
export const EXECUTION_TIMEOUT_MS = 8000;
export const TIMEOUT_MESSAGE = "⏱ Execution stopped: possible infinite loop (exceeded 8s)";

let worker = null;
let nextId = 1;
const pending = new Map();

function spawnWorker() {
  const w = new Worker(new URL("./pyodideWorker.js", import.meta.url), { type: "module" });
  w.onmessage = (e) => {
    const { id, fatalError, ...rest } = e.data;
    const entry = pending.get(id);
    if (!entry) return;
    pending.delete(id);
    if (fatalError) entry.reject(new Error(fatalError));
    else entry.resolve(rest);
  };
  w.onerror = (e) => {
    for (const entry of pending.values()) entry.reject(new Error(e.message || "pyodide worker error"));
    pending.clear();
  };
  worker = w;
  return w;
}

export async function runInPyodideWorker(code, { initialFiles = {}, trackedFiles = [], inputs = [], needsIOShim = false } = {}) {
  const w = worker || spawnWorker();
  const id = nextId++;

  const resultPromise = new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
  });
  w.postMessage({ id, code, initialFiles, trackedFiles, inputs, needsIOShim });

  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      pending.delete(id);
      w.terminate();
      if (worker === w) worker = null;
      reject(new Error("TIMEOUT"));
    }, EXECUTION_TIMEOUT_MS);
  });

  try {
    return await Promise.race([resultPromise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}
