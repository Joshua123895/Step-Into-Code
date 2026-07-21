import { useState, useCallback } from "react";
import usePlayback from "./usePlayback";
import VizControls from "./VizControls";
import { parseSortStates } from "./sortInterp";

const HIGHLIGHT_COLOR = {
  compare: "#7AA2F7",
  swap: "#FF5F57",
  write: "#E9B44C",
};

const BAR_MAX_HEIGHT = 96;

function Bars({ state }) {
  const items = state?.items || [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-50 text-center p-4" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-30">▤</div>
        <p className="text-xs">Create an array to see it sort<br /><code className="text-xs" style={{ color: "var(--text-secondary)" }}>arr = [5, 2, 9, 1]</code></p>
      </div>
    );
  }

  const highlight = state.highlight;
  const highlightColor = highlight ? HIGHLIGHT_COLOR[highlight.type] : null;
  const highlightSet = highlight ? new Set(highlight.indices) : null;
  const values = items.map((it) => Number(it.value) || 0);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const span = Math.max(maxVal - minVal, 1);

  return (
    <div className="flex items-end justify-center gap-1.5 px-1" style={{ minHeight: BAR_MAX_HEIGHT + 40 }}>
      {items.map((item, i) => {
        const v = Number(item.value) || 0;
        const heightPx = Math.max(10, ((v - minVal) / span) * BAR_MAX_HEIGHT + 10);
        const isHi = highlightSet && highlightSet.has(i);
        const color = isHi ? highlightColor : "#7AA2F7";
        return (
          <div key={item._id} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono font-bold transition-colors duration-150" style={{ color }}>
              {item.value}
            </span>
            <div
              className="rounded-t transition-all duration-150"
              style={{
                width: 20,
                height: heightPx,
                background: isHi ? color + "40" : color + "20",
                border: `2px solid ${color}`,
                borderBottom: "none",
              }}
            />
            <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>{i}</span>
          </div>
        );
      })}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
      {[["compare", "comparing"], ["swap", "swap"], ["write", "write"]].map(([key, label]) => (
        <div key={key} className="flex items-center gap-1 text-[9px]" style={{ color: "var(--text-muted)" }}>
          <span className="w-2 h-2 rounded-sm inline-block" style={{ background: HIGHLIGHT_COLOR[key] }} />
          {label}
        </div>
      ))}
    </div>
  );
}

export default function SortViz({ code }) {
  const playback = usePlayback();
  const [parsed, setParsed] = useState(null);

  const ensureParsed = useCallback(() => {
    if (parsed && parsed.code === code) return parsed.states;
    const s = parseSortStates(code);
    setParsed({ code, states: s });
    playback.configure(s.length);
    return s;
  }, [code, parsed, playback]);

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

  if (!parsed) {
    return (
      <div className="flex items-center justify-center h-full min-h-50">
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
      <Bars state={parsed.states[idx]} />
      <Legend />
    </div>
  );
}
