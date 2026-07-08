import pythonIcon from "../assets/icons/python.svg";
import outputIcon from "../assets/icons/hello.svg";
import variableIcon from "../assets/icons/variable.svg";
import mathIcon from "../assets/icons/math.svg";
import ifIcon from "../assets/icons/if.svg";
import loopIcon from "../assets/icons/loop.svg";
import dataIcon from "../assets/icons/data.svg";
import functionIcon from "../assets/icons/function.svg";
import objectIcon from "../assets/icons/object.svg";
import fileIcon from "../assets/icons/file.svg";
import warningIcon from "../assets/icons/warning.svg";
import moduleIcon from "../assets/icons/module.svg";
import trophyIcon from "../assets/icons/challenge.svg";
import { load } from "js-yaml";

const trackModules = import.meta.glob("./tracks/*.yaml", { query: "?raw", import: "default", eager: true });

const ICON_MAP = {
  python: pythonIcon,
  output: outputIcon,
  variable: variableIcon,
  math: mathIcon,
  if: ifIcon,
  loop: loopIcon,
  data: dataIcon,
  function: functionIcon,
  object: objectIcon,
  file: fileIcon,
  warning: warningIcon,
  module: moduleIcon,
  challenge: trophyIcon,
};

function parseRichText(str) {
  if (!str) return undefined;
  const parts = str.split(/(`[^`]*`)/);
  const result = [];
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("`") && part.endsWith("`")) {
      result.push({ type: "code", value: part.slice(1, -1) });
    } else {
      result.push({ type: "text", value: part });
    }
  }
  return result.length > 0 ? result : undefined;
}

function parseTests(tests) {
  if (!tests || tests.length === 0) return undefined;
  return tests.map((t) => {
    if (typeof t === "string") {
      return { expected: t };
    }
    const out = {};
    if (t.in !== undefined) out.input = t.in;
    if (t.exp !== undefined) out.expected = t.exp;
    if (t.any !== undefined) out.expectAnyOf = t.any;
    if (t.match !== undefined) out.expectMatch = t.match;
    return out;
  });
}

function parseExample(ex) {
  if (!ex) return undefined;
  return { input: ex.in, output: ex.out };
}

function parseChecks(checks) {
  if (!checks) return undefined;
  const c = {};
  if (checks.cls) c.classes = checks.cls;
  if (checks.fn) c.functions = checks.fn;
  if (checks.inh) c.inheritance = checks.inh;
  if (checks.not) c.not = checks.not;
  return c;
}

function parseFiles(files) {
  if (!files) return undefined;
  const f = {};
  if (files.init) f.initial = files.init;
  if (files.track) f.track = files.track;
  return f;
}

function parseMax(max) {
  if (!max) return {};
  const parts = String(max).split("/");
  return {
    maxLines: parts[0] ? parseInt(parts[0], 10) : undefined,
    maxTime: parts[1] ? parseInt(parts[1], 10) : undefined,
  };
}

function parseLevel(lvl) {
  const { max, obj, expl, start, sol, checks, ...rest } = lvl;
  const result = { ...rest };
  if (obj) result.objective = parseRichText(obj);
  if (lvl.hint) result.hint = parseRichText(lvl.hint);
  if (expl) result.explanation = parseRichText(expl);
  if (start) result.startingCode = start;
  if (sol) result.solution = sol;
  if (lvl.tests) result.tests = parseTests(lvl.tests);
  if (lvl.example) result.example = parseExample(lvl.example);
  if (checks) result.sourceChecks = parseChecks(checks);
  if (lvl.files) result.files = parseFiles(lvl.files);
  if (max) {
    const { maxLines, maxTime } = parseMax(max);
    if (maxLines !== undefined) result.maxLines = maxLines;
    if (maxTime !== undefined) result.maxTime = maxTime;
  }
  return result;
}

const rawData = Object.values(trackModules).map((yaml) => load(yaml));

const TRACKS = rawData.map((track) => ({
  name: track.name,
  slug: track.slug,
  icon: ICON_MAP[track.icon] || track.icon,
  description: track.desc,
  difficulty: track.difficulty,
  chapters: track.chapters.map((ch) => ({
    name: ch.name,
    icon: ICON_MAP[ch.icon] || ch.icon,
    levels: ch.levels.map(parseLevel),
  })),
}));

TRACKS.forEach((track) => {
  track.id = TRACKS.indexOf(track) + 1;
  track.chapters.forEach((chapter, ci) => {
    chapter.id = ci + 1;
  });
  let levelId = 1;
  track.chapters.forEach((chapter) => {
    chapter.levels.forEach((level) => {
      level.id = levelId++;
    });
  });
});

export { TRACKS };
