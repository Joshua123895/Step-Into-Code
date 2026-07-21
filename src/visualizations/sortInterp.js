import { splitStatements } from "./parseUtils";

// ---------------------------------------------------------------------------
// A small expression tokenizer/parser/evaluator, needed because sorting
// algorithms lean on real conditions (`arr[j] > arr[j + 1]`,
// `j >= 0 and arr[j] > key`) and index arithmetic (`n // 2 - 1`) that the
// regex-per-shape approach used by the other viz parsers can't express.
// Grammar (low to high precedence):
//   or := and ('or' and)*
//   and := not ('and' not)*
//   not := 'not' not | cmp
//   cmp := add ((< | > | <= | >= | == | !=) add)?
//   add := mul (('+' | '-') mul)*
//   mul := unary (('*' | '//' | '%') unary)*
//   unary := '-' unary | primary
//   primary := NUMBER | 'len' '(' or ')' | IDENT '[' or ']' | IDENT | '(' or ')'
// ---------------------------------------------------------------------------

const TOKEN_RE = /\/\/|<=|>=|==|!=|[()[\],+\-*%<>]|\d+|[A-Za-z_]\w*/g;

function tokenize(text) {
  return text.match(TOKEN_RE) || [];
}

function parseTokens(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const expect = (tok) => {
    if (next() !== tok) throw new Error(`expected "${tok}"`);
  };

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
    if (["<=", ">=", "==", "!=", "<", ">"].includes(peek())) {
      const op = next();
      left = { type: "cmp", op, left, right: parseAdd() };
    }
    return left;
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
    if (peek() === "[") { next(); const idx = parseOr(); expect("]"); return { type: "index", index: idx }; }
    return { type: "var", name: t };
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

// ---------------------------------------------------------------------------

export function parseSortStates(code) {
  const lines = splitStatements(code);
  const functions = {};
  let arr = null;
  let itemId = 0;
  const states = [];

  const snapshot = (highlight) => {
    states.push({
      items: arr ? arr.map((x) => ({ ...x })) : [],
      highlight: highlight || null,
    });
  };

  const arrGet = (i, touched) => {
    if (touched) touched.push(i);
    return arr && i >= 0 && i < arr.length ? Number(arr[i].value) : NaN;
  };
  const arrSet = (i, value) => {
    if (arr && i >= 0 && i < arr.length) arr[i] = { value: String(value), _id: arr[i]._id };
  };

  function evalNode(node, scope, touched) {
    switch (node.type) {
      case "num": return node.value;
      case "var": {
        if (!(node.name in scope)) throw new Error(`unbound name "${node.name}"`);
        return scope[node.name];
      }
      case "index": return arrGet(evalNode(node.index, scope, touched), touched);
      case "len": return arr ? arr.length : 0;
      case "neg": return -evalNode(node.expr, scope, touched);
      case "not": return !evalNode(node.expr, scope, touched);
      case "and": return evalNode(node.left, scope, touched) && evalNode(node.right, scope, touched);
      case "or": return evalNode(node.left, scope, touched) || evalNode(node.right, scope, touched);
      case "cmp": {
        const l = evalNode(node.left, scope, touched);
        const r = evalNode(node.right, scope, touched);
        switch (node.op) {
          case "<": return l < r;
          case ">": return l > r;
          case "<=": return l <= r;
          case ">=": return l >= r;
          case "==": return l === r;
          case "!=": return l !== r;
          default: return false;
        }
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
      default: return undefined;
    }
  }

  function evalText(text, scope, touched) {
    return evalNode(parseExpr(text), scope, touched);
  }

  function evalCondition(text, scope) {
    const touched = [];
    const result = evalText(text, scope, touched);
    if (touched.length > 0) snapshot({ type: "compare", indices: [...new Set(touched)] });
    return Boolean(result);
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

  function callFunction(name, argExprTexts, callerScope) {
    const fn = functions[name];
    if (!fn) return;
    const scope = {};
    // Param 0 is always the array by convention in these lessons — the
    // array itself is tracked globally (name-agnostic), so only the
    // remaining scalar params need real binding.
    for (let p = 1; p < fn.params.length && p < argExprTexts.length; p++) {
      scope[fn.params[p]] = evalText(argExprTexts[p], callerScope);
    }
    execBlock(fn.bodyLines, scope);
  }

  function execBlock(blockLines, scope) {
    let idx = 0;
    let guard = 5000;
    while (idx < blockLines.length && guard-- > 0) {
      const line = blockLines[idx];
      const t = line.trim();
      const indent = getIndent(line);

      if (!t || t.startsWith("#")) { idx++; continue; }
      if (t.startsWith("return")) { idx++; continue; }

      const ifMatch = t.match(/^if\s+(.+):$/);
      if (ifMatch) {
        const bodyIndent = indent + 1;
        const condResult = evalCondition(ifMatch[1], scope);
        idx++;
        const { lines: trueBlock, nextIdx: tbNext } = collectBlock(blockLines, idx, bodyIndent);
        if (condResult) execBlock(trueBlock, scope);
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
            const elResult = !handled && evalCondition(elCond, scope);
            if (elResult) { execBlock(elBlock, scope); handled = true; }
            idx = elNext;
          } else if (nt === "else:") {
            idx++;
            const { lines: elseBlock, nextIdx: esNext } = collectBlock(blockLines, idx, bodyIndent);
            if (!handled) execBlock(elseBlock, scope);
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
        let whileGuard = 2000;
        while (evalCondition(whileMatch[1], scope) && whileGuard-- > 0) {
          execBlock(bodyLines, scope);
        }
        idx = nextIdx;
        continue;
      }

      const forMatch = t.match(/^for\s+(\w+)\s+in\s+range\s*\((.*)\)\s*:$/);
      if (forMatch) {
        const bodyIndent = indent + 1;
        const { lines: bodyLines, nextIdx } = collectBlock(blockLines, idx + 1, bodyIndent);
        const argVals = splitTopLevelCommas(forMatch[2]).map((a) => evalText(a, scope));
        let start = 0, stop, step = 1;
        if (argVals.length === 1) { stop = argVals[0]; }
        else if (argVals.length === 2) { start = argVals[0]; stop = argVals[1]; }
        else { start = argVals[0]; stop = argVals[1]; step = argVals[2]; }
        const varName = forMatch[1];
        if (step > 0) {
          for (let v = start; v < stop; v += step) { scope[varName] = v; execBlock(bodyLines, scope); }
        } else if (step < 0) {
          for (let v = start; v > stop; v += step) { scope[varName] = v; execBlock(bodyLines, scope); }
        }
        idx = nextIdx;
        continue;
      }

      // Parallel-assignment swap: arr[i], arr[j] = arr[j], arr[i]. Evaluated
      // Python-style (both RHS reads happen before either write) so it's
      // correct even when the two sides don't literally mirror each other.
      const swapMatch = t.match(/^\w+\[([^\]]+)\]\s*,\s*\w+\[([^\]]+)\]\s*=\s*\w+\[([^\]]+)\]\s*,\s*\w+\[([^\]]+)\]$/);
      if (swapMatch) {
        const i1 = evalText(swapMatch[1], scope);
        const i2 = evalText(swapMatch[2], scope);
        const v1 = arrGet(evalText(swapMatch[3], scope));
        const v2 = arrGet(evalText(swapMatch[4], scope));
        arrSet(i1, v1);
        arrSet(i2, v2);
        snapshot({ type: "swap", indices: [i1, i2] });
        idx++;
        continue;
      }

      const idxAssign = t.match(/^\w+\[([^\]]+)\]\s*=\s*(.+)$/);
      if (idxAssign) {
        const i1 = evalText(idxAssign[1], scope);
        const val = evalText(idxAssign[2], scope);
        arrSet(i1, val);
        snapshot({ type: "write", indices: [i1] });
        idx++;
        continue;
      }

      const augMatch = t.match(/^(\w+)\s*([+-])=\s*(.+)$/);
      if (augMatch) {
        const cur = scope[augMatch[1]] ?? 0;
        const delta = evalText(augMatch[3], scope);
        scope[augMatch[1]] = augMatch[2] === "+" ? cur + delta : cur - delta;
        idx++;
        continue;
      }

      const callStmt = t.match(/^(\w+)\s*\((.*)\)$/);
      if (callStmt && functions[callStmt[1]]) {
        callFunction(callStmt[1], splitTopLevelCommas(callStmt[2]), scope);
        idx++;
        continue;
      }

      const scalarMatch = t.match(/^(\w+)\s*=\s*(.+)$/);
      if (scalarMatch) {
        scope[scalarMatch[1]] = evalText(scalarMatch[2], scope);
        idx++;
        continue;
      }

      idx++;
    }
  }

  // ---- Merge sort / quick sort: neither mutates in place in the reference
  // solutions (both build new lists via slicing/list-comprehension and
  // recursion with return-value composition), which is out of reach for
  // this line-based interpreter. Recognizing the call by name and running a
  // canonical simulation mirrors the precedent already set by
  // LinkedListViz's insert_head/insert_tail/delete_node/search and
  // TreeViz's insert_bst — trust the required function name, since the
  // level's actual grading runs the student's real code, not this
  // animation.
  function rangeArray(lo, hi) {
    return Array.from({ length: hi - lo }, (_, k) => lo + k);
  }

  function trustedMergeSort(lo, hi) {
    if (hi - lo <= 1) return;
    const mid = lo + Math.floor((hi - lo) / 2);
    trustedMergeSort(lo, mid);
    trustedMergeSort(mid, hi);
    const left = arr.slice(lo, mid);
    const right = arr.slice(mid, hi);
    const merged = [];
    let li = 0, ri = 0;
    while (li < left.length && ri < right.length) {
      if (Number(left[li].value) <= Number(right[ri].value)) merged.push(left[li++]);
      else merged.push(right[ri++]);
    }
    while (li < left.length) merged.push(left[li++]);
    while (ri < right.length) merged.push(right[ri++]);
    for (let m = 0; m < merged.length; m++) arr[lo + m] = merged[m];
    snapshot({ type: "write", indices: rangeArray(lo, hi) });
  }

  function trustedQuickSort(lo, hi) {
    if (hi - lo <= 1) return;
    const mid = lo + Math.floor((hi - lo) / 2);
    const pivotVal = Number(arr[mid].value);
    const less = [], equal = [], greater = [];
    for (let k = lo; k < hi; k++) {
      const v = Number(arr[k].value);
      if (v < pivotVal) less.push(arr[k]);
      else if (v === pivotVal) equal.push(arr[k]);
      else greater.push(arr[k]);
    }
    const merged = [...less, ...equal, ...greater];
    for (let m = 0; m < merged.length; m++) arr[lo + m] = merged[m];
    snapshot({ type: "write", indices: rangeArray(lo, hi) });
    trustedQuickSort(lo, lo + less.length);
    trustedQuickSort(lo + less.length + equal.length, hi);
  }

  const TRUSTED = {
    merge_sort: () => trustedMergeSort(0, arr.length),
    quick_sort: () => trustedQuickSort(0, arr.length),
  };

  snapshot();

  let i = 0;
  let triggered = false;
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
    if (arrInit && !triggered) {
      const vals = arrInit[2].split(",").map((s) => s.trim()).filter(Boolean);
      arr = vals.map((v) => ({ value: v, _id: itemId++ }));
      snapshot();
      i++;
      continue;
    }

    // fn(name) where `name` was set via a separate `name = [...]` line above.
    if (!triggered && arr) {
      const callMatch = t.match(/(\w+)\s*\(\s*\w+\s*\)/);
      if (callMatch && (functions[callMatch[1]] || TRUSTED[callMatch[1]])) {
        triggered = true;
        if (TRUSTED[callMatch[1]]) TRUSTED[callMatch[1]]();
        else callFunction(callMatch[1], ["__arr__"], {});
        i++;
        continue;
      }
    }

    // fn([1, 2, 3]) — an inline list literal passed straight into the call,
    // with no separate variable at all (e.g. `print(selection_sort([64, 25,
    // 12, 22, 11]))`). Just as valid Python as the named-variable form above,
    // and arguably the more natural way to write a quick one-off test call.
    if (!triggered) {
      const inlineMatch = t.match(/(\w+)\s*\(\s*\[([^\]]*)\]\s*\)/);
      if (inlineMatch && (functions[inlineMatch[1]] || TRUSTED[inlineMatch[1]])) {
        const vals = inlineMatch[2].split(",").map((s) => s.trim()).filter(Boolean);
        arr = vals.map((v) => ({ value: v, _id: itemId++ }));
        snapshot();
        triggered = true;
        if (TRUSTED[inlineMatch[1]]) TRUSTED[inlineMatch[1]]();
        else callFunction(inlineMatch[1], ["__arr__"], {});
        i++;
        continue;
      }
    }

    i++;
  }

  return states;
}
