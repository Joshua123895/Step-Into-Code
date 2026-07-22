import { describe, it, expect } from "vitest";
import { treeTraceToStates } from "../src/visualizations/treeTraversalTrace.js";

// Serialized real tree:      5
//                          /   \
//                         3     8
const rawTree = {
  val: 5,
  left: { val: 3, left: null, right: null },
  right: { val: 8, left: null, right: null },
};

describe("tree traversal trace (real tree + detected order)", () => {
  it("inorder: Left, Root, Right => 3, 5, 8", () => {
    const states = treeTraceToStates(rawTree, "inorder");
    expect(states[states.length - 1].sequence).toEqual(["3", "5", "8"]);
    // tree carries name + val for layout/visited tracking
    expect(states[0].tree).toMatchObject({ val: "5" });
    expect(states[0].tree.left).toMatchObject({ val: "3" });
  });

  it("preorder: Root, Left, Right => 5, 3, 8", () => {
    const states = treeTraceToStates(rawTree, "preorder");
    expect(states[states.length - 1].sequence).toEqual(["5", "3", "8"]);
  });

  it("postorder: Left, Right, Root => 3, 8, 5", () => {
    const states = treeTraceToStates(rawTree, "postorder");
    expect(states[states.length - 1].sequence).toEqual(["3", "8", "5"]);
  });

  it("bfs: level by level => 5, 3, 8", () => {
    const states = treeTraceToStates(rawTree, "bfs");
    expect(states[states.length - 1].sequence).toEqual(["5", "3", "8"]);
  });

  it("returns empty for a null tree (falls back)", () => {
    expect(treeTraceToStates(null, "preorder")).toEqual([]);
  });
});
