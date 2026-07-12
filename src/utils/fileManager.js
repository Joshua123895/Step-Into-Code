export function mergeFileStore(existing, initial, captures) {
  const merged = { ...existing };
  if (initial) {
    for (const [name, content] of Object.entries(initial)) {
      merged[name] = content;
    }
  }
  if (captures) {
    for (const [name, content] of Object.entries(captures)) {
      merged[name] = content;
    }
  }
  return merged;
}
