import { describe, it, expect } from "vitest";
import { dpTraceToStates } from "../src/visualizations/dpTrace.js";

const D = (pairs) => ({ __dict__: pairs });

describe("dp trace (real-code execution)", () => {
  it("tabulation: fills the list cell by cell with fib formula and result", () => {
    // Snapshots of dp growing: [0,1,0,0,0] -> [0,1,1,0,0] -> [0,1,1,2,0] -> [0,1,1,2,3]
    const snaps = [
      { n: 4, dp: [0, 1, 0, 0, 0], i: 2 },
      { n: 4, dp: [0, 1, 1, 0, 0], i: 2 },
      { n: 4, dp: [0, 1, 1, 2, 0], i: 3 },
      { n: 4, dp: [0, 1, 1, 2, 3], i: 4 },
      { __return__: 3 },
    ];
    const states = dpTraceToStates(snaps, "tabulation");
    // base + f(2), f(3), f(4)
    expect(states.length).toBe(4);
    expect(states[1].current).toBe(2);
    expect(states[1].deps).toEqual([1, 0]);
    expect(states[1].formula).toBe("f(2) = f(1) + f(0) = 1 + 0 = 1");
    const last = states[states.length - 1];
    expect(last.current).toBe(4);
    expect(last.result).toBe(3);
    // filled cells carry values, future cells are null in the earlier frame
    expect(states[1].cells[3].value).toBeNull();
    expect(last.cells.map((c) => c.value)).toEqual([0, 1, 1, 2, 3]);
  });

  it("memoization: fills the cache in real recursion order", () => {
    const snaps = [
      { n: 4, memo: D([]) },
      { n: 4, memo: D([[2, 1]]) },
      { n: 4, memo: D([[2, 1], [3, 2]]) },
      { n: 4, memo: D([[2, 1], [3, 2], [4, 3]]) },
      { __return__: 3 },
    ];
    const states = dpTraceToStates(snaps, "memoization");
    expect(states.map((s) => s.current)).toEqual([null, 2, 3, 4]);
    expect(states[states.length - 1].result).toBe(3);
  });
});
