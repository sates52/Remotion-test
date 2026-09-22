const fs = require('fs');

const data = JSON.parse(fs.readFileSync('c:/Users/savas/Cursor/Remotion/test/production-gbs-evil-bones.json', 'utf8'));
const scenes = data.scenes || data.sceneConfig?.scenes || [];

let result = `Total scenes: ${scenes.length}\n`;

const targetScene = scenes.find(s => s.id === 'scene-02');
result += '\nScene 02 Details:\n';
result += JSON.stringify(targetScene, null, 2) + '\n';

const targetTime = 64; // 01:04
result += '\nOverlays around 01:04:\n';

if (data.chapterCards) {
    data.chapterCards.filter(c => c.startTime <= targetTime + 5 && c.endTime >= targetTime - 5).forEach(c => {
        result += `Chapter Card: ${c.text}, Start: ${c.startTime}, End: ${c.endTime}\n`;
    });
}

if (data.typewriterQuotes) {
    data.typewriterQuotes.filter(q => q.startTime <= targetTime + 5 && q.endTime >= targetTime - 5).forEach(q => {
        result += `Typewriter Quote: ${q.text.substring(0, 30)}..., Start: ${q.startTime}, End: ${q.endTime}\n`;
    });
}

const outFile = 'c:/Users/savas/Cursor/Remotion/test/analysis_output.txt';
fs.writeFileSync(outFile, result);
console.log(`Summary:\n${result}`);
