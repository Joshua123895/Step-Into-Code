import { describe, it, expect } from "vitest";
import { backtrackTraceToStates } from "../src/visualizations/backtrackTrace.js";

// Synthetic settrace snapshots for subsets([1,2]): path grows/shrinks, result
// collects every node. result is a list-of-lists; path is the varying flat list.
const R = (arrs) => arrs.map((a) => [...a]);

describe("backtrack trace (real-code execution)", () => {
  it("subsets (include/exclude): add grows current, backtrack shrinks it, leaves collect solutions", () => {
    // Binary-choice subsets([1,2]): path grows on "take" (without result
    // growing), result grows only at the leaves.
    const snaps = [
      { nums: [1, 2], path: [], result: R([]) },
      { nums: [1, 2], path: [], result: R([[]]) },        // leaf: solution []
      { nums: [1, 2], path: [2], result: R([[]]) },       // take 2 (add)
      { nums: [1, 2], path: [2], result: R([[], [2]]) },  // leaf: solution [2]
      { nums: [1, 2], path: [], result: R([[], [2]]) },   // pop (backtrack)
      { nums: [1, 2], path: [1], result: R([[], [2]]) },  // take 1 (add)
      { nums: [1, 2], path: [1], result: R([[], [2], [1]]) }, // leaf: solution [1]
      { nums: [1, 2], path: [1, 2], result: R([[], [2], [1]]) }, // take 2 (add)
      { nums: [1, 2], path: [1, 2], result: R([[], [2], [1], [1, 2]]) }, // leaf
      { nums: [1, 2], path: [1], result: R([[], [2], [1], [1, 2]]) }, // pop
      { __return__: null },
    ];
    const states = backtrackTraceToStates(snaps, "subsets");
    expect(states.filter((s) => s.justFound).length).toBe(4); // [], [2], [1], [1,2]
    expect(states.some((s) => s.action === "backtrack")).toBe(true);
    expect(states.some((s) => /^add /.test(s.action))).toBe(true);
    const last = states[states.length - 1];
    expect(last.solutions).toEqual([[], [2], [1], [1, 2]]);
  });

  it("returns empty when there is no varying path list", () => {
    const snaps = [{ nums: [1, 2, 3] }, { __return__: null }];
    expect(backtrackTraceToStates(snaps, "subsets")).toEqual([]);
  });
});
