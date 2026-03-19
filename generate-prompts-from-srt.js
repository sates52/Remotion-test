#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// 🎬 Film-Mode Prompt Engine v2.0
// SRT/VTT → 50 AI Image Prompts (B-Roll Quality)
// Usage: node generate-prompts-from-srt.js --srt=captions.vtt --scenes=50 --genre=drama --title="The Day I Lost You"
// Output: scene-prompts.txt + scene-prompts.json
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');

// Parse CLI arguments
const args = {};
process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.replace('--', '').split('=');
    args[key] = value;
});

const srtPath = args['vtt'] || args['srt'];
const sceneCount = parseInt(args['scenes'] || '50');
const genre = args['genre'] || 'drama';
const bookTitle = args['title'] || 'Book Summary';
const outputFile = args['output'] || 'scene-prompts.txt';
const jsonOutput = outputFile.replace('.txt', '.json');

if (!srtPath) {
    console.log('🎬 Film-Mode Prompt Engine v2.0');
    console.log('Usage: node generate-prompts-from-srt.js --srt=captions.vtt --scenes=50 --genre=drama --title="Book Name"');
    console.log('Output: scene-prompts.txt + scene-prompts.json');
    process.exit(1);
}

// ═══════════════════════════════════════════════════════════════
// SRT / VTT Parsers
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

function parseVTT(content) {
    const entries = [];
    const seenTimes = new Set();
    const blocks = content.split(/\r?\n\r?\n/);
    for (const block of blocks) {
        const lines = block.trim().split(/\r?\n/);
        const timeLine = lines.find(l => l.includes('-->'));
        if (!timeLine) continue;
        const timeMatch = timeLine.match(
            /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
        );
        if (!timeMatch) continue;
        const startTime = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
        const endTime = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
        const timeKey = `${startTime.toFixed(2)}-${endTime.toFixed(2)}`;
        if (seenTimes.has(timeKey)) continue;
        seenTimes.add(timeKey);
        const timeLineIdx = lines.indexOf(timeLine);
        const text = lines.slice(timeLineIdx + 1)
            .join(' ')
            .replace(/<\d{2}:\d{2}:\d{2}\.\d{3}>/g, '')
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        if (!text || text === ' ') continue;
        entries.push({ startTime, endTime, text });
    }
    return entries;
}

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
// Genre Styles (Enhanced for Film Mode)
// ═══════════════════════════════════════════════════════════════

