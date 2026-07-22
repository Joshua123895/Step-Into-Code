import { describe, it, expect } from "vitest";
import { graphDSTraceToStates } from "../src/visualizations/graphDSTrace.js";

describe("graph (DS) trace — real adjacency serialized per step", () => {
  it("derives vertices (insertion order) and edges from a growing adjacency", () => {
    const snaps = [
      null,
      { "0": [] },
      { "0": ["1"], "1": [] },
      { "0": ["1", "2"], "1": [], "2": [] },
    ];
    const states = graphDSTraceToStates(snaps);
    const last = states[states.length - 1];
    expect(last.vertices).toEqual(["0", "1", "2"]);
    expect(last.edges).toEqual([
      { from: "0", to: "1" },
      { from: "0", to: "2" },
    ]);
  });

  it("dedups steps where the visible graph didn't change but keeps real changes", () => {
    const snaps = [{ a: ["b"] }, { a: ["b"] }, { a: ["b", "c"] }];
    const states = graphDSTraceToStates(snaps);
    expect(states.length).toBe(2); // [a,b] then [a,b,c]
    expect(states[1].edges).toContainEqual({ from: "a", to: "c" });
  });
});
