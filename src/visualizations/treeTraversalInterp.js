import { parseTreeStates } from "./TreeViz";

// Splits a file into its top-level function bodies (indent-based), so the
// traversal function can be told apart from the TreeNode class's __init__.
function getFunctions(code) {
  const lines = code.split("\n");
  const indentOf = (s) => s.length - s.trimStart().length;
  const fns = {};
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^(\s*)def\s+(\w+)\s*\(([^)]*)\)\s*:/);
    if (m) {
      const base = m[1].length;
      const body = [];
      let j = i + 1;
      while (j < lines.length && (lines[j].trim() === "" || indentOf(lines[j]) > base)) {
        if (lines[j].trim()) body.push(lines[j]);
        j++;
      }
      fns[m[2]] = body;
      i = j;
    } else {
      i++;
    }
  }
  return fns;
}

// Works out which of the four standard traversals the student wrote, from the
// SHAPE of their code rather than the function name: a queue means BFS;
// otherwise the position of the "visit" (print / append) relative to the left
// and right recursion decides pre- / in- / post-order. This reads their actual
// logic, so reordering the three statements changes the animation.
export function detectTraversal(code) {
  if (/\bdeque\b|\.popleft\s*\(\)|\.pop\s*\(\s*0\s*\)/.test(code)) return "bfs";
  const fns = getFunctions(code);
  for (const [name, body] of Object.entries(fns)) {
    if (name === "__init__") continue;
    let visitIdx = -1, leftIdx = -1, rightIdx = -1;
    body.forEach((line, idx) => {
      const t = line.trim();
      if (t.includes("self.")) return; // skip the node class internals
      if (visitIdx < 0 && (/\bprint\s*\(/.test(t) || /\.append\s*\(/.test(t))) visitIdx = idx;
      if (leftIdx < 0 && /\.left\b/.test(t)) leftIdx = idx;
      if (rightIdx < 0 && /\.right\b/.test(t)) rightIdx = idx;
    });
    if (visitIdx >= 0 && leftIdx >= 0 && rightIdx >= 0) {
      if (visitIdx < leftIdx) return "preorder";
      if (visitIdx < rightIdx) return "inorder";
      return "postorder";
    }
  }
  return "preorder";
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

export const TRAVERSAL_LABEL = {
  preorder: "Pre-order · Root → Left → Right",
  inorder: "In-order · Left → Root → Right",
  postorder: "Post-order · Left → Right → Root",
  bfs: "BFS · level by level",
};

export function parseTraversalStates(code) {
  const treeStates = parseTreeStates(code);
  const tree = treeStates.length ? treeStates[treeStates.length - 1].tree : null;
  if (!tree) return [{ tree: null, type: null, currentName: null, visited: [], sequence: [] }];

  const type = detectTraversal(code);
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
