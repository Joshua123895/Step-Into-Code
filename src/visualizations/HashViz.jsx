import { useState, useCallback, useEffect, useRef } from "react";
import usePlayback from "./usePlayback";
import VizControls from "./VizControls";
import AnimatedItem from "./AnimatedItem";

function parseHashStates(code) {
  const lines = code.split("\n");
  const hashes = {};
  const states = [];

  const snapshot = () => states.push(JSON.parse(JSON.stringify(hashes)));

  snapshot();

  for (const line of lines) {
    if (line.trim().startsWith("#")) continue;
    const init = line.match(/(\w+)\s*=\s*\{\s*\}/);
    if (init) {
      hashes[init[1]] = [];
      snapshot();
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
      snapshot();
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
      snapshot();
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
      snapshot();
    }
  }

  return states;
}

function VizBody({ hashes, ghosts = {} }) {
  const names = Object.keys(hashes);
  const allNames = [...new Set([...names, ...Object.keys(ghosts)])];

  if (allNames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-30">☰</div>
        <p className="text-xs">Create a dict to see it<br /><code className="text-xs" style={{ color: "var(--text-secondary)" }}>d = {}</code></p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {allNames.map((name) => {
        const items = hashes[name] || [];
        const ghostItems = ghosts[name] || [];

        return (
          <div key={name} className="w-full">
            <div className="text-xs font-bold mb-2 text-center" style={{ color: "var(--text-muted)", fontFamily: "'Courier New', monospace" }}>
              {name}
            </div>
            <div className="flex flex-col gap-1">
              {items.length === 0 && ghostItems.length === 0 && (
                <div className="text-xs text-center py-3 rounded-lg" style={{ background: "var(--bg)", border: "2px dashed var(--border-strong)", color: "var(--text-muted)" }}>empty</div>
              )}
              {items.map((pair) => (
                <AnimatedItem key={pair.key}>
                  <div
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
                </AnimatedItem>
              ))}
              {ghostItems.map((pair) => (
                <AnimatedItem key={`ghost-${pair.key}`} leaving>
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs"
                    style={{
                      background: "var(--bg)",
                      border: "1.5px solid var(--border)",
                      color: "var(--text-muted)",
                      opacity: 0.5,
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>{pair.key}</span>
                    <span style={{ color: "var(--text-muted)" }}>→</span>
                    <span style={{ color: "var(--text-muted)" }}>{pair.val}</span>
                  </div>
                </AnimatedItem>
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

export default function HashViz({ code }) {
  const playback = usePlayback();
  const [parsed, setParsed] = useState(null);
  const [ghosts, setGhosts] = useState({});
  const prevRef = useRef(null);
  const ghostTimerRef = useRef(null);

  const ensureParsed = useCallback(() => {
    if (parsed && parsed.code === code) return parsed.states;
    const s = parseHashStates(code);
    setParsed({ code, states: s });
    playback.configure(s.length);
    return s;
  }, [code, parsed, playback]);

  useEffect(() => {
    if (!parsed || playback.step < 0) return;
    const cur = parsed.states[Math.min(playback.step, parsed.states.length - 1)];
    const prev = prevRef.current;
    prevRef.current = cur;
    if (!prev) return;
    if (ghostTimerRef.current) clearTimeout(ghostTimerRef.current);
    const g = {};
    for (const name of Object.keys(prev)) {
      const prevItems = prev[name] || [];
      const curItems = cur[name] || [];
      const curKeys = new Set(curItems.map((i) => i.key));
      const removed = prevItems.filter((i) => !curKeys.has(i.key));
      if (removed.length > 0) g[name] = removed;
    }
    if (Object.keys(g).length > 0) {
      setGhosts(g);
      ghostTimerRef.current = setTimeout(() => { setGhosts({}); ghostTimerRef.current = null; }, 300);
    } else {
      setGhosts({});
    }
  }, [parsed, playback.step]);

  const handleToggle = useCallback(() => {
    if (playback.playing) {
      playback.pause();
    } else {
      ensureParsed();
      playback.play();
    }
  }, [playback, ensureParsed]);

  const handleStep = useCallback(() => {
    ensureParsed();
    playback.stepForward();
  }, [playback, ensureParsed]);

  const handleReset = useCallback(() => {
    playback.reset();
    setParsed(null);
    setGhosts({});
    prevRef.current = null;
  }, [playback]);

  if (!parsed) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <button
          onClick={handleToggle}
          className="text-xs px-4 py-2 rounded font-bold hover:brightness-110 active:brightness-90 active:scale-[0.98]"
          style={{
            background: "#6AAE6F",
            color: "#fff",
          }}
        >
          ▶ Run
        </button>
      </div>
    );
  }

  const idx = Math.max(0, Math.min(playback.step, parsed.states.length - 1));
  return (
    <div className="flex flex-col">
      <VizControls
        onToggle={handleToggle}
        onStep={handleStep}
        onPrev={playback.stepBackward}
        playing={playback.playing}
        step={playback.step}
        total={playback.total}
      />
      <VizBody hashes={parsed.states[idx]} ghosts={ghosts} />
    </div>
  );
}
