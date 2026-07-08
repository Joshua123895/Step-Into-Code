import { load, dump } from 'js-yaml';
import fs from 'fs';
const yaml = fs.readFileSync('./src/data/tracks.yaml', 'utf-8');
const data = load(yaml);
const fixed = dump(data, { indent: 2, lineWidth: 120 });
fs.writeFileSync('./src/data/tracks.yaml', fixed, 'utf-8');
console.log('Fixed and re-written');
