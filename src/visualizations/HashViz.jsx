import { useMemo } from "react";

function parseHashOps(code) {
  const lines = code.split("\n");
  const hashes = {};

  for (const line of lines) {
    if (line.trim().startsWith("#")) continue;
    const init = line.match(/(\w+)\s*=\s*\{\s*\}/);
    if (init) {
      hashes[init[1]] = [];
      continue;
    }

    const initFull = line.match(/(\w+)\s*=\s*\{(.+?)\}/);
    if (initFull && !initFull[0].includes("(")) {
      const pairs = [];
      const pairRe = /'([^']*)'\s*:\s*([^,}]+)/g;
      let m;
      while ((m = pairRe.exec(initFull[2])) !== null) {
        pairs.push({ key: m[1], val: m[2].trim() });
      }
      if (pairs.length > 0) {
        hashes[initFull[1]] = pairs;
      }
      continue;
    }

    const assign = line.match(/(\w+)\[('?[^\]]+?'?)\]\s*=\s*(.+)/);
    if (assign && hashes[assign[1]]) {
      const key = assign[2].replace(/^['"]|['"]$/g, "");
      const val = assign[3].trim();
      const copy = [...hashes[assign[1]]];
      const existing = copy.findIndex((p) => p.key === key);
      if (existing >= 0) {
        copy[existing] = { key, val, updated: true };
      } else {
        copy.push({ key, val, updated: true });
      }
      hashes[assign[1]] = copy;
      continue;
    }

    const access = line.match(/(\w+)\[('?[^\]]+?'?)\]/);
    if (access && hashes[access[1]]) {
      const key = access[2].replace(/^['"]|['"]$/g, "");
      const copy = hashes[access[1]].map((p) => ({
        ...p,
        accessed: p.key === key ? true : p.accessed,
      }));
      hashes[access[1]] = copy;
    }
  }

  return hashes;
}

export default function HashViz({ code }) {
  const hashes = useMemo(() => parseHashOps(code), [code]);
  const names = Object.keys(hashes);

  if (names.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-30">☰</div>
        <p className="text-xs">Create a dict to see it<br /><code className="text-xs" style={{ color: "var(--text-secondary)" }}>d = {}</code></p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {names.map((name) => {
        const items = hashes[name];

        return (
          <div key={name} className="w-full">
            <div className="text-xs font-bold mb-2 text-center" style={{ color: "var(--text-muted)", fontFamily: "'Courier New', monospace" }}>
              {name}
            </div>
            <div className="flex flex-col gap-1">
              {items.length === 0 && (
                <div className="text-xs text-center py-3 rounded-lg" style={{ background: "var(--bg)", border: "2px dashed var(--border-strong)", color: "var(--text-muted)" }}>empty</div>
              )}
              {items.map((pair, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs"
                  style={{
                    background: pair.accessed ? "#7AA2F715" : pair.updated ? "#E9B44C15" : "var(--bg)",
                    border: "1.5px solid " + (pair.accessed ? "#7AA2F7" : pair.updated ? "#E9B44C" : "var(--border)"),
                    color: "var(--text)",
                  }}
                >
                  <span style={{ color: "#BB9AF7" }}>{pair.key}</span>
                  <span style={{ color: "var(--text-muted)" }}>→</span>
                  <span style={{ color: "#28CA41" }}>{pair.val}</span>
                  {pair.accessed && <span className="text-[9px]" style={{ color: "#7AA2F7" }}>read</span>}
                  {pair.updated && <span className="text-[9px]" style={{ color: "#E9B44C" }}>updated</span>}
                </div>
              ))}
            </div>
            <div className="text-[10px] text-center mt-1" style={{ color: "var(--text-muted)" }}>
              {items.length} entr{items.length === 1 ? "y" : "ies"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
