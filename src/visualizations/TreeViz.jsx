import { useMemo } from "react";

function parseTreeOps(code) {
  const lines = code.split("\n");
  const treeVars = {};

  for (const line of lines) {
    if (line.trim().startsWith("#")) continue;
    const init = line.match(/(\w+)\s*=\s*(?:TreeNode|Node)\s*\(\s*(\d+)\s*\)/);
    if (init) {
      treeVars[init[1]] = { val: init[2], left: null, right: null };
      continue;
    }

    const link = line.match(/(\w+)\.(left|right)\s*=\s*(\w+)/);
    if (link && treeVars[link[1]] && treeVars[link[3]]) {
      treeVars[link[1]][link[2]] = link[3];
    }
  }

  return treeVars;
}

function buildTreeNodes(treeVars, rootName) {
  const node = treeVars[rootName];
  if (!node) return null;
  return {
    name: rootName,
    val: node.val,
    left: node.left ? buildTreeNodes(treeVars, node.left) : null,
    right: node.right ? buildTreeNodes(treeVars, node.right) : null,
  };
}

function findRoot(treeVars) {
  const children = new Set();
  for (const name of Object.keys(treeVars)) {
    if (treeVars[name].left) children.add(treeVars[name].left);
    if (treeVars[name].right) children.add(treeVars[name].right);
  }
  for (const name of Object.keys(treeVars)) {
    if (!children.has(name)) return name;
  }
  return null;
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
      <circle cx={x} cy={y} r={r} fill="#7AA2F715" stroke="#7AA2F7" strokeWidth={2} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="var(--text)" fontSize={12} fontFamily="monospace" fontWeight="bold">{node.val}</text>
    </g>
  );
}

export default function TreeViz({ code }) {
  const treeVars = useMemo(() => parseTreeOps(code), [code]);
  const names = Object.keys(treeVars);
  const rootName = useMemo(() => findRoot(treeVars), [treeVars]);
  const tree = rootName ? buildTreeNodes(treeVars, rootName) : null;

  if (names.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-30">⬡</div>
        <p className="text-xs">Create tree nodes to see them<br /><code className="text-xs" style={{ color: "var(--text-secondary)" }}>root = Node(5)</code></p>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4" style={{ color: "var(--text-muted)" }}>
        <p className="text-xs">Link nodes to build the tree</p>
      </div>
    );
  }

  const depth = (function maxDepth(n) {
    if (!n) return 0;
    return 1 + Math.max(maxDepth(n.left), maxDepth(n.right));
  })(tree);

  const svgWidth = Math.max(200, Math.pow(2, depth) * 40);
  const svgHeight = depth * 50 + 40;

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-bold mb-2" style={{ color: "var(--text-muted)", fontFamily: "'Courier New', monospace" }}>
        {rootName}
      </div>
      <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ maxWidth: "100%" }}>
        <TreeNodeBox node={tree} x={svgWidth / 2} y={25} level={0} totalWidth={svgWidth} />
      </svg>
    </div>
  );
}
