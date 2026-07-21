import { describe, it, expect } from "vitest";
import { EditorState } from "@codemirror/state";
import { computeTabEdit } from "../src/editor/useCodeMirror.js";

// Build a state, apply the Tab/Shift-Tab edit, return the resulting text.
function applyTab(doc, { anchor, head }, shiftKey) {
  const state = EditorState.create({ doc, selection: { anchor, head: head ?? anchor } });
  const edit = computeTabEdit(state, shiftKey);
  if (!edit) return doc; // no-op
  return state.update(edit).state.doc.toString();
}

const idx = (doc, sub) => doc.indexOf(sub);

describe("editor Tab / Shift-Tab indentation", () => {
  it("Shift-Tab removes one full indent (4 spaces) from the caret's line", () => {
    const doc = "def f():\n    return 1";
    const caret = idx(doc, "return"); // inside the indented line
    expect(applyTab(doc, { anchor: caret }, true)).toBe("def f():\nreturn 1");
  });

  it("Shift-Tab removes only what's there when a line has fewer than 4 leading spaces", () => {
    const doc = "  x = 1";
    expect(applyTab(doc, { anchor: idx(doc, "x") }, true)).toBe("x = 1");
  });

  it("Shift-Tab on a line with no indent is a no-op (does NOT move focus away)", () => {
    const doc = "x = 1";
    const state = EditorState.create({ doc, selection: { anchor: 0 } });
    expect(computeTabEdit(state, true)).toBeNull();
  });

  it("Shift-Tab dedents every line of a multi-line selection", () => {
    const doc = "    a\n    b\n    c";
    // select from start of line 1 through line 3
    const out = applyTab(doc, { anchor: 0, head: doc.length }, true);
    expect(out).toBe("a\nb\nc");
  });

  it("Shift-Tab removes a leading tab character too", () => {
    const doc = "\tindented";
    expect(applyTab(doc, { anchor: 2 }, true)).toBe("indented");
  });

  it("Tab with a plain caret inserts 4 spaces", () => {
    const doc = "ab";
    expect(applyTab(doc, { anchor: 1 }, false)).toBe("a    b");
  });

  it("Tab indents every line of a multi-line selection instead of replacing it", () => {
    const doc = "a\nb\nc";
    const out = applyTab(doc, { anchor: 0, head: doc.length }, false);
    expect(out).toBe("    a\n    b\n    c");
  });

  it("a selection ending exactly at a line start does not affect that trailing line", () => {
    const doc = "a\nb\nc";
    // select line 1 fully, ending at the very start of line 2
    const endOfLine1Start = idx(doc, "b"); // position at start of "b"
    const out = applyTab(doc, { anchor: 0, head: endOfLine1Start }, false);
    expect(out).toBe("    a\nb\nc");
  });
});
