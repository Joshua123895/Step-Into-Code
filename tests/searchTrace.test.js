import { describe, it, expect } from "vitest";
import { buildSearchHarness, searchTraceToStates } from "../src/visualizations/searchTrace.js";

describe("search trace (real-code execution via sys.settrace)", () => {
  it("builds a harness targeting the called function, with the user code indented under settrace", () => {
    const code = `def binary_search(arr, target):\n    return -1\nnums = [1, 3, 5, 7]\nprint(binary_search(nums, 5))`;
    const { harness, fn } = buildSearchHarness(code);
    expect(fn).toBe("binary_search");
    expect(harness).toContain("sys.settrace(_tr)");
    expect(harness).toContain("    def binary_search(arr, target):"); // indented into try
    expect(harness).toContain("@@VIZTRACE@@");
  });

  it("returns null when there is no function to trace", () => {
    expect(buildSearchHarness("x = 5\nprint(x)")).toBeNull();
  });

  it("maps per-line locals into array + pointers + active range + found status", () => {
    // Simulated binary-search snapshots on [1, 3, 5, 7, 9], target 7.
    const snaps = [
      { arr: [1, 3, 5, 7, 9], target: 7, low: 0, high: 4 },
      { arr: [1, 3, 5, 7, 9], target: 7, low: 0, high: 4, mid: 2 },
      { arr: [1, 3, 5, 7, 9], target: 7, low: 3, high: 4, mid: 2 },
      { arr: [1, 3, 5, 7, 9], target: 7, low: 3, high: 4, mid: 3 },
      { __return__: 3 },
    ];
    const states = searchTraceToStates(snaps);
    expect(states.length).toBe(4);
    // array detected
    expect(states[0].items.map((i) => i.value)).toEqual(["1", "3", "5", "7", "9"]);
    // pointers picked up, target kept as a scalar var (not a pointer)
    expect(states[1].pointers).toMatchObject({ low: 0, high: 4, mid: 2 });
    expect(states[1].vars).toMatchObject({ target: 7 });
    // active range brackets low..high
    expect(states[2].activeRange).toEqual([3, 4]);
    // final found status from the return value
    const last = states[states.length - 1];
    expect(last.status).toBe("Found at index 3");
    expect(last.found).toEqual([3]);
  });

  it("reports 'Not found' when the function returns -1", () => {
    const snaps = [
      { arr: [1, 2, 3], target: 9, i: 0 },
      { arr: [1, 2, 3], target: 9, i: 2 },
      { __return__: -1 },
    ];
    const states = searchTraceToStates(snaps);
    expect(states[states.length - 1].status).toBe("Not found");
  });
});
