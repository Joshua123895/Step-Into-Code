import { useState, useCallback, useEffect, useRef } from "react";
import usePlayback from "./usePlayback";
import VizControls from "./VizControls";
import AnimatedItem from "./AnimatedItem";

function parseQueueStates(code) {
  const lines = code.split("\n");
  const queues = {};
  let itemId = 0;
  const states = [];

  const snapshot = () => states.push(JSON.parse(JSON.stringify(queues)));

  const getIndent = (s) => s.length - s.trimStart().length;

  const execLine = (line) => {
    if (line.trim().startsWith("#")) return;
    const init = line.match(/(\w+)\s*=\s*\[\s*\]/);
    if (init) {
      queues[init[1]] = [];
      snapshot();
      return;
    }

    const initDeque = line.match(/(\w+)\s*=\s*deque\(\s*\)/);
    if (initDeque) {
      queues[initDeque[1]] = [];
      snapshot();
      return;
    }

    const enq = line.match(/(\w+)\.(?:append|enqueue|appendleft)\s*\((.+?)\)/);
    if (enq && queues[enq[1]] !== undefined) {
      queues[enq[1]] = [...queues[enq[1]], { val: enq[2], side: enq[0].includes("appendleft") ? "left" : "right", _id: itemId++ }];
      snapshot();
      return;
    }

    const deq = line.match(/(\w+)\.(?:pop|dequeue|popleft)\s*\(\s*(\d*)\s*\)/);
    if (deq && queues[deq[1]] !== undefined) {
      const copy = [...queues[deq[1]]];
      if (deq[0].includes("popleft") || deq[0].includes("pop(0)") || deq[2] === "0") {
        copy.shift();
      } else {
        copy.pop();
      }
      queues[deq[1]] = copy;
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

function VizBody({ queues, ghosts = {} }) {
  const names = Object.keys(queues);
  const allNames = [...new Set([...names, ...Object.keys(ghosts)])];

  if (allNames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-30">⊞</div>
        <p className="text-xs">Create a queue to see it<br /><code className="text-xs" style={{ color: "var(--text-secondary)" }}>q = []</code></p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {allNames.map((name) => {
        const items = queues[name] || [];
        const ghostItems = ghosts[name] || [];

        return (
          <div key={name} className="w-full">
            <div className="text-xs font-bold mb-2 text-center" style={{ color: "var(--text-muted)", fontFamily: "'Courier New', monospace" }}>
              {name}
            </div>
            <div className="flex items-center justify-center gap-0">
              <div className="text-xs mr-1" style={{ color: "#28CA41" }}>front</div>
              <div className="flex" style={{ direction: "ltr" }}>
                {items.length === 0 && ghostItems.length === 0 && (
                  <div className="text-xs px-4 py-3 rounded-lg" style={{ background: "var(--bg)", border: "2px dashed var(--border-strong)", color: "var(--text-muted)" }}>empty</div>
                )}
                {items.map((item, i) => (
                  <AnimatedItem key={item._id}>
                    <div
                      className="px-3 py-2 text-center font-mono text-sm font-bold mx-[1px] first:rounded-l-lg last:rounded-r-lg"
                      style={{
                        background: i === 0 ? "#28CA4120" : "var(--bg)",
                        border: "2px solid" + (i === 0 ? "#28CA41" : "var(--border-strong)"),
                        color: "var(--text)",
                        borderLeft: i > 0 ? "none" : "2px solid " + (i === 0 ? "#28CA41" : "var(--border-strong)"),
                      }}
                    >
                      {item.val}
                    </div>
                  </AnimatedItem>
                ))}
                {ghostItems.map((item) => (
                  <AnimatedItem key={`ghost-${item._id}`} leaving>
                    <div
                      className="px-3 py-2 text-center font-mono text-sm font-bold mx-[1px]"
                      style={{
                        background: "var(--bg)",
                        border: "2px solid var(--border-strong)",
                        color: "var(--text-muted)",
                        opacity: 0.6,
                      }}
                    >
                      {item.val}
                    </div>
                  </AnimatedItem>
                ))}
              </div>
              <div className="text-xs ml-1" style={{ color: "#FF5F57" }}>rear</div>
            </div>
            <div className="text-[10px] text-center mt-1" style={{ color: "var(--text-muted)" }}>
              {items.length} item{items.length !== 1 ? "s" : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function QueueViz({ code }) {
  const playback = usePlayback();
  const [parsed, setParsed] = useState(null);
  const [ghosts, setGhosts] = useState({});
  const prevRef = useRef(null);
  const ghostTimerRef = useRef(null);

  const ensureParsed = useCallback(() => {
    if (parsed && parsed.code === code) return parsed.states;
    const s = parseQueueStates(code);
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
      <VizBody queues={parsed.states[idx]} ghosts={ghosts} />
    </div>
  );
}
