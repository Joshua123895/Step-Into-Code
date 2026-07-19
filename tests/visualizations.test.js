import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { load as loadYaml } from "js-yaml";

import { parseArrayStates } from "../src/visualizations/ArrayViz.jsx";
import { parseStackStates } from "../src/visualizations/StackViz.jsx";
import { parseQueueStates } from "../src/visualizations/QueueViz.jsx";
import { parseLinkedListStates } from "../src/visualizations/LinkedListViz.jsx";
import { parseHashStates } from "../src/visualizations/HashViz.jsx";
import { parseTreeStates } from "../src/visualizations/TreeViz.jsx";
import { parseHeapStates } from "../src/visualizations/HeapViz.jsx";
import { parseGraphStates } from "../src/visualizations/GraphViz.jsx";

const ROOT = join(import.meta.dirname, "..");
const TRACKS_DIR = join(ROOT, "src", "data", "tracks");

const PARSERS = {
  array: parseArrayStates,
  stack: parseStackStates,
  queue: parseQueueStates,
  linked_list: parseLinkedListStates,
  hash_table: parseHashStates,
  tree: parseTreeStates,
  heap: parseHeapStates,
  graph: parseGraphStates,
};

function loadTrack(file) {
  const raw = readFileSync(join(TRACKS_DIR, file), "utf-8");
  return loadYaml(raw);
}

function vizLevels(track) {
  const out = [];
  for (const chapter of track.chapters) {
    for (const level of chapter.levels) {
      if (level.viz) out.push({ chapter: chapter.name, level });
    }
  }
  return out;
}

const track = loadTrack("python4.yaml");
const levels = vizLevels(track);

describe("data-structures track visualizations", () => {
  it("finds at least one viz-tagged level per structure type", () => {
    const types = new Set(levels.map((l) => l.level.viz));
    for (const key of Object.keys(PARSERS)) {
      expect(types.has(key), `expected at least one level tagged viz: ${key}`).toBe(true);
    }
  });

  for (const { chapter, level } of levels) {
    it(`${chapter} / ${level.name} (viz: ${level.viz}) produces a real animation, not just the empty starting frame`, () => {
      const parser = PARSERS[level.viz];
      expect(parser, `no parser registered for viz type "${level.viz}"`).toBeTypeOf("function");

      const fullCode = (level.start || "") + "\n" + level.sol;
      const states = parser(fullCode);

      expect(Array.isArray(states)).toBe(true);
      expect(
        states.length,
        `parser produced no state changes beyond the initial empty snapshot for "${level.name}" — the level's own solution never animates`
      ).toBeGreaterThan(1);
    });
  }

  it("Build a Tree: root gets both children linked, not a spurious top-level variable", () => {
    const level = levels.find((l) => l.level.name === "Build a Tree").level;
    const states = parseTreeStates((level.start || "") + "\n" + level.sol);
    const final = states[states.length - 1];
    expect(final.rootName).toBe("root");
    expect(final.tree.left.val).toBe("2");
    expect(final.tree.right.val).toBe("3");
  });

  it("Tree Height: a two-level dotted chain (root.left.right) attaches to the right node", () => {
    const level = levels.find((l) => l.level.name === "Tree Height").level;
    const states = parseTreeStates((level.start || "") + "\n" + level.sol);
    const final = states[states.length - 1];
    expect(final.tree.left.val).toBe("2");
    expect(final.tree.left.right.val).toBe("4");
  });

  it("Collections Deque: appendleft places the item at the front, not the rear", () => {
    const level = levels.find((l) => l.level.name === "Collections Deque").level;
    const states = parseQueueStates((level.start || "") + "\n" + level.sol);
    // The solution drains the deque with a trailing `while dq:` loop, so the
    // last snapshot is empty — check the peak (right after appendleft) instead.
    const peak = states.find((s) => (s.dq || []).length === 4);
    expect(peak, "expected a state with all 4 items present after appendleft").toBeTruthy();
    expect(peak.dq.map((item) => item.val)).toEqual(["0", "1", "2", "3"]);
  });

  it("Min Heap Basics: pushes end in real heapq order, not raw insertion order", () => {
    const level = levels.find((l) => l.level.name === "Min Heap Basics").level;
    const states = parseHeapStates((level.start || "") + "\n" + level.sol);
    const final = states[states.length - 1];
    expect(final.map((i) => i.value)).toEqual(["1", "3", "5", "8"]);
  });

  it("Heap Sort: a function call bound to a list literal actually runs and empties the heap", () => {
    const level = levels.find((l) => l.level.name === "Heap Sort").level;
    const states = parseHeapStates((level.start || "") + "\n" + level.sol);
    const final = states[states.length - 1];
    expect(final).toEqual([]);
  });

  it("Adjacency List: a multi-line dict literal is read as vertices + edges", () => {
    const level = levels.find((l) => l.level.name === "Adjacency List").level;
    const states = parseGraphStates((level.start || "") + "\n" + level.sol);
    const final = states[states.length - 1];
    expect(final.vertices.sort()).toEqual(["A", "B", "C"]);
    expect(final.edges.length).toBeGreaterThan(0);
  });

  it("BFS Traversal: a single-line non-empty dict literal is read as vertices + edges", () => {
    const level = levels.find((l) => l.level.name === "BFS Traversal").level;
    const states = parseGraphStates((level.start || "") + "\n" + level.sol);
    const final = states[states.length - 1];
    expect(final.vertices.length).toBe(5);
    expect(final.edges.length).toBeGreaterThan(0);
  });

  it("Chain Nodes: semicolon-joined node creation links all three nodes", () => {
    const level = levels.find((l) => l.level.name === "Chain Nodes").level;
    const states = parseLinkedListStates((level.start || "") + "\n" + level.sol);
    const final = states[states.length - 1];
    expect(final.ordered.map((n) => n.val)).toEqual(["1", "2", "3"]);
  });

  it("Stack Class: while-not-is_empty loop actually drains the stack", () => {
    const level = levels.find((l) => l.level.name === "Stack Class").level;
    const states = parseStackStates((level.start || "") + "\n" + level.sol);
    const final = states[states.length - 1];
    expect(final.s).toEqual([]);
  });

  it("Dictionary Basics: double-quoted keys populate the dict, and read/write badges don't linger past their own step", () => {
    const level = levels.find((l) => l.level.name === "Dictionary Basics").level;
    const states = parseHashStates((level.start || "") + "\n" + level.sol);
    const final = states[states.length - 1];

    expect(final.ages.map((p) => [p.key, p.val])).toEqual([
      ["Alice", "25"],
      ["Bob", "30"],
      ["Charlie", "35"],
    ]);
    // Alice was read a step ago, then Charlie was added — Alice's "read"
    // badge should have cleared once a later, unrelated step happened.
    const alice = final.ages.find((p) => p.key === "Alice");
    expect(alice.accessed).toBeFalsy();
    const charlie = final.ages.find((p) => p.key === "Charlie");
    expect(charlie.added).toBe(true);

    const accessStep = states.find((s) => s.ages?.some((p) => p.accessed));
    expect(accessStep, "expected some state to show Alice's read highlight").toBeTruthy();
  });
});