const GENRE_STYLES = {
    romance: {
        atmosphere: 'warm soft lighting, romantic ambiance, cinematic depth of field',
        colors: 'warm tones, golden hour, soft pastels, rose gold shimmer',
        settings: ['cozy coffee shop interior', 'sunset beach with silhouettes', 'city rooftop at dusk', 'rainy window with reflections', 'candlelit room with warm shadows', 'autumn park walkway covered in leaves', 'vintage bookstore with warm lamp', 'moonlit garden with fireflies', 'flower-filled balcony overlooking city', 'cozy fireplace with two armchairs'],
        visualVerbs: { kiss: 'extreme close-up, lips in golden light', dance: 'wide shot, spinning silhouettes', cry: 'close-up profile, single tear on cheek', smile: 'medium shot, sun-dappled face', walk: 'tracking shot, couple on cobblestone street' },
    },
    thriller: {
        atmosphere: 'dark moody lighting, cinematic noir, high contrast chiaroscuro',
        colors: 'dark blues, deep shadows, cold steel tones, red neon accents',
        settings: ['dark alley with wet reflections', 'rain-soaked city street at night', 'shadowy office with venetian blinds', 'foggy bridge in silence', 'abandoned warehouse interior', 'dimly lit bar corner booth', 'midnight cityscape from above', 'surveillance room with screens', 'empty parking garage concrete', 'stormy cliff edge with crashing waves'],
        visualVerbs: { run: 'handheld tracking, motion blur in dark corridor', hide: 'tight shot, eyes peeking through crack', scream: 'dutch angle close-up, distorted shadows', watch: 'over-shoulder POV, surveillance monitor glow', discover: 'rack focus from foreground to hidden object' },
    },
    fantasy: {
        atmosphere: 'magical ethereal glow, otherworldly luminescence, enchanting mist',
        colors: 'rich purples, emerald greens, mystical blues, golden sparkles, iridescent',
        settings: ['ancient enchanted forest with glowing mushrooms', 'crystal cave with refracting light', 'floating castle above clouds', 'magical library with living books', 'dragon perched on mountain peak', 'starlit meadow with fairy lights', 'underwater palace with bioluminescence', 'mystical marketplace with floating lanterns', 'glowing ancient portal between worlds', 'fairy garden with miniature architecture'],
        visualVerbs: { fly: 'aerial tracking, clouds rushing past', cast: 'close-up hands, magical particles emanating', fight: 'wide dynamic shot, magical energy clash', explore: 'slow push-in through arched doorway', transform: 'dissolve sequence, morphing silhouette' },
    },
    drama: {
        atmosphere: 'realistic natural lighting, emotionally charged, intimate cinematography',
        colors: 'muted earth tones, natural palette, warm shadows, desaturated highlights',
        settings: ['cluttered family kitchen with morning light', 'sterile hospital corridor', 'quiet courtroom in session', 'park bench at sunset alone', 'suburban street with autumn trees', 'train station platform at dusk', 'old apartment with peeling wallpaper', 'empty graduation stage', 'tense office meeting room', 'empty classroom with light through blinds'],
        visualVerbs: { cry: 'close-up, tears catching light, shallow depth of field', argue: 'two-shot, tension in body language', remember: 'soft focus flashback, dreamy grain', walk: 'long tracking shot, isolated figure', hug: 'over-shoulder medium shot, emotional embrace' },
    },
    selfhelp: {
        atmosphere: 'bright inspiring light, clean composition, motivational energy',
        colors: 'bright whites, sky blues, warm yellows, fresh greens, golden glow',
        settings: ['mountain summit at sunrise', 'open horizon road disappearing', 'zen garden with raked sand', 'modern bright workspace', 'lighthouse at dawn breaking waves', 'clear sky meadow with wild flowers', 'meditation temple with incense', 'infinite library of knowledge', 'stepping stones across calm water', 'golden sunrise over endless ocean'],
        visualVerbs: { grow: 'time-lapse, seedling to tree', climb: 'low angle, person reaching summit', think: 'profile shot, contemplative gaze at horizon', write: 'overhead shot, journal with pen', breathe: 'close-up, peaceful face with eyes closed' },
    },
    horror: {
        atmosphere: 'oppressive dread, unsettling angular shadows, eerie silence broken',
        colors: 'deep blacks, blood reds, sickly greens, cold desaturated grays',
        settings: ['abandoned asylum long corridor', 'foggy graveyard at midnight', 'creaking Victorian mansion staircase', 'dark basement with single flickering bulb', 'misty forest path with twisted trees', 'empty school hallway with lockers', 'decaying church nave', 'storm-battered lighthouse top', 'overgrown ruins with vines', 'shadowy attic with covered furniture'],
        visualVerbs: { scream: 'extreme close-up, distorted mouth', hide: 'tight space, peek through fingers', run: 'shaky cam, flashlight bouncing in dark', discover: 'slow zoom on hidden object, horror reveal', watch: 'POV through keyhole, voyeuristic dread' },
    },
    'cozy-drama': {
        atmosphere: 'nostalgic warmth, bittersweet contemplation, magical realism glow',
        colors: 'amber glow, sepia undertones, soft teal, deep coffee browns, golden dust particles',
        settings: ['vintage Japanese basement cafe', 'steaming cup on wooden table', 'old wall clock ticking', 'shadowy corner with ethereal figure', 'steam rising in dusty light shafts', 'rainy Tokyo street through window', 'old rotary telephone', 'cozy booth with velvet cushions', 'shimmering translucent portal in chair', 'gentle ripples in a coffee cup surface'],
        visualVerbs: { remember: 'double exposure, past overlaying present', wait: 'static wide shot, clock ticking', talk: 'two-shot across table, steam between them', leave: 'back-shot walking into light', arrive: 'door opening, shaft of warm light' },
    },
    history: {
        atmosphere: 'authentic period detail, documentary realism, aged patina texture',
        colors: 'sepia tones, aged parchment, warm bronze, dusty gold, faded ink',
        settings: ['ancient library with scrolls and candles', 'medieval castle great hall', 'Victorian London cobblestone street', 'Egyptian temple ruins at sunset', 'Renaissance artist workshop', 'WW1 trenches with mud', 'colonial port city harbor', 'ancient Roman forum columns', 'samurai training dojo', 'tall ship deck at sea'],
        visualVerbs: { fight: 'wide battle scene, dust and chaos', write: 'close-up on quill and parchment', speak: 'low angle, leader addressing crowd', build: 'time-lapse, structure rising', discover: 'torch illuminating ancient inscription' },
    },
    biography: {
        atmosphere: 'intimate personal documentary, candid authenticity, real-world texture',
        colors: 'natural film tones, warm skin tones, documentary grain, honest palette',
        settings: ['childhood home interior with toys', 'university lecture amphitheater', 'backstage behind heavy curtain', 'personal office cluttered desk', 'busy city intersection crosswalk', 'quiet writing nook with lamp', 'award ceremony spotlit stage', 'family dinner table gathered', 'hospital waiting room chairs', 'train journey window countryside'],
        visualVerbs: { succeed: 'low angle, spotlight on stage', struggle: 'close-up hands, clenched or writing', travel: 'window reflections, landscape passing', create: 'overhead, workspace covered in work', speak: 'medium shot at podium, audience bokeh' },
    },
};

