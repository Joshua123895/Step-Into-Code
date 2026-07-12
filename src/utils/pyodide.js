import { loadPyodide } from "pyodide";

let instance = null;
let loading = null;

export async function ensurePyodide() {
  if (instance) return instance;
  if (loading) return loading;

  loading = loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.4/full/",
    fullStdLib: true,
    stdin: () => "",
  }).then((pyodide) => {
    instance = pyodide;
    return pyodide;
  });

  return loading;
}
