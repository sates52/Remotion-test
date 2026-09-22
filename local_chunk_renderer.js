const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEFAULT_CFG = 'books/single-dad-dilemma/config.vox.json';
const configFile = process.argv[2] || (fs.existsSync(DEFAULT_CFG) ? DEFAULT_CFG : 'project-config.json');
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

// Vox configs register as `Vox-<slug>`, Antidote as `Antidote-<slug>` (see
// src/books.generated.ts); legacy configs carry their own compositionId.
// Engine is inferred from the config shape: Vox carries meta.totalFrames,
// Antidote carries meta.durationInFrames (config.antidote.json).
const meta = config.meta || {};
const engine = config.engine || (meta.totalFrames ? 'vox' : (meta.durationInFrames ? 'antidote' : 'vox'));
const COMPOSITION =
    config.compositionId || (meta.slug ? `${engine === 'antidote' ? 'Antidote' : 'Vox'}-${meta.slug}` : 'Generic-Book-Summary');
const OUT_DIR = `out_${COMPOSITION}_chunks`.replace(/ /g, '_');
const TOTAL_FRAMES = config.totalFrames || meta.totalFrames || meta.durationInFrames || 77423;
const CHUNK_SIZE = Number(process.argv[3]) || 400;
const ENTRY_FILE = 'src/index.ts';
// Concurrency override (env RENDER_CONCURRENCY or argv[4]); default stays 1 for
// legacy/heavy configs. Vox is pure 2D DOM/CSS → safe to raise on a multi-core
// box with ample RAM (see SKILL §4). 8-core / 34 GB here → 5 is a good balance.
// Concurrency resolution (highest → lowest precedence):
//   1) render.concurrency file at repo root  ← LIVE override; re-read every chunk
//      so concurrency can be changed mid-render without restarting.
//   2) env RENDER_CONCURRENCY  3) argv[4]  4) default 1
// The file wins over env on purpose: auto-chain-render passes its hardcoded
// default via env, but a human-set render.concurrency must still take effect.
const CONC_FILE = path.join(__dirname, 'render.concurrency');
function readConc() {
    try {
        if (fs.existsSync(CONC_FILE)) {
            const n = Number(String(fs.readFileSync(CONC_FILE, 'utf8')).trim());
            if (n >= 1) return n;
        }
    } catch { /* ignore */ }
    return Number(process.env.RENDER_CONCURRENCY || process.argv[4]) || 1;
}
const CONCURRENCY = readConc();


if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log(`\n--- [PHASE 1: STARTING MICRO-CHUNKING] ---`);
console.log(`Total Frames: ${TOTAL_FRAMES}, Chunk Size: ${CHUNK_SIZE}`);
console.log(`Processing ${COMPOSITION} using ${ENTRY_FILE} and ${configFile}\n`);

let chunkIndex = 1;
for (let start = 0; start < TOTAL_FRAMES; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE - 1, TOTAL_FRAMES - 1);
    const outFile = path.join(OUT_DIR, `chunk-${chunkIndex.toString().padStart(4, '0')}.mp4`);
    
    if (fs.existsSync(outFile)) {
        // console.log(`Skipping Chunk ${chunkIndex} (${start}-${end}): Already exists.`);
    } else {
        console.log(`\n[${new Date().toLocaleTimeString()}] Rendering Chunk ${chunkIndex}: Frames ${start} to ${end}`);
        // Vox compositions already carry their config in defaultProps (registry).
        // Passing --props there would replace {config:...} with the raw config and crash.
        const isVox = !!(config.meta && config.meta.slug);
        const propsFlag = isVox ? '' : `--props=${configFile}`;
        const conc = readConc(); // re-read per chunk → live concurrency changes
        const cmd = `npx remotion render ${ENTRY_FILE} ${COMPOSITION} ${outFile} --frames=${start}-${end} ${propsFlag} --concurrency=${conc} --puppeteer-timeout=90000 --timeout=180000`;
        
        let success = false;
        let retries = 3;
        while (!success && retries > 0) {
            try {
                execSync(cmd, { stdio: 'inherit' });
                console.log(`[PASS] Chunk ${chunkIndex} saved.`);
                success = true;
            } catch (error) {
                retries--;
                console.error(`\n[WARN] Chunk ${chunkIndex} (frames ${start}-${end}) failed/timed out. Retries left: ${retries}`);
                if (retries === 0) {
                    console.error(`Error details: ${error.message}`);
                    process.exit(1);
                }
                console.log(`Waiting 5s before retrying Chunk ${chunkIndex}...`);
                execSync('node -e "new Promise(r => setTimeout(r, 5000))"');
            }
        }
    }
    chunkIndex++;
}

console.log(`\n--- [PHASE 2: GENERATING CONCAT LIST] ---`);
const concatList = [];
for (let i = 1; i < chunkIndex; i++) {
    const fileName = `chunk-${i.toString().padStart(4, '0')}.mp4`;
    concatList.push(`file '${fileName}'`);
}
fs.writeFileSync(path.join(OUT_DIR, 'parts.txt'), concatList.join('\n'));
console.log(`Generated ${OUT_DIR}/parts.txt`);

console.log(`\n--- ALL CHUNKS COMPLETE ---`);
console.log(`To merge: ffmpeg -f concat -safe 0 -i ${OUT_DIR}/parts.txt -c copy SingleDadDilemma-FINAL.mp4`);
