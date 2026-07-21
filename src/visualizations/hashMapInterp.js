import { splitStatements } from "./parseUtils";

// Interpreter for the two hashing-pattern lessons: a frequency counter
// (build a dict of counts while scanning a string) and two-sum (build a
// value -> index map and look up complements). It actually computes the
// values — HashViz only stores the raw right-hand-side text — so the dict
// fills in with real counts/indices and lookups highlight correctly.

const getIndent = (s) => s.length - s.trimStart().length;

function collectBlock(lines, startIdx, blockIndent) {
  const block = [];
  let j = startIdx;
  while (j < lines.length && (lines[j].trim() === "" || getIndent(lines[j]) >= blockIndent)) {
    if (lines[j].trim()) block.push(lines[j]);
    j++;
  }
  return { lines: block, nextIdx: j };
}

// Parse a Python literal argument: number, string, or list of numbers/strings.
function parseLiteral(text) {
  const t = text.trim();
  if (/^-?\d+$/.test(t)) return Number(t);
  const str = t.match(/^["'](.*)["']$/);
  if (str) return str[1];
  const list = t.match(/^\[(.*)\]$/);
  if (list) {
    return list[1].split(",").map((s) => parseLiteral(s)).filter((v) => v !== "");
  }
  return t;
}

export function parseHashMapStates(code) {
  const lines = splitStatements(code);
  const functions = {};
  const states = [];

  let arr = null;          // the array being scanned (two-sum); null for freq counter
  let itemId = 0;
  let dictName = null;     // the dict variable we visualize
  let entries = [];        // [{ key, val }] in insertion order
  let currentStatus = null;

  const RETURN = Symbol("return");

  const cloneEntries = (mark) =>
    entries.map((e) => ({ key: String(e.key), val: e.val, status: mark && mark.key === e.key ? mark.status : null }));

  const snapshot = (extra = {}) => {
    if (extra.status !== undefined) currentStatus = extra.status;
    states.push({
      array: arr ? arr.map((x) => ({ ...x })) : null,
      arrayPtr: extra.arrayPtr ?? null,
      dict: cloneEntries(extra.mark),
      status: currentStatus,
      found: extra.found ?? null,
    });
  };

  const dictGet = (key) => {
    const e = entries.find((x) => x.key === key);
    return e ? e.val : undefined;
  };
  const dictHas = (key) => entries.some((x) => x.key === key);
  const dictIndexOf = (key) => {
    const e = entries.find((x) => x.key === key);
    return e ? e.val : undefined; // for two-sum the stored value IS an index
  };

  function evalExpr(text, scope) {
    const t = text.trim();
    if (/^-?\d+$/.test(t)) return Number(t);
    const str = t.match(/^["'](.*)["']$/);
    if (str) return str[1];

    // d.get(k, default)
    const get = t.match(/^(\w+)\.get\s*\(\s*(\w+)\s*,\s*(.+?)\s*\)$/);
    if (get) {
      const v = dictGet(scope[get[2]]);
      return v !== undefined ? v : evalExpr(get[3], scope);
    }
    // d[k]
    const idx = t.match(/^(\w+)\[\s*(\w+)\s*\]$/);
    if (idx) return dictGet(scope[idx[2]]);

    // simple binary arithmetic a - b / a + b (single operator, left to right)
    const bin = t.match(/^(.+?)\s*([+-])\s*(.+)$/);
    if (bin) {
      const l = evalExpr(bin[1], scope);
      const r = evalExpr(bin[3], scope);
      return bin[2] === "+" ? l + r : l - r;
    }
    if (/^\w+$/.test(t)) return scope[t];
    return t;
  }

  function evalCond(text, scope) {
    const t = text.trim();
    // `key in dict`
    const inMatch = t.match(/^(\w+)\s+in\s+(\w+)$/);
    if (inMatch) {
      return dictHas(scope[inMatch[1]]);
    }
    return Boolean(evalExpr(t, scope));
  }

  function execBlock(block, scope) {
    let i = 0;
    let guard = 5000;
    while (i < block.length && guard-- > 0) {
      const line = block[i];
      const t = line.trim();
      const indent = getIndent(line);

      const ret = t.match(/^return\b\s*(.*)$/);
      if (ret) {
        handleReturn(ret[1].trim(), scope);
        return RETURN;
      }

      // dict init
      const init = t.match(/^(\w+)\s*=\s*\{\s*\}$/);
      if (init) {
        dictName = init[1];
        entries = [];
        snapshot({});
        i++;
        continue;
      }

      // for ch in s:  (iterate a string)
      const forStr = t.match(/^for\s+(\w+)\s+in\s+(\w+)\s*:$/);
      if (forStr) {
        const [, v, iterName] = forStr;
        const seq = scope[iterName];
        const { lines: body, nextIdx } = collectBlock(block, i + 1, indent + 1);
        for (const ch of String(seq)) {
          scope[v] = ch;
          if (execBlock(body, scope) === RETURN) return RETURN;
        }
        i = nextIdx;
        continue;
      }

      // for i, num in enumerate(nums):
      const forEnum = t.match(/^for\s+(\w+)\s*,\s*(\w+)\s+in\s+enumerate\s*\(\s*(\w+)\s*\)\s*:$/);
      if (forEnum) {
        const [, iVar, vVar, iterName] = forEnum;
        const seq = scope[iterName] || [];
        const { lines: body, nextIdx } = collectBlock(block, i + 1, indent + 1);
        for (let k = 0; k < seq.length; k++) {
          scope[iVar] = k;
          scope[vVar] = seq[k];
          snapshot({ arrayPtr: k });
          if (execBlock(body, scope) === RETURN) return RETURN;
        }
        i = nextIdx;
        continue;
      }

      // if <cond>:
      const ifMatch = t.match(/^if\s+(.+):$/);
      if (ifMatch) {
        const { lines: body, nextIdx } = collectBlock(block, i + 1, indent + 1);
        if (evalCond(ifMatch[1], scope)) {
          if (execBlock(body, scope) === RETURN) return RETURN;
        }
        i = nextIdx;
        continue;
      }

      // dict assignment  d[k] = expr
      const dictSet = t.match(/^(\w+)\[\s*(\w+)\s*\]\s*=\s*(.+)$/);
      if (dictSet && dictSet[1] === dictName) {
        const key = scope[dictSet[2]];
        const val = evalExpr(dictSet[3], scope);
        const existing = entries.find((e) => e.key === key);
        if (existing) {
          existing.val = val;
          snapshot({ mark: { key, status: "updated" }, arrayPtr: scope.i ?? null });
        } else {
          entries.push({ key, val });
          snapshot({ mark: { key, status: "added" }, arrayPtr: scope.i ?? null });
        }
        i++;
        continue;
      }

      // scalar assignment
      const scalar = t.match(/^(\w+)\s*=\s*(.+)$/);
      if (scalar) {
        scope[scalar[1]] = evalExpr(scalar[2], scope);
        i++;
        continue;
      }

      i++;
    }
    return null;
  }

  function handleReturn(expr, scope) {
    // return [seen[complement], i]  → found pair of array indices
    const pair = expr.match(/^\[\s*(\w+)\[\s*(\w+)\s*\]\s*,\s*(\w+)\s*\]$/);
    if (pair) {
      const firstIdx = dictIndexOf(scope[pair[2]]);
      const secondIdx = scope[pair[3]];
      snapshot({ found: [firstIdx, secondIdx], status: `Found: indices [${firstIdx}, ${secondIdx}]` });
      return;
    }
    // return freq / return the dict → done
    if (expr === dictName) {
      snapshot({ status: "Done" });
      return;
    }
    if (expr === "[]" || expr === "None" || expr === "") {
      snapshot({ status: "No pair found" });
      return;
    }
    snapshot({});
  }

  function callFunction(name, args) {
    const fn = functions[name];
    if (!fn) return;
    const scope = {};
    fn.params.forEach((p, k) => { scope[p] = args[k]; });
    // Seed the array we visualize from the first list-valued argument.
    for (const a of args) {
      if (Array.isArray(a)) {
        arr = a.map((v) => ({ value: v, _id: itemId++ }));
        break;
      }
    }
    snapshot({});
    execBlock(fn.bodyLines, scope);
  }

  // -------- top level --------
  let i = 0;
  let triggered = false;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t || t.startsWith("#")) { i++; continue; }
    const indent = getIndent(line);

    const def = t.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:$/);
    if (def && def[1] !== "__init__") {
      const { lines: body, nextIdx } = collectBlock(lines, i + 1, indent + 1);
      functions[def[1]] = {
        params: def[2].split(",").map((s) => s.trim()).filter(Boolean),
        bodyLines: body,
      };
      i = nextIdx;
      continue;
    }

    if (!triggered) {
      // Find a call to a defined function, even nested inside another call
      // such as print(two_sum([...], 9)). Locate `<fnName>(` at a word
      // boundary, then read its balanced-paren argument list.
      for (const fnName of Object.keys(functions)) {
        const at = t.indexOf(fnName + "(");
        if (at < 0 || (at > 0 && /\w/.test(t[at - 1]))) continue;
        const start = at + fnName.length + 1;
        const argsRaw = [];
        let depth = 1, cur = "";
        for (let j = start; j < t.length; j++) {
          const ch = t[j];
          if (ch === "(" || ch === "[") { depth++; cur += ch; }
          else if (ch === ")" || ch === "]") {
            depth--;
            if (depth === 0) break;
            cur += ch;
          } else if (ch === "," && depth === 1) { argsRaw.push(cur); cur = ""; }
          else cur += ch;
        }
        if (cur.trim()) argsRaw.push(cur);
        const args = argsRaw.map((a) => parseLiteral(a));
        triggered = true;
        callFunction(fnName, args);
        break;
      }
      if (triggered) { i++; continue; }
    }

    i++;
  }

  return states;
}
