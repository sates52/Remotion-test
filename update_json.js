const fs = require('fs');
const path = require('path');

const jsonPath = 'c:\\Users\\savas\\Cursor\\Remotion\\test\\production-single-dad-dilemma.json';
const vttPath = 'c:\\Users\\savas\\Cursor\\Remotion\\test\\public\\captions\\captions.vtt';

try {
    const vttContent = fs.readFileSync(vttPath, 'utf8');
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    jsonContent.captionContent = vttContent;
    jsonContent.title = 'Single Dad Dilemma';
    jsonContent.author = 'Karla Sorensen';

    fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2), 'utf8');
    console.log('Successfully updated production-single-dad-dilemma.json');
} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
