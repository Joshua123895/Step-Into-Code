import { describe, it, expect } from "vitest";
import { linkedTraceToStates } from "../src/visualizations/linkedTrace.js";

// snap = [walk, ptrs]; walk = [[pyid, val], ...]; ptrs = [[varName, pyid], ...]
describe("linked list trace (real .next walk)", () => {
  it("builds ordered nodes + chain from the walk and maps pointer vars", () => {
    const snaps = [
      [[[100, "1"]], [["head", 100]]],
      [[[100, "1"], [200, "2"]], [["head", 100]]],
      [[[100, "1"], [200, "2"], [300, "3"]], [["head", 100], ["tail", 300]]],
    ];
    const states = linkedTraceToStates(snaps);
    const last = states[states.length - 1];
    expect(last.ordered.map((n) => n.val)).toEqual(["1", "2", "3"]);
    // chain links consecutive nodes by their id-based var names
    expect(last.chain).toEqual([
      { from: "n100", to: "n200" },
      { from: "n200", to: "n300" },
    ]);
    // pointers reference node ids (targetId)
    expect(last.pointers).toContainEqual({ var: "head", targetId: 100 });
    expect(last.pointers).toContainEqual({ var: "tail", targetId: 300 });
    // node identity is stable: node 100 keeps _id across steps
    expect(last.ordered[0]._id).toBe(100);
  });

  it("marks a newly appended node as isNew", () => {
    const snaps = [
      [[[1, "a"]], [["head", 1]]],
      [[[1, "a"], [2, "b"]], [["head", 1]]],
    ];
    const states = linkedTraceToStates(snaps);
    const last = states[states.length - 1];
    expect(last.ordered.find((n) => n.val === "b").isNew).toBe(true);
    expect(last.ordered.find((n) => n.val === "a").isNew).toBe(false);
  });
});
