import { useMemo } from "react";

const COLORS = ["#FF5F57", "#E9B44C", "#28CA41", "#7AA2F7", "#BB9AF7", "#FF75A0", "#86E1F9", "#A6E3A1"];

function parseExtendArgs(str) {
  const m = str.match(/\[([^\]]*)\]/);
  if (m) return m[1].split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function parseArrayOps(code) {
  const lines = code.split("\n");
  const arrays = {};
  let sliceIdCounter = 0;

  for (const line of lines) {
    if (line.trim().startsWith("#")) continue;
    const init = line.match(/(\w+)\s*=\s*\[([^\]]*)\]/);
    if (init) {
      const vals = init[2].split(",").map((s) => s.trim()).filter(Boolean);
      arrays[init[1]] = { items: vals.map((v) => ({ value: v })), slices: [] };
      continue;
    }

    const name = Object.keys(arrays).find((n) => {
      return /\.(append|extend|pop|remove)\s*\(/.test(line) || /\[\s*[^\]]+\s*\]/.test(line);
    });
    if (!name) continue;
    const arr = arrays[name];

    const append = line.match(/(\w+)\.append\s*\((.+?)\)\s*$/);
    if (append && append[1] === name) {
      arr.items = [...arr.items, { value: append[2].trim() }];
      continue;
    }

    const extend = line.match(/(\w+)\.extend\s*\((.+)\)\s*$/);
    if (extend && extend[1] === name) {
      const vals = parseExtendArgs(extend[2]);
      arr.items = [...arr.items, ...vals.map((v) => ({ value: v }))];
      continue;
    }

    const pop = line.match(/(\w+)\.pop\s*\(\s*(\d*)\s*\)\s*$/);
    if (pop && pop[1] === name && arr.items.length > 0) {
      const copy = [...arr.items];
      if (pop[2] !== "") { const idx = Number(pop[2]); if (idx >= 0 && idx < copy.length) copy.splice(idx, 1); }
      else { copy.pop(); }
      arr.items = copy;
      continue;
    }

    const remove = line.match(/(\w+)\.remove\s*\((.+?)\)\s*$/);
    if (remove && remove[1] === name) {
      const val = remove[2].trim();
      const idx = arr.items.findIndex((item) => item.value === val);
      if (idx >= 0) { const copy = [...arr.items]; copy.splice(idx, 1); arr.items = copy; }
      continue;
    }

    const assign = line.match(/(\w+)\[(-?\d+)\]\s*=\s*(.+)/);
    if (assign && assign[1] === name) {
      const idx = Number(assign[2]);
      const norm = idx < 0 ? arr.items.length + idx : idx;
      if (norm >= 0 && norm < arr.items.length) {
        const copy = [...arr.items];
        copy[norm] = { value: assign[3].trim(), sel: "set" };
        arr.items = copy;
      }
      continue;
    }

    const access = line.match(/(\w+)\[([^\]]+)\]/);
    if (access && access[1] === name) {
      const inner = access[2].trim();
      const isSlice = inner.includes(":");
      const len = arr.items.length;

      if (!isSlice && /^-?\d+$/.test(inner)) {
        const norm = Number(inner) < 0 ? len + Number(inner) : Number(inner);
        if (norm >= 0 && norm < len) {
          arr.items = arr.items.map((item, i) => ({ ...item, sel: i === norm ? "idx" : item.sel }));
        }
      } else if (isSlice) {
        const parts = inner.split(":");
        const sA = parts[0] === "" ? undefined : Number(parts[0]);
        const sB = parts[1] === "" ? undefined : Number(parts[1]);
        let step = parts[2] === "" || parts[2] === undefined ? 1 : Number(parts[2]);
        if (step === 0) step = 1;
        const pStart = sA !== undefined ? (sA < 0 ? len + sA : sA) : (step > 0 ? 0 : len - 1);
        const pStop = sB !== undefined ? (sB < 0 ? len + sB : sB) : (step > 0 ? len : -1);
        const idxs = [];
        if (step > 0) { for (let k = pStart; k < pStop; k += step) idxs.push(k); }
        else { for (let k = pStart; k > pStop; k += step) idxs.push(k); }

        const sid = "s" + (sliceIdCounter++);
        arr.items = arr.items.map((item, i) => ({ ...item, sel: idxs.includes(i) ? sid : item.sel }));
        arr.slices.push({ ids: idxs, label: inner, id: sid });
      }
    }
  }
  return arrays;
}

function SelBox({ item, i }) {
  const isIdx = item.sel === "idx";
  const isSet = item.sel === "set";
  const isSlice = item.sel && item.sel !== "idx" && item.sel !== "set";

  let color = "var(--bg)";
  let borderColor = "var(--border-strong)";
  let textColor = "var(--text)";
  let shadow = "none";
  let scale = 1;
  let extraTop = null;

  if (isIdx) {
    color = "#7AA2F720"; borderColor = "#7AA2F7"; textColor = "#7AA2F7"; shadow = "0 0 8px rgba(122,162,247,0.25)"; scale = 1.05;
  } else if (isSet) {
    color = "#E9B44C20"; borderColor = "#E9B44C"; textColor = "#E9B44C"; shadow = "0 0 8px rgba(233,180,76,0.25)"; scale = 1.05;
  } else if (isSlice) {
    const c = COLORS[Number(item.sel.slice(1)) % COLORS.length];
    color = c + "18"; borderColor = c; textColor = c; shadow = "none"; scale = 1;
    extraTop = <div className="h-0.5 rounded-full mb-0.5" style={{ background: c, width: 28 }} />;
  }

  return (
    <div className="flex flex-col items-center">
      {extraTop}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center font-mono text-sm font-bold transition-all duration-200"
        style={{
          background: color,
          border: `2px solid ${borderColor}`,
          color: textColor,
          boxShadow: shadow,
          transform: `scale(${scale})`,
        }}
      >
        {item.value}
      </div>
      <div className="text-[10px] mt-1 font-mono" style={{ color: "var(--text-muted)" }}>
        {i}
      </div>
    </div>
  );
}

export default function ArrayViz({ code }) {
  const arrays = useMemo(() => parseArrayOps(code), [code]);
  const names = Object.keys(arrays);

  if (names.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-30">⊟</div>
        <p className="text-xs">Create an array to see it here<br /><code className="text-xs" style={{ color: "var(--text-secondary)" }}>nums = [1, 2, 3]</code></p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {names.map((name) => {
        const { items, slices } = arrays[name];
        const activeSlices = slices.filter((s) => s.ids.length > 0);

        return (
          <div key={name} className="w-full">
            <div className="text-xs font-bold mb-2 text-center" style={{ color: "var(--text-muted)", fontFamily: "'Courier New', monospace" }}>
              {name}
            </div>

            {activeSlices.length > 0 && (
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mb-2">
                {activeSlices.map((slice) => {
                  const c = COLORS[Number(slice.id.slice(1)) % COLORS.length];
                  return (
                    <div key={slice.id} className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: c }}>
                      <span className="w-2 h-0.5 rounded-full inline-block" style={{ background: c }} />
                      {slice.label}
                      <span style={{ color: "var(--text-muted)" }}>→</span>
                      <span style={{ color: "var(--text-muted)" }}>{slice.ids.length} items</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-1">
              {items.length === 0 && (
                <div className="text-xs px-4 py-3 rounded-lg" style={{ background: "var(--bg)", border: "2px dashed var(--border-strong)", color: "var(--text-muted)" }}>empty</div>
              )}
              {items.map((item, i) => (
                <SelBox key={i} item={item} i={i} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
