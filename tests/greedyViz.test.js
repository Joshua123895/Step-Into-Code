import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { load as loadYaml } from "js-yaml";
import { parseGreedyStates } from "../src/visualizations/greedyInterp.js";

const ROOT = join(import.meta.dirname, "..");
const track = loadYaml(readFileSync(join(ROOT, "src/data/tracks/python5.yaml"), "utf-8"));
const chapter = track.chapters.find((c) => c.name === "Greedy Algorithms");

function run(name) {
  const lvl = chapter.levels.find((l) => l.name === name);
  const states = parseGreedyStates((lvl.start || "") + "\n" + lvl.sol);
  return { states, final: states[states.length - 1] };
}

describe("greedy-algorithm visualization (track 5)", () => {
  it("all three study levels are tagged viz: greedy", () => {
    for (const lvl of chapter.levels) {
      if (lvl.example) continue;
      expect(lvl.viz, `${lvl.name} should be greedy`).toBe("greedy");
    }
  });

  it("Activity Selection: keeps 4 non-overlapping activities (matches the level's output)", () => {
    const { final } = run("Activity Selection");
    expect(final.problem).toBe("activity");
    expect(final.count).toBe(4);
    // kept activities never overlap: each kept start >= the previous kept end
    const keptIntervals = final.kept.map((i) => final.activities[i]);
    for (let i = 1; i < keptIntervals.length; i++) {
      expect(keptIntervals[i][0]).toBeGreaterThanOrEqual(keptIntervals[i - 1][1]);
    }
  });

  it("Greedy Coin Change: picks [25, 25, 10, 1, 1, 1] for 63 and reaches remaining 0", () => {
    const { final } = run("Greedy Coin Change");
    expect(final.problem).toBe("coins");
    expect(final.picked).toEqual([25, 25, 10, 1, 1, 1]);
    expect(final.remaining).toBe(0);
    expect(final.picked.reduce((a, b) => a + b, 0)).toBe(63);
  });

  it("Jump Game: both calls trace — [2,3,1,1,4] reaches the end (True), [3,2,1,0,4] gets stuck (False)", () => {
    const { states } = run("Jump Game");
    const run1 = states.filter((s) => s.run === 1);
    const run2 = states.filter((s) => s.run === 2);
    expect(run1[run1.length - 1].result).toBe(true);
    expect(run1.some((s) => s.stuck)).toBe(false);
    expect(run2[run2.length - 1].result).toBe(false);
    expect(run2.some((s) => s.stuck)).toBe(true);
  });

  it("Jump Game: farthest-reachable only ever grows within a single run", () => {
    const { states } = run("Jump Game");
    const run1 = states.filter((s) => s.run === 1 && s.index !== null);
    for (let i = 1; i < run1.length; i++) {
      expect(run1[i].farthest).toBeGreaterThanOrEqual(run1[i - 1].farthest);
    }
  });
});
