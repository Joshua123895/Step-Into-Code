import { traceRun, buildSettraceHarness, detectCalledFn, asDict } from "./traceRun";

// Runs the student's real hashing code (frequency counter / two-sum) and turns
// the captured per-line locals into the dict-fill animation. Because it watches
// the actual dict grow and the actual return value, it works regardless of how
// they wrote the loop. Falls back to hashMapInterp.js if it can't be traced.

const PTR_NAMES = ["i", "idx", "index", "j"];

function sameMap(a, b) {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
}

export function hashMapTraceToStates(snaps) {
  if (!Array.isArray(snaps) || snaps.length === 0) return [];

  let ret;
  const lineSnaps = [];
  for (const s of snaps) {
    if (s && "__return__" in s) { ret = s.__return__; continue; }
    lineSnaps.push(s);
  }

  // The visualized dict is the first dict-valued local; the array (two-sum) is
  // the longest list-valued local (absent for the string frequency counter).
  let dictKey = null;
  let arrKey = null;
  let arrLen = 0;
  for (const s of lineSnaps) {
    for (const [k, v] of Object.entries(s)) {
      if (!dictKey && asDict(v)) dictKey = k;
      if (Array.isArray(v) && v.length > arrLen) { arrKey = k; arrLen = v.length; }
    }
  }
  if (!dictKey) return [];

  let arrayItems = null;
  if (arrKey) {
    for (const s of lineSnaps) {
      if (Array.isArray(s[arrKey])) { arrayItems = s[arrKey].map((v, i) => ({ value: String(v), _id: i })); break; }
    }
  }

  const findPtr = (s) => {
    for (const name of PTR_NAMES) {
      if (Number.isInteger(s[name]) && arrLen && s[name] >= 0 && s[name] < arrLen) return s[name];
    }
    return null;
  };

  const states = [];
  let prevMap = null;
  let prevPtr = -999;

  for (const s of lineSnaps) {
    const dEntries = asDict(s[dictKey]) || [];
    const curMap = new Map(dEntries.map(([k, v]) => [String(k), v]));
    const ptr = findPtr(s);

    let changedKey = null;
    let changeType = null;
    if (prevMap) {
      for (const [k, v] of curMap) {
        if (!prevMap.has(k)) { changedKey = k; changeType = "added"; break; }
        if (prevMap.get(k) !== v) { changedKey = k; changeType = "updated"; break; }
      }
    }

    const dictChanged = !prevMap || !sameMap(prevMap, curMap);
    const ptrChanged = ptr !== prevPtr;
    if (states.length > 0 && !dictChanged && !ptrChanged) continue;

    states.push({
      array: arrayItems,
      arrayPtr: ptr,
      dict: dEntries.map(([k, v]) => ({
        key: String(k),
        val: v,
        status: dictChanged && String(k) === changedKey ? changeType : null,
      })),
      status: null,
      found: null,
    });
    prevMap = curMap;
    prevPtr = ptr;
  }

  if (states.length > 0) {
    const last = states[states.length - 1];
    if (Array.isArray(ret) && ret.length === 2 && ret.every((x) => Number.isInteger(x))) {
      last.found = ret;
      last.status = `Found: indices [${ret[0]}, ${ret[1]}]`;
    } else if (asDict(ret)) {
      last.status = "Done";
    } else if (ret === null || (Array.isArray(ret) && ret.length === 0)) {
      last.status = "No pair found";
    }
  }
  return states;
}

export async function runHashMapViz(code) {
  const fn = detectCalledFn(code);
  if (!fn) return null;
  const snaps = await traceRun(buildSettraceHarness(code, fn));
  const states = hashMapTraceToStates(snaps);
  return states.length > 1 ? states : null;
}
