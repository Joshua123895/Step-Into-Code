import { splitStatements } from "./parseUtils";

// ---------------------------------------------------------------------------
// Interpreter for pointer-over-array algorithms — linear/binary search, two
// pointers, sliding window. These need things the sort interpreter doesn't:
// real `return` that stops the function, `enumerate`, index-vs-value
// comparisons, and tracking of named index pointers (low/mid/high, left/right)
// plus running-value variables (target, window_sum) so the UI can draw
// pointers under cells and a live readout.
//
// The expression tokenizer/parser below is intentionally a self-contained copy
// of the one in sortInterp.js: keeping the two interpreters independent means
// changes here can never destabilize the (well-tested) sorting visualization.
// ---------------------------------------------------------------------------

const TOKEN_RE = /\/\/|<=|>=|==|!=|[()[\]:,+\-*%<>]|\d+|[A-Za-z_]\w*/g;

function tokenize(text) {
  return text.match(TOKEN_RE) || [];
}

// Names that represent an index into the array (rendered as a labelled pointer
// under a cell). Everything else scalar is a value, shown in the readout.
const POINTER_NAMES = new Set(["low", "high", "mid", "middle", "m", "left", "right", "lo", "hi", "l", "r", "i", "j"]);

function parseTokens(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const expect = (tok) => { if (next() !== tok) throw new Error(`expected "${tok}"`); };

  function parseOr() {
    let left = parseAnd();
    while (peek() === "or") { next(); left = { type: "or", left, right: parseAnd() }; }
    return left;
  }
  function parseAnd() {
    let left = parseNot();
    while (peek() === "and") { next(); left = { type: "and", left, right: parseNot() }; }
    return left;
  }
  function parseNot() {
    if (peek() === "not") { next(); return { type: "not", expr: parseNot() }; }
    return parseCmp();
  }
  function parseCmp() {
    let left = parseAdd();
    // Support Python chained comparison: a <= b < c
    const ops = [];
    const operands = [left];
    while (["<=", ">=", "==", "!=", "<", ">"].includes(peek())) {
      ops.push(next());
      operands.push(parseAdd());
    }
    if (ops.length === 0) return left;
    return { type: "chain", ops, operands };
  }
  function parseAdd() {
    let left = parseMul();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      left = { type: "bin", op, left, right: parseMul() };
    }
    return left;
  }
  function parseMul() {
    let left = parseUnary();
    while (peek() === "*" || peek() === "//" || peek() === "%") {
      const op = next();
      left = { type: "bin", op, left, right: parseUnary() };
    }
    return left;
  }
  function parseUnary() {
    if (peek() === "-") { next(); return { type: "neg", expr: parseUnary() }; }
    return parsePrimary();
  }
  function parsePrimary() {
    const t = next();
    if (t === undefined) throw new Error("unexpected end of expression");
    if (/^\d+$/.test(t)) return { type: "num", value: Number(t) };
    if (t === "(") { const e = parseOr(); expect(")"); return e; }
    if (t === "len") { expect("("); const e = parseOr(); expect(")"); return { type: "len", expr: e }; }
    if (t === "sum") {
      // sum(arr[:k]) / sum(arr[a:b]) / sum(arr) — the argument parses as an
      // arrslice (or a bare var), handled in evalNode.
      expect("(");
      const arg = parseOr();
      expect(")");
      return { type: "sum", arg };
    }
    if (t === "max" || t === "min") {
      expect("(");
      const args = [parseOr()];
      while (peek() === ",") { next(); args.push(parseOr()); }
      expect(")");
      return { type: t, args };
    }
    if (peek() === "[") {
      next();
      const inner = parseSliceOrExpr();
      expect("]");
      if (inner.type === "slice") return { type: "arrslice", name: t, slice: inner };
      return { type: "index", name: t, index: inner };
    }
    return { type: "var", name: t };
  }
  // Parses either a plain expression or a slice `a:b` (either side optional).
  function parseSliceOrExpr() {
    let start = null;
    if (peek() !== ":") start = parseOr();
    if (peek() === ":") {
      next();
      let end = null;
      if (peek() !== "]" && peek() !== ")") end = parseOr();
      return { type: "slice", start, end };
    }
    return start;
  }

  return parseOr();
}

function parseExpr(text) {
  return parseTokens(tokenize(text));
}

