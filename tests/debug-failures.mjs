import { readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { mkdtempSync, writeFileSync as writeTmp, rmSync, existsSync } from "fs";
import { tmpdir } from "os";
import { load as loadYaml } from "js-yaml";

function dedent(str) {
  if (!str) return "";
  const lines = str.split("\n");
  const indents = lines.filter(l => l.trim().length > 0).map(l => l.match(/^(\s*)/)[1].length);
  if (indents.length === 0) return "";
  const min = Math.min(...indents);
  return lines.map(l => l.slice(min)).join("\n");
}

const ROOT = join(import.meta.dirname, "..");
const TRACKS_DIR = join(ROOT, "src", "data", "tracks");

let pythonCmd = "python";
for (const cmd of ["python", "python3"]) {
  try { execSync(`${cmd} --version`, { timeout: 3000, stdio: "ignore" }); pythonCmd = cmd; break; } catch {}
}

function runPython(code, initialFiles = {}, inputs = []) {
  const dir = mkdtempSync(join(tmpdir(), "sitc-dbg-"));
  try {
    for (const [name, content] of Object.entries(initialFiles)) {
      writeTmp(join(dir, name), String(content), "utf-8");
    }
    writeTmp(join(dir, "main.py"), code, "utf-8");
    const inputStr = inputs.length > 0 ? inputs.join("\n") + "\n" : "";
    const stdout = execSync(`${pythonCmd} main.py`, {
      cwd: dir, timeout: 10000, encoding: "utf-8", input: inputStr,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return stdout;
  } catch (e) {
    return (e.stdout || "") + (e.stderr || "");
  } finally {
    try { rmSync(dir, { recursive: true, force: true }); } catch {}
  }
}

function normalizeTest(t) {
  if (typeof t === "string") return { expected: t };
  const out = {};
  if (t.in !== undefined) out.input = t.in;
  if (t.exp !== undefined) out.expected = t.exp;
  if (t.any !== undefined) out.expectAnyOf = t.any;
  if (t.match !== undefined) out.expectMatch = t.match;
  return out;
}

function checkOutput(actual, test) {
  const clean = actual.replace(/\r\n/g, "\n");
  const expected = test.expected !== undefined ? test.expected.replace(/\r\n/g, "\n") : undefined;
  if (test.expectAnyOf) return test.expectAnyOf.some(e => clean === e.replace(/\r\n/g, "\n"));
  if (test.expectMatch) return new RegExp(test.expectMatch, "s").test(clean);
  if (expected !== undefined) return clean === expected;
  return true;
}

// Collect failures
const failures = [];

for (const file of ["python1.yaml", "python2.yaml"]) {
  const data = loadYaml(readFileSync(join(TRACKS_DIR, file), "utf-8"));
  for (const ch of data.chapters || []) {
    for (const lvl of ch.levels || []) {
      if (!lvl.tests || lvl.tests.length === 0) continue;
      const startCode = dedent(lvl.start || "");
      const solCode = dedent(lvl.sol);
      const solutionCode = (startCode ? startCode + "\n" : "") + solCode;
      for (const rawTest of lvl.tests) {
        const test = normalizeTest(rawTest);
        const input = test.input !== undefined ? (Array.isArray(test.input) ? test.input : [test.input]) : [];
        const output = runPython(solutionCode, lvl.files?.init || {}, input);
        if (!checkOutput(output, test)) {
          const clean = output.replace(/\r\n/g, "\n");
          let expected;
          if (test.expectMatch) expected = `REGEX: ${test.expectMatch}`;
          else if (test.expectAnyOf) expected = test.expectAnyOf.map(e => e.replace(/\r\n/g, "\n")).join(" OR ");
          else expected = (test.expected || "").replace(/\r\n/g, "\n");
          failures.push({
            file,
            chapter: ch.name,
            level: lvl.name,
            id: lvl.id,
            input,
            actual: clean,
            expected,
            startRaw: JSON.stringify(lvl.start),
            solRaw: JSON.stringify(lvl.sol),
            combinedCode: solutionCode,
          });
        }
      }
    }
  }
}

console.log(`\n=== ${failures.length} FAILURES ===\n`);
for (const f of failures) {
  console.log(`--- ${f.chapter} > ${f.level} (id:${f.id}) input:${JSON.stringify(f.input)} ---`);
  console.log(`  start: ${f.startRaw}`);
  console.log(`  sol:   ${f.solRaw}`);
  console.log(`  combined code:\n${f.combinedCode.split("\n").map(l => "    " + l).join("\n")}`);
  console.log(`  actual output:   ${JSON.stringify(f.actual)}`);
  console.log(`  expected output: ${JSON.stringify(f.expected)}`);
  console.log();
}
