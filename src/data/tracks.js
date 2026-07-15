import pythonComponent from "../assets/icons/python.svg?react";
import outputComponent from "../assets/icons/hello.svg?react";
import variableComponent from "../assets/icons/variable.svg?react";
import mathComponent from "../assets/icons/math.svg?react";
import ifComponent from "../assets/icons/if.svg?react";
import loopComponent from "../assets/icons/loop.svg?react";
import dataComponent from "../assets/icons/data.svg?react";
import functionComponent from "../assets/icons/function.svg?react";
import objectComponent from "../assets/icons/object.svg?react";
import fileComponent from "../assets/icons/file.svg?react";
import warningComponent from "../assets/icons/warning.svg?react";
import moduleComponent from "../assets/icons/module.svg?react";
import challengeComponent from "../assets/icons/challenge.svg?react";
import oopComponent from "../assets/icons/oop.svg?react";
import mechanismComponent from "../assets/icons/mechanism.svg?react";
import inheritanceComponent from "../assets/icons/inheritance.svg?react";
import magicComponent from "../assets/icons/magic.svg?react";
import connectionComponent from "../assets/icons/connection.svg?react";
import objectAdvanceComponent from "../assets/icons/object_advance.svg?react";
import nodesComponent from "../assets/icons/nodes.svg?react";
import { load } from "js-yaml";

const trackModules = import.meta.glob("./tracks/*.yaml", { query: "?raw", import: "default", eager: true });

const ICON_COMPONENT_MAP = {
  python: pythonComponent,
  output: outputComponent,
  variable: variableComponent,
  math: mathComponent,
  if: ifComponent,
  loop: loopComponent,
  data: dataComponent,
  function: functionComponent,
  object: objectComponent,
  file: fileComponent,
  warning: warningComponent,
  module: moduleComponent,
  challenge: challengeComponent,
  oop: oopComponent,
  mechanism: mechanismComponent,
  inheritance: inheritanceComponent,
  magic: magicComponent,
  connection: connectionComponent,
  object_advance: objectAdvanceComponent,
  nodes: nodesComponent,
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
  if (files.initial) f.initial = files.initial;
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

const TRACKS = rawData.map((track) => {
  if (!ICON_COMPONENT_MAP[track.icon]) {
    throw new Error(`Track "${track.name}" references unknown icon "${track.icon}"`);
  }
  return {
    name: track.name,
    slug: track.slug,
    trackIcon: ICON_COMPONENT_MAP[track.icon],
    description: track.desc,
    difficulty: track.difficulty,
    chapters: track.chapters.map((ch) => {
      if (!ICON_COMPONENT_MAP[ch.icon]) {
        throw new Error(`Chapter "${ch.name}" in track "${track.name}" references unknown icon "${ch.icon}"`);
      }
      return {
        name: ch.name,
        chapterIcon: ICON_COMPONENT_MAP[ch.icon],
        levels: ch.levels.map(parseLevel),
      };
    }),
  };
});

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

const DIFFICULTY = {
  1: { label: "Beginner", bg: "#6AAE6F20", color: "#6AAE6F" },
  2: { label: "Intermediate", bg: "#7AA2F720", color: "#7AA2F7" },
  3: { label: "Advanced", bg: "#BB9AF720", color: "#BB9AF7" },
  4: { label: "Expert", bg: "#FF5F5720", color: "#FF5F57" },
};

export { TRACKS, DIFFICULTY };
