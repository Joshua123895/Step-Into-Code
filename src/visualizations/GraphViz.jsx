import { useMemo } from "react";

const COLORS = ["#FF5F57", "#E9B44C", "#28CA41", "#7AA2F7", "#BB9AF7", "#FF75A0", "#86E1F9", "#A6E3A1"];

function parseGraphOps(code) {
  const lines = code.split("\n");
  let graph = null;
  let vertices = new Set();
  let edges = [];

  for (const line of lines) {
    if (line.trim().startsWith("#")) continue;
    const init = line.match(/(\w+)\s*=\s*\{\s*\}/);
    if (init) {
      graph = init[1];
      continue;
    }

    const addV = line.match(/add_vertex\s*\(\s*(\w+)\s*,\s*['\"]?(\w+)['\"]?\s*\)/);
    if (addV) {
      vertices.add(addV[2]);
      continue;
    }

    const addE = line.match(/add_edge\s*\(\s*(\w+)\s*,\s*['\"]?(\w+)['\"]?\s*,\s*['\"]?(\w+)['\"]?\s*\)/);
    if (addE) {
      edges.push({ from: addE[2], to: addE[3] });
      vertices.add(addE[2]);
      vertices.add(addE[3]);
      continue;
    }

    const dictAdd = line.match(/(\w+)\[['\"]?(\w+)['\"]?\]\s*=\s*\[/);
    if (dictAdd && graph) {
      vertices.add(dictAdd[2]);
      continue;
    }

    const dictAppend = line.match(/(\w+)\[['\"]?(\w+)['\"]?\]\.append\s*\(\s*['\"]?(\w+)['\"]?\s*\)/);
    if (dictAppend && dictAppend[1] === graph) {
      edges.push({ from: dictAppend[2], to: dictAppend[3] });
      vertices.add(dictAppend[2]);
      vertices.add(dictAppend[3]);
    }
  }

  return { vertices: [...vertices], edges, graphName: graph };
}

function getCircularLayout(vertices, cx, cy, radius) {
  return vertices.map((v, i) => {
    const angle = (2 * Math.PI * i) / vertices.length - Math.PI / 2;
    return { name: v, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
}

export default function GraphViz({ code }) {
  const graph = useMemo(() => parseGraphOps(code), [code]);

  if (graph.vertices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-30">⬡</div>
        <p className="text-xs">Create a graph to see it<br /><code className="text-xs" style={{ color: "var(--text-secondary)" }}>g = {}</code></p>
      </div>
    );
  }

  const cx = 90, cy = 90, radius = 65;
  const layout = getCircularLayout(graph.vertices, cx, cy, radius);
  const vertexMap = layout.reduce((acc, v) => { acc[v.name] = v; return acc; }, {});

  return (
    <div className="flex flex-col items-center">
      <svg width={180} height={180} viewBox="0 0 180 180" style={{ maxWidth: "100%" }}>
        {graph.edges.map((e, i) => {
          const from = vertexMap[e.from];
          const to = vertexMap[e.to];
          if (!from || !to) return null;
          return (
            <line
              key={i}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="var(--border-strong)"
              strokeWidth={1.5}
              opacity={0.6}
            />
          );
        })}
        {layout.map((v, i) => (
          <g key={v.name}>
            <circle cx={v.x} cy={v.y} r={18} fill={COLORS[i % COLORS.length] + "20"} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
            <text x={v.x} y={v.y + 1} textAnchor="middle" dominantBaseline="middle" fill="var(--text)" fontSize={11} fontFamily="monospace" fontWeight="bold">{v.name}</text>
          </g>
        ))}
      </svg>
      <div className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
        {graph.vertices.length} vert{graph.vertices.length !== 1 ? "ices" : "ex"}, {graph.edges.length} edge{graph.edges.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
