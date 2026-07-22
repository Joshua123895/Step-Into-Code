import { describe, it, expect } from "vitest";
import { queueTraceToStates } from "../src/visualizations/queueTrace.js";

describe("queue trace (real-code execution)", () => {
  it("enqueue (right) then dequeue (front) preserves ids and infers sides", () => {
    // q=[] ; append a ; append b ; popleft -> [b]
    const snaps = [{ q: [] }, { q: ["a"] }, { q: ["a", "b"] }, { q: ["b"] }];
    const states = queueTraceToStates(snaps);
    const two = states.find((s) => s.q.length === 2);
    expect(two.q.map((x) => x.val)).toEqual(["a", "b"]);
    expect(two.q[1].side).toBe("right"); // b entered on the right
    const last = states[states.length - 1];
    expect(last.q.map((x) => x.val)).toEqual(["b"]);
    // "b" kept its id through the dequeue of "a"
    expect(last.q[0]._id).toBe(two.q[1]._id);
  });

  it("appendleft tags the new item side=left and adds it at the front", () => {
    const snaps = [{ dq: ["a"] }, { dq: ["b", "a"] }];
    const states = queueTraceToStates(snaps);
    const last = states[states.length - 1];
    expect(last.dq.map((x) => x.val)).toEqual(["b", "a"]);
    expect(last.dq[0].side).toBe("left");
  });
});
