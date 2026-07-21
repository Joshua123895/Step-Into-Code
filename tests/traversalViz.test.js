import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { load as loadYaml } from "js-yaml";
import { parseTraversalStates, detectTraversal } from "../src/visualizations/treeTraversalInterp.js";

const ROOT = join(import.meta.dirname, "..");
const track = loadYaml(readFileSync(join(ROOT, "src/data/tracks/python5.yaml"), "utf-8"));
const chapter = track.chapters.find((c) => c.name === "Tree Patterns");

function run(name) {
  const lvl = chapter.levels.find((l) => l.name === name);
  return parseTraversalStates((lvl.start || "") + "\n" + lvl.sol);
}

describe("tree traversal visualization (track 5)", () => {
  it("all three study levels are tagged viz: tree_traversal", () => {
    for (const lvl of chapter.levels) {
      if (lvl.example) continue; // test-type level, no viz
      expect(lvl.viz, `${lvl.name} should be tree_traversal`).toBe("tree_traversal");
    }
  });

  it("Tree Traversal: detected as in-order, visits Left-Root-Right", () => {
    const states = run("Tree Traversal");
    const final = states[states.length - 1];
    expect(final.type).toBe("inorder");
    expect(final.sequence).toEqual([1, 2, 3].map(String));
  });

  it("DFS: detected as pre-order (visit-before-recurse), visits Root-Left-Right", () => {
    const states = run("DFS");
    const final = states[states.length - 1];
    expect(final.type).toBe("preorder");
    // root 1, left 2 (with its left child 4), then right 3
    expect(final.sequence).toEqual([1, 2, 4, 3].map(String));
  });

  it("BFS: detected as level-order via the queue, visits by depth", () => {
    const states = run("BFS");
    const final = states[states.length - 1];
    expect(final.type).toBe("bfs");
    expect(final.sequence).toEqual([1, 2, 3, 4, 5].map(String));
  });

  it("each step highlights exactly one current node and accumulates the visited set", () => {
    const states = run("BFS");
    // first state is the built tree, nothing visited
    expect(states[0].currentName).toBeNull();
    expect(states[0].visited).toEqual([]);
    // every later step advances by exactly one visited node
    for (let i = 1; i < states.length; i++) {
      expect(states[i].visited.length).toBe(i);
      expect(states[i].currentName).toBe(states[i].visited[i - 1]);
    }
  });

  it("detection reads code shape, not the function name: swapping the visit line changes the order", () => {
    const preCode = `class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
def walk(node, result):
    if node:
        result.append(node.value)
        walk(node.left, result)
        walk(node.right, result)
    return result
root = TreeNode(2)
root.left = TreeNode(1)
root.right = TreeNode(3)
print(walk(root, []))`;
    expect(detectTraversal(preCode)).toBe("preorder");

    const postCode = preCode.replace(
      "        result.append(node.value)\n        walk(node.left, result)\n        walk(node.right, result)",
      "        walk(node.left, result)\n        walk(node.right, result)\n        result.append(node.value)"
    );
    expect(detectTraversal(postCode)).toBe("postorder");
  });
});
