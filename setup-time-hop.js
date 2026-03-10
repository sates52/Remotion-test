const fs = require('fs');
const path = require('path');

const vttContent = fs.readFileSync('public/captions/captions.vtt', 'utf-8');

const tsContent = `export const timeHopVTT = \`${vttContent.replace(/`/g, '\\`')}\`;\n`;
fs.writeFileSync('src/data/time-hop-vtt.ts', tsContent);
console.log('✅ Generated src/data/time-hop-vtt.ts');

const timeMatches = [...vttContent.matchAll(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/g)];
const lastMatch = timeMatches[timeMatches.length - 1];
const audioDuration = parseInt(lastMatch[1]) * 3600 + parseInt(lastMatch[2]) * 60 + parseInt(lastMatch[3]) + parseInt(lastMatch[4]) / 1000;
console.log(`⏱️ Detected audio duration: ${audioDuration} seconds`);

const sceneCount = 30;
const sceneDuration = audioDuration / sceneCount;

// Dramatic & highly dynamic YPP-compliant transitions / animations
const ALL_TRANSITIONS = ['crossfade', 'blur', 'zoom', 'whiteFlash', 'glitch', 'filmBurn', 'colorShift', 'diagonalWipe', 'gridReveal'];
const ALL_ANIMATIONS = ['parallax', 'kenburns', 'dolly', 'orbit', 'zoomBounce', 'zoomPulse', 'panBounce', 'panFloat', 'panGlide', 'tiltShift', 'pushInTilt', 'cinematicPan', 'zoomSnap', 'breatheAndPan'];
const TEMPERATURES = ['warm', 'cool', 'neutral'];

function selectBalanced(pool, previous, windowSize = 3) {
    const recent = previous.slice(-windowSize);
    let candidates = pool.filter(item => !recent.includes(item));
    if (candidates.length === 0) candidates = pool.filter(item => item !== previous[previous.length - 1]);
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

const previousTransitions = [];
const previousAnimations = [];
const scenes = [];

for (let i = 0; i < sceneCount; i++) {
    const startTime = i * sceneDuration;
    const endTime = (i + 1) * sceneDuration;

    const transition = selectBalanced(ALL_TRANSITIONS, previousTransitions, 4);
    const animation = selectBalanced(ALL_ANIMATIONS, previousAnimations, 3);

    previousTransitions.push(transition);
    previousAnimations.push(animation);

    const scene = {
        id: `scene-${String(i).padStart(2, '0')}`,
        startTime,
        endTime,
        assets: [{
            type: 'image',
            path: `scenes/scene-${String(i).padStart(2, '0')}.png`,
            position: { x: 50, y: 50 },
            scale: randomRange(1.05, 1.4), // high zoom/movement
            opacity: 1.0,
            zIndex: 1,
        }],
        animations: [{
            type: animation,
            easing: 'ease-in-out',
            params: {},
        }],
        transition: {
            type: transition,
            duration: randomRange(2.0, 4.0), // slightly longer transitions for dreamy effect
            easing: 'ease-out',
        },
        colorGrade: {
            brightness: randomRange(1.05, 1.3),
            contrast: randomRange(1.15, 1.5), // punchy contrast
            saturation: randomRange(1.0, 1.4), // highly saturated for a dreamy/dramatic vibe
            temperature: TEMPERATURES[i % 3],
        },
        filmGrain: {
            enabled: true,
            amount: randomRange(0.1, 0.25), // noticeable film grain for drama
        },
        vignette: {
            enabled: true, // Always true for moody drama
            intensity: randomRange(0.3, 0.6),
        },
    };

    scenes.push(scene);
}

const config = {
    scenes,
    defaultTransition: {
        type: 'crossfade',
        duration: 2.5,
    },
    fps: 30,
    globalFilmGrain: true,
    globalVignette: true,
    cinematicBars: true,

    // Overlay configs for high engagement
    chapterCards: [
        { startTime: 5, endTime: 12, text: "Chapter 1", subtitle: "The Glitch in Perfection", type: "chapter" },
        { startTime: Math.floor(audioDuration * 0.3), endTime: Math.floor(audioDuration * 0.3) + 7, text: "Chapter 2", subtitle: "Mapleville's Secrets", type: "chapter" },
        { startTime: Math.floor(audioDuration * 0.6), endTime: Math.floor(audioDuration * 0.6) + 7, text: "Chapter 3", subtitle: "The Cost of Nostalgia", type: "chapter" },
        { startTime: Math.floor(audioDuration * 0.85), endTime: Math.floor(audioDuration * 0.85) + 7, text: "Chapter 4", subtitle: "A Choice of Reality", type: "chapter" }
    ],
    emotionalArc: [0.3, 0.6, 0.85, 0.95, 0.4],
    emotionalArcLabels: ["Curiosity", "Nostalgia", "Tension", "Realization", "Acceptance"],
    intermissionCards: [
        { time: Math.floor(audioDuration * 0.15), duration: 5, text: "What if you could redo one mistake?", style: "reflection" },
        { time: Math.floor(audioDuration * 0.45), duration: 5, text: "Would you change the past if the coffee was right?", style: "insight" },
        { time: Math.floor(audioDuration * 0.65), duration: 6, text: "Every choice has a consequence.", style: "keyTakeaway" },
        { time: Math.floor(audioDuration * 0.75), duration: 5, text: "The magic isn't in the cup. It's in the choice.", style: "reflection" },
        { time: Math.floor(audioDuration * 0.90), duration: 5, text: "Moving forward is the only way.", style: "nextUp" }
    ],
    typewriterQuotes: [
        { startTime: 54, endTime: 60, text: "And then the glitch happens. The terrifying pivot...", attribution: "The Illusion Breaking" },
        { startTime: 120, endTime: 128, text: "A secret buried in the grounds of time.", attribution: "The First Sip" },
        { startTime: 211, endTime: 218, text: "She discovers a seemingly whimsical coffee shop...", attribution: "The Discovery" },
        { startTime: 314, endTime: 320, text: "Her coffee is merely an Instagram filter.", attribution: "Iris's Confession" },
        { startTime: 450, endTime: 458, text: "We all want to rewrite our history.", attribution: "The universal truth" }
    ],
    totalChapters: 4,
    chapterTitles: ["The Glitch in Perfection", "Mapleville's Secrets", "The Cost of Nostalgia", "A Choice of Reality"],
    progressVariant: "dots",
    showSceneTitles: true
};

fs.writeFileSync('production-time-hop.json', JSON.stringify(config, null, 2));
console.log('✅ Generated production-time-hop.json');
