import { traceRun, TRACE_START, TRACE_END } from "./traceRun";

// Runs the student's real hash-table code and serializes the actual structure
// after each statement — a dict, or a class's real `self.buckets` (using their
// real hash function to place keys). Diffs consecutive steps to mark the
// added/updated entry. Falls back to HashViz's interpreter.

function buildHashHarness(code) {
  const indented = code.split("\n").map((l) => "    " + l).join("\n");
  return `import json, sys
_SNAPS = []
def _hv(v):
    if isinstance(v, dict):
        try:
            if all(isinstance(_k, (int, float, str, bool)) and isinstance(_val, (int, float, str, bool)) for _k, _val in v.items()):
                return {"dict": [[str(_k), str(_val)] for _k, _val in v.items()]}
        except Exception:
            return None
        return None
    for _a in ('buckets', 'table', 'slots', '_buckets', 'data'):
        _b = getattr(v, _a, None)
        if isinstance(_b, list) and len(_b) > 0 and all(isinstance(_x, list) for _x in _b):
            try:
                _out = []
                for _bucket in _b:
                    _pairs = []
                    for _item in _bucket:
                        if isinstance(_item, (list, tuple)) and len(_item) == 2:
                            _pairs.append([str(_item[0]), str(_item[1])])
                        else:
                            raise ValueError()
                    _out.append(_pairs)
                return {"buckets": _out}
            except Exception:
                pass
    return None
def _tr(frame, event, arg):
    if frame.f_code.co_name != '_run':
        return None
    if event == 'line' or event == 'return':
        _found = None
        _name = None
        for _k, _v in list(frame.f_locals.items()):
            if _k.startswith('_'):
                continue
            _h = _hv(_v)
            if _h is not None:
                _found = _h
                _name = _k
                break
        _SNAPS.append([_name, _found])
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

function diffKey(prevMap, curMap) {
  if (!prevMap) return [null, null];
  for (const [k, v] of curMap) {
    if (!prevMap.has(k)) return [k, "added"];
    if (prevMap.get(k) !== v) return [k, "updated"];
  }
  return [null, null];
}

export function hashTraceToStates(snaps) {
  if (!Array.isArray(snaps)) return [];
  const states = [];
  let prevMap = null;
  let prevKey = null;

  for (const [name, h] of snaps) {
    if (!name || !h) continue;
    let out;
    let curMap;
    if (h.dict) {
      curMap = new Map(h.dict.map(([k, v]) => [k, v]));
      const [ck, ct] = diffKey(prevMap, curMap);
      out = { [name]: h.dict.map(([k, v]) => ({ key: k, val: v, ...(k === ck ? { [ct]: true } : {}) })) };
    } else if (h.buckets) {
      curMap = new Map();
      for (const b of h.buckets) for (const [k, v] of b) curMap.set(k, v);
      const [ck, ct] = diffKey(prevMap, curMap);
      out = {
        [name]: {
          size: h.buckets.length,
          buckets: h.buckets.map((b) => b.map(([k, v]) => ({ key: k, val: v, ...(k === ck ? { [ct]: true } : {}) }))),
        },
      };
    } else {
      continue;
    }
    prevMap = curMap;
    const key = JSON.stringify(out);
    if (key !== prevKey) {
      states.push(out);
      prevKey = key;
    }
  }
  return states;
}

export async function runHashViz(code) {
  const snaps = await traceRun(buildHashHarness(code));
  const states = hashTraceToStates(snaps);
  return states.length > 1 ? states : null;
}
