import { traceRun, TRACE_START, TRACE_END } from "./traceRun";

// Runs the student's real linked-list code and serializes the ACTUAL list after
// each statement: it finds the head, walks real .next pointers (using python
// id() for stable node identity), and records which variables (head, current,
// ...) point where. Falls back to LinkedListViz's interpreter.

function buildLinkedHarness(code) {
  const indented = code.split("\n").map((l) => "    " + l).join("\n");
  return `import json, sys
_SNAPS = []
def _is_node(v):
    return hasattr(v, 'next') and not isinstance(v, (list, dict, str, tuple))
def _nval(n):
    _v = getattr(n, 'val', None)
    if _v is None:
        _v = getattr(n, 'value', None)
    if _v is None:
        _v = getattr(n, 'data', None)
    return _v
def _walk(head):
    _out = []
    _seen = set()
    _cur = head
    while _cur is not None and id(_cur) not in _seen and len(_out) < 200:
        _seen.add(id(_cur))
        _out.append([id(_cur), str(_nval(_cur))])
        _cur = getattr(_cur, 'next', None)
    return _out
def _find_head(loc):
    _nodes = [(_k, _v) for _k, _v in loc.items() if not _k.startswith('_') and _is_node(_v)]
    if not _nodes:
        return None
    _nexts = set()
    for _k, _v in _nodes:
        _nx = getattr(_v, 'next', None)
        if _nx is not None:
            _nexts.add(id(_nx))
    for _k, _v in _nodes:
        if id(_v) not in _nexts:
            return _v
    return _nodes[0][1]
def _tr(frame, event, arg):
    if frame.f_code.co_name != '_run':
        return None
    if event == 'line' or event == 'return':
        _loc = frame.f_locals
        _head = _find_head(_loc)
        _walked = _walk(_head) if _head is not None else []
        _ptrs = []
        for _k, _v in list(_loc.items()):
            if _k.startswith('_'):
                continue
            if _is_node(_v):
                _ptrs.append([_k, id(_v)])
        _SNAPS.append([_walked, _ptrs])
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

export function linkedTraceToStates(snaps) {
  if (!Array.isArray(snaps)) return [];
  const states = [];
  let prevIds = new Set();
  let prevKey = null;

  for (const [walk, ptrs] of snaps) {
    const ordered = walk.map(([pyid, val]) => ({ _id: pyid, var: "n" + pyid, val, isNew: !prevIds.has(pyid) }));
    const chain = [];
    for (let i = 0; i < walk.length - 1; i++) {
      chain.push({ from: "n" + walk[i][0], to: "n" + walk[i + 1][0] });
    }
    const pointers = ptrs.map(([name, pyid]) => ({ var: name, targetId: pyid }));
    const obj = { ordered, chain, pointers };
    // Key on structure + pointer targets (ignore isNew so it doesn't block dedup).
    const key = JSON.stringify({
      o: walk.map((w) => w),
      p: pointers.map((p) => [p.var, p.targetId]),
    });
    if (key !== prevKey) {
      states.push(obj);
      prevKey = key;
      prevIds = new Set(walk.map((w) => w[0]));
    }
  }
  return states;
}

export async function runLinkedViz(code) {
  const snaps = await traceRun(buildLinkedHarness(code));
  const states = linkedTraceToStates(snaps);
  return states.some((s) => s.ordered.length > 0) && states.length > 1 ? states : null;
}
