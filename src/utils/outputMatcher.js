// Single source of truth for output validation.
// Imported by BOTH the app (LevelPage.jsx) and the test suite (tests/*.test.js)
// so the grading rules can never drift apart again.
//
// Deliberate decisions:
// - NO suffix matching (the old `a.endsWith(e)` rule). Output must match exactly
//   after normalization. If correct solutions start failing because the runner
//   prepends noise to stdout, fix the runner. Do not loosen this matcher.
// - expectAnyOf candidates are normalized before comparison (YAML block scalars
//   carry trailing newlines).
// - Regexes are compiled identically everywhere, with the "s" flag.

/**
 * Normalize output for comparison: unify line endings and strip
 * leading/trailing blank lines. Inner whitespace is preserved.
 */
export function norm(s) {
  const lines = (s || "").replace(/\r\n/g, "\n").split("\n");
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start] === "") start++;
  while (end > start && lines[end - 1] === "") end--;
  return lines.slice(start, end).join("\n");
}

/**
 * Strict equality between two program outputs (used by solution-diff levels,
 * i.e. levels without explicit tests).
 */
export function matchOutput(actual, expected) {
  return norm(actual) === norm(expected);
}

/**
 * Check one program output against one level test.
 * `test` shape: { expected?, expectAnyOf?, expectMatch? }, the same shape
 * produced by parseTests() in tracks.js and normalizeTest() in the test suite.
 */
export function checkOutput(output, test) {
  const clean = norm(output);

  if (test.expectAnyOf) {
    return test.expectAnyOf.some((e) => clean === norm(e));
  }

  if (test.expectMatch) {
    const raw = (output || "").replace(/\r\n/g, "\n");
    return new RegExp(test.expectMatch, "s").test(raw);
  }

  if (test.expected !== undefined) {
    return clean === norm(test.expected);
  }

  return true;
}
