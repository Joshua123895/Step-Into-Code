import { describe, it, expect } from "vitest";
import { treeTraceToStates } from "../src/visualizations/treeTrace.js";

const T = (val, left, right) => ({ val, left: left || null, right: right || null });

describe("tree trace (real BST object serialized per step)", () => {
  it("builds named nodes + treeVars from the serialized tree, growing over steps", () => {
    const snaps = [
      null,
      T(5),
      T(5, T(3)),
      T(5, T(3), T(8)),
    ];
    const states = treeTraceToStates(snaps);
    // null collapses; then 5, then 5+3, then 5+3+8
    const last = states[states.length - 1];
    expect(last.tree.val).toBe("5");
    expect(last.tree.left.val).toBe("3");
    expect(last.tree.right.val).toBe("8");
    // stable value-based names + treeVars wiring
    expect(last.rootName).toBe("n5");
    expect(last.treeVars.n5).toMatchObject({ val: "5", left: "n3", right: "n8" });
    expect(last.treeVars.n3).toMatchObject({ val: "3", left: null, right: null });
  });

  it("dedups identical consecutive trees", () => {
    const snaps = [T(1), T(1), T(1, null, T(2)), T(1, null, T(2))];
    const states = treeTraceToStates(snaps);
    expect(states.length).toBe(2); // just [1] then [1,right=2]
  });
});
