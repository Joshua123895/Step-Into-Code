import { describe, it, expect } from "vitest";
import { greedyTraceToStates } from "../src/visualizations/greedyTrace.js";

describe("greedy trace (real-code execution)", () => {
  it("activity selection: derives kept (non-overlapping) from the real sorted list", () => {
    // activities already sorted by end time in the last snapshot.
    const snaps = [
      { activities: [[1, 3], [2, 5], [4, 7], [6, 8]], i: 3, last_end: 7 },
      { __return__: 3 },
    ];
    const states = greedyTraceToStates(snaps, "activity");
    const final = states[states.length - 1];
    expect(final.problem).toBe("activity");
    // kept intervals never overlap: each kept start >= previous kept end
    const kept = final.kept.map((i) => final.activities[i]);
    for (let i = 1; i < kept.length; i++) expect(kept[i][0]).toBeGreaterThanOrEqual(kept[i - 1][1]);
    expect(final.count).toBe(final.kept.length);
  });

  it("coin change: picked list grows and remaining shrinks to 0", () => {
    const snaps = [
      { coins: [25, 10, 1], amount: 30, result: [] },
      { coins: [25, 10, 1], amount: 5, coin: 25, result: [25] },
      { coins: [25, 10, 1], amount: 4, coin: 1, result: [25, 1] },
      { coins: [25, 10, 1], amount: 3, coin: 1, result: [25, 1, 1] },
      { coins: [25, 10, 1], amount: 2, coin: 1, result: [25, 1, 1, 1] },
      { coins: [25, 10, 1], amount: 1, coin: 1, result: [25, 1, 1, 1, 1] },
      { coins: [25, 10, 1], amount: 0, coin: 1, result: [25, 1, 1, 1, 1, 1] },
      { __return__: [25, 1, 1, 1, 1, 1] },
    ];
    const states = greedyTraceToStates(snaps, "coins");
    expect(states[0].remaining).toBe(30);
    const final = states[states.length - 1];
    expect(final.remaining).toBe(0);
    expect(final.picked).toEqual([25, 1, 1, 1, 1, 1]);
    expect(final.currentCoin).toBe(1);
  });

  it("jump game: traces both calls; run 1 reachable (True), run 2 stuck (False)", () => {
    const snaps = [
      { nums: [2, 3, 1, 1, 4], i: 0, farthest: 2 },
      { nums: [2, 3, 1, 1, 4], i: 1, farthest: 4 },
      { nums: [2, 3, 1, 1, 4], i: 4, farthest: 8 },
      { __return__: true },
      { nums: [3, 2, 1, 0, 4], i: 0, farthest: 3 },
      { nums: [3, 2, 1, 0, 4], i: 3, farthest: 3 },
      { nums: [3, 2, 1, 0, 4], i: 4, farthest: 3 },
      { __return__: false },
    ];
    const states = greedyTraceToStates(snaps, "jump");
    const run1 = states.filter((s) => s.run === 1 && s.index !== null);
    const run2 = states.filter((s) => s.run === 2 && s.index !== null);
    expect(run1[run1.length - 1].result).toBe(true);
    expect(run1.some((s) => s.stuck)).toBe(false);
    expect(run2[run2.length - 1].result).toBe(false);
    expect(run2.some((s) => s.stuck)).toBe(true);
  });
});
