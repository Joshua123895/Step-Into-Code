// Interpreter for the Backtracking lessons — subsets, permutations, and
// combination sum. Arbitrary recursion is out of reach for a line parser, so
// it recognizes which of the three problems the code is and runs a canonical
// version, recording the explore -> solution -> backtrack rhythm: the partial
// solution grows as choices are made, snaps back on backtrack, and completed
// solutions collect on the side. Grading runs the student's real code.

function detectProblem(code) {
  if (/combination_sum|def\s+\w*combo|remaining\s*[<=]=?\s*0/.test(code) && /start/.test(code)) return "combination_sum";
  if (/permutation|remaining/i.test(code)) return "permutations";
  return "subsets";
}

// Reads the list (and optional target) from the driver call, e.g.
// subsets([1,2,3]) or combination_sum([2,3,6,7], 7).
function parseArgs(code) {
  const listMatch = code.match(/\[([\d,\s]+)\]/);
  const list = listMatch ? listMatch[1].split(",").map((s) => Number(s.trim())).filter((v) => !Number.isNaN(v)) : [];
  const targetMatch = code.match(/\]\s*,\s*(\d+)\s*\)/);
  const target = targetMatch ? Number(targetMatch[1]) : null;
  return { list, target };
}

export const BACKTRACK_LABEL = {
  subsets: "Subsets · include / exclude each element",
  permutations: "Permutations · choose an unused element",
  combination_sum: "Combination Sum · reuse, prune on overshoot",
};

export function parseBacktrackStates(code) {
  const problem = detectProblem(code);
  const { list, target } = parseArgs(code);

  const states = [];
  const solutions = [];
  const current = [];
  const fmt = (a) => `[${a.join(", ")}]`;

  const emit = (action, opts = {}) => {
    states.push({
      problem,
      current: [...current],
      action,
      solutions: solutions.map((s) => [...s]),
      justFound: !!opts.justFound,
      pruned: !!opts.pruned,
    });
  };

  emit("start");

  if (problem === "subsets") {
    const bt = (index) => {
      if (index === list.length) {
        solutions.push([...current]);
        emit(`✓ solution ${fmt(current)}`, { justFound: true });
        return;
      }
      emit(`skip ${list[index]}`);
      bt(index + 1);
      current.push(list[index]);
      emit(`take ${list[index]}`);
      bt(index + 1);
      current.pop();
      emit("backtrack");
    };
    bt(0);
  } else if (problem === "permutations") {
    const bt = (remaining) => {
      if (remaining.length === 0) {
        solutions.push([...current]);
        emit(`✓ solution ${fmt(current)}`, { justFound: true });
        return;
      }
      for (let i = 0; i < remaining.length; i++) {
        current.push(remaining[i]);
        emit(`choose ${remaining[i]}`);
        bt([...remaining.slice(0, i), ...remaining.slice(i + 1)]);
        current.pop();
        emit("backtrack");
      }
    };
    bt([...list]);
  } else {
    const bt = (start, remaining) => {
      if (remaining === 0) {
        solutions.push([...current]);
        emit(`✓ sum = ${target}`, { justFound: true });
        return;
      }
      if (remaining < 0) {
        emit(`prune · over ${target}`, { pruned: true });
        return;
      }
      for (let i = start; i < list.length; i++) {
        current.push(list[i]);
        emit(`add ${list[i]} · need ${remaining - list[i]}`);
        bt(i, remaining - list[i]);
        current.pop();
        emit("backtrack");
      }
    };
    bt(0, target);
  }

  return states;
}