// ═══════════════════════════════════════════════════════════════
// B-Roll Shot Types
// ═══════════════════════════════════════════════════════════════

const BROLL_SHOT_TYPES = [
    { type: 'establishing', desc: 'wide establishing shot showing full environment', weight: 0.15 },
    { type: 'detail_insert', desc: 'extreme close-up detail insert shot of significant object', weight: 0.12 },
    { type: 'emotional_closeup', desc: 'intimate close-up capturing raw emotion on face', weight: 0.18 },
    { type: 'environmental_mood', desc: 'atmospheric environment shot conveying mood without people', weight: 0.15 },
    { type: 'symbolic_metaphor', desc: 'symbolic visual metaphor representing the theme', weight: 0.1 },
    { type: 'tracking', desc: 'smooth tracking shot following action or movement', weight: 0.08 },
    { type: 'overhead', desc: 'overhead bird\'s eye view revealing spatial relationships', weight: 0.07 },
    { type: 'silhouette', desc: 'dramatic silhouette backlit by strong light source', weight: 0.05 },
    { type: 'reflection', desc: 'subject or scene captured in reflection (mirror, water, glass)', weight: 0.05 },
    { type: 'pov', desc: 'first-person point-of-view shot immersing viewer', weight: 0.05 },
];

function selectBrollShot(sceneIndex, mood) {
    // Use weighted random, but ensure establishing shots appear at key moments
    if (sceneIndex === 0) return BROLL_SHOT_TYPES[0]; // Opening = establishing
    if (sceneIndex % 10 === 0) return BROLL_SHOT_TYPES[0]; // Re-establish every 10 scenes

    // Mood-influenced selection
    if (mood === 'negative') {
        const emotionalShots = BROLL_SHOT_TYPES.filter(s => ['emotional_closeup', 'environmental_mood', 'silhouette'].includes(s.type));
        return emotionalShots[sceneIndex % emotionalShots.length];
    }
    if (mood === 'tension') {
        const tensionShots = BROLL_SHOT_TYPES.filter(s => ['detail_insert', 'pov', 'tracking'].includes(s.type));
        return tensionShots[sceneIndex % tensionShots.length];
    }
    if (mood === 'reflection') {
        const reflectiveShots = BROLL_SHOT_TYPES.filter(s => ['symbolic_metaphor', 'reflection', 'environmental_mood'].includes(s.type));
        return reflectiveShots[sceneIndex % reflectiveShots.length];
    }

    // Default: cycle through all weighted
    return BROLL_SHOT_TYPES[sceneIndex % BROLL_SHOT_TYPES.length];
}

// ═══════════════════════════════════════════════════════════════
// Keyword & Mood Detection (Enhanced)
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
    'doesn', 'don', 'didn', 'won', 'isn', 'aren', 'wasn', 'weren', 'hasn', 'hadn',
    'book', 'story', 'chapter', 'page', 'read', 'written', 'author', 'narrator',
]);

function extractKeywords(text) {
    const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)
        .filter(w => w.length > 3 && !STOP_WORDS.has(w));
    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);
}

