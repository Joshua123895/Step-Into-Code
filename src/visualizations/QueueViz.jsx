import { useMemo } from "react";

function parseQueueOps(code) {
  const lines = code.split("\n");
  const queues = {};

  for (const line of lines) {
    if (line.trim().startsWith("#")) continue;
    const init = line.match(/(\w+)\s*=\s*\[\s*\]/);
    if (init) {
      queues[init[1]] = [];
      continue;
    }

    const initDeque = line.match(/(\w+)\s*=\s*deque\(\s*\)/);
    if (initDeque) {
      queues[initDeque[1]] = [];
      continue;
    }

    const enq = line.match(/(\w+)\.(?:append|enqueue|appendleft)\s*\((.+?)\)\s*$/);
    if (enq && queues[enq[1]] !== undefined) {
      queues[enq[1]] = [...queues[enq[1]], { val: enq[2], side: enq[0].includes("appendleft") ? "left" : "right" }];
      continue;
    }

    const deq = line.match(/(\w+)\.(?:pop|dequeue|popleft)\s*\(\s*(\d*)\s*\)\s*$/);
    if (deq && queues[deq[1]] !== undefined) {
      const copy = [...queues[deq[1]]];
      if (deq[0].includes("popleft") || deq[0].includes("pop(0)") || deq[2] === "0") {
        copy.shift();
      } else {
        copy.pop();
      }
      queues[deq[1]] = copy;
    }
  }

  return queues;
}

export default function QueueViz({ code }) {
  const queues = useMemo(() => parseQueueOps(code), [code]);
  const names = Object.keys(queues);

  if (names.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-30">⊞</div>
        <p className="text-xs">Create a queue to see it<br /><code className="text-xs" style={{ color: "var(--text-secondary)" }}>q = []</code></p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {names.map((name) => {
        const items = queues[name];

        return (
          <div key={name} className="w-full">
            <div className="text-xs font-bold mb-2 text-center" style={{ color: "var(--text-muted)", fontFamily: "'Courier New', monospace" }}>
              {name}
            </div>
            <div className="flex items-center justify-center gap-0">
              <div className="text-xs mr-1" style={{ color: "#28CA41" }}>front</div>
              <div className="flex" style={{ direction: "ltr" }}>
                {items.length === 0 && (
                  <div className="text-xs px-4 py-3 rounded-lg" style={{ background: "var(--bg)", border: "2px dashed var(--border-strong)", color: "var(--text-muted)" }}>empty</div>
                )}
                {items.map((item, i) => (
                  <div
                    key={i}
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
