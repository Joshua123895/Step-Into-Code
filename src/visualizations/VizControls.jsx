export default function VizControls({ onToggle, onStep, onPrev, playing, step, total }) {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <button
        onClick={onPrev}
        disabled={step <= 0}
        className="flex items-center justify-center transition-all duration-100 hover:brightness-110 active:translate-y-0.5 disabled:opacity-30"
        style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg)", border: "1.5px solid var(--border-strong)", color: "var(--text-muted)" }}
        title="Previous step"
      >
        <span style={{ fontSize: 26, lineHeight: 1, transform: "translate(-0px, -2.5px)" }}>‹</span>
      </button>
      <button
        onClick={onToggle}
        className="text-xs px-4 py-2 rounded font-bold hover:brightness-110 active:brightness-90 active:scale-[0.98]"
        style={{
          background: playing ? "#6B7280" : "#6AAE6F",
          color: "#fff",
        }}
        title={playing ? "Pause" : "Play"}
      >
        {playing ? "■ Pause" : "▶ Run"}
      </button>
      <button
        onClick={onStep}
        disabled={step >= total - 1 || total === 0}
        className="flex items-center justify-center transition-all duration-100 hover:brightness-110 active:translate-y-0.5 disabled:opacity-30"
        style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg)", border: "1.5px solid var(--border-strong)", color: "var(--text-muted)" }}
        title="Step forward"
      >
        <span style={{ fontSize: 26, lineHeight: 1, transform: "translate(0px, -2.5px)" }}>›</span>
      </button>
      <span className="text-xs font-mono min-w-10 text-center" style={{ color: "var(--text-muted)" }}>
        {total > 0 ? `${Math.max(0, step + 1)}/${total}` : ""}
      </span>
    </div>
  );
}
