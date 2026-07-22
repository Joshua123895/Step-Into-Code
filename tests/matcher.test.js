// Adversarial tests for the shared output matcher.
//
// The levels.test.js suite only proves that CORRECT solutions pass ("does my
// key open the lock"). This suite deliberately submits WRONG outputs and
// asserts they are REJECTED ("do the wrong keys fail"). Every case below
// encodes a real bug that previously shipped: the endsWith suffix loophole,
// the raw-includes expectAnyOf bug, and unanchored regex acceptance.
import { describe, it, expect } from "vitest";
import { norm, matchOutput, checkOutput } from "../src/utils/outputMatcher.js";

describe("norm", () => {
  it("strips leading/trailing blank lines and unifies CRLF", () => {
    expect(norm("\r\n\r\nHello\r\nWorld\r\n\r\n")).toBe("Hello\nWorld");
  });

  it("preserves inner blank lines and inner whitespace", () => {
    expect(norm("a\n\nb")).toBe("a\n\nb");
    expect(norm("  a  ")).toBe("  a  ");
  });

  it("handles empty and null input", () => {
    expect(norm("")).toBe("");
    expect(norm(null)).toBe("");
    expect(norm(undefined)).toBe("");
  });
});

describe("exact match (test.expected), suffix loophole must stay dead", () => {
  const test = { expected: "5\n" };

  it("accepts the exact answer", () => {
    expect(checkOutput("5\n", test)).toBe(true);
    expect(checkOutput("5", test)).toBe(true); // trailing newline is normalized
  });

  it("REJECTS a numeric superstring that merely ends with the answer (15 vs 5)", () => {
    expect(checkOutput("15\n", test)).toBe(false);
  });

  it("REJECTS a negated answer (-5 vs 5)", () => {
    expect(checkOutput("-5\n", test)).toBe(false);
  });

  it("REJECTS correct answer preceded by extra output", () => {
    expect(checkOutput("debug garbage\n5\n", test)).toBe(false);
  });

  it("REJECTS correct answer followed by extra output", () => {
    expect(checkOutput("5\nextra line\n", test)).toBe(false);
  });

  it("REJECTS empty output when something was expected", () => {
    expect(checkOutput("", test)).toBe(false);
  });
});

describe("matchOutput (solution-diff levels)", () => {
  it("accepts identical output modulo edge blank lines", () => {
    expect(matchOutput("Even\n", "\nEven\n\n")).toBe(true);
  });

  it("REJECTS output that prints both branches then the right answer", () => {
    // Old endsWith rule accepted this: student printed "Odd" AND "Even".
    expect(matchOutput("Odd\nEven\n", "Even\n")).toBe(false);
  });

  it("REJECTS a suffix-only match at character level", () => {
    expect(matchOutput("xEven\n", "Even\n")).toBe(false);
  });

  it("accepts two empty outputs, rejects empty vs non-empty", () => {
    expect(matchOutput("", "")).toBe(true);
    expect(matchOutput("something", "")).toBe(false);
    expect(matchOutput("", "something")).toBe(false);
  });
});

describe("expectAnyOf, YAML block-scalar candidates must be matchable", () => {
  // YAML `- |` block scalars produce candidates WITH trailing newlines.
  // The old app compared raw candidates against normalized output, so a
  // correct solution could NEVER pass (permanent false reject).
  const test = { expectAnyOf: ["1\n", "2\n", "3\n"] };

  it("accepts a correct output despite the candidate's trailing newline", () => {
    expect(checkOutput("2\n", test)).toBe(true);
    expect(checkOutput("2", test)).toBe(true);
  });

  it("REJECTS output not in the candidate set", () => {
    expect(checkOutput("4\n", test)).toBe(false);
  });

  it("REJECTS a candidate embedded in extra output", () => {
    expect(checkOutput("noise\n2\n", test)).toBe(false);
  });
});

describe("expectMatch, regex semantics are consistent and anchorable", () => {
  it("compiles with the s flag so `.` can span lines (parity with old CI behavior)", () => {
    expect(checkOutput("a\nb", { expectMatch: "a.b" })).toBe(true);
  });

  it("REJECTS wrong output against an anchored pattern", () => {
    const test = { expectMatch: "^D, B, C, A, object\\n?$" };
    expect(checkOutput("D, B, C, A, object\n", test)).toBe(true);
    expect(
      checkOutput("I built no MRO\nD, B, C, A, object\nalso wrong\n", test)
    ).toBe(false);
  });

  it("documents that UNanchored patterns still substring-match (fix these in YAML)", () => {
    // This is intentional regex behavior; the guard belongs in the pattern.
    const test = { expectMatch: "D, B, C, A, object" };
    expect(checkOutput("garbage\nD, B, C, A, object\ngarbage\n", test)).toBe(true);
  });
});

describe("degenerate tests", () => {
  it("a test with no expectation accepts anything (documented behavior)", () => {
    expect(checkOutput("whatever", {})).toBe(true);
  });

  it("expected empty string means output must be empty", () => {
    expect(checkOutput("", { expected: "" })).toBe(true);
    expect(checkOutput("not empty", { expected: "" })).toBe(false);
  });
});
