import { useMemo } from "react";

function parseLinkedListOps(code) {
  const lines = code.split("\n");
  const nodes = {};
  const chain = [];

  for (const line of lines) {
    if (line.trim().startsWith("#")) continue;
    const nodeCreate = line.match(/(\w+)\s*=\s*Node\s*\(\s*(\d+)\s*\)/);
    if (nodeCreate) {
      nodes[nodeCreate[1]] = { var: nodeCreate[1], val: nodeCreate[2] };
      continue;
    }

    const link = line.match(/(\w+)\.next\s*=\s*(\w+)/);
    if (link && nodes[link[1]] && nodes[link[2]]) {
      chain.push({ from: link[1], to: link[2] });
      continue;
    }

    const ih = line.match(/insert_head\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)/);
    if (ih) {
      const newVar = "new_" + ih[2];
      nodes[newVar] = { var: newVar, val: ih[2], isNew: true };
      chain.unshift({ from: newVar, to: ih[1] });
    }
  }

  const incoming = {};
  for (const c of chain) {
    incoming[c.to] = (incoming[c.to] || 0) + 1;
  }

  let head = null;
  for (const name of Object.keys(nodes)) {
    if (!incoming[name]) { head = name; break; }
  }

  const ordered = [];
  const seen = new Set();
  let cur = head;
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    ordered.push(nodes[cur]);
    const next = chain.find((c) => c.from === cur);
    cur = next ? next.to : null;
  }

  for (const name of Object.keys(nodes)) {
    if (!seen.has(name)) ordered.push(nodes[name]);
  }

  return { ordered, chain };
}

export default function LinkedListViz({ code }) {
  const list = useMemo(() => parseLinkedListOps(code), [code]);

  if (list.ordered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-30">⠉</div>
        <p className="text-xs">Create some nodes to see them<br /><code className="text-xs" style={{ color: "var(--text-secondary)" }}>a = Node(5)</code></p>
      </div>
    );
  }

  const children = list.chain.reduce((acc, link) => {
    if (!acc[link.from]) acc[link.from] = [];
    acc[link.from].push(link.to);
    return acc;
  }, {});

  const hasNext = (varName) => children[varName] && children[varName].length > 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 p-2">
      {list.ordered.map((node) => (
        <div key={node.var} className="flex items-center gap-0">
          <div
            className="rounded-lg px-3 py-2 text-center font-mono text-sm font-bold min-w-[48px]"
            style={{
              background: "#7AA2F715",
              border: "2px solid " + (node.isNew ? "#E9B44C" : "#7AA2F7"),
              color: "var(--text)",
            }}
          >
            <div>{node.val}</div>
            <div className="text-[9px] font-normal mt-0.5" style={{ color: "var(--text-muted)" }}>
              {node.var}
            </div>
          </div>
          {hasNext(node.var) && (
            <div className="text-lg mx-1" style={{ color: "var(--text-muted)" }}>
              →
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
