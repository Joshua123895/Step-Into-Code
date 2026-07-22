import { describe, it, expect } from "vitest";
import { heapTraceToStates } from "../src/visualizations/heapTrace.js";

describe("heap trace (real heap list per step)", () => {
  it("matches ids by value so reordering keeps identity and pop drops the min's id", () => {
    // heap=[] ; push 5 ; push 3 (sifts to [3,5]) ; pop (removes 3 -> [5])
    const snaps = [
      { heap: [] },
      { heap: ["5"] },
      { heap: ["3", "5"] },
      { heap: ["5"] },
    ];
    const states = heapTraceToStates(snaps);
    const two = states.find((s) => s.length === 2);
    // "5" keeps the same id across the sift reorder
    const id5push = states.find((s) => s.length === 1 && s[0].value === "5" && s === states[1])?.[0]?._id;
    const id5in2 = two.find((x) => x.value === "5")._id;
    const last = states[states.length - 1];
    expect(last.map((x) => x.value)).toEqual(["5"]);
    expect(last[0]._id).toBe(id5in2); // 5 kept identity through the pop of 3
    expect(id5in2).toBe(id5push);
  });
});
