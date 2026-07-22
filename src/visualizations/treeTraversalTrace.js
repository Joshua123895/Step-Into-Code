import { traceRun, TRACE_START, TRACE_END } from "./traceRun";
import { detectTraversal } from "./treeTraversalInterp";

// Serializes the student's REAL tree object (walking the actual TreeNode
// .left/.right/.val, so any way they built the tree works), then animates the
// traversal whose order matches THEIR code shape (pre/in/post/BFS, detected
// from where they put the visit relative to the recursion). Falls back to
// treeTraversalInterp.js.

function buildTreeHarness(code) {
  const indented = code.split("\n").map((l) => "    " + l).join("\n");
  return `import json
try:
${indented}
except Exception:
    pass

def _tv(node, depth=0):
    if node is None or depth > 40:
        return None
    _val = getattr(node, 'val', None)
    if _val is None:
        _val = getattr(node, 'value', None)
    if _val is None:
        _val = getattr(node, 'data', None)
    if _val is None:
        _val = getattr(node, 'key', None)
    return {"val": _val, "left": _tv(getattr(node, 'left', None), depth + 1), "right": _tv(getattr(node, 'right', None), depth + 1)}

_root = None
_g = dict(globals())
if 'root' in _g and (hasattr(_g['root'], 'left') or hasattr(_g['root'], 'right')):
    _root = _g['root']
else:
    for _k, _v in _g.items():
        if hasattr(_v, 'left') and hasattr(_v, 'right'):
            _root = _v
            break

print("${TRACE_START}" + json.dumps(_tv(_root) if _root is not None else None) + "${TRACE_END}")
`;
}

function nameTree(node, counter) {
  if (!node) return null;
  const name = "n" + counter.i++;
  return {
    name,
    val: String(node.val),
    left: nameTree(node.left, counter),
    right: nameTree(node.right, counter),
  };
}

function computeOrder(tree, type) {
  const order = [];
  if (!tree) return order;
  if (type === "bfs") {
    const q = [tree];
    while (q.length) {
      const n = q.shift();
      order.push(n);
      if (n.left) q.push(n.left);
      if (n.right) q.push(n.right);
    }
    return order;
  }
  const rec = (n) => {
    if (!n) return;
    if (type === "preorder") { order.push(n); rec(n.left); rec(n.right); }
    else if (type === "inorder") { rec(n.left); order.push(n); rec(n.right); }
    else { rec(n.left); rec(n.right); order.push(n); }
  };
  rec(tree);
  return order;
}

export function treeTraceToStates(rawTree, type) {
  if (!rawTree) return [];
  const tree = nameTree(rawTree, { i: 0 });
  const order = computeOrder(tree, type);
  const states = [{ tree, type, currentName: null, visited: [], sequence: [] }];
  const visited = [];
  const sequence = [];
  for (const node of order) {
    visited.push(node.name);
    sequence.push(node.val);
    states.push({ tree, type, currentName: node.name, visited: [...visited], sequence: [...sequence] });
  }
  return states;
}

export async function runTraversalViz(code) {
  const rawTree = await traceRun(buildTreeHarness(code));
  if (!rawTree) return null;
  const states = treeTraceToStates(rawTree, detectTraversal(code));
  return states.length > 1 ? states : null;
}