function splitTopLevelCommas(text) {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (const ch of text) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) { parts.push(cur); cur = ""; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map((s) => s.trim()).filter(Boolean);
}

const RETURN = Symbol("return");

export function parseSearchStates(code) {
  const lines = splitStatements(code);
  const functions = {};
  let arr = null;
  let itemId = 0;
  const states = [];

  // Persisted across snapshots so a status set on a return survives to the end.
  let currentStatus = null;
  let slidingWindow = false; // set when a function looks like a sliding window
  let windowK = null;

  const arrValue = (i) => (arr && i >= 0 && i < arr.length ? Number(arr[i].value) : NaN);

  function pointersFrom(scope, activeRange) {
    const p = {};
    for (const name of Object.keys(scope)) {
      if (!POINTER_NAMES.has(name)) continue;
      const v = scope[name];
      if (!Number.isInteger(v) || v < 0 || !arr || v >= arr.length) continue;
      // A probe (e.g. mid) keeps its old value for one frame after a bound
      // jumps past it (low = mid + 1); don't render it stranded on an
      // already-eliminated cell.
      if (activeRange && (v < activeRange[0] || v > activeRange[1])) continue;
      p[name] = v;
    }
    return p;
  }

  function activeRangeFrom(scope) {
    const lo = scope.low ?? scope.lo ?? scope.left ?? scope.l;
    const hi = scope.high ?? scope.hi ?? scope.right ?? scope.r;
    if (Number.isInteger(lo) && Number.isInteger(hi) && arr) {
      const a = Math.max(0, Math.min(lo, arr.length - 1));
      const b = Math.max(0, Math.min(hi, arr.length - 1));
      if (a <= b) return [a, b];
    }
    return null;
  }

  function windowFrom(scope) {
    if (!slidingWindow || windowK == null || !arr) return null;
    // Prefer an explicit right-edge loop var; fall back to the initial window.
    const edge = scope.i ?? scope.right ?? scope.r;
    if (Number.isInteger(edge)) {
      const start = Math.max(0, edge - windowK + 1);
      return [start, Math.min(edge, arr.length - 1)];
    }
    return [0, Math.min(windowK - 1, arr.length - 1)];
  }

  const VALUE_KEYS = ["target", "k", "current", "best", "window_sum", "total", "sum"];
  function valuesFrom(scope) {
    const out = {};
    for (const key of VALUE_KEYS) {
      if (typeof scope[key] === "number") out[key] = scope[key];
    }
    return out;
  }

  // Turns a list of touched array indices into a `compare` highlight (deduped,
  // in-bounds), or an empty extra when nothing was read.
  const compareOf = (touched) => {
    const cmp = [...new Set(touched)].filter((i) => Number.isInteger(i) && i >= 0 && arr && i < arr.length);
    return cmp.length ? { compare: cmp } : {};
  };

  const stateKey = (s) =>
    JSON.stringify([s.pointers, s.activeRange, s.window, s.compare, s.found, s.status, s.vars]);

  const snapshot = (scope, extra = {}) => {
    if (extra.status !== undefined) currentStatus = extra.status;
    const activeRange = extra.activeRange !== undefined ? extra.activeRange : activeRangeFrom(scope);
    const state = {
      items: arr ? arr.map((x) => ({ ...x })) : [],
      pointers: pointersFrom(scope, activeRange),
      activeRange,
      window: windowFrom(scope),
      compare: extra.compare || null,
      found: extra.found ?? null,
      status: currentStatus,
      vars: valuesFrom(scope),
    };
    // Collapse consecutive identical frames (e.g. an `if arr[mid]==t` check
    // immediately followed by an `elif arr[mid]<t` check on the same mid).
    const prev = states[states.length - 1];
    if (prev && stateKey(prev) === stateKey(state)) return;
    states.push(state);
  };

  function evalNode(node, scope, touched) {
    switch (node.type) {
      case "num": return node.value;
      case "var": {
        if (!(node.name in scope)) throw new Error(`unbound name "${node.name}"`);
        return scope[node.name];
      }
      case "index": {
        const i = evalNode(node.index, scope, touched);
        if (touched) touched.push(i);
        return arrValue(i);
      }
      case "len": return arr ? arr.length : 0;
      case "neg": return -evalNode(node.expr, scope, touched);
      case "not": return !evalNode(node.expr, scope, touched);
      case "and": return evalNode(node.left, scope, touched) && evalNode(node.right, scope, touched);
      case "or": return evalNode(node.left, scope, touched) || evalNode(node.right, scope, touched);
      case "chain": {
        for (let i = 0; i < node.ops.length; i++) {
          const l = evalNode(node.operands[i], scope, touched);
          const r = evalNode(node.operands[i + 1], scope, touched);
          let ok;
          switch (node.ops[i]) {
            case "<": ok = l < r; break;
            case ">": ok = l > r; break;
            case "<=": ok = l <= r; break;
            case ">=": ok = l >= r; break;
            case "==": ok = l === r; break;
            case "!=": ok = l !== r; break;
            default: ok = false;
          }
          if (!ok) return false;
        }
        return true;
      }
      case "bin": {
        const l = evalNode(node.left, scope, touched);
        const r = evalNode(node.right, scope, touched);
        switch (node.op) {
          case "+": return l + r;
          case "-": return l - r;
          case "*": return l * r;
          case "//": return Math.floor(l / r);
          case "%": return ((l % r) + r) % r;
          default: return NaN;
        }
      }
      case "max": return Math.max(...node.args.map((a) => evalNode(a, scope, touched)));
      case "min": return Math.min(...node.args.map((a) => evalNode(a, scope, touched)));
      case "sum": {
        let lo = 0, hi = arr ? arr.length : 0;
        if (node.arg.type === "arrslice") [lo, hi] = sliceBounds(node.arg.slice, scope, touched);
        let total = 0;
        for (let i = lo; i < hi; i++) { total += arrValue(i); if (touched) touched.push(i); }
        return total;
      }
      default: return undefined;
    }
  }

  function sliceBounds(sliceNode, scope, touched) {
    const lo = sliceNode.start != null ? evalNode(sliceNode.start, scope, touched) : 0;
    const hi = sliceNode.end != null ? evalNode(sliceNode.end, scope, touched) : (arr ? arr.length : 0);
    return [lo, hi];
  }

  function evalText(text, scope, touched) {
    return evalNode(parseExpr(text), scope, touched);
  }

  const getIndent = (s) => s.length - s.trimStart().length;

  function collectBlock(allLines, startIdx, blockIndent) {
    const block = [];
    let j = startIdx;
    while (j < allLines.length && getIndent(allLines[j]) >= blockIndent) {
      block.push(allLines[j]);
      j++;
    }
    return { lines: block, nextIdx: j };
  }

  // Returns RETURN-tagged object if the block hit a `return`, else undefined.
  function execBlock(blockLines, scope) {
    let idx = 0;
    let guard = 6000;
    while (idx < blockLines.length && guard-- > 0) {
      const line = blockLines[idx];
      const t = line.trim();
      const indent = getIndent(line);

      if (!t || t.startsWith("#")) { idx++; continue; }

      const retMatch = t.match(/^return\b\s*(.*)$/);
      if (retMatch) {
        handleReturn(retMatch[1].trim(), scope);
        return { [RETURN]: true };
      }

      const ifMatch = t.match(/^if\s+(.+):$/);
      if (ifMatch) {
        const bodyIndent = indent + 1;
        const condResult = evalCondition(ifMatch[1], scope);
        idx++;
        const { lines: trueBlock, nextIdx: tbNext } = collectBlock(blockLines, idx, bodyIndent);
        if (condResult) { const r = execBlock(trueBlock, scope); if (r) return r; }
        idx = tbNext;
        let handled = condResult;
        while (idx < blockLines.length) {
          const nt = blockLines[idx].trim();
          const ni = getIndent(blockLines[idx]);
          if (ni !== indent) break;
          if (nt.startsWith("elif ")) {
            const elCond = nt.slice(5, -1);
            idx++;
            const { lines: elBlock, nextIdx: elNext } = collectBlock(blockLines, idx, bodyIndent);
            if (!handled && evalCondition(elCond, scope)) { const r = execBlock(elBlock, scope); if (r) return r; handled = true; }
            idx = elNext;
          } else if (nt === "else:") {
            idx++;
            const { lines: elseBlock, nextIdx: esNext } = collectBlock(blockLines, idx, bodyIndent);
            if (!handled) { const r = execBlock(elseBlock, scope); if (r) return r; }
            idx = esNext;
            break;
          } else break;
        }
        continue;
      }

      const whileMatch = t.match(/^while\s+(.+):$/);
      if (whileMatch) {
        const bodyIndent = indent + 1;
        const { lines: bodyLines, nextIdx } = collectBlock(blockLines, idx + 1, bodyIndent);
        let whileGuard = 3000;
        while (evalCondition(whileMatch[1], scope) && whileGuard-- > 0) {
          const r = execBlock(bodyLines, scope);
          if (r) return r;
        }
        idx = nextIdx;
        continue;
      }

      const enumMatch = t.match(/^for\s+(\w+)\s*,\s*(\w+)\s+in\s+enumerate\s*\(\s*(\w+)\s*\)\s*:$/);
      if (enumMatch) {
        const [, idxVar, valVar] = enumMatch;
        const bodyIndent = indent + 1;
        const { lines: bodyLines, nextIdx } = collectBlock(blockLines, idx + 1, bodyIndent);
        for (let k = 0; arr && k < arr.length; k++) {
          scope[idxVar] = k;
          scope[valVar] = arrValue(k);
          snapshot(scope, { compare: [k] });
          const r = execBlock(bodyLines, scope);
          if (r) return r;
        }
        idx = nextIdx;
        continue;
      }

      const forMatch = t.match(/^for\s+(\w+)\s+in\s+range\s*\((.*)\)\s*:$/);
      if (forMatch) {
        const varName = forMatch[1];
        const bodyIndent = indent + 1;
        const { lines: bodyLines, nextIdx } = collectBlock(blockLines, idx + 1, bodyIndent);
        const argVals = splitTopLevelCommas(forMatch[2]).map((a) => evalText(a, scope));
        let start = 0, stop, step = 1;
        if (argVals.length === 1) stop = argVals[0];
        else if (argVals.length === 2) { start = argVals[0]; stop = argVals[1]; }
        else { start = argVals[0]; stop = argVals[1]; step = argVals[2]; }
        const iterate = (v) => {
          scope[varName] = v;
          snapshot(scope, {});
          return execBlock(bodyLines, scope);
        };
        if (step > 0) { for (let v = start; v < stop; v += step) { const r = iterate(v); if (r) return r; } }
        else if (step < 0) { for (let v = start; v > stop; v += step) { const r = iterate(v); if (r) return r; } }
        idx = nextIdx;
        continue;
      }

      // Parallel assignment of scalars: low, high = 0, len(arr) - 1
      const parAssign = t.match(/^([\w,\s]+)=\s*(.+)$/);
      if (parAssign && parAssign[1].includes(",") && !t.includes("[")) {
        const names = parAssign[1].split(",").map((s) => s.trim());
        const valuesExprs = splitTopLevelCommas(parAssign[2]);
        if (names.length === valuesExprs.length) {
          const evaluated = valuesExprs.map((e) => evalText(e, scope));
          names.forEach((n, k) => { scope[n] = evaluated[k]; });
          snapshot(scope, {});
          idx++;
          continue;
        }
      }

      const augMatch = t.match(/^(\w+)\s*([+-])=\s*(.+)$/);
      if (augMatch) {
        const cur = scope[augMatch[1]] ?? 0;
        const touched = [];
        const delta = evalNode(parseExpr(augMatch[3]), scope, touched);
        scope[augMatch[1]] = augMatch[2] === "+" ? cur + delta : cur - delta;
        snapshot(scope, compareOf(touched));
        idx++;
        continue;
      }

      // Scalar assignment. LHS is guaranteed a bare name by the regex, so a
      // RHS containing `[` is an array *read* (e.g. current = arr[left] +
      // arr[right]), never an element write — search algorithms don't mutate
      // the array. Highlighting those reads is what makes the two-pointer sum
      // and the sliding-window edges light up.
      const scalarMatch = t.match(/^(\w+)\s*=\s*(.+)$/);
      if (scalarMatch) {
        const name = scalarMatch[1];
        // `window_sum = sum(arr[:k])` flags this as a sliding-window trace.
        if (/\bsum\s*\(/.test(scalarMatch[2]) && typeof scope.k === "number") {
          slidingWindow = true;
          windowK = scope.k;
        }
        const touched = [];
        scope[name] = evalNode(parseExpr(scalarMatch[2]), scope, touched);
        snapshot(scope, compareOf(touched));
        idx++;
        continue;
      }

      idx++;
    }
    return undefined;
  }

  function evalCondition(text, scope) {
    const touched = [];
    const result = evalNode(parseExpr(text), scope, touched);
    if (touched.length > 0) snapshot(scope, { compare: [...new Set(touched.filter((i) => i >= 0 && arr && i < arr.length))] });
    return Boolean(result);
  }

  function handleReturn(expr, scope) {
    if (expr === "" || expr === "None") {
      snapshot(scope, { status: "No result", found: null });
      return;
    }
    if (expr === "-1") {
      snapshot(scope, { status: "Not found", found: null, activeRange: null });
      return;
    }
    // Tuple return, e.g. (arr[left], arr[right])
    const tupleMatch = expr.match(/^\((.+)\)$/);
    if (tupleMatch && tupleMatch[1].includes(",")) {
      const idxs = [];
      const parts = splitTopLevelCommas(tupleMatch[1]);
      for (const part of parts) {
        const m = part.match(/^\w+\[(.+)\]$/);
        if (m) idxs.push(evalText(m[1], scope));
      }
      const vals = idxs.map((i) => arrValue(i));
      snapshot(scope, { found: idxs, status: `Found pair (${vals.join(", ")})` });
      return;
    }
    // Bare pointer var → the index it found.
    if (POINTER_NAMES.has(expr) && typeof scope[expr] === "number") {
      const i = scope[expr];
      snapshot(scope, { found: [i], status: `Found ${arrValue(i)} at index ${i}` });
      return;
    }
    // Some other value (best, window_sum, ...).
    try {
      const v = evalText(expr, scope);
      snapshot(scope, { status: `Result: ${v}`, found: null });
    } catch {
      snapshot(scope, {});
    }
  }

  function callFunction(name, argExprTexts) {
    const fn = functions[name];
    if (!fn) return;
    // Each call is an independent run: reset the pointers/status so a second
    // search (e.g. the "not found" case) starts from a clean board rather
    // than inheriting the first call's found highlight.
    currentStatus = null;
    slidingWindow = false;
    windowK = null;
    const scope = {};
    // Param 0 is the array (tracked globally, name-agnostic); bind the rest.
    for (let p = 1; p < fn.params.length && p < argExprTexts.length; p++) {
      scope[fn.params[p]] = evalText(argExprTexts[p], {});
    }
    snapshot(scope, { found: null });
    execBlock(fn.bodyLines, scope);
  }

  // -------- top level --------
  // Trace EVERY call to a defined function, in order — a level that calls
  // linear_search twice (found, then not-found) should animate both, not
  // just the first. Between calls, callFunction resets the board.
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t || t.startsWith("#")) { i++; continue; }
    const indent = getIndent(line);

    const defMatch = t.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:$/);
    if (defMatch) {
      const { lines: body, nextIdx } = collectBlock(lines, i + 1, indent + 1);
      functions[defMatch[1]] = {
        params: defMatch[2].split(",").map((s) => s.trim()).filter(Boolean),
        bodyLines: body,
      };
      i = nextIdx;
      continue;
    }

    const arrInit = t.match(/^(\w+)\s*=\s*\[([^\]]*)\]$/);
    if (arrInit && arr === null) {
      const vals = arrInit[2].split(",").map((s) => s.trim()).filter(Boolean);
      arr = vals.map((v) => ({ value: v, _id: itemId++ }));
      snapshot({}, {});
      i++;
      continue;
    }

    // fn([...], ...) — inline list literal (re-seeds the array each time).
    const inlineArr = t.match(/(\w+)\s*\(\s*\[([^\]]*)\]\s*(?:,\s*(.+?))?\)/);
    if (inlineArr && functions[inlineArr[1]]) {
      const vals = inlineArr[2].split(",").map((s) => s.trim()).filter(Boolean);
      arr = vals.map((v) => ({ value: v, _id: itemId++ }));
      snapshot({}, {});
      const rest = inlineArr[3] ? splitTopLevelCommas(inlineArr[3]) : [];
      callFunction(inlineArr[1], ["__arr__", ...rest]);
      i++;
      continue;
    }

    // fn(nums, ...) — array passed by name.
    if (arr) {
      const named = t.match(/(\w+)\s*\(\s*(\w+)\s*(?:,\s*(.+?))?\)/);
      if (named && functions[named[1]]) {
        const rest = named[3] ? splitTopLevelCommas(named[3]) : [];
        callFunction(named[1], ["__arr__", ...rest]);
        i++;
        continue;
      }
    }

    i++;
  }

  return states;
}
