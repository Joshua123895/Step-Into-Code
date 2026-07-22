import { describe, it, expect } from "vitest";
import { arrayTraceToStates } from "../src/visualizations/arrayTrace.js";

// The converter self-calibrates off the first line event's line number, so we
// fabricate snapshots with lineno = BASE + (0-based source line index), and the
// first snapshot must be at BASE.
const BASE = 20;
const S = (srcIdx, vals) => [BASE + srcIdx, { nums: vals }];

describe("array trace (real-code execution)", () => {
  const userLines = [
    "nums = [10, 20, 30]", // 0
    "nums.append(40)", // 1
    "print(nums[1])", // 2
    "nums[0] = 99", // 3
    "print(nums[1:3])", // 4
  ];

  it("captures append/assign structural changes from real values", () => {
    const snaps = [
      S(0, ["10", "20", "30"]),
      S(1, ["10", "20", "30", "40"]),
      S(3, ["10", "20", "30", "40"]),
      [-1, { nums: ["99", "20", "30", "40"] }],
    ];
    const states = arrayTraceToStates(snaps, userLines);
    const last = states[states.length - 1];
    // assignment set index 0 to 99, highlighted as "set"
    expect(last.nums.items.map((x) => x.value)).toEqual(["99", "20", "30", "40"]);
    expect(last.nums.items[0].sel).toBe("set");
  });

  it("highlights an index read without changing values", () => {
    const snaps = [
      S(0, ["10", "20", "30"]),
      S(2, ["10", "20", "30"]),
      [-1, { nums: ["10", "20", "30"] }],
    ];
    const states = arrayTraceToStates(snaps, userLines);
    const accessState = states.find((s) => s.nums.items.some((it) => it.sel === "idx"));
    expect(accessState.nums.items[1].sel).toBe("idx"); // nums[1]
  });

  it("highlights a slice with a labeled slices entry", () => {
    const snaps = [
      S(0, ["10", "20", "30"]),
      S(4, ["10", "20", "30"]),
      [-1, { nums: ["10", "20", "30"] }],
    ];
    const states = arrayTraceToStates(snaps, userLines);
    const sliceState = states.find((s) => s.nums.slices.length > 0);
    expect(sliceState.nums.slices[0].ids).toEqual([1, 2]); // nums[1:3]
    expect(sliceState.nums.slices[0].label).toBe("1:3");
  });
});
