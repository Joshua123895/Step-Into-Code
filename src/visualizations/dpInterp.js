// Interpreter for the Dynamic Programming lessons, Fibonacci by memoization
// (top-down) and tabulation (bottom-up). Both compute f(i) = f(i-1) + f(i-2),
// and both effectively fill index 2..n in order (memoization's recursion
// bottoms out and caches upward in the same sequence), so a single left-to-
// right table fill models both, each step highlighting the cell being
// computed and the two cells it depends on.

export function detectDPType(code) {
  if (/\bmemo\b/.test(code) || /memoiz/i.test(code)) return "memoization";
  return "tabulation";
}

export const DP_LABEL = {
  memoization: "Memoization · top-down cache",
  tabulation: "Tabulation · bottom-up table",
};

export function parseDPStates(code) {
  const type = detectDPType(code);
  // n from the call, e.g. fib_tab(30) / fib_memo(30)
  const call = code.match(/fib_\w+\s*\(\s*(\d+)\s*\)/) || code.match(/\w+\s*\(\s*(\d+)\s*\)/);
  const n = call ? Number(call[1]) : 0;

  const emptyCells = (values) => values.map((v, i) => ({ index: i, value: v }));

  if (n <= 1) {
    const values = [];
    for (let i = 0; i <= Math.max(n, 0); i++) values[i] = i;
    return [{ type, cells: emptyCells(values), current: null, deps: [], formula: null, result: n, n }];
  }

  const values = new Array(n + 1).fill(null);
  values[0] = 0;
  values[1] = 1;

  const states = [];
  const base = { type, n };
  // Base cases already known.
  states.push({ ...base, cells: emptyCells(values), current: null, deps: [], formula: "base cases: f(0)=0, f(1)=1", result: null });

  for (let i = 2; i <= n; i++) {
    const a = values[i - 1];
    const b = values[i - 2];
    values[i] = a + b;
    states.push({
      ...base,
      cells: emptyCells(values),
      current: i,
      deps: [i - 1, i - 2],
      formula: `f(${i}) = f(${i - 1}) + f(${i - 2}) = ${a} + ${b} = ${a + b}`,
      result: i === n ? values[n] : null,
    });
  }

  return states;
}
