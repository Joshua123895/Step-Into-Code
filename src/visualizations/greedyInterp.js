// Interpreter for the Greedy Algorithms lessons: Activity Selection (interval
// scheduling), Greedy Coin Change (largest-denomination-first), and Jump Game
// (farthest-reachable tracking). Each has a genuinely different shape, so
// rather than one generic executor this detects the problem from the code and
// runs a small dedicated trace for each, real execution over the parsed
// input, not a hardcoded "textbook" answer, so results always match the
// level's actual data.

function detectProblem(code) {
  if (/activity_selection|last_end/.test(code)) return "activity";
  if (/greedy_coin_change|while\s+amount\s*>=/.test(code)) return "coins";
  return "jump";
}

function parseTuples(code) {
  // [(1, 4), (3, 5), ...]
  const m = code.match(/\[\s*(\(\s*\d+\s*,\s*\d+\s*\)(?:\s*,\s*\(\s*\d+\s*,\s*\d+\s*\))*)\s*\]/);
  if (!m) return [];
  const pairs = [];
  const re = /\(\s*(\d+)\s*,\s*(\d+)\s*\)/g;
  let pm;
  while ((pm = re.exec(m[1])) !== null) pairs.push([Number(pm[1]), Number(pm[2])]);
  return pairs;
}

function parseIntArrays(code) {
  // Every `[n, n, ...]` integer-literal array appearing in the code, in order.
  const arrays = [];
  const re = /\[\s*-?\d+(?:\s*,\s*-?\d+)*\s*\]/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    arrays.push(m[0].slice(1, -1).split(",").map((s) => Number(s.trim())));
  }
  return arrays;
}

function parseAmount(code) {
  const m = code.match(/\w+\s*\(\s*\w+\s*,\s*(\d+)\s*\)/);
  return m ? Number(m[1]) : null;
}

export const GREEDY_LABEL = {
  activity: "Activity Selection · pick by earliest finish",
  coins: "Greedy Coin Change · largest denomination first",
  jump: "Jump Game · farthest reachable tracker",
};

function traceActivity(code) {
  const activities = parseTuples(code);
  const sorted = [...activities].sort((a, b) => a[1] - b[1]);
  const states = [{ problem: "activity", activities: sorted, current: -1, kept: [], lastEnd: null, count: 0 }];
  if (sorted.length === 0) return states;

  let lastEnd = sorted[0][1];
  const kept = [0];
  states.push({ problem: "activity", activities: sorted, current: 0, kept: [...kept], lastEnd, count: 1 });
  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i];
    const keep = start >= lastEnd;
    if (keep) { kept.push(i); lastEnd = end; }
    states.push({ problem: "activity", activities: sorted, current: i, kept: [...kept], lastEnd, count: kept.length, skipped: !keep });
  }
  return states;
}

function traceCoins(code) {
  const arrays = parseIntArrays(code);
  const coins = arrays[0] || [25, 10, 5, 1];
  const amount = parseAmount(code) ?? 63;
  const states = [{ problem: "coins", coins, amount, remaining: amount, picked: [], currentCoin: null }];
  let remaining = amount;
  const picked = [];
  for (const coin of coins) {
    while (remaining >= coin) {
      picked.push(coin);
      remaining -= coin;
      states.push({ problem: "coins", coins, amount, remaining, picked: [...picked], currentCoin: coin });
    }
  }
  return states;
}

function traceJumpOnce(nums) {
  const states = [];
  let farthest = 0;
  let stuck = false;
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) {
      stuck = true;
      states.push({ index: i, farthest, nums, stuck: true, result: false });
      break;
    }
    farthest = Math.max(farthest, i + nums[i]);
    states.push({ index: i, farthest, nums, stuck: false, result: i === nums.length - 1 ? true : null });
  }
  if (!stuck) states[states.length - 1].result = true;
  return states;
}

function traceJump(code) {
  const arrays = parseIntArrays(code);
  const states = [{ problem: "jump", nums: arrays[0] || [], index: null, farthest: 0, stuck: false, result: null, run: 1 }];
  arrays.forEach((nums, run) => {
    for (const s of traceJumpOnce(nums)) {
      states.push({ problem: "jump", ...s, run: run + 1 });
    }
  });
  return states;
}

export function parseGreedyStates(code) {
  const problem = detectProblem(code);
  if (problem === "activity") return traceActivity(code);
  if (problem === "coins") return traceCoins(code);
  return traceJump(code);
}
