import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { load as loadYaml } from "js-yaml";
import { parseHashMapStates } from "../src/visualizations/hashMapInterp.js";

const ROOT = join(import.meta.dirname, "..");
const track = loadYaml(readFileSync(join(ROOT, "src/data/tracks/python5.yaml"), "utf-8"));
const chapter = track.chapters.find((c) => c.name === "Hashing Patterns");

function run(name) {
  const lvl = chapter.levels.find((l) => l.name === name);
  return parseHashMapStates((lvl.start || "") + "\n" + lvl.sol);
}

describe("hash-map visualization (track 5)", () => {
  it("both study levels are tagged viz: hash_map", () => {
    for (const lvl of chapter.levels) {
      if (lvl.example) continue;
      expect(lvl.viz, `${lvl.name} should be hash_map`).toBe("hash_map");
    }
  });

  it("Frequency Counter: counts build up and end matching the real solution output", () => {
    const states = run("Frequency Counter");
    const final = states[states.length - 1];
    const asObj = Object.fromEntries(final.dict.map((e) => [e.key, e.val]));
    expect(asObj).toEqual({ b: 1, a: 3, n: 2 });
    // a repeated key is marked "updated", a first-seen key "added"
    const marks = states.flatMap((s) => s.dict.map((e) => e.status)).filter(Boolean);
    expect(marks).toContain("added");
    expect(marks).toContain("updated");
  });

  it("Frequency Counter: no array row (it scans a string, not an indexed array)", () => {
    const states = run("Frequency Counter");
    expect(states.every((s) => s.array === null)).toBe(true);
  });

  it("Hash Map Lookup: builds a value->index map and finds the complement pair", () => {
    const states = run("Hash Map Lookup");
    // array of nums is shown
    expect(states.some((s) => Array.isArray(s.array))).toBe(true);
    const final = states[states.length - 1];
    // two_sum([2,7,11,15], 9) → indices [0, 1]
    expect(final.found).toEqual([0, 1]);
    expect(final.status).toContain("[0, 1]");
    // before the match, index 0 (value 2) was stored in the map
    const stored = states.find((s) => s.dict.some((e) => e.key === "2"));
    expect(stored, "value 2 should have been stored with its index").toBeTruthy();
  });

  it("Hash Map Lookup: the array pointer advances across the scanned elements", () => {
    const states = run("Hash Map Lookup");
    const ptrs = states.filter((s) => s.arrayPtr !== null).map((s) => s.arrayPtr);
    expect(ptrs[0]).toBe(0);
    expect(Math.max(...ptrs)).toBeGreaterThanOrEqual(1);
  });
});
