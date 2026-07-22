import { describe, it, expect } from "vitest";
import { hashMapTraceToStates } from "../src/visualizations/hashMapTrace.js";

const D = (pairs) => ({ __dict__: pairs });

describe("hash map trace (real-code execution)", () => {
  it("frequency counter: dict fills with added/updated marks, no array", () => {
    const snaps = [
      { s: "aab", freq: D([]) },
      { s: "aab", ch: "a", freq: D([["a", 1]]) },
      { s: "aab", ch: "a", freq: D([["a", 2]]) },
      { s: "aab", ch: "b", freq: D([["a", 2], ["b", 1]]) },
      { __return__: D([["a", 2], ["b", 1]]) },
    ];
    const states = hashMapTraceToStates(snaps);
    expect(states[0].array).toBeNull(); // string scan, no array row
    // first insert marks "added", the a->2 step marks "updated"
    const addedA = states.find((s) => s.dict.some((p) => p.key === "a" && p.status === "added"));
    const updatedA = states.find((s) => s.dict.some((p) => p.key === "a" && p.val === 2 && p.status === "updated"));
    expect(addedA).toBeTruthy();
    expect(updatedA).toBeTruthy();
    // ends with the full dict
    const last = states[states.length - 1];
    expect(last.dict.map((p) => [p.key, p.val])).toEqual([["a", 2], ["b", 1]]);
    expect(last.status).toBe("Done");
  });

  it("two-sum: shows the array, tracks the i pointer, and reports the found pair", () => {
    const snaps = [
      { nums: [2, 7, 11, 15], target: 9 },
      { nums: [2, 7, 11, 15], target: 9, i: 0, num: 2, complement: 7 },
      { nums: [2, 7, 11, 15], target: 9, i: 0, num: 2, complement: 7, seen: D([[2, 0]]) },
      { nums: [2, 7, 11, 15], target: 9, i: 1, num: 7, complement: 2, seen: D([[2, 0]]) },
      { __return__: [0, 1] },
    ];
    const states = hashMapTraceToStates(snaps);
    expect(states[0].array.map((x) => x.value)).toEqual(["2", "7", "11", "15"]);
    // the i pointer advances
    expect(states.some((s) => s.arrayPtr === 0)).toBe(true);
    expect(states.some((s) => s.arrayPtr === 1)).toBe(true);
    const last = states[states.length - 1];
    expect(last.found).toEqual([0, 1]);
    expect(last.status).toBe("Found: indices [0, 1]");
  });
});
