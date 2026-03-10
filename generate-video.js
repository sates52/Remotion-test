#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// 🎬 Parametric Video Scene Generator
// Usage: node generate-video.js --audio-duration=1640 --intro-duration=28 --scene-count=30 --output=production.json
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');

// Parse CLI arguments
const args = {};
process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.replace('--', '').split('=');
    args[key] = isNaN(value) ? value : Number(value);
});

const audioDuration = args['audio-duration'] || 1640;  // seconds
const introDuration = args['intro-duration'] || 28;    // seconds
const sceneCount = args['scene-count'] || 30;
const outputFile = args['output'] || 'production.json';
const filmGrain = args['film-grain'] !== 'false';      // default: true
const vignette = args['vignette'] !== 'false';          // default: true

// ═══════════════════════════════════════════════════════════════
// 🎨 Full Effect Libraries
// ═══════════════════════════════════════════════════════════════

const ALL_TRANSITIONS = [
    'crossfade', 'blur', 'zoom',
    'whiteFlash', 'glitch', 'filmBurn',
    'rotate', 'circleWipe', 'pixelate',
    'colorShift', 'slide', 'wipe',
    'morph', 'spiral', 'pushSlide',
    'diagonalWipe', 'blinds', 'pageTurn', 'gridReveal',
];

const ALL_ANIMATIONS = [
    // Original 8
    'kenburns', 'parallax', 'zoom', 'slide', 'rotate', 'spotlight', 'fade',
    // Camera movements
    'dolly', 'orbit', 'whipPan', 'rackFocus',
    // Zoom variations
    'zoomBounce', 'zoomPulse', 'zoomElastic', 'zoomPop', 'zoomBreath',
    // Pan variations
    'panDrift', 'panBounce', 'panSway', 'panFloat', 'panCircle', 'panWave', 'panGlide',
    // Rotate variations
    'rotateSwing', 'rotateSpin', 'rotateWobble', 'tiltShift', 'rotateCarousel',
    // Combo effects
    'zoomPan', 'spiralZoom', 'tiltZoom', 'bouncePan', 'swayZoom', 'driftRotate',
    // Dynamic effects (10 new)
    'pushInTilt', 'revealSlide', 'breathingFocus', 'heartbeat', 'wobbleZ',
    'flyIn', 'quake', 'floatUp', 'sinkDown', 'cinematicPan',
    // CapCut-style effects (10 new)
    'glideIn', 'pullBack', 'gentleRock', 'zoomSnap', 'softBounce',
    'tiltDrift', 'horizonShift', 'verticalReveal', 'slowSpin', 'breatheAndPan',
];

const TEMPERATURES = ['warm', 'cool', 'neutral'];

// ═══════════════════════════════════════════════════════════════
// 🔄 Balanced Selection (no repeats within window)
// ═══════════════════════════════════════════════════════════════

function selectBalanced(pool, previous, windowSize = 3) {
    const recent = previous.slice(-windowSize);
    let candidates = pool.filter(item => !recent.includes(item));
    if (candidates.length === 0) {
        candidates = pool.filter(item => item !== previous[previous.length - 1]);
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

// ═══════════════════════════════════════════════════════════════
// 🎬 Generate Scenes
// ═══════════════════════════════════════════════════════════════

const sceneDuration = audioDuration / sceneCount;
const previousTransitions = [];
const previousAnimations = [];
const scenes = [];

console.log('═══════════════════════════════════════════════════');
console.log('🎬 Parametric Video Scene Generator');
console.log('═══════════════════════════════════════════════════');
console.log(`📊 Audio Duration: ${Math.floor(audioDuration / 60)}:${String(Math.round(audioDuration % 60)).padStart(2, '0')}`);
console.log(`🎬 Intro Duration: ${introDuration}s`);
console.log(`🖼️  Scene Count: ${sceneCount}`);
console.log(`⏱️  Scene Duration: ${sceneDuration.toFixed(2)}s each`);
console.log(`📁 Output: ${outputFile}`);
console.log(`🎞️  Film Grain: ${filmGrain ? 'ON' : 'OFF'}`);
console.log(`🔲 Vignette: ${vignette ? 'ON' : 'OFF'}`);
console.log('═══════════════════════════════════════════════════\n');

for (let i = 0; i < sceneCount; i++) {
    const startTime = i * sceneDuration;
    const endTime = (i + 1) * sceneDuration;

    const transition = selectBalanced(ALL_TRANSITIONS, previousTransitions, 4);
    const animation = selectBalanced(ALL_ANIMATIONS, previousAnimations, 3);

    previousTransitions.push(transition);
    previousAnimations.push(animation);

    scenes.push({
        id: `scene-${String(i + 1).padStart(2, '0')}`,
        startTime,
        endTime,
        assets: [{
            type: 'image',
            path: `scenes/scene-${String(i + 1).padStart(2, '0')}.png`,
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
            duration: 7.5, // 7-8 seconds for smooth transitions
            easing: 'ease-out',
        },
        colorGrade: {
            brightness: randomRange(0.9, 1.3),
            contrast: randomRange(1.0, 1.3),
            saturation: randomRange(0.9, 1.2),
            temperature: TEMPERATURES[i % 3],
        },
        filmGrain: {
            enabled: filmGrain,
            amount: randomRange(0.08, 0.2),
        },
        vignette: {
            enabled: vignette && (i % 2 === 0),
            intensity: randomRange(0.25, 0.45),
        },
    });
}

const config = {
    scenes,
    defaultTransition: {
        type: 'crossfade',
        duration: 7.5,
    },
    fps: 30,
    globalFilmGrain: false, // Per-scene grain is better for performance
    globalVignette: false,
    cinematicBars: true,
};

fs.writeFileSync(outputFile, JSON.stringify(config, null, 2));

// ═══════════════════════════════════════════════════════════════
// 📊 Summary
// ═══════════════════════════════════════════════════════════════

const uniqueTransitions = [...new Set(previousTransitions)];
const uniqueAnimations = [...new Set(previousAnimations)];

console.log(`✅ Generated ${outputFile}!`);
console.log(`\n📊 Effect Distribution:`);
console.log(`   Unique Transitions: ${uniqueTransitions.length}/${ALL_TRANSITIONS.length}`);
console.log(`   Unique Animations:  ${uniqueAnimations.length}/${ALL_ANIMATIONS.length}`);
console.log(`\n🎭 Transitions used: ${uniqueTransitions.join(', ')}`);
console.log(`\n🎬 Animations used: ${uniqueAnimations.join(', ')}`);
console.log(`\n📐 Total video: ${introDuration}s intro + ${audioDuration}s audio = ${introDuration + audioDuration}s`);
console.log(`   (${Math.floor((introDuration + audioDuration) / 60)}:${String(Math.round((introDuration + audioDuration) % 60)).padStart(2, '0')})`);

// ═══════════════════════════════════════════════════════════════
// 📝 Next Steps
// ═══════════════════════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════════');
console.log('📝 Next Steps:');
console.log('═══════════════════════════════════════════════════');
console.log(`1. Place ${sceneCount} images in public/scenes/ (scene-00.png to scene-${String(sceneCount - 1).padStart(2, '0')}.png)`);
console.log(`2. Update Root.tsx to use '${outputFile}'`);
console.log(`3. Run: npm run dev (preview)`);
console.log(`4. Run: npx remotion render PRODUCTION-Full output.mp4 --codec=h264 --timeout=120000 --concurrency=2`);
