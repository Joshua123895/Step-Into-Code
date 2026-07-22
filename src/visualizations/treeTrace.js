import { traceRun, TRACE_START, TRACE_END } from "./traceRun";

// Runs the student's real BST code and serializes the ACTUAL tree object after
// each statement (walking real TreeNode.left/.right/.val), so the tree grows on
// screen exactly as their inserts run — whether they use insert_bst() or dotted
// assignment. Falls back to TreeViz's interpreter otherwise.

function buildTreeHarness(code) {
  const indented = code.split("\n").map((l) => "    " + l).join("\n");
  return `import json, sys
_SNAPS = []
def _sv(node, depth=0):
    if node is None or depth > 40:
        return None
    _val = getattr(node, 'val', None)
    if _val is None:
        _val = getattr(node, 'value', None)
    if _val is None:
        _val = getattr(node, 'data', None)
    if _val is None:
        _val = getattr(node, 'key', None)
    return {"val": _val, "left": _sv(getattr(node, 'left', None), depth + 1), "right": _sv(getattr(node, 'right', None), depth + 1)}
def _find_root(loc):
    _r = loc.get('root')
    if _r is not None and (hasattr(_r, 'left') or hasattr(_r, 'right')):
        return _r
    for _k, _v in loc.items():
        if _k.startswith('_'):
            continue
        if hasattr(_v, 'left') and hasattr(_v, 'right'):
            return _v
    return None
def _tr(frame, event, arg):
    if frame.f_code.co_name != '_run':
        return None
    if event == 'line' or event == 'return':
        _r = _find_root(frame.f_locals)
        _SNAPS.append(_sv(_r) if _r is not None else None)
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

// Name nodes by value so a node keeps its identity as the tree grows.
function nameTree(node, treeVars) {
  if (!node) return null;
  const name = "n" + String(node.val);
  const left = nameTree(node.left, treeVars);
  const right = nameTree(node.right, treeVars);
  treeVars[name] = { val: String(node.val), left: left ? left.name : null, right: right ? right.name : null };
  return { name, val: String(node.val), left, right };
}

export function treeTraceToStates(snaps) {
  if (!Array.isArray(snaps)) return [];
  const states = [];
  let prevKey = null;
  for (const raw of snaps) {
    const treeVars = {};
    const tree = raw ? nameTree(raw, treeVars) : null;
    const key = JSON.stringify(tree);
    if (key !== prevKey) {
      states.push({ treeVars, tree, rootName: tree ? tree.name : null });
      prevKey = key;
    }
  }
  return states;
}

export async function runTreeViz(code) {
  const snaps = await traceRun(buildTreeHarness(code));
  const states = treeTraceToStates(snaps);
  return states.some((s) => s.tree) && states.length > 1 ? states : null;
}
