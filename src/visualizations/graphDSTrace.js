import { traceRun, TRACE_START, TRACE_END } from "./traceRun";

// Runs the student's real graph-building code and serializes the actual
// adjacency structure after each statement, so vertices/edges appear as their
// code adds them — whether they use a dict literal, graph[x].append(y), or a
// Graph class. Falls back to GraphViz's interpreter.

function buildGraphDSHarness(code) {
  const indented = code.split("\n").map((l) => "    " + l).join("\n");
  return `import json, sys
_SNAPS = []
def _adjof(v):
    if isinstance(v, dict) and len(v) > 0 and all(isinstance(_x, list) for _x in v.values()):
        try:
            return {str(_k): [str(_n) for _n in _val] for _k, _val in v.items()}
        except Exception:
            return None
    for _a in ('adj', 'graph', 'adjacency', '_adj', 'adj_list', 'edges'):
        _inner = getattr(v, _a, None)
        if isinstance(_inner, dict) and len(_inner) > 0 and all(isinstance(_x, list) for _x in _inner.values()):
            try:
                return {str(_k): [str(_n) for _n in _val] for _k, _val in _inner.items()}
            except Exception:
                pass
    return None
def _tr(frame, event, arg):
    if frame.f_code.co_name != '_run':
        return None
    if event == 'line' or event == 'return':
        _found = None
        for _k, _v in list(frame.f_locals.items()):
            if _k.startswith('_'):
                continue
            _a = _adjof(_v)
            if _a is not None:
                _found = _a
                break
        _SNAPS.append(_found)
    return _tr
def _run():
${indented}
sys.settrace(_tr)
try:
    _run()
except Exception:
    pass
sys.settrace(None)
print("${TRACE_START}" + json.dumps(_SNAPS) + "${TRACE_END}")
`;
}

export function graphDSTraceToStates(snaps, graphName = "graph") {
  if (!Array.isArray(snaps)) return [];
  const states = [];
  let prevKey = null;
  for (const adj of snaps) {
    const vertices = [];
    const seen = new Set();
    const add = (v) => { if (!seen.has(v)) { seen.add(v); vertices.push(v); } };
    const edges = [];
    if (adj) {
      for (const from of Object.keys(adj)) add(from);
      for (const from of Object.keys(adj)) {
        for (const to of adj[from]) { add(to); edges.push({ from, to }); }
      }
    }
    const obj = { vertices, edges, graphName };
    const key = JSON.stringify({ vertices, edges });
    if (key !== prevKey) { states.push(obj); prevKey = key; }
  }
  return states;
}

export async function runGraphDSViz(code) {
  const snaps = await traceRun(buildGraphDSHarness(code));
  const states = graphDSTraceToStates(snaps);
  return states.some((s) => s.vertices.length > 0) && states.length > 1 ? states : null;
}
