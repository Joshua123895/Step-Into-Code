import { describe, it, expect } from "vitest";
import { hashTraceToStates } from "../src/visualizations/hashTrace.js";

describe("hash trace (real dict / real buckets)", () => {
  it("dict mode: marks added then updated on the changed key", () => {
    const snaps = [
      ["freq", { dict: [] }],
      ["freq", { dict: [["a", "1"]] }],
      ["freq", { dict: [["a", "2"]] }],
      ["freq", { dict: [["a", "2"], ["b", "1"]] }],
    ];
    const states = hashTraceToStates(snaps);
    expect(states.some((s) => s.freq.some((p) => p.key === "a" && p.added))).toBe(true);
    expect(states.some((s) => s.freq.some((p) => p.key === "a" && p.val === "2" && p.updated))).toBe(true);
    const last = states[states.length - 1];
    expect(last.freq.map((p) => [p.key, p.val])).toEqual([["a", "2"], ["b", "1"]]);
  });

  it("bucket mode: keeps the bucket layout and marks the inserted key", () => {
    const snaps = [
      ["ht", { buckets: [[], [], []] }],
      ["ht", { buckets: [[["cat", "1"]], [], []] }],
      ["ht", { buckets: [[["cat", "1"]], [["dog", "2"]], []] }],
    ];
    const states = hashTraceToStates(snaps);
    const last = states[states.length - 1];
    expect(last.ht.size).toBe(3);
    expect(last.ht.buckets[0][0]).toMatchObject({ key: "cat", val: "1" });
    expect(last.ht.buckets[1][0]).toMatchObject({ key: "dog", val: "2", added: true });
  });
});
