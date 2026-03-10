#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// 🎨 SRT → 30 AI Image Prompts (TXT output)
// Usage: node generate-prompts-from-srt.js --srt=captions.srt --scenes=30 --genre=romance --title="Book Name"
// Output: scene-prompts.txt (one prompt per line)
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');

// Parse CLI arguments
const args = {};
process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.replace('--', '').split('=');
    args[key] = value;
});

const srtPath = args['srt'];
const sceneCount = parseInt(args['scenes'] || '30');
const genre = args['genre'] || 'romance';
const bookTitle = args['title'] || 'Book Summary';
const outputFile = args['output'] || 'scene-prompts.txt';

if (!srtPath) {
    console.log('Usage: node generate-prompts-from-srt.js --srt=captions.srt --scenes=30 --genre=romance --title="Book Name"');
    console.log('Output: scene-prompts.txt');
    process.exit(1);
}

// ═══════════════════════════════════════════════════════════════
// SRT Parser
// ═══════════════════════════════════════════════════════════════

function parseSRT(content) {
    const entries = [];
    const blocks = content.trim().split(/\n\s*\n/);
    for (const block of blocks) {
        const lines = block.trim().split('\n');
        if (lines.length < 3) continue;
        const timeMatch = lines[1].match(
            /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
        );
        if (!timeMatch) continue;
        const startTime = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
        const endTime = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
        const text = lines.slice(2).join(' ').replace(/<[^>]*>/g, '').trim();
        entries.push({ startTime, endTime, text });
    }
    return entries;
}

// ═══════════════════════════════════════════════════════════════
// VTT Parser (YouTube-style with word-level timing)
// ═══════════════════════════════════════════════════════════════

function parseVTT(content) {
    const entries = [];
    const seenTimes = new Set();

    // Split on blank lines
    const blocks = content.split(/\r?\n\r?\n/);

    for (const block of blocks) {
        const lines = block.trim().split(/\r?\n/);

        // Find the line with "-->"
        const timeLine = lines.find(l => l.includes('-->'));
        if (!timeLine) continue;

        // Parse timestamps  (HH:MM:SS.mmm or MM:SS.mmm)
        const timeMatch = timeLine.match(
            /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
        );
        if (!timeMatch) continue;

        const startTime = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
        const endTime = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;

        // Skip near-duplicate blocks (YouTube VTT emits overlapping 10ms blocks for each word)
        const timeKey = `${startTime.toFixed(2)}-${endTime.toFixed(2)}`;
        if (seenTimes.has(timeKey)) continue;
        seenTimes.add(timeKey);

        // Text lines = everything after the timestamp line
        const timeLineIdx = lines.indexOf(timeLine);
        const textLines = lines.slice(timeLineIdx + 1);

        // Strip inline tags (<c>, <00:00:01.000>, align:start etc.) and HTML tags
        const text = textLines
            .join(' ')
            .replace(/<\d{2}:\d{2}:\d{2}\.\d{3}>/g, '')  // remove timestamp tags
            .replace(/<[^>]*>/g, '')                        // remove all other tags
            .replace(/\s+/g, ' ')
            .trim();

        if (!text || text === ' ') continue;

        entries.push({ startTime, endTime, text });
    }

    return entries;
}

// ═══════════════════════════════════════════════════════════════
// Auto-detect format and parse
// ═══════════════════════════════════════════════════════════════

function parseCaptions(content) {
    const trimmed = content.trimStart();
    if (trimmed.startsWith('WEBVTT')) {
        console.log('📄 Detected VTT format');
        return parseVTT(content);
    } else {
        console.log('📄 Detected SRT format');
        return parseSRT(content);
    }
}

// ═══════════════════════════════════════════════════════════════
// Genre Styles
// ═══════════════════════════════════════════════════════════════

