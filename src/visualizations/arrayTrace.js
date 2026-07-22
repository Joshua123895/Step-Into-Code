import { traceRun, TRACE_START, TRACE_END } from "./traceRun";

// Runs the student's real array code. Structural changes (append/extend/pop/
// remove/assign) come from the actual list values; index-access and slice
// HIGHLIGHTS are read-only (values don't change), so we map each executed line
// back to its source to detect `arr[i]` / `arr[a:b]`. Falls back to ArrayViz's
// interpreter.

const PREFIX = `import json, sys
_SNAPS = []
def _flat(v):
    if isinstance(v, list) and all(isinstance(x, (int, float, str, bool)) for x in v):
        return [str(x) for x in v]
    return None
def _capd(d):
    _s = {}
    for _k, _v in list(d.items()):
        if _k.startswith('_'):
            continue
        _fd = _flat(_v)
        if _fd is not None:
            _s[_k] = _fd
    return _s
def _tr(frame, event, arg):
    if frame.f_code.co_name != '_run':
        return None
    if event == 'line':
        _SNAPS.append([frame.f_lineno, _capd(frame.f_locals)])
    elif event == 'return':
        _SNAPS.append([-1, _capd(frame.f_locals)])
    return _tr
def _run():
`;

function buildArrayHarness(code) {
  const indented = code.split("\n").map((l) => "    " + l).join("\n");
  const baseLine = PREFIX.split("\n").length - 1; // line number of "def _run():"
  const harness = PREFIX + indented + `
sys.settrace(_tr)
try:
    _run()
except Exception:
    pass
sys.settrace(None)
print("${TRACE_START}" + json.dumps(_SNAPS) + "${TRACE_END}")
`;
  return { harness, baseLine };
}

function sliceIndices(inner, len) {
  const parts = inner.split(":");
  const num = (p, d) => (p === "" || p === undefined ? d : Number(p));
  let step = num(parts[2], 1);
  if (step === 0) step = 1;
  const norm = (v, d) => (v === undefined ? d : v < 0 ? len + v : v);
  const start = parts[0] === "" || parts[0] === undefined ? (step > 0 ? 0 : len - 1) : norm(Number(parts[0]));
  const stop = parts[1] === "" || parts[1] === undefined ? (step > 0 ? len : -1) : norm(Number(parts[1]));
  const idxs = [];
  if (step > 0) for (let k = start; k < stop; k += step) { if (k >= 0 && k < len) idxs.push(k); }
  else for (let k = start; k > stop; k += step) { if (k >= 0 && k < len) idxs.push(k); }
  return idxs;
}

export function arrayTraceToStates(snaps, userLines) {
  if (!Array.isArray(snaps) || snaps.length === 0) return [];
  // Self-calibrate: the first traced line event is the first user line, so its
  // line number maps to userLines[0] (robust to the harness prefix length).
  let base = null;
  for (const [lineno] of snaps) {
    if (lineno > 0) { base = lineno; break; }
  }
  if (base === null) return [];
  // The array is the first list-valued variable seen.
  let name = null;
  for (const [, vals] of snaps) {
    const k = Object.keys(vals)[0];
    if (k) { name = k; break; }
  }
  if (!name) return [];

  const valuesAfter = (i) => {
    for (let j = i + 1; j < snaps.length; j++) {
      if (snaps[j][1][name]) return snaps[j][1][name];
    }
    return snaps[i][1][name] || [];
  };

  let sliceId = 0;
  const ids = [];
  let nextId = 0;
  const buildItems = (vals, sel) => {
    const items = [];
    for (let i = 0; i < vals.length; i++) {
      if (i >= ids.length) ids[i] = nextId++;
      const it = { value: String(vals[i]), _id: ids[i] };
      if (sel && sel.index === i) it.sel = sel.kind;
      else if (sel && sel.set && sel.set.has(i)) it.sel = sel.sliceId;
      items.push(it);
    }
    ids.length = vals.length;
    return items;
  };

  const states = [];
  let prevKey = null;
  const push = (obj) => {
    const key = JSON.stringify(obj);
    if (key !== prevKey) { states.push(obj); prevKey = key; }
  };

  for (let i = 0; i < snaps.length; i++) {
    const [lineno] = snaps[i];
    if (lineno < 0) continue;
    const src = (userLines[lineno - base] || "").trim();
    if (!src || !src.includes(name)) continue;

    const after = valuesAfter(i);
    const re = (p) => new RegExp(p);

    // assignment  arr[i] = x
    const asg = src.match(re(`\\b${name}\\[(-?\\d+)\\]\\s*=`));
    if (asg) {
      const idx = Number(asg[1]) < 0 ? after.length + Number(asg[1]) : Number(asg[1]);
      push({ [name]: { items: buildItems(after, { index: idx, kind: "set" }), slices: [] } });
      continue;
    }
    // slice  arr[a:b]
    const sl = src.match(re(`\\b${name}\\[([^\\]]*:[^\\]]*)\\]`));
    if (sl) {
      const idxs = sliceIndices(sl[1].trim(), after.length);
      const sid = "s" + sliceId++;
      push({ [name]: { items: buildItems(after, { set: new Set(idxs), sliceId: sid }), slices: [{ ids: idxs, label: sl[1].trim(), id: sid }] } });
      continue;
    }
    // index read  arr[i]
    const acc = src.match(re(`\\b${name}\\[(-?\\d+)\\]`));
    if (acc) {
      const idx = Number(acc[1]) < 0 ? after.length + Number(acc[1]) : Number(acc[1]);
      push({ [name]: { items: buildItems(after, { index: idx, kind: "idx" }), slices: [] } });
      continue;
    }
    // structural (init / append / extend / pop / remove) — just show the values
    push({ [name]: { items: buildItems(after, null), slices: [] } });
  }
  return states;
}

export async function runArrayViz(code) {
  const { harness } = buildArrayHarness(code);
  const snaps = await traceRun(harness);
  const states = arrayTraceToStates(snaps, code.split("\n"));
  return states.length > 1 ? states : null;
}
