import { useState, useCallback, useEffect, useRef } from "react";
import usePlayback from "./usePlayback";
import VizControls from "./VizControls";

function parseTreeStates(code) {
  const lines = code.split("\n");
  const treeVars = {};
  const states = [];

  const computeState = () => {
    const children = new Set();
    for (const name of Object.keys(treeVars)) {
      if (treeVars[name].left) children.add(treeVars[name].left);
      if (treeVars[name].right) children.add(treeVars[name].right);
    }
    let rootName = null;
    for (const name of Object.keys(treeVars)) {
      if (!children.has(name)) { rootName = name; break; }
    }

    const buildTreeNodes = (rootName) => {
      const node = treeVars[rootName];
      if (!node) return null;
      return {
        name: rootName,
        val: node.val,
        left: node.left ? buildTreeNodes(node.left) : null,
        right: node.right ? buildTreeNodes(node.right) : null,
      };
    };

    const tree = rootName ? buildTreeNodes(rootName) : null;
    return { treeVars: { ...treeVars }, tree, rootName };
  };

  states.push(computeState());

  for (const line of lines) {
    if (line.trim().startsWith("#")) continue;
    const init = line.match(/(\w+)\s*=\s*(?:TreeNode|Node)\s*\(\s*(\d+)\s*\)/);
    if (init) {
      treeVars[init[1]] = { val: init[2], left: null, right: null };
      states.push(computeState());
      continue;
    }

    const link = line.match(/(\w+)\.(left|right)\s*=\s*(\w+)/);
    if (link && treeVars[link[1]] && treeVars[link[3]]) {
      treeVars[link[1]][link[2]] = link[3];
      states.push(computeState());
    }
  }

  return states;
}

function TreeNodeBox({ node, x, y, level, totalWidth }) {
  if (!node) return null;
  const r = 18;
  const xOff = totalWidth / Math.pow(2, level + 1);
  const leftX = x - xOff;
  const rightX = x + xOff;
  const childY = y + 50;

  return (
    <g>
      {node.left && (
        <>
          <line x1={x} y1={y + r} x2={leftX} y2={childY - r} stroke="var(--border-strong)" strokeWidth={1.5} />
          <TreeNodeBox node={node.left} x={leftX} y={childY} level={level + 1} totalWidth={totalWidth} />
        </>
      )}
      {node.right && (
        <>
          <line x1={x} y1={y + r} x2={rightX} y2={childY - r} stroke="var(--border-strong)" strokeWidth={1.5} />
          <TreeNodeBox node={node.right} x={rightX} y={childY} level={level + 1} totalWidth={totalWidth} />
        </>
      )}
      <circle cx={x} cy={y} r={r} fill="#7AA2F715" stroke="#7AA2F7" strokeWidth={2} style={{ animation: "viz-in 0.25s ease-out both" }} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="var(--text)" fontSize={12} fontFamily="monospace" fontWeight="bold">{node.val}</text>
    </g>
  );
}

function VizBody({ state, ghostVars = {} }) {
  const { treeVars, tree, rootName } = state;
  const names = Object.keys(treeVars);

  if (names.length === 0 && Object.keys(ghostVars).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-30">⬡</div>
        <p className="text-xs">Create tree nodes to see them<br /><code className="text-xs" style={{ color: "var(--text-secondary)" }}>root = Node(5)</code></p>
      </div>
    );
  }

  const maxDepth = (n) => {
    if (!n) return 0;
    return 1 + Math.max(maxDepth(n.left), maxDepth(n.right));
  };
  const depth = tree ? maxDepth(tree) : 0;
  const svgWidth = Math.max(200, Math.pow(2, depth) * 40);
  const svgHeight = depth * 50 + 40;

  return (
    <div className="flex flex-col items-center">
      {tree && (
        <>
          <div className="text-xs font-bold mb-2" style={{ color: "var(--text-muted)", fontFamily: "'Courier New', monospace" }}>
            {rootName}
          </div>
          <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ maxWidth: "100%" }}>
            <TreeNodeBox node={tree} x={svgWidth / 2} y={25} level={0} totalWidth={svgWidth} />
          </svg>
        </>
      )}
      {Object.keys(ghostVars).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 justify-center">
          {Object.values(ghostVars).map((node) => (
            <div
              key={node.var}
              className="rounded-lg px-3 py-1.5 text-center font-mono text-xs font-bold"
              style={{
                animation: "viz-out 0.2s ease-in both",
                background: "var(--bg)",
                border: "2px solid var(--border)",
                color: "var(--text-muted)",
                opacity: 0.5,
              }}
            >
              <div>{node.val}</div>
              <div className="text-[9px] font-normal" style={{ color: "var(--text-muted)" }}>{node.var}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeViz({ code }) {
  const playback = usePlayback();
  const [parsed, setParsed] = useState(null);
  const [ghostVars, setGhostVars] = useState({});
  const prevRef = useRef(null);
  const ghostTimerRef = useRef(null);

  const ensureParsed = useCallback(() => {
    if (parsed && parsed.code === code) return parsed.states;
    const s = parseTreeStates(code);
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

    const prevVars = Object.keys(prev.treeVars || {});
    const curVars = new Set(Object.keys(cur.treeVars || {}));
    const removed = {};
    for (const v of prevVars) {
      if (!curVars.has(v)) removed[v] = prev.treeVars[v];
    }

    if (Object.keys(removed).length > 0) {
      setGhostVars(removed);
      ghostTimerRef.current = setTimeout(() => { setGhostVars({}); ghostTimerRef.current = null; }, 300);
    } else {
      setGhostVars({});
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
    setGhostVars({});
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
      <VizBody state={parsed.states[idx]} ghostVars={ghostVars} />
    </div>
  );
}
