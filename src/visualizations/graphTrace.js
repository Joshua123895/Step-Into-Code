import { traceRun, detectCalledFn, TRACE_START, TRACE_END } from "./traceRun";

// Runs the student's real graph code: serializes the ACTUAL adjacency object
// (robust to however they built it) and captures the real traversal order /
// distances via sys.settrace. Falls back to graphAlgoInterp.js (canonical
// algorithm over a regex-parsed graph) when the order can't be captured.

function detectAlgo(code) {
  if (/dijkstra/i.test(code) || /float\(\s*["']inf["']\s*\)/.test(code)) return "dijkstra";
  if (/prim/i.test(code) || (/heapq/.test(code) && /\btotal\b/.test(code))) return "prim";
  if (/\[::-1\]|topolog/i.test(code)) return "topo";
  return "dfs";
}

function detectRecursiveFn(code) {
  const lines = code.split("\n");
  const indentOf = (s) => s.length - s.trimStart().length;
  const found = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)def\s+(\w+)\s*\(/);
    if (!m) continue;
    const base = m[1].length;
    const name = m[2];
    let body = "";
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].trim() === "") continue;
      if (indentOf(lines[j]) <= base) break;
      body += lines[j] + "\n";
    }
    if (new RegExp("\\b" + name + "\\s*\\(").test(body)) found.push(name);
  }
  return found.length ? found[found.length - 1] : null;
}

function buildGraphHarness(code, fn) {
  const indented = code.split("\n").map((l) => "    " + l).join("\n");
  return `import json, sys

def _ser(v):
    if isinstance(v, bool) or isinstance(v, (int, float, str)):
        return v
    if isinstance(v, (list, tuple)):
        try:
            return [x for x in v] if all(isinstance(x, (int, float, str, bool)) for x in v) else None
        except Exception:
            return None
    if isinstance(v, dict):
        try:
            if all(isinstance(k, (int, float, str, bool)) and isinstance(val, (int, float, str, bool)) for k, val in v.items()):
                return {"__dict__": [[k, val] for k, val in v.items()]}
            return None
        except Exception:
            return None
    return None

_SNAPS = []
_TARGET = ${JSON.stringify(fn)}
def _tr(frame, event, arg):
    if frame.f_code.co_name != _TARGET:
        return None
    if event == 'line':
        _loc = {}
        for _k, _v in list(frame.f_locals.items()):
            _s = _ser(_v)
            if _s is not None:
                _loc[_k] = _s
        _SNAPS.append(_loc)
    elif event == 'return':
        _SNAPS.append({"__return__": _ser(arg)})
    return _tr

sys.settrace(_tr)
try:
${indented}
except Exception:
    pass
sys.settrace(None)

_graph = None
for _k, _v in list(globals().items()):
    if isinstance(_v, dict) and len(_v) > 0 and all(isinstance(_val, list) for _val in _v.values()):
        _graph = _v
        break

_norm = {}
_order = []
if _graph is not None:
    for _node, _nbrs in _graph.items():
        _key = str(_node)
        _order.append(_key)
        _lst = []
        for _nb in _nbrs:
            if isinstance(_nb, (list, tuple)) and len(_nb) == 2:
                _lst.append([str(_nb[0]), _nb[1]])
            else:
                _lst.append([str(_nb), 1])
        _norm[_key] = _lst

print("${TRACE_START}" + json.dumps({"graph": _norm, "order": _order, "snaps": _SNAPS}) + "${TRACE_END}")
`;
}

export function graphTraceToStates(data, algo) {
  if (!data || !data.graph || data.order.length === 0) return [];
  const vertices = data.order;
  const vSet = new Set(vertices);
  const edges = [];
  for (const from of vertices) {
    for (const [to, weight] of data.graph[from] || []) edges.push({ from, to: String(to), weight });
  }
  const weighted = edges.some((e) => e.weight !== 1);

  const line = (data.snaps || []).filter((s) => !(s && "__return__" in s));
  const ret = (data.snaps || []).find((s) => s && "__return__" in s)?.__return__;

  // Real visit order: the longest growing list whose entries are all vertices.
  let visitOrder = null;
  let bestLen = 0;
  const asDictOf = (v) => (v && typeof v === "object" && !Array.isArray(v) && Array.isArray(v.__dict__) ? v.__dict__ : null);
  for (const s of line) {
    for (const v of Object.values(s)) {
      if (Array.isArray(v) && v.length > bestLen && v.every((x) => vSet.has(String(x)))) {
        visitOrder = v.map(String);
        bestLen = v.length;
      }
    }
  }
  // The returned list (topo) is also a valid order.
  if (Array.isArray(ret) && ret.length >= (visitOrder?.length || 0) && ret.every((x) => vSet.has(String(x)))) {
    visitOrder = ret.map(String);
  }

  // Distances (dijkstra): the last dict keyed by vertices with numeric values.
  let dist = null;
  for (const s of line) {
    for (const v of Object.values(s)) {
      const d = asDictOf(v);
      if (d && d.length && d.every(([k]) => vSet.has(String(k)))) dist = Object.fromEntries(d.map(([k, val]) => [String(k), val]));
    }
  }
  if (algo === "dijkstra" && dist && !visitOrder) {
    // Finalized order in dijkstra is by increasing distance.
    visitOrder = [...vertices].filter((n) => Number.isFinite(dist[n])).sort((a, b) => dist[a] - dist[b]);
  }
  if (!visitOrder || visitOrder.length === 0) return [];

  const totalRet = algo === "prim" && typeof ret === "number" ? ret : null;
  const base = { vertices, edges, algo, weighted };
  const states = [{ ...base, current: null, visited: [], values: {}, order: [], total: null }];
  const visited = [];
  const order = [];
  for (const node of visitOrder) {
    visited.push(node);
    order.push(node);
    states.push({
      ...base,
      current: node,
      visited: [...visited],
      order: [...order],
      values: algo === "dijkstra" && dist ? dist : {},
      total: algo === "prim" ? totalRet : null,
    });
  }
  return states;
}

export async function runGraphViz(code) {
  const fn = detectRecursiveFn(code) || detectCalledFn(code);
  if (!fn) return null;
  const data = await traceRun(buildGraphHarness(code, fn));
  const states = graphTraceToStates(data, detectAlgo(code));
  return states.length > 1 ? states : null;
}
