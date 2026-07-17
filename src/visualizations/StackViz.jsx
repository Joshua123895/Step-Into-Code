import { useMemo } from "react";

function parseStackOps(code) {
  const lines = code.split("\n");
  const stacks = {};

  for (const line of lines) {
    if (line.trim().startsWith("#")) continue;
    const init = line.match(/(\w+)\s*=\s*\[\s*\]/);
    if (init) {
      stacks[init[1]] = [];
      continue;
    }

    const push = line.match(/(\w+)\.(?:append|push)\s*\((.+?)\)\s*$/);
    if (push && stacks[push[1]] !== undefined) {
      stacks[push[1]] = [...stacks[push[1]], push[2]];
      continue;
    }

    const pop = line.match(/(\w+)\.pop\s*\(\s*(\d*)\s*\)\s*$/);
    if (pop && stacks[pop[1]] !== undefined) {
      const idx = pop[2] !== "" ? Number(pop[2]) : stacks[pop[1]].length - 1;
      if (idx >= 0 && idx < stacks[pop[1]].length) {
        const copy = [...stacks[pop[1]]];
        copy.splice(idx, 1);
        stacks[pop[1]] = copy;
      }
    }
  }

  return stacks;
}

function peekedValue(items) {
  return items.length > 0 ? items[items.length - 1] : null;
}

export default function StackViz({ code }) {
  const stacks = useMemo(() => parseStackOps(code), [code]);
  const names = Object.keys(stacks);

  if (names.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-30">⏹</div>
        <p className="text-xs">Declare a stack to see it here<br/><code className="text-xs" style={{ color: "var(--text-secondary)" }}>stack = []</code></p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {names.map((name) => {
        const items = stacks[name];
        const top = peekedValue(items);

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
                {items.length === 0 && (
                  <div className="flex-1 flex items-center justify-center py-3">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>empty</span>
                  </div>
                )}
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 text-center text-sm font-mono font-bold border-b last:border-b-0"
                    style={{
                      background: i === items.length - 1 ? "#7AA2F720" : "transparent",
                      color: i === items.length - 1 ? "#7AA2F7" : "var(--text)",
                      borderColor: "var(--border)",
                      borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {item}
                  </div>
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
