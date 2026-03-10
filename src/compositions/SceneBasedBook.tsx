import React from 'react';
import {
    AbsoluteFill,
    Audio,
    useVideoConfig,
    useCurrentFrame,
    staticFile,
    interpolate,
} from 'remotion';
import { z } from 'zod';
import { parseCaptions } from '../utils/srtParser';
import { AnimatedCaption } from '../components/AnimatedCaption';
import { CinematicSceneManager } from '../components/CinematicSceneManager';
import { ParticleBackground } from '../components/ParticleBackground';
import { AnimatedVisualizer } from '../components/audio/AnimatedVisualizer';

import { getTheme } from '../themes';
import { SceneConfig } from '../types/scene';
import { YPPEnhancementLayer } from '../components/YPPEnhancementLayer';
import {
    makeVideoSeed,
    pickFromSeed,
    getBgPool,
} from '../utils/videoSeedUtils';

// ── New creative overlay imports ──────────────────────────────────────────────
import { ChapterCard, ChapterCardData } from '../components/overlays/ChapterCard';
import { EmotionalArc } from '../components/overlays/EmotionalArc';
import { SceneTitleBurnIn } from '../components/overlays/SceneTitleBurnIn';
import { IntermissionCard, IntermissionCardData } from '../components/overlays/IntermissionCard';
import { BookProgressIndicator } from '../components/overlays/BookProgressIndicator';
import { TypewriterQuote, TypewriterQuoteData } from '../components/effects/TypewriterQuote';

// ── Schema ────────────────────────────────────────────────────────────────────

const chapterCardSchema = z.object({
    startTime: z.number(),
    endTime: z.number(),
    text: z.string(),
    subtitle: z.string().optional(),
    type: z.enum(['quote', 'chapter', 'insight', 'keypoint']),
});

const intermissionCardSchema = z.object({
    time: z.number(),
    duration: z.number().optional(),
    text: z.string(),
    style: z.enum(['nextUp', 'keyTakeaway', 'meanwhile', 'reflection']).optional(),
});

const typewriterQuoteSchema = z.object({
    startTime: z.number(),
    endTime: z.number(),
    text: z.string(),
    attribution: z.string().optional(),
});

const sceneBasedConfigSchema = z.object({
    title: z.string(),
    author: z.string(),
    genre: z.string(),
    audioFile: z.string(),
    srtContent: z.string(),
    sceneConfig: z.any().optional(),
    autoGenerateScenes: z.boolean().optional(),
    sceneDuration: z.number().optional(),
    captionOffset: z.number().optional(),
    backgroundVariant: z.string().optional(),
    // ── New creative enhancement fields (all optional) ────────────────────
    chapterCards: z.array(chapterCardSchema).optional(),
    emotionalArc: z.array(z.number()).optional(),
    emotionalArcLabels: z.array(z.string()).optional(),
    intermissionCards: z.array(intermissionCardSchema).optional(),
    typewriterQuotes: z.array(typewriterQuoteSchema).optional(),
    totalChapters: z.number().optional(),
    chapterTitles: z.array(z.string()).optional(),
    progressVariant: z.enum(['bar', 'pages', 'dots']).optional(),
    /** Master toggle to show scene title burn-ins (default: true if scenes have titles) */
    showSceneTitles: z.boolean().optional(),
    captionStyle: z.string().optional(),
    captionColor: z.string().optional(),
    activeCaptionColor: z.string().optional(),
    waveformColor: z.string().optional(),
    progressColor: z.string().optional(),
    titleColor: z.string().optional(),
});

export const sceneBasedBookSchema = z.object({
    config: sceneBasedConfigSchema,
});

export type SceneBasedConfig = z.infer<typeof sceneBasedConfigSchema>;
export type SceneBasedBookProps = z.infer<typeof sceneBasedBookSchema>;

// ── Component ─────────────────────────────────────────────────────────────────

