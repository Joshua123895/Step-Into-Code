const fs = require("fs");
const yaml = require("js-yaml");

const path = "D:/Kuliah/Coding/Web/step-into-code/src/data/tracks/python4.yaml";
const raw = fs.readFileSync(path, "utf-8");
const data = yaml.load(raw);

// Collect lines to remove: for each test level, find the viz: line number
const lines = raw.split("\n");
const removeLines = new Set();

// Track which level objects are test levels
const testNames = new Set();
for (const ch of data.chapters) {
  const isChallenges = ch.name === "Challenges";
  for (const lvl of ch.levels) {
    if (isChallenges || lvl.example) {
      testNames.add(lvl.name);
    }
  }
}

// Walk lines to find viz lines that belong to test levels
let currentLevelName = null;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^\s{6}- name:\s*(.+)/);
  if (m) {
    currentLevelName = m[1].replace(/^'(.*)'$/, "$1").trim();
  }
  if (lines[i].match(/^\s{8}viz:/) && currentLevelName && testNames.has(currentLevelName)) {
    removeLines.add(i);
  }
}

// Filter out removed lines
const result = lines.filter((_, i) => !removeLines.has(i));
fs.writeFileSync(path, result.join("\n"), "utf-8");
console.log("Removed viz from", removeLines.size, "test levels");
