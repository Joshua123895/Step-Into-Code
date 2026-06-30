export async function runPythonReal(code, initialFiles = {}, trackedFiles = [], inputs = []) {
  const res = await fetch('/api/run-python', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, initialFiles, trackedFiles, inputs }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Python execution failed');
  }

  return data;
}
