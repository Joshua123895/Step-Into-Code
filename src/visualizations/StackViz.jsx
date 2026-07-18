import { useState, useCallback, useEffect, useRef } from "react";
import usePlayback from "./usePlayback";
import VizControls from "./VizControls";
import AnimatedItem from "./AnimatedItem";

function parseStackStates(code) {
  const lines = code.split("\n");
  const stacks = {};
  let itemId = 0;
  const states = [];

  const snapshot = () => states.push(JSON.parse(JSON.stringify(stacks)));

  const getIndent = (s) => s.length - s.trimStart().length;

  const execLine = (line) => {
    if (line.trim().startsWith("#")) return;
    const init = line.match(/(\w+)\s*=\s*\[\s*\]/);
    if (init) {
      stacks[init[1]] = [];
      snapshot();
      return;
    }

    const push = line.match(/(\w+)\.(?:append|push)\s*\((.+?)\)/);
    if (push && stacks[push[1]] !== undefined) {
      stacks[push[1]] = [...stacks[push[1]], { val: push[2], _id: itemId++ }];
      snapshot();
      return;
    }

    const pop = line.match(/(\w+)\.pop\s*\(\s*(\d*)\s*\)/);
    if (pop && stacks[pop[1]] !== undefined) {
      const idx = pop[2] !== "" ? Number(pop[2]) : stacks[pop[1]].length - 1;
      if (idx >= 0 && idx < stacks[pop[1]].length) {
        const copy = [...stacks[pop[1]]];
        copy.splice(idx, 1);
        stacks[pop[1]] = copy;
      }
      snapshot();
    }
  };

  snapshot();

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const indent = getIndent(line);
    const t = line.trim();

    const forMatch = t.match(/for\s+\w+\s+in\s+range\s*\(\s*(\d+)\s*\)\s*:/);
    if (forMatch) {
      const count = Number(forMatch[1]);
      const bodyIndent = indent + 1;
      const bodyLines = [];
      let j = i + 1;
      while (j < lines.length && getIndent(lines[j]) >= bodyIndent) {
        bodyLines.push(lines[j]);
        j++;
      }
      for (let iter = 0; iter < count; iter++) {
        for (const bl of bodyLines) {
          execLine(bl);
        }
      }
      i = j;
    } else {
      execLine(line);
      i++;
    }
  }
  return states;
}

function VizBody({ stacks, ghosts = {} }) {
  const names = Object.keys(stacks);
  const allNames = [...new Set([...names, ...Object.keys(ghosts)])];

  if (allNames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-30">⏹</div>
        <p className="text-xs">Declare a stack to see it here<br /><code className="text-xs" style={{ color: "var(--text-secondary)" }}>stack = []</code></p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {allNames.map((name) => {
        const items = stacks[name] || [];
        const ghostItems = ghosts[name] || [];
        const top = items.length > 0 ? items[items.length - 1].val : null;

        return (
          <div key={name} className="w-full">
            <div className="text-xs font-bold mb-2 text-center" style={{ color: "var(--text-muted)", fontFamily: "'Courier New', monospace" }}>
              {name}
            </div>
            <div className="flex flex-col items-center">
              <div
                className="rounded-lg border-2 border-dashed flex flex-col-reverse w-full max-w-[200px]"
                style={{
                  minHeight: 60,
                  borderColor: "var(--border-strong)",
                  background: "var(--bg)",
                }}
              >
                {items.length === 0 && ghostItems.length === 0 && (
                  <div className="flex-1 flex items-center justify-center py-3">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>empty</span>
                  </div>
                )}
                {items.map((item, i) => (
                  <AnimatedItem key={item._id}>
                    <div
                      className="px-3 py-1.5 text-center text-sm font-mono font-bold border-b last:border-b-0"
                      style={{
                        background: i === items.length - 1 ? "#7AA2F720" : "transparent",
                        color: i === items.length - 1 ? "#7AA2F7" : "var(--text)",
                        borderColor: "var(--border)",
                        borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      {item.val}
                    </div>
                  </AnimatedItem>
                ))}
                {ghostItems.map((item) => (
                  <AnimatedItem key={`ghost-${item._id}`} leaving>
                    <div
                      className="px-3 py-1.5 text-center text-sm font-mono font-bold border-b"
                      style={{
                        background: "transparent",
                        color: "var(--text-muted)",
                        borderColor: "var(--border)",
                        borderBottom: "1px solid var(--border)",
                        opacity: 0.6,
                      }}
                    >
                      {item.val}
                    </div>
                  </AnimatedItem>
                ))}
              </div>
              {top && (
                <div className="text-xs mt-1" style={{ color: "#7AA2F7" }}>
                  ← top
                </div>
              )}
              <div className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                {items.length} item{items.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StackViz({ code }) {
  const playback = usePlayback();
  const [parsed, setParsed] = useState(null);
  const [ghosts, setGhosts] = useState({});
  const prevRef = useRef(null);
  const ghostTimerRef = useRef(null);

  const ensureParsed = useCallback(() => {
    if (parsed && parsed.code === code) return parsed.states;
    const s = parseStackStates(code);
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
      const curIds = new Set(curItems.map((i) => i._id));
      const removed = prevItems.filter((i) => !curIds.has(i._id));
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
      <VizBody stacks={parsed.states[idx]} ghosts={ghosts} />
    </div>
  );
}
