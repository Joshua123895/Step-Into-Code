import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { load as loadYaml } from "js-yaml";
import { parseDPStates, detectDPType } from "../src/visualizations/dpInterp.js";

const ROOT = join(import.meta.dirname, "..");
const track = loadYaml(readFileSync(join(ROOT, "src/data/tracks/python5.yaml"), "utf-8"));
const chapter = track.chapters.find((c) => c.name === "Dynamic Programming");

function run(name) {
  const lvl = chapter.levels.find((l) => l.name === name);
  const states = parseDPStates((lvl.start || "") + "\n" + lvl.sol);
  return { states, final: states[states.length - 1] };
}

describe("dynamic-programming visualization (track 5)", () => {
  it("both study levels are tagged viz: dp", () => {
    for (const lvl of chapter.levels) {
      if (lvl.example) continue;
      expect(lvl.viz, `${lvl.name} should be dp`).toBe("dp");
    }
  });

  it("Tabulation: fills a 31-cell table and ends at fib(30) = 832040", () => {
    const { states, final } = run("Tabulation");
    expect(final.type).toBe("tabulation");
    expect(final.cells).toHaveLength(31); // indices 0..30
    expect(final.result).toBe(832040);
    // base cases known up front, then one fill per step
    expect(states[0].current).toBeNull();
    expect(states.length).toBe(30); // base state + fills for i=2..30 (29) = 30
  });

  it("Memoization: detected as top-down, same Fibonacci result", () => {
    const { final } = run("Memoization");
    expect(final.type).toBe("memoization");
    expect(final.result).toBe(832040);
  });

  it("each fill step highlights the current cell and its two predecessors", () => {
    const { states } = run("Tabulation");
    for (let i = 1; i < states.length; i++) {
      const s = states[i];
      expect(s.current).toBe(i + 1); // i=1 -> filling index 2, etc.
      expect(s.deps).toEqual([s.current - 1, s.current - 2]);
      // the current cell's value equals the sum of its dependency cells
      const val = s.cells[s.current].value;
      const a = s.cells[s.current - 1].value;
      const b = s.cells[s.current - 2].value;
      expect(val).toBe(a + b);
    }
  });

  it("cells are empty until filled, the frontier advances left to right", () => {
    const { states } = run("Tabulation");
    const mid = states[5]; // filling index 6
    expect(mid.cells[6].value).not.toBeNull(); // just filled
    expect(mid.cells[7].value).toBeNull();     // not yet reached
  });

  it("detection keys off the code: a memo dict means memoization, a table means tabulation", () => {
    expect(detectDPType("def fib(n, memo=None):\n    memo = {}")).toBe("memoization");
    expect(detectDPType("table = [0] * (n + 1)")).toBe("tabulation");
  });
});
