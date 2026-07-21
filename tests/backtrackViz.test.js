import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { load as loadYaml } from "js-yaml";
import { parseBacktrackStates } from "../src/visualizations/backtrackInterp.js";

const ROOT = join(import.meta.dirname, "..");
const track = loadYaml(readFileSync(join(ROOT, "src/data/tracks/python5.yaml"), "utf-8"));
const chapter = track.chapters.find((c) => c.name === "Backtracking");

function run(name) {
  const lvl = chapter.levels.find((l) => l.name === name);
  const states = parseBacktrackStates((lvl.start || "") + "\n" + lvl.sol);
  return { states, final: states[states.length - 1], expected: lvl.tests[0].trim() };
}

const asList = (str) => JSON.parse(str.replace(/'/g, '"'));

describe("backtracking visualization (track 5)", () => {
  it("all three study levels are tagged viz: backtrack", () => {
    for (const lvl of chapter.levels) {
      if (lvl.example) continue;
      expect(lvl.viz, `${lvl.name} should be backtrack`).toBe("backtrack");
    }
  });

  it("Subsets: collects the full power set in the same order the code produces", () => {
    const { final, expected } = run("Subsets");
    expect(final.problem).toBe("subsets");
    expect(final.solutions).toEqual(asList(expected));
  });

  it("Permutations: collects all 6 orderings", () => {
    const { final, expected } = run("Permutations");
    expect(final.problem).toBe("permutations");
    expect(final.solutions).toEqual(asList(expected));
  });

  it("Combination Sum: finds [[2,2,3],[7]] and prunes overshooting branches", () => {
    const { states, final, expected } = run("Combination Sum");
    expect(final.problem).toBe("combination_sum");
    expect(final.solutions).toEqual(asList(expected));
    // pruning actually happens (sum overshoots target 7)
    expect(states.some((s) => s.pruned)).toBe(true);
  });

  it("the partial solution grows on a choice and shrinks on backtrack", () => {
    const { states } = run("Permutations");
    // every step changes `current` by at most one element (a single choice or undo)
    for (let i = 1; i < states.length; i++) {
      const delta = Math.abs(states[i].current.length - states[i - 1].current.length);
      expect(delta).toBeLessThanOrEqual(1);
    }
    // a solution is only recorded when the partial is a full-length permutation
    for (const s of states) {
      if (s.justFound) expect(s.current.length).toBe(3);
    }
  });

  it("solutions only ever accumulate (never lost as exploration continues)", () => {
    const { states } = run("Subsets");
    for (let i = 1; i < states.length; i++) {
      expect(states[i].solutions.length).toBeGreaterThanOrEqual(states[i - 1].solutions.length);
    }
  });
});
