import { traceRun, TRACE_START, TRACE_END } from "./traceRun";

// Runs the student's real stack code and snapshots every named stack after each
// statement. Works for list-based stacks (stack = []; stack.append(x)) AND
// class-based ones (s = Stack(); s.push(x)) by serializing either a list value
// directly or the internal list an object wraps. Falls back to the StackViz
// interpreter otherwise.

// Shared harness: trace the module frame, capture each stack-like local per
// line. A "stack-like" value is a flat list, or an object with a flat-list
// attribute (items/stack/data/...).
export function buildStructHarness(code) {
  const indented = code.split("\n").map((l) => "    " + l).join("\n");
  return `import json, sys
_SNAPS = []
def _flatlist(v):
    if (isinstance(v, list) or type(v).__name__ == 'deque') and all(isinstance(x, (int, float, str, bool)) for x in v):
        return [str(x) for x in v]
    return None
def _sv(v):
    try:
        _d = _flatlist(v)
        if _d is not None:
            return _d
    except Exception:
        return None
    for _a in ('items', 'stack', 'queue', 'data', '_items', '_data', 'elements', 'container', '_list', 'arr'):
        _inner = getattr(v, _a, None)
        try:
            _d = _flatlist(_inner)
            if _d is not None:
                return _d
        except Exception:
            pass
    return None
def _tr(frame, event, arg):
    if event == 'line' and frame.f_code.co_name == '<module>':
        _snap = {}
        for _k, _v in list(frame.f_locals.items()):
            if _k.startswith('_'):
                continue
            _s = _sv(_v)
            if _s is not None:
                _snap[_k] = _s
        _SNAPS.append(_snap)
    return _tr
sys.settrace(_tr)
try:
${indented}
except Exception:
    pass
sys.settrace(None)
print("${TRACE_START}" + json.dumps(_SNAPS) + "${TRACE_END}")
`;
}

// Turn the per-line snapshots into the {name: [{val,_id}]} states StackViz
// wants, giving each item a stable id (matched by bottom-up position) so the
// push-in / pop-out animation works.
export function structTraceToStates(snaps) {
  if (!Array.isArray(snaps) || snaps.length === 0) return [];
  const idState = {};
  let itemId = 0;
  const states = [];
  let prevKey = null;

  for (const snap of snaps) {
    const out = {};
    for (const [name, vals] of Object.entries(snap)) {
      const prev = idState[name] || [];
      const next = [];
      for (let i = 0; i < vals.length; i++) {
        if (i < prev.length && prev[i].val === String(vals[i])) next.push(prev[i]);
        else next.push({ val: String(vals[i]), _id: itemId++ });
      }
      idState[name] = next;
      out[name] = next.map((x) => ({ ...x }));
    }
    const key = JSON.stringify(out);
    if (key !== prevKey) {
      states.push(out);
      prevKey = key;
    }
  }
  return states;
}

export async function runStackViz(code) {
  const snaps = await traceRun(buildStructHarness(code));
  const states = structTraceToStates(snaps);
  // Need at least one state that actually contains a stack.
  return states.some((s) => Object.keys(s).length > 0) && states.length > 1 ? states : null;
}
