import { describe, it, expect } from "vitest";
import { structTraceToStates } from "../src/visualizations/stackTrace.js";

describe("stack trace (real-code execution)", () => {
  it("assigns stable ids by bottom-up position so push adds and pop removes cleanly", () => {
    // Per-line snapshots of: stack=[] ; push 1 ; push 2 ; pop
    const snaps = [
      {},
      { stack: [] },
      { stack: ["1"] },
      { stack: ["1", "2"] },
      { stack: ["1"] },
    ];
    const states = structTraceToStates(snaps);
    // dedup collapses the leading {} / [] duplicates but keeps the real changes
    const last = states[states.length - 1];
    expect(last.stack.map((x) => x.val)).toEqual(["1"]);
    // the bottom item "1" keeps its id across push and pop
    const afterPush2 = states.find((s) => s.stack && s.stack.length === 2);
    const id1Push = afterPush2.stack[0]._id;
    const id1Pop = last.stack[0]._id;
    expect(id1Pop).toBe(id1Push);
    // the popped item "2" had a distinct id (gone now)
    expect(last.stack.some((x) => x.val === "2")).toBe(false);
  });

  it("handles a class-based stack the same (serialized internal list)", () => {
    // s.push serialized from the object's internal list per line
    const snaps = [
      { s: [] },
      { s: ["a"] },
      { s: ["a", "b"] },
    ];
    const states = structTraceToStates(snaps);
    expect(states[states.length - 1].s.map((x) => x.val)).toEqual(["a", "b"]);
  });
});
