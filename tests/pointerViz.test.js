import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { load as loadYaml } from "js-yaml";
import { parseSearchStates } from "../src/visualizations/searchInterp.js";

const ROOT = join(import.meta.dirname, "..");
const track = loadYaml(readFileSync(join(ROOT, "src/data/tracks/python5.yaml"), "utf-8"));

function level(chapterName, levelName) {
  const ch = track.chapters.find((c) => c.name === chapterName);
  return ch.levels.find((l) => l.name === levelName);
}

function run(chapter, name) {
  const lvl = level(chapter, name);
  return parseSearchStates((lvl.start || "") + "\n" + lvl.sol);
}

describe("pointer/search visualization (track 5)", () => {
  it("Searching: both study levels are tagged viz: pointers", () => {
    const ch = track.chapters.find((c) => c.name === "Searching");
    for (const lvl of ch.levels) {
      if (lvl.example) continue; // test-type level, no viz by design
      expect(lvl.viz, `${lvl.name} should be viz: pointers`).toBe("pointers");
    }
  });

  it("Linear Search: traces BOTH calls, the found search then the not-found one", () => {
    const states = run("Searching", "Linear Search");
    expect(states.length).toBeGreaterThan(1);

    // First call: linear_search(nums, 7) → found at index 2.
    const foundState = states.find((s) => s.found && s.found.includes(2));
    expect(foundState, "expected the first search to find index 2").toBeTruthy();
    expect(foundState.status).toContain("index 2");
    expect(foundState.vars.target).toBe(7);

    // Second call: linear_search(nums, 5) → not found, and it's the last run.
    const final = states[states.length - 1];
    expect(final.vars.target, "second search should be for 5").toBe(5);
    expect(final.found).toBeNull();
    expect(final.status).toBe("Not found");
  });

  it("Binary Search: both calls trace, and each run's active range only narrows", () => {
    const states = run("Searching", "Binary Search");

    // A found[3] frame (search for 7) must appear...
    const foundIdx = states.findIndex((s) => s.found && s.found.includes(3));
    expect(foundIdx, "expected the first search to find index 3").toBeGreaterThan(-1);

    // ...and within that first run, the range never widens.
    const firstRun = states.slice(0, foundIdx + 1).filter((s) => s.activeRange);
    for (let i = 1; i < firstRun.length; i++) {
      const prevWidth = firstRun[i - 1].activeRange[1] - firstRun[i - 1].activeRange[0];
      const curWidth = firstRun[i].activeRange[1] - firstRun[i].activeRange[0];
      expect(curWidth).toBeLessThanOrEqual(prevWidth);
    }

    // The second call (search for 4) is not found and ends the trace.
    const final = states[states.length - 1];
    expect(final.vars.target).toBe(4);
    expect(final.status).toBe("Not found");
  });

  it("Binary Search: mid is always inside the current [low, high] range", () => {
    const states = run("Searching", "Binary Search");
    for (const s of states) {
      if (s.pointers.mid !== undefined && s.activeRange) {
        expect(s.pointers.mid).toBeGreaterThanOrEqual(s.activeRange[0]);
        expect(s.pointers.mid).toBeLessThanOrEqual(s.activeRange[1]);
      }
    }
  });

  it("Two Pointers: left/right converge and report the correct pair", () => {
    const states = run("Array Patterns", "Two Pointers");
    const first = states.find((s) => s.pointers.left !== undefined);
    expect(first.pointers.left).toBe(0);
    expect(first.pointers.right).toBe(5);
    const final = states[states.length - 1];
    // pair (4, 6) lives at indices 2 and 3 in [1,3,4,6,8,10]
    expect(final.found).toEqual([2, 3]);
    expect(final.status).toBe("Found pair (4, 6)");
    // pointers only ever move inward
    const lefts = states.filter((s) => s.pointers.left !== undefined).map((s) => s.pointers.left);
    const rights = states.filter((s) => s.pointers.right !== undefined).map((s) => s.pointers.right);
    for (let i = 1; i < lefts.length; i++) expect(lefts[i]).toBeGreaterThanOrEqual(lefts[i - 1]);
    for (let i = 1; i < rights.length; i++) expect(rights[i]).toBeLessThanOrEqual(rights[i - 1]);
  });

  it("Sliding Window: a fixed-width window slides across and tracks the best sum", () => {
    const states = run("Array Patterns", "Sliding Window");
    const windows = states.filter((s) => s.window).map((s) => s.window);
    expect(windows.length).toBeGreaterThan(1);
    for (const w of windows) {
      expect(w[1] - w[0]).toBe(2); // k = 3 → width 3 → span of 2 indices
    }
    const finalBest = states[states.length - 1].vars.best;
    expect(finalBest).toBe(9); // 5 + 1 + 3
  });

  it("recognizes a probe named `middle` (not just `mid`) as a pointer", () => {
    // A common student variant of binary search, the probe should still
    // render as a pointer inside the active range.
    const code = `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        middle = low + (high - low) // 2
        if target < arr[middle]:
            high = middle - 1
        elif target > arr[middle]:
            low = middle + 1
        else:
            return middle
    return -1
arr = [1, 3, 5, 7, 9, 11]
print(binary_search(arr, 7))`;
    const states = parseSearchStates(code);
    const withMiddle = states.filter((s) => s.pointers.middle !== undefined);
    expect(withMiddle.length, "expected `middle` to be tracked as a pointer").toBeGreaterThan(0);
    for (const s of withMiddle) {
      expect(s.pointers.middle).toBeGreaterThanOrEqual(s.activeRange[0]);
      expect(s.pointers.middle).toBeLessThanOrEqual(s.activeRange[1]);
    }
    const final = states[states.length - 1];
    expect(final.found).toEqual([3]); // 7 is at index 3
  });
});
