import { describe, it, expect } from "vitest";
import { graphTraceToStates } from "../src/visualizations/graphTrace.js";

const dictOf = (obj) => ({ __dict__: Object.entries(obj) });

describe("graph trace (real-code execution)", () => {
  it("DFS: builds vertices/edges from the real graph and replays the captured order", () => {
    const data = {
      graph: { "0": [["1", 1], ["2", 1]], "1": [["3", 1]], "2": [], "3": [] },
      order: ["0", "1", "2", "3"],
      snaps: [
        { start: "0", result: ["0"] },
        { start: "0", result: ["0", "1"] },
        { start: "0", result: ["0", "1", "3"] },
        { start: "0", result: ["0", "1", "3", "2"] },
        { __return__: ["0", "1", "3", "2"] },
      ],
    };
    const states = graphTraceToStates(data, "dfs");
    expect(states[0].vertices).toEqual(["0", "1", "2", "3"]);
    expect(states[0].edges).toContainEqual({ from: "0", to: "1", weight: 1 });
    const last = states[states.length - 1];
    expect(last.order).toEqual(["0", "1", "3", "2"]);
    expect(last.current).toBe("2");
    expect(last.visited).toEqual(["0", "1", "3", "2"]);
  });

  it("Dijkstra: shows final distances and orders finalized nodes by distance", () => {
    const data = {
      graph: { a: [["b", 1], ["c", 4]], b: [["c", 2]], c: [] },
      order: ["a", "b", "c"],
      snaps: [
        { start: "a", dist: dictOf({ a: 0, b: 1000000, c: 1000000 }) },
        { start: "a", dist: dictOf({ a: 0, b: 1, c: 3 }) },
        { __return__: dictOf({ a: 0, b: 1, c: 3 }) },
      ],
    };
    const states = graphTraceToStates(data, "dijkstra");
    const last = states[states.length - 1];
    expect(last.values).toMatchObject({ a: 0, b: 1, c: 3 });
    // finalized order by increasing distance: a(0), b(1), c(3)
    expect(last.order).toEqual(["a", "b", "c"]);
    expect(last.weighted).toBe(true);
  });

  it("returns empty when the graph could not be serialized", () => {
    expect(graphTraceToStates({ graph: {}, order: [], snaps: [] }, "dfs")).toEqual([]);
  });
});
