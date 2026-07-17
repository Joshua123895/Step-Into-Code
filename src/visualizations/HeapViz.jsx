import { useMemo } from "react";

function parseHeapOps(code) {
  const lines = code.split("\n");
  let heap = null;

  for (const line of lines) {
    const init = line.match(/(\w+)\s*=\s*\[\s*\]/);
    if (init) {
      heap = [];
      continue;
    }

    const init2 = line.match(/(\w+)\s*=\s*\[([^\]]+)\]\s*$/);
    if (init2 && !init2[0].includes("heapq.") && !init2[0].includes(".append")) {
      const vals = init2[2].split(",").map((s) => s.trim()).filter(Boolean);
      heap = vals.map((v) => ({ value: v }));
      continue;
    }

    const push = line.match(/heapq\.heappush\s*\(\s*(\w+)\s*,\s*(.+?)\s*\)/);
    if (push && heap !== null) {
      heap = [...heap, { value: push[2] }];
      continue;
    }

    const pop = line.match(/heapq\.heappop\s*\(\s*(\w+)\s*\)/);
    if (pop && heap !== null && heap.length > 0) {
      heap = heap.slice(1);
      continue;
    }

    const heapify = line.match(/heapq\.heapify\s*\(\s*(\w+)\s*\)/);
    if (heapify && heap !== null) {
      heap = [...heap].sort((a, b) => Number(a.value) - Number(b.value));
    }
  }

  return heap;
}

function HeapTree({ items, x, y, level, index, totalWidth }) {
  if (index >= items.length) return null;
  const r = 16;
  const xOff = totalWidth / Math.pow(2, level + 2);
  const leftIdx = 2 * index + 1;
  const rightIdx = 2 * index + 2;
  const leftX = x - xOff;
  const rightX = x + xOff;
  const childY = y + 45;

  return (
    <g>
      {leftIdx < items.length && (
        <>
          <line x1={x} y1={y + r} x2={leftX} y2={childY - r} stroke="var(--border-strong)" strokeWidth={1} />
          <HeapTree items={items} x={leftX} y={childY} level={level + 1} index={leftIdx} totalWidth={totalWidth} />
        </>
      )}
      {rightIdx < items.length && (
        <>
          <line x1={x} y1={y + r} x2={rightX} y2={childY - r} stroke="var(--border-strong)" strokeWidth={1} />
          <HeapTree items={items} x={rightX} y={childY} level={level + 1} index={rightIdx} totalWidth={totalWidth} />
        </>
      )}
      <circle cx={x} cy={y} r={r} fill="#BB9AF715" stroke="#BB9AF7" strokeWidth={2} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="var(--text)" fontSize={11} fontFamily="monospace" fontWeight="bold">{items[index].value}</text>
    </g>
  );
}

export default function HeapViz({ code }) {
  const items = useMemo(() => parseHeapOps(code), [code]);

  if (items === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-30">⊟</div>
        <p className="text-xs">Create a heap to see it<br /><code className="text-xs" style={{ color: "var(--text-secondary)" }}>heap = []</code></p>
      </div>
    );
  }

  const depth = Math.ceil(Math.log2(items.length + 1));
  const svgWidth = Math.max(180, Math.pow(2, depth) * 30);
  const svgHeight = depth * 45 + 30;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-1">
        {items.map((item, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold"
            style={{
              background: "var(--bg)",
              border: "2px solid #BB9AF7",
              color: "var(--text)",
            }}
          >
            {item.value}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ maxWidth: "100%" }}>
          <HeapTree items={items} x={svgWidth / 2} y={20} level={0} index={0} totalWidth={svgWidth} />
        </svg>
      )}
      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
        {items.length} element{items.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
