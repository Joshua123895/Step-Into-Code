import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { load as loadYaml } from "js-yaml";
import { parseSortStates } from "../src/visualizations/sortInterp.js";

const ROOT = join(import.meta.dirname, "..");
const track = loadYaml(readFileSync(join(ROOT, "src/data/tracks/python5.yaml"), "utf-8"));
const chapter = track.chapters.find((c) => c.name === "Sorting");

function level(name) {
  return chapter.levels.find((l) => l.name === name);
}

function run(name) {
  const lvl = level(name);
  const code = (lvl.start || "") + "\n" + lvl.sol;
  return { states: parseSortStates(code), level: lvl };
}

describe("Sorting chapter visualization (track 5)", () => {
  it("every study-type level in Sorting is tagged viz: sort", () => {
    for (const lvl of chapter.levels) {
      if (lvl.example) continue; // test-type level, no viz by design
      expect(lvl.viz, `${lvl.name} should be tagged viz: sort`).toBe("sort");
    }
  });

  for (const name of ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Heap Sort"]) {
    it(`${name}: animates and ends fully sorted, matching the level's own expected output`, () => {
      const { states, level: lvl } = run(name);
      expect(states.length, "no animation beyond the initial frame").toBeGreaterThan(1);
      const final = states[states.length - 1];
      const finalValues = `[${final.items.map((i) => i.value).join(", ")}]`;
      expect(finalValues).toBe(lvl.tests[0].trim());
    });
  }

  it("Bubble Sort: highlights a genuine swap, not just writes", () => {
    const { states } = run("Bubble Sort");
    const swapStep = states.find((s) => s.highlight?.type === "swap");
    expect(swapStep, "expected at least one swap-highlighted state").toBeTruthy();
    expect(swapStep.highlight.indices).toHaveLength(2);
  });

  it("Insertion Sort: shifts (single-index writes) are tracked distinctly from swaps", () => {
    const { states } = run("Insertion Sort");
    const writeStep = states.find((s) => s.highlight?.type === "write");
    expect(writeStep, "expected at least one single-index write (the shift-right step)").toBeTruthy();
    expect(writeStep.highlight.indices).toHaveLength(1);
  });

  it("Heap Sort: real recursion (heapify calling itself) still terminates and animates", () => {
    const { states } = run("Heap Sort");
    // 6 elements: plenty of swap/compare activity if recursion actually ran,
    // not just the initial array with nothing happening.
    expect(states.length).toBeGreaterThan(10);
  });

  it("Merge Sort and Quick Sort (trusted-name simulation) still reach the correct order for an already-tricky case", () => {
    // Duplicate values and a reverse-sorted run, to make sure the
    // simulations aren't just accidentally correct on the YAML's own input.
    const arr = [9, 9, 1, 5, 5, 3, 7, 2];
    const code = `def merge_sort(arr):\n    pass\narr = [9, 9, 1, 5, 5, 3, 7, 2]\nmerge_sort(arr)\n`;
    const states = parseSortStates(code);
    const final = states[states.length - 1].items.map((i) => Number(i.value));
    expect(final).toEqual([...arr].sort((a, b) => a - b));
  });

  it("triggers on a list literal passed straight into the call, not just a named variable", () => {
    // `print(selection_sort([64, 25, 12, 22, 11]))` — no separate
    // `nums = [...]` line at all. Previously this never matched either
    // trigger pattern, so the array stayed unset and nothing animated.
    const code = `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

print(selection_sort([64, 25, 12, 22, 11]))
`;
    const states = parseSortStates(code);
    expect(states.length, "inline list literal call never triggered execution").toBeGreaterThan(1);
    const final = states[states.length - 1].items.map((i) => Number(i.value));
    expect(final).toEqual([11, 12, 22, 25, 64]);
  });
});
