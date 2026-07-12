const FILE_MARKER = "__FILE_SAVE__";

function escapeStr(s) {
  return JSON.stringify(s);
}

export function buildFileSetup(files) {
  const store = files || {};
  const keys = Object.keys(store);
  if (keys.length === 0) return "";
  let code = "";
  for (const name of keys) {
    const content = store[name];
    code += `with open(${escapeStr(name)}, "w") as __f:\n    __f.write(${escapeStr(content)})\n\n`;
  }
  return code;
}

export function buildFileTeardown(trackList) {
  if (!trackList || trackList.length === 0) return "";
  let code = "\n\nimport json\n";
  for (const name of trackList) {
    code += `try:\n    with open(${escapeStr(name)}, "r") as __f:\n        print(${escapeStr(FILE_MARKER)} + json.dumps({"n": ${escapeStr(name)}, "c": __f.read()}))\nexcept:\n    pass\n\n`;
  }
  return code;
}

export function parseFileCaptures(output) {
  const files = {};
  const lines = output.replace(/\r\n/g, "\n").split("\n");
  for (const line of lines) {
    if (line.startsWith(FILE_MARKER)) {
      try {
        const data = JSON.parse(line.slice(FILE_MARKER.length));
        files[data.n] = data.c;
      } catch {
        // skip malformed lines
      }
    }
  }
  return files;
}

export function stripFileCaptures(output) {
  return output.replace(/\r\n/g, "\n").split("\n").filter((l) => !l.startsWith(FILE_MARKER)).join("\n");
}

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