const GENRE_STYLES = {
    romance: {
        atmosphere: 'warm soft lighting, romantic ambiance, cinematic',
        colors: 'warm tones, golden hour, soft pastels, rose gold',
        settings: ['cozy coffee shop', 'sunset beach', 'city rooftop at dusk', 'rainy window scene', 'candlelit room', 'autumn park walkway', 'vintage bookstore', 'moonlit garden', 'flower-filled balcony', 'cozy fireplace interior'],
    },
    thriller: {
        atmosphere: 'dark moody lighting, cinematic noir, high contrast',
        colors: 'dark blues, deep shadows, cold tones, neon accents',
        settings: ['dark alley at night', 'rain-soaked street', 'shadowy office', 'foggy bridge', 'abandoned building', 'dimly lit bar', 'midnight cityscape', 'surveillance room', 'empty parking garage', 'stormy cliff edge'],
    },
    fantasy: {
        atmosphere: 'magical ethereal glow, otherworldly, enchanting',
        colors: 'rich purples, emerald greens, mystical blues, golden sparkles',
        settings: ['ancient enchanted forest', 'crystal cave', 'floating castle', 'magical library', 'dragon mountain peak', 'starlit meadow', 'underwater palace', 'mystical marketplace', 'glowing portal', 'fairy garden'],
    },
    scifi: {
        atmosphere: 'futuristic, holographic, neon-lit, clean tech',
        colors: 'cyan, electric blue, chrome, holographic overlays',
        settings: ['space station interior', 'cyberpunk cityscape', 'holographic lab', 'alien landscape', 'starship bridge', 'virtual reality world', 'terraformed planet', 'quantum reactor', 'orbital view of earth', 'neon underground'],
    },
    drama: {
        atmosphere: 'realistic, emotionally charged, natural lighting',
        colors: 'muted earth tones, natural palette, warm shadows',
        settings: ['family kitchen', 'hospital corridor', 'quiet courtroom', 'park bench at sunset', 'suburban street', 'train station platform', 'old apartment interior', 'graduation stage', 'office meeting room', 'empty classroom'],
    },
    selfhelp: {
        atmosphere: 'bright, inspiring, clean, motivational',
        colors: 'bright whites, sky blues, warm yellows, fresh greens',
        settings: ['mountain summit sunrise', 'open horizon road', 'zen garden', 'modern workspace', 'lighthouse at dawn', 'clear sky meadow', 'meditation temple', 'library of knowledge', 'stepping stones path', 'sunrise over ocean'],
    },
};

// ═══════════════════════════════════════════════════════════════
// Keyword & Mood Detection
// ═══════════════════════════════════════════════════════════════

const STOP_WORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'to', 'of', 'in', 'for', 'on',
    'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'out', 'off', 'over', 'under', 'again', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or', 'if', 'while',
    'about', 'up', 'down', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'he',
    'him', 'his', 'she', 'her', 'they', 'them', 'their', 'what', 'which', 'who', 'you', 'your', 'like', 'know',
    'think', 'going', 'really', 'actually', 'also', 'get', 'got', 'even', 'well', 'back', 'still', 'way',
    'take', 'come', 'make', 'let', 'thing', 'things', 'much', 'kind', 'says', 'said', 'told', 'went',
]);

function extractKeywords(text) {
    const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)
        .filter(w => w.length > 3 && !STOP_WORDS.has(w));
    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w]) => w);
}

const EMOTIONS = {
    positive: ['love', 'happy', 'joy', 'laugh', 'smile', 'hope', 'dream', 'beautiful', 'wonderful', 'excited', 'warm', 'together', 'kiss', 'celebrate'],
    negative: ['sad', 'cry', 'pain', 'hurt', 'anger', 'fear', 'dark', 'lost', 'alone', 'broken', 'tears', 'death', 'struggle', 'cold'],
    tension: ['secret', 'lie', 'betray', 'conflict', 'argue', 'tension', 'surprise', 'shock', 'reveal', 'discover', 'hidden', 'truth', 'confront', 'risk'],
    reflection: ['remember', 'past', 'journey', 'change', 'grow', 'learn', 'realize', 'understand', 'memory', 'reflect', 'quiet', 'peace', 'calm'],
};

