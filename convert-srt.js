const fs = require('fs');
const srtPath = 'public/captions/captions - 2026-02-24T091828.981.srt';
const outPath = 'src/data/new-srt.ts';

const srt = fs.readFileSync(srtPath, 'utf-8');
const escapedSrt = srt.replace(/`/g, '\\`');

const output = `export const newSRT = \`${escapedSrt}\`;\n`;

fs.writeFileSync(outPath, output);
console.log('✅ Successfully converted new SRT to TypeScript format!');