export const SceneBasedBook: React.FC<SceneBasedBookProps> = ({ config }) => {
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();

    // ── Per-video deterministic seed ─────────────────────────────────────────
    const videoSeed = React.useMemo(
        () => makeVideoSeed(config.title, config.author),
        [config.title, config.author]
    );

    // ── Parse captions (SRT or VTT auto-detect) ─────────────────────────────
    const srtCaptions = React.useMemo(() => parseCaptions(config.srtContent), [config.srtContent]);

    // ── Scene config ─────────────────────────────────────────────────────────
    const sceneConfig: SceneConfig = React.useMemo(() => {
        if (config.sceneConfig) {
            return {
                ...config.sceneConfig,
                cinematicBars: true,
            };
        }
        return { scenes: [], defaultTransition: { type: 'crossfade', duration: 4.5 }, cinematicBars: true } as SceneConfig;
    }, [config]);

    // ── Theme ────────────────────────────────────────────────────────────────
    const baseTheme = getTheme(config.genre);
    const theme = React.useMemo(() => {
        let t = { ...baseTheme };
        if (config.captionColor || config.activeCaptionColor) {
            t.caption = {
                ...t.caption,
                textColor: config.captionColor || t.caption.textColor,
                highlightColor: config.activeCaptionColor || t.caption.highlightColor,
            };
        }
        if (config.waveformColor || config.titleColor) {
            t.text = {
                ...t.text,
                accent: config.waveformColor || t.text.accent,
                primary: config.titleColor || t.text.primary,
            };
        }
        if (config.progressColor) {
            t.effects = {
                ...t.effects,
                glowColor: config.progressColor,
            };
        }
        return t;
    }, [baseTheme, config]);

    // ── Background variant — seed-based ──────────────────────────────────────
    const bgPool = React.useMemo(() => getBgPool(config.genre), [config.genre]);
    const bgVariant = React.useMemo(
        () => (config.backgroundVariant as any) ?? pickFromSeed(videoSeed, 'bg', bgPool),
        [videoSeed, bgPool, config.backgroundVariant]
    );

    // ── Caption offset (seconds) ─────────────────────────────────────────────
    const captionOffset = config.captionOffset ?? 0;

    // ── Fade in ──────────────────────────────────────────────────────────────
    const fadeIn = interpolate(frame, [0, fps * 1], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // ── Audio source ─────────────────────────────────────────────────────────
    const audioSrc = staticFile(config.audioFile);

    // ── Current scene index for BookProgressIndicator ────────────────────────
    const currentTime = frame / fps;
    const currentSceneIndex = React.useMemo(() => {
        return sceneConfig.scenes.findIndex(
            (s) => currentTime >= s.startTime && currentTime < s.endTime
        );
    }, [currentTime, sceneConfig.scenes]);

    // ── Determine if scene titles should be shown ────────────────────────────
    const showSceneTitles = config.showSceneTitles ??
        sceneConfig.scenes.some((s) => !!s.title);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>

            {/* ── 1. Scene images with cinematic animations ────────────────── */}
            {sceneConfig.scenes.length > 0 ? (
                <CinematicSceneManager config={sceneConfig} />
            ) : (
                <AbsoluteFill style={{ backgroundColor: '#1a1a1a' }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#666', fontSize: 32, textAlign: 'center',
                        fontFamily: 'Inter, sans-serif',
                    }}>
                        No scenes configured yet.<br />
                        <span style={{ fontSize: 20 }}>Generate scenes or provide scene assets.</span>
                    </div>
                </AbsoluteFill>
            )}

            {/* ── 2. Particle OVERLAY — on TOP of scenes with screen blend ── */}
            <AbsoluteFill style={{
                zIndex: 5000,
                pointerEvents: 'none',
                mixBlendMode: 'screen',
                opacity: 0.55,
            }}>
                <ParticleBackground
                    theme={theme}
                    variant={bgVariant}
                    seed={`${config.title}-${config.author}`}
                    particleCount={80}
                />
            </AbsoluteFill>

            {/* ── 3. Audio ────────────────────────────────────────────────── */}
            <Audio src={audioSrc} />

            {/* ── 4. Waveform Audiogram — top of screen, ALWAYS visible ──── */}
            <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 50000 }}>
                <div
                    style={{
                        position: 'absolute',
                        top: '6%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '75%',
                        opacity: 0.85,
                    }}
                >
                    <AnimatedVisualizer
                        mode="waveform"
                        color={theme.text.accent}
                        height={80}
                        strokeWidth={3}
                    />
                </div>
            </AbsoluteFill>

            {/* ── 5. Equalizer Bars — bottom area, ALWAYS visible ──────── */}
            <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 50000 }}>
                <div
                    style={{
                        position: 'absolute',
                        bottom: '18%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '55%',
                        opacity: 0.7,
                    }}
                >
                    <AnimatedVisualizer
                        mode="bars"
                        color={theme.text.accent}
                        accentColor={theme.effects.glowColor}
                        barCount={64}
                        height={60}
                    />
                </div>
            </AbsoluteFill>

            {/* ── 6. Captions — AnimatedCaption (word-by-word highlight) ───── */}
            <AbsoluteFill style={{ zIndex: 100000, pointerEvents: 'none' }}>
                <AnimatedCaption
                    captions={srtCaptions}
                    theme={theme}
                    style={config.captionStyle as any || "tiktok"}
                    position="bottom"
                    fontSize={36}
                    offset={captionOffset - 0.15}
                    maxWordsPerLine={10}
                />
            </AbsoluteFill>

            {/* ── 7. YPP Enhancement Layer (progress bar, corner rings) ──── */}
            <YPPEnhancementLayer theme={theme} currentTime={frame / fps} />

            {/* ── 8. NEW — Emotional Arc Visualization ─────────────────────── */}
            {config.emotionalArc && config.emotionalArc.length >= 2 && (
                <EmotionalArc
                    dataPoints={config.emotionalArc}
                    theme={theme}
                    position="bottom"
                    height={60}
                    labels={config.emotionalArcLabels}
                />
            )}

            {/* ── 9. NEW — Book Progress Indicator ─────────────────────────── */}
            {(config.totalChapters ?? 0) > 0 && (
                <BookProgressIndicator
                    totalChapters={config.totalChapters!}
                    currentSceneIndex={Math.max(0, currentSceneIndex)}
                    totalScenes={sceneConfig.scenes.length}
                    theme={theme}
                    chapterTitles={config.chapterTitles}
                    variant={config.progressVariant ?? 'bar'}
                />
            )}

            {/* ── 10. NEW — Scene Title Burn-In ────────────────────────────── */}
            {showSceneTitles && sceneConfig.scenes.length > 0 && (
                <SceneTitleBurnIn scenes={sceneConfig.scenes} theme={theme} />
            )}

            {/* ── 11. NEW — Chapter Cards ──────────────────────────────────── */}
            {config.chapterCards && config.chapterCards.length > 0 && (
                <ChapterCard cards={config.chapterCards as ChapterCardData[]} theme={theme} />
            )}

            {/* ── 12. NEW — Typewriter Quotes ──────────────────────────────── */}
            {config.typewriterQuotes && config.typewriterQuotes.length > 0 && (
                <TypewriterQuote quotes={config.typewriterQuotes as TypewriterQuoteData[]} theme={theme} />
            )}

            {/* ── 13. NEW — Intermission Cards ─────────────────────────────── */}
            {config.intermissionCards && config.intermissionCards.length > 0 && (
                <IntermissionCard cards={config.intermissionCards as IntermissionCardData[]} theme={theme} />
            )}

            {/* ── 14. Fade-in overlay ─────────────────────────────────────── */}
            <AbsoluteFill
                style={{
                    backgroundColor: '#000',
                    opacity: 1 - fadeIn,
                    pointerEvents: 'none',
                    zIndex: 200000,
                }}
            />
        </AbsoluteFill>
    );
};