function detectMood(text) {
    const lower = text.toLowerCase();
    const scores = {};
    for (const [mood, kws] of Object.entries(EMOTIONS)) {
        scores[mood] = kws.filter(k => lower.includes(k)).length;
    }
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return top[1] > 0 ? top[0] : 'neutral';
}

// ═══════════════════════════════════════════════════════════════
// Compositions & Lighting
// ═══════════════════════════════════════════════════════════════

const COMPOSITIONS = [
    'wide establishing shot', 'close-up dramatic portrait', 'over-the-shoulder view',
    'aerial bird\'s eye view', 'dramatic low angle shot', 'silhouette against golden light',
    'shallow depth of field bokeh', 'split screen composition', 'leading lines perspective',
    'symmetrical framing', 'rule of thirds', 'dutch angle cinematic tilt',
    'foreground framing through objects', 'negative space minimalist', 'reflection in water or glass',
    'long exposure motion', 'macro detail shot', 'panoramic landscape view',
    'point of view shot', 'candid documentary style', 'theatrical stage lighting',
    'double exposure overlay', 'abstract conceptual art', 'vintage film photograph',
    'underwater perspective', 'window light portrait', 'street photography candid',
    'golden ratio spiral', 'chiaroscuro dramatic light', 'minimalist flat lay',
];

const MOOD_LIGHTING = {
    positive: 'warm golden sunlight, sun rays streaming through, bright inviting glow',
    negative: 'dim moody lighting, deep dramatic shadows, melancholic blue tones',
    tension: 'dramatic chiaroscuro contrast, sharp angular shadows, intense spotlight beam',
    reflection: 'soft diffused morning light, gentle atmospheric mist, contemplative twilight',
    neutral: 'natural balanced daylight, clean professional lighting, soft ambient glow',
};

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

const srtContent = fs.readFileSync(srtPath, 'utf-8');
const captions = parseCaptions(srtContent);
const totalDuration = captions[captions.length - 1]?.endTime || 0;
const sceneDuration = totalDuration / sceneCount;
const genreStyle = GENRE_STYLES[genre] || GENRE_STYLES.drama;

console.log(`📝 Parsed ${captions.length} captions (${Math.floor(totalDuration / 60)}:${String(Math.round(totalDuration % 60)).padStart(2, '0')})`);
console.log(`🖼️  Generating ${sceneCount} prompts for genre: ${genre}\n`);

const prompts = [];

for (let i = 0; i < sceneCount; i++) {
    const sceneStart = i * sceneDuration;
    const sceneEnd = (i + 1) * sceneDuration;

    const sceneCaptions = captions.filter(c => c.startTime >= sceneStart && c.startTime < sceneEnd);
    const sceneText = sceneCaptions.map(c => c.text).join(' ');

    const keywords = extractKeywords(sceneText);
    const mood = detectMood(sceneText);
    const composition = COMPOSITIONS[i % COMPOSITIONS.length];
    const setting = genreStyle.settings[i % genreStyle.settings.length];
    const lighting = MOOD_LIGHTING[mood] || MOOD_LIGHTING.neutral;
    const keywordsStr = keywords.length > 0 ? keywords.slice(0, 5).join(', ') : 'storytelling, narrative, emotion';

    const prompt = `Cinematic ${composition}, ${setting}, ${genreStyle.atmosphere}, ${lighting}, ${genreStyle.colors}, themes of ${keywordsStr}, ultra detailed, 8K quality, photorealistic digital art, movie poster aesthetic, professional cinematography, no text, no watermark, no letters`;

    prompts.push(prompt);

    console.log(`Scene ${String(i + 1).padStart(2, '0')}/${sceneCount} [${mood}] → ${composition}`);
}

// Write plain TXT - one prompt per line
fs.writeFileSync(outputFile, prompts.join('\n'), 'utf-8');

console.log(`\n✅ ${sceneCount} prompts saved to: ${outputFile}`);
console.log(`\n📁 Each line = 1 prompt. Feed to your image generator.`);
console.log(`   Save outputs as: scene-00.png, scene-01.png, ..., scene-${String(sceneCount - 1).padStart(2, '0')}.png`);
console.log(`   Place in: public/scenes/`);