const EMOTIONS = {
    positive: ['love', 'happy', 'joy', 'laugh', 'smile', 'hope', 'dream', 'beautiful', 'wonderful', 'excited', 'warm', 'together', 'kiss', 'celebrate', 'grateful', 'alive', 'light', 'bright', 'peace', 'comfort'],
    negative: ['sad', 'cry', 'pain', 'hurt', 'anger', 'fear', 'dark', 'lost', 'alone', 'broken', 'tears', 'death', 'struggle', 'cold', 'grief', 'empty', 'miss', 'gone', 'never', 'dying', 'funeral', 'grave'],
    tension: ['secret', 'lie', 'betray', 'conflict', 'argue', 'tension', 'surprise', 'shock', 'reveal', 'discover', 'hidden', 'truth', 'confront', 'risk', 'danger', 'suspect', 'guilty', 'accused', 'caught', 'evidence'],
    reflection: ['remember', 'past', 'journey', 'change', 'grow', 'learn', 'realize', 'understand', 'memory', 'reflect', 'quiet', 'peace', 'calm', 'accept', 'wisdom', 'lesson', 'forgive', 'heal', 'move'],
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
// Visual Verb Detection — Map action words → camera techniques
// ═══════════════════════════════════════════════════════════════

const VISUAL_VERBS = {
    // Movement
    run: 'dynamic tracking shot with motion blur',
    walk: 'smooth dolly following from behind',
    drive: 'interior car shot through windshield',
    fly: 'aerial sweeping crane shot upward',
    fall: 'slow motion falling with dramatic angle',
    // Emotion
    cry: 'extreme close-up, tears catching light, shallow depth of field',
    laugh: 'medium shot capturing genuine laughter, warm backlight',
    scream: 'dutch angle close-up, dramatic shadows',
    whisper: 'intimate close-up, lip movement detail',
    // Action
    fight: 'wide dynamic action shot with environmental context',
    break: 'slow motion impact, fragments in air',
    burn: 'close-up of flames with orange and red reflections',
    hide: 'tight framing, subject partially obscured',
    search: 'tracking POV shot scanning environment',
    // Cognitive
    remember: 'soft focus flashback with warm grain',
    dream: 'surreal double exposure, ethereal glow',
    discover: 'rack focus reveal, from blur to sharp',
    decide: 'tight facial close-up, contemplative expression',
    // Interaction
    kiss: 'close-up silhouette against warm background light',
    hug: 'over-shoulder embrace shot',
    talk: 'two-shot conversation across table',
    meet: 'wide shot of two figures approaching',
    leave: 'back-shot walking away, depth receding',
};

function detectVisualVerb(text) {
    const lower = text.toLowerCase();
    for (const [verb, technique] of Object.entries(VISUAL_VERBS)) {
        // Match the verb as a word boundary
        const regex = new RegExp(`\\b${verb}(s|ed|ing|es)?\\b`, 'i');
        if (regex.test(lower)) {
            return { verb, technique };
        }
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════
// Scene Continuity Tracker
// ═══════════════════════════════════════════════════════════════

function extractCharacterMentions(text) {
    // Find capitalized words that could be character names
    const namePattern = /\b([A-Z][a-z]{2,})\b/g;
    const names = new Set();
    let match;
    while ((match = namePattern.exec(text)) !== null) {
        const name = match[1];
        // Filter out common sentence-starting words
        const commonWords = new Set(['The', 'This', 'That', 'When', 'Where', 'What', 'Who', 'How', 'One', 'But', 'And', 'She', 'Her', 'His', 'They', 'Their']);
        if (!commonWords.has(name)) {
            names.add(name);
        }
    }
    return [...names];
}

// ═══════════════════════════════════════════════════════════════
// Compositions & Lighting (Enhanced for B-Roll)
// ═══════════════════════════════════════════════════════════════

const COMPOSITIONS = [
    'wide establishing master shot', 'extreme close-up with bokeh background', 'over-the-shoulder two-shot',
    'aerial bird\'s eye descending', 'dramatic low angle hero shot', 'silhouette against golden backlight',
    'shallow depth of field with foreground blur', 'split composition, light and shadow',
    'leading lines pulling eye to subject', 'symmetrical framing with central vanishing point',
    'rule of thirds with negative space', 'dutch angle conveying unease',
    'foreground framing through doorway or window', 'negative space isolation shot',
    'reflection in still water or polished surface', 'long exposure flowing motion',
    'macro detail revealing texture', 'panoramic landscape with tiny figure',
    'first-person POV immersive', 'candid documentary moment captured',
    'theatrical Rembrandt lighting', 'double exposure layered narrative',
    'abstract conceptual visual metaphor', 'vintage film stock aesthetic',
    'window light Vermeer-style portrait', 'street photography decisive moment',
    'golden ratio spiral composition', 'chiaroscuro with single light source',
    'minimalist negative space', 'handheld intimate close-up',
];

const MOOD_LIGHTING = {
    positive: 'warm golden sunlight streaming through, rim light on subject, bright inviting glow, lens flare',
    negative: 'dim moody single-source lighting, deep dramatic shadows, desaturated cool blue tones, dark corners',
    tension: 'harsh chiaroscuro contrast, sharp angular shadows, spotlight beam cutting through dark, red accent',
    reflection: 'soft diffused morning light through curtains, gentle atmospheric mist, contemplative blue hour',
    neutral: 'natural balanced three-point lighting, clean professional studio feel, soft ambient fill',
};

// ═══════════════════════════════════════════════════════════════
// Narrative Context Extraction (Story Beats)
// ═══════════════════════════════════════════════════════════════

function extractStoryBeat(text) {
    // Extract the core narrative action from scene text
    const clean = text.replace(/[^\w\s.,!?'-]/g, '').trim();
    const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 10);

    if (sentences.length === 0) return clean.split(' ').slice(0, 25).join(' ');

    // Pick the most visually descriptive sentence (has the most concrete nouns/verbs)
    const visualWords = /\b(look|see|stand|sit|hold|open|close|turn|reach|touch|place|room|door|window|hand|face|eye|light|shadow|dark|rain|sun|night|morning|table|chair|floor|wall|road|tree|sky|water|fire|blood|tears|smile|child|woman|man|house|car|street|phone|letter|book|picture|photo|glass|bottle|mirror|clock|bed|garden|beach|mountain|river|lake|forest|city|village)\b/gi;

    let bestSentence = sentences[0];
    let bestScore = 0;

    for (const sentence of sentences) {
        const matches = sentence.match(visualWords) || [];
        if (matches.length > bestScore) {
            bestScore = matches.length;
            bestSentence = sentence;
        }
    }

    return bestSentence.trim().split(' ').slice(0, 30).join(' ');
}

// ═══════════════════════════════════════════════════════════════
// MAIN — Generate Prompts
// ═══════════════════════════════════════════════════════════════

const srtContent = fs.readFileSync(srtPath, 'utf-8');
const captions = parseCaptions(srtContent);
const totalDuration = captions[captions.length - 1]?.endTime || 0;
const sceneDuration = totalDuration / sceneCount;
const genreStyle = GENRE_STYLES[genre] || GENRE_STYLES.drama;

console.log(`\n🎬 Film-Mode Prompt Engine v2.0`);
console.log(`📝 Parsed ${captions.length} captions (${Math.floor(totalDuration / 60)}:${String(Math.round(totalDuration % 60)).padStart(2, '0')})`);
console.log(`🖼️  Generating ${sceneCount} B-roll quality prompts for genre: ${genre}`);
console.log(`📖 Title: "${bookTitle}"\n`);

const prompts = [];
const sceneMetadata = [];
let activeCharacters = []; // Track characters across scenes

for (let i = 0; i < sceneCount; i++) {
    const sceneStart = i * sceneDuration;
    const sceneEnd = (i + 1) * sceneDuration;

    // Collect all captions for this scene
    const sceneCaptions = captions.filter(c => c.startTime >= sceneStart && c.startTime < sceneEnd);
    const sceneText = sceneCaptions.map(c => c.text).join(' ');

    // Analysis
    const keywords = extractKeywords(sceneText);
    const keywordsStr = keywords.join(', ');
    const mood = detectMood(sceneText);
    const storyBeat = extractStoryBeat(sceneText);
    const visualVerb = detectVisualVerb(sceneText);
    const brollShot = selectBrollShot(i, mood);
    const characters = extractCharacterMentions(sceneText);

    // Update active characters
    if (characters.length > 0) {
        activeCharacters = characters.slice(0, 3);
    }

    // Select composition & setting
    const composition = COMPOSITIONS[i % COMPOSITIONS.length];
    const setting = genreStyle.settings[i % genreStyle.settings.length];
    const lighting = MOOD_LIGHTING[mood] || MOOD_LIGHTING.neutral;

    // Check for genre-specific visual verb override
    const genreVerbOverride = genreStyle.visualVerbs && visualVerb
        ? genreStyle.visualVerbs[visualVerb.verb]
        : null;

    // Build the cinematic prompt
    const cameraWork = genreVerbOverride || (visualVerb ? visualVerb.technique : brollShot.desc);

    const narrativeContext = storyBeat.length > 10
        ? `visual representation of: "${storyBeat.replace(/"/g, '')}"`
        : `scene about ${keywordsStr}`;

    const characterContext = activeCharacters.length > 0
        ? `, featuring character(s): ${activeCharacters.join(', ')}`
        : '';

    const prompt = [
        `Cinematic ${cameraWork}`,
        setting,
        genreStyle.atmosphere,
        lighting,
        genreStyle.colors,
        narrativeContext + characterContext,
        `key themes: ${keywordsStr}`,
        'ultra detailed, 8K quality, photorealistic digital art, movie-grade cinematography, no text, no watermark, no letters, no words'
    ].join(', ');

    prompts.push(prompt);

    // Scene metadata for JSON output
    sceneMetadata.push({
        index: i,
        sceneId: `scene-${String(i).padStart(2, '0')}`,
        startTime: parseFloat(sceneStart.toFixed(2)),
        endTime: parseFloat(sceneEnd.toFixed(2)),
        mood,
        shotType: brollShot.type,
        composition,
        keywords,
        characters: activeCharacters.slice(),
        visualVerb: visualVerb ? visualVerb.verb : null,
        storyBeat: storyBeat.substring(0, 100),
    });

    const shotIcon = { establishing: '🎬', detail_insert: '🔍', emotional_closeup: '😢', environmental_mood: '🌧️', symbolic_metaphor: '🎭', tracking: '📹', overhead: '🦅', silhouette: '🌅', reflection: '🪞', pov: '👁️' };
    console.log(`Scene ${String(i + 1).padStart(2, '0')}/${sceneCount} [${mood}] ${shotIcon[brollShot.type] || '🎥'} ${brollShot.type} → ${keywords.slice(0, 3).join(', ')}`);
}

// Write TXT — one prompt per line
fs.writeFileSync(outputFile, prompts.join('\n'), 'utf-8');

// Write JSON — full metadata
const jsonData = {
    version: '2.0',
    title: bookTitle,
    genre,
    totalDuration: parseFloat(totalDuration.toFixed(2)),
    sceneCount,
    sceneDuration: parseFloat(sceneDuration.toFixed(2)),
    generatedAt: new Date().toISOString(),
    scenes: sceneMetadata,
    chapterCards: generateChapterCards(captions, totalDuration),
    typewriterQuotes: generateTypewriterQuotes(captions, totalDuration),
};

function generateChapterCards(captions, totalDuration) {
    const cards = [];
    const interval = 25; // Create a card every 25s
    const count = Math.ceil(totalDuration / interval);
    
    for (let i = 0; i < count; i++) {
        const startTime = i * interval + 2; 
        const endTime = startTime + 4.5;
        if (startTime > totalDuration - 10) break;
        
        const nearbyCaptions = captions.filter(c => c.startTime >= startTime && c.startTime < startTime + 25);
        const kws = extractKeywords(nearbyCaptions.map(c => c.text).join(' '));
        
        if (kws.length > 0) {
            cards.push({
                startTime,
                endTime,
                text: kws[0].toUpperCase(),
                subtitle: kws.slice(1, 3).join(' ').toUpperCase(),
                type: ['chapter', 'insight', 'keypoint'][i % 3]
            });
        }
    }
    return cards;
}

function generateTypewriterQuotes(captions, totalDuration) {
    const quotes = [];
    const targetCount = 18; // significantly more quotes
    const step = Math.floor(captions.length / targetCount);
    
    for (let i = 1; i < targetCount; i++) {
        const entry = captions[i * step];
        if (!entry) continue;
        
        let text = entry.text.trim();
        if (text.length > 25 && text.length < 120) {
            quotes.push({
                startTime: entry.startTime,
                endTime: entry.startTime + 5,
                text: text,
                attribution: i % 2 === 0 ? "— Dramatic Insight" : undefined
            });
        }
    }
    return quotes;
}

fs.writeFileSync(jsonOutput, JSON.stringify(jsonData, null, 2), 'utf-8');

console.log(`\n✅ ${sceneCount} B-roll quality prompts saved to: ${outputFile}`);
console.log(`📋 Scene metadata saved to: ${jsonOutput}`);
console.log(`\n📁 Each line in TXT = 1 prompt. Feed to your AI image generator.`);
console.log(`   Save outputs as: scene-00.png, scene-01.png, ..., scene-${String(sceneCount - 1).padStart(2, '0')}.png`);
console.log(`   Place in: public/scenes/`);
console.log(`\n🎬 Film Mode v2.0 — B-Roll quality, scene-relevant, continuity-tracked`);
