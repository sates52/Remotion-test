const fs = require('fs');
const path = require('path');

const vttContent = fs.readFileSync('public/captions/captions.vtt', 'utf-8');

const tsContent = `export const dukeRiversVTT = \`${vttContent.replace(/`/g, '\\`')}\`;\n`;
fs.writeFileSync('src/data/duke-rivers-vtt.ts', tsContent);
console.log('✅ Generated src/data/duke-rivers-vtt.ts');

const audioDuration = 1234;  // seconds
const sceneCount = 30;
const sceneDuration = audioDuration / sceneCount;

const ALL_TRANSITIONS = ['crossfade', 'blur', 'zoom', 'whiteFlash', 'glitch', 'filmBurn', 'rotate', 'circleWipe', 'pixelate', 'colorShift', 'slide', 'wipe', 'morph', 'spiral', 'pushSlide', 'diagonalWipe', 'blinds', 'pageTurn', 'gridReveal'];
const ALL_ANIMATIONS = ['kenburns', 'parallax', 'zoom', 'slide', 'rotate', 'spotlight', 'fade', 'dolly', 'orbit', 'whipPan', 'rackFocus', 'zoomBounce', 'zoomPulse', 'zoomElastic', 'zoomPop', 'zoomBreath', 'panDrift', 'panBounce', 'panSway', 'panFloat', 'panCircle', 'panWave', 'panGlide', 'rotateSwing', 'rotateSpin', 'rotateWobble', 'tiltShift', 'rotateCarousel', 'zoomPan', 'spiralZoom', 'tiltZoom', 'bouncePan', 'swayZoom', 'driftRotate', 'pushInTilt', 'revealSlide', 'breathingFocus', 'heartbeat', 'wobbleZ', 'flyIn', 'quake', 'floatUp', 'sinkDown', 'cinematicPan', 'glideIn', 'pullBack', 'gentleRock', 'zoomSnap', 'softBounce', 'tiltDrift', 'horizonShift', 'verticalReveal', 'slowSpin', 'breatheAndPan'];
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
            scale: randomRange(1.0, 1.3),
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
            duration: 7.5,
            easing: 'ease-out',
        },
        colorGrade: {
            brightness: randomRange(0.9, 1.3),
            contrast: randomRange(1.0, 1.3),
            saturation: randomRange(0.9, 1.2),
            temperature: TEMPERATURES[i % 3],
        },
        filmGrain: {
            enabled: true,
            amount: randomRange(0.08, 0.2),
        },
        vignette: {
            enabled: i % 2 === 0,
            intensity: randomRange(0.25, 0.45),
        },
    };

    scenes.push(scene);
}

const config = {
    scenes,
    defaultTransition: {
        type: 'crossfade',
        duration: 7.5,
    },
    fps: 30,
    globalFilmGrain: false,
    globalVignette: false,
    cinematicBars: true,

    chapterCards: [
        { startTime: 0, endTime: 5, text: "Chapter 1", subtitle: "The Greenhouse Incident", type: "chapter" },
        { startTime: 400, endTime: 405, text: "Chapter 2", subtitle: "The Weight of Expectations", type: "chapter" },
        { startTime: 800, endTime: 805, text: "Chapter 3", subtitle: "Quick Wins vs Long-term Commitment", type: "chapter" }
    ],
    emotionalArc: [0.9, 0.8, 0.6, 0.5, 0.3],
    emotionalArcLabels: ["Panic", "Chaos", "Tension", "Reflection", "Resolution"],
    intermissionCards: [
        { time: 600, duration: 4, text: "Take a breath. The conflict deepens.", style: "reflection" }
    ],
    typewriterQuotes: [
        { startTime: 82, endTime: 90, text: "The smell of burnt remolad. Acrid. Thick.", attribution: "Tension in the Air" },
        { startTime: 287, endTime: 295, text: "You aren't even there for the food. You're there for Ray Rose.", attribution: "The Paparazzi" },
        { startTime: 493, endTime: 501, text: "The sudden walnut allergy, right?", attribution: "The Excuse" },
        { startTime: 699, endTime: 707, text: "What they're catching is violence.", attribution: "The Incident" },
        { startTime: 905, endTime: 913, text: "The oak table punching his brother Tommy right in the face.", attribution: "The Confrontation" },
        { startTime: 1111, endTime: 1119, text: "A case study in trauma in the paralyzing suffocating weight of family expectations.", attribution: "The Analysis" }
    ],
    totalChapters: 3,
    chapterTitles: ["The Greenhouse Incident", "The Weight of Expectations", "Quick Wins vs Long-term Commitment"],
    progressVariant: "bar",
    showSceneTitles: false
};

fs.writeFileSync('production-duke-rivers.json', JSON.stringify(config, null, 2));
console.log('✅ Generated production-duke-rivers.json');
