// Interpreter for the Graph Patterns lessons: DFS traversal, topological sort,
// Dijkstra shortest paths, and Prim's MST. Rather than interpret the student's
// exact code (recursion + heaps + sets are out of reach for a line parser), it
// parses the adjacency-dict literal, recognizes which algorithm the code is,
// and runs a canonical version, the same "trust the recognized algorithm"
// approach used for merge/quick sort. Grading still runs the student's real
// code; this animation shows the textbook algorithm over their graph.

function splitTop(s) {
  const parts = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) { parts.push(cur); cur = ""; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

// Finds `<var> = { ... }` where the value is an adjacency dict (its body
// contains a list), collecting a possibly multi-line literal by brace balance.
// Skips things like `distances = {node: float("inf") for node in graph}`.
function parseGraph(code) {
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/(\w+)\s*=\s*\{/);
    if (!m) continue;
    let depth = 0, started = false, buf = "", j = i;
    for (; j < lines.length; j++) {
      for (const ch of lines[j]) {
        if (ch === "{") { depth++; started = true; }
        else if (ch === "}") depth--;
      }
      buf += lines[j] + "\n";
      if (started && depth === 0) break;
    }
    const inner = buf.slice(buf.indexOf("{") + 1, buf.lastIndexOf("}"));
    if (!inner.includes("[") || !inner.includes(":")) continue; // not an adjacency dict
    const adj = {};
    const order = [];
    let ok = false;
    for (const entry of splitTop(inner)) {
      const em = entry.match(/^\s*["']?(\w+)["']?\s*:\s*\[(.*)\]\s*$/s);
      if (!em) continue;
      const key = em[1];
      const neighbors = [];
      for (const n of splitTop(em[2])) {
        const tup = n.trim().match(/^\(\s*["']?(\w+)["']?\s*,\s*(\d+)\s*\)$/);
        if (tup) neighbors.push({ to: tup[1], weight: Number(tup[2]) });
        else {
          const plain = n.trim().match(/^["']?(\w+)["']?$/);
          if (plain) neighbors.push({ to: plain[1], weight: 1 });
        }
      }
      adj[key] = neighbors;
      order.push(key);
      ok = true;
    }
    if (ok) return { name: m[1], adj, order };
  }
  return null;
}

function detectAlgo(code) {
  if (/dijkstra/i.test(code) || /float\(\s*["']inf["']\s*\)/.test(code)) return "dijkstra";
  if (/prim/i.test(code) || (/heapq/.test(code) && /\btotal\b/.test(code))) return "prim";
  if (/\[::-1\]|topolog/i.test(code)) return "topo";
  return "dfs";
}

// Parses the traversal's start node from a call like graph_dfs(graph, 0) or
// dijkstra(graph, "a"). Topological sort has no single start.
function parseStart(code, graphName) {
  // Match the CALL, e.g. graph_dfs(graph, 0), skipping the def line, whose
  // second parameter is literally named `start` and would be captured instead.
  const re = new RegExp("\\w+\\s*\\(\\s*" + graphName + "\\s*,\\s*[\"']?(\\w+)[\"']?");
  for (const line of code.split("\n")) {
    if (line.trim().startsWith("def ")) continue;
    if (/^\s/.test(line)) continue; // skip indented lines (recursive calls inside a function body)
    const m = line.match(re);
    if (m) return m[1];
  }
  return null;
}

function runDFS(adj, start) {
  const visited = new Set();
  const seq = [];
  const dfs = (node) => {
    visited.add(node);
    seq.push({ node });
    for (const { to } of adj[node] || []) {
      if (!visited.has(to)) dfs(to);
    }
  };
  dfs(start);
  return { seq, values: {}, total: null };
}

function runTopo(adj, order) {
  const visited = new Set();
  const stack = [];
  const dfs = (node) => {
    visited.add(node);
    for (const { to } of adj[node] || []) if (!visited.has(to)) dfs(to);
    stack.push(node);
  };
  for (const node of order) if (!visited.has(node)) dfs(node);
  const result = stack.reverse();
  return { seq: result.map((n) => ({ node: n })), values: {}, total: null };
}

function runDijkstra(adj, start) {
  const dist = {};
  for (const n of Object.keys(adj)) dist[n] = Infinity;
  dist[start] = 0;
  const heap = [[0, start]];
  const finalized = new Set();
  const seq = [];
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0]);
    const [d, node] = heap.shift();
    if (d > dist[node]) continue;
    if (!finalized.has(node)) { finalized.add(node); seq.push({ node, badge: d }); }
    for (const { to, weight } of adj[node] || []) {
      const nd = d + weight;
      if (nd < dist[to]) { dist[to] = nd; heap.push([nd, to]); }
    }
  }
  return { seq, values: dist, total: null };
}

function runPrim(adj, start) {
  const visited = new Set([start]);
  const heap = (adj[start] || []).map(({ to, weight }) => [weight, start, to]);
  let total = 0;
  const seq = [{ node: start, badge: 0 }];
  const size = Object.keys(adj).length;
  let guard = 1000;
  while (heap.length && visited.size < size && guard-- > 0) {
    heap.sort((a, b) => a[0] - b[0]);
    const [w, , to] = heap.shift();
    if (visited.has(to)) continue;
    visited.add(to);
    total += w;
    seq.push({ node: to, badge: w });
    for (const { to: nb, weight } of adj[to] || []) if (!visited.has(nb)) heap.push([weight, to, nb]);
  }
  return { seq, values: {}, total };
}

export const ALGO_LABEL = {
  dfs: "DFS traversal",
  topo: "Topological order",
  dijkstra: "Dijkstra · shortest distance",
  prim: "Prim's MST",
};

export function parseGraphAlgoStates(code) {
  const graph = parseGraph(code);
  if (!graph) return [{ vertices: [], edges: [], algo: null, current: null, visited: [], values: {}, order: [], total: null, weighted: false }];

  const { adj, order: nodeOrder, name } = graph;
  const algo = detectAlgo(code);
  const start = parseStart(code, name) || nodeOrder[0];
  const weighted = Object.values(adj).some((ns) => ns.some((n) => n.weight !== 1));

  const edges = [];
  for (const from of nodeOrder) {
    for (const { to, weight } of adj[from]) edges.push({ from, to, weight });
  }

  let result;
  if (algo === "topo") result = runTopo(adj, nodeOrder);
  else if (algo === "dijkstra") result = runDijkstra(adj, start);
  else if (algo === "prim") result = runPrim(adj, start);
  else result = runDFS(adj, start);

  const base = { vertices: nodeOrder, edges, algo, weighted };
  const states = [{ ...base, current: null, visited: [], values: {}, order: [], total: null }];

  const visited = [];
  const orderList = [];
  const badges = {};
  let runningTotal = algo === "prim" ? 0 : null;
  for (const step of result.seq) {
    visited.push(step.node);
    orderList.push(step.node);
    if (step.badge !== undefined) badges[step.node] = step.badge;
    if (algo === "prim" && step.badge !== undefined) runningTotal += step.node === start ? 0 : step.badge;
    // Dijkstra shows final distances on every node; others show per-step badges.
    const values = algo === "dijkstra" ? result.values : { ...badges };
    states.push({
      ...base,
      current: step.node,
      visited: [...visited],
      values,
      order: [...orderList],
      total: algo === "prim" ? runningTotal : null,
    });
  }
  return states;
}
