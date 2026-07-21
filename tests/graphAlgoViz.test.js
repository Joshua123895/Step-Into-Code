import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { load as loadYaml } from "js-yaml";
import { parseGraphAlgoStates } from "../src/visualizations/graphAlgoInterp.js";

const ROOT = join(import.meta.dirname, "..");
const track = loadYaml(readFileSync(join(ROOT, "src/data/tracks/python5.yaml"), "utf-8"));
const chapter = track.chapters.find((c) => c.name === "Graph Patterns");

function run(name) {
  const lvl = chapter.levels.find((l) => l.name === name);
  const states = parseGraphAlgoStates((lvl.start || "") + "\n" + lvl.sol);
  return { states, final: states[states.length - 1] };
}

describe("graph-algorithm visualization (track 5)", () => {
  it("all four study levels are tagged viz: graph_algo", () => {
    for (const lvl of chapter.levels) {
      if (lvl.example) continue;
      expect(lvl.viz, `${lvl.name} should be graph_algo`).toBe("graph_algo");
    }
  });

  it("Graph Traversal: DFS from 0 visits 0, 1, 3, 2 (matches the level's output)", () => {
    const { final } = run("Graph Traversal");
    expect(final.algo).toBe("dfs");
    expect(final.order).toEqual(["0", "1", "3", "2"]);
  });

  it("Topological Sort: produces a valid dependency order d, a, b, c", () => {
    const { final } = run("Topological Sort");
    expect(final.algo).toBe("topo");
    expect(final.order).toEqual(["d", "a", "b", "c"]);
  });

  it("Shortest Path: Dijkstra distances match {a:0, b:3, c:1, d:4}", () => {
    const { final } = run("Shortest Path");
    expect(final.algo).toBe("dijkstra");
    expect(final.weighted).toBe(true);
    expect(final.values).toEqual({ a: 0, b: 3, c: 1, d: 4 });
    // nodes finalize in nondecreasing distance order
    const dists = final.order.map((n) => final.values[n]);
    for (let i = 1; i < dists.length; i++) expect(dists[i]).toBeGreaterThanOrEqual(dists[i - 1]);
  });

  it("Minimum Spanning Tree: Prim's total weight is 4", () => {
    const { final } = run("Minimum Spanning Tree");
    expect(final.algo).toBe("prim");
    expect(final.total).toBe(4);
    // every node ends up in the tree
    expect(new Set(final.order).size).toBe(final.vertices.length);
  });

  it("each step highlights one current node and grows the visited set by one", () => {
    const { states } = run("Graph Traversal");
    expect(states[0].current).toBeNull();
    for (let i = 1; i < states.length; i++) {
      expect(states[i].visited.length).toBe(i);
      expect(states[i].current).toBe(states[i].visited[i - 1]);
    }
  });
});
