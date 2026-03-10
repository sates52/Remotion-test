import React from 'react';
import {
    AbsoluteFill,
    Sequence,
    Audio,
    staticFile,
    useVideoConfig,
} from 'remotion';
import { z } from 'zod';
import {
    ShortsLayout,
    FaceVideoSegment,
    BookInfoOverlay,
    ShortsTransition,
} from '../components/shorts';
import { getShortsTheme, ShortsThemeId } from '../themes/shorts';



// Types from ../types/shorts are used via Zod schema inference

// ── Zod Schema ───────────────────────────────────────────────────────────────

const bookInfoSchema = z.object({
    title: z.string(),
    author: z.string(),
    description: z.string(),
    coverImage: z.string().optional(),
});

const segmentSchema = z.object({
    id: z.string(),
    type: z.enum(['hook', 'book', 'outro']),
    videoFile: z.string(),
    overlayText: z.string().optional(),
    book: bookInfoSchema.optional(),
    bookNumber: z.number().optional(),
    isHorizontal: z.boolean().optional(),
});

export const bookRecommendationShortSchema = z.object({
    segments: z.array(segmentSchema),
    bgMusic: z.string().optional(),
    bgMusicVolume: z.number().optional(),
    /** Transition SFX file (e.g. whoosh/swoosh) played at each segment boundary */
    transitionSfx: z.string().optional(),
    transitionSfxVolume: z.number().optional(),
    transitionDuration: z.number().optional(),
    transitionType: z.custom<any>().optional(), // ShortsTransitionType
    accentColor: z.string().optional(),
    themeId: z.custom<ShortsThemeId>().optional(),

    /** Array of durations in frames, dynamically computed via calculateMetadata */

    segmentDurations: z.array(z.number()).optional(),
});

export type BookRecommendationShortProps = z.infer<typeof bookRecommendationShortSchema>;

// ── Component ────────────────────────────────────────────────────────────────

export const BookRecommendationShort: React.FC<BookRecommendationShortProps> = ({
    segments,
    bgMusic,
    bgMusicVolume = 0.12,
    transitionSfx,
    transitionSfxVolume = 0.7,
    transitionDuration = 0.4,
    transitionType,
    accentColor,
    themeId = 'epic-bestseller',
    segmentDurations,
}) => {
    const theme = getShortsTheme(themeId);
    const activeAccentColor = accentColor || theme.colors.accent;
    const activeTransition = transitionType || theme.animations.transitionDefault;

    console.log("BookRecommendationShort Render - segments:", segments.length, "segmentDurations:", segmentDurations);



    const { fps } = useVideoConfig();
    const transFrames = Math.round(transitionDuration * fps);

    // Default durations if not dynamically computed (fallback: 10s each)
    const durations = segmentDurations ?? segments.map(() => fps * 10);

    // Build sequences: for each segment, figure out its absolute start frame
    let currentFrame = 0;
    const sequenceEntries: {
        segment: (typeof segments)[number] & { isHorizontal?: boolean };
        startFrame: number;
        durationInFrames: number;
    }[] = [];

    for (let i = 0; i < segments.length; i++) {
        const dur = durations[i] ?? fps * 10;
        sequenceEntries.push({
            segment: segments[i] as (typeof segments)[number] & { isHorizontal?: boolean },
            startFrame: currentFrame,
            durationInFrames: dur,
        });
        currentFrame += dur;
    }

    console.log("Sequence Entries:", sequenceEntries.map(s => ({ id: s.segment.id, startFrame: s.startFrame, duration: s.durationInFrames })));


    return (
        <AbsoluteFill style={{ fontFamily: theme.typography.bodyFont }}>
            <ShortsLayout theme={theme} accentColor={activeAccentColor}>
                {/* ── Segment sequences ─────────────────────────────── */}

                {sequenceEntries.map(({ segment, startFrame, durationInFrames }, i) => (
                    <Sequence
                        key={segment.id}
                        from={startFrame}
                        durationInFrames={durationInFrames}
                    >
                        {/* Face-camera video */}
                        <FaceVideoSegment
                            videoFile={segment.videoFile}
                            isHorizontal={segment.isHorizontal ?? false}
                        />

                        {/* Book info overlay (only for book segments) */}
                        {segment.type === 'book' && segment.book && (
                            <BookInfoOverlay
                                book={segment.book}
                                bookNumber={segment.bookNumber}
                                theme={theme}
                                accentColor={activeAccentColor}
                            />
                        )}

                        {/* Hook / Outro text overlay */}
                        {(segment.type === 'hook' || segment.type === 'outro') &&
                            segment.overlayText && (
                                <OverlayText text={segment.overlayText} theme={theme} accentColor={activeAccentColor} />
                            )}

                    </Sequence>
                ))}

                {/* ── Transitions between segments ──────────────────── */}
                {sequenceEntries.slice(1).map(({ startFrame }, i) => (
                    <Sequence
                        key={`trans-${i}`}
                        from={startFrame - transFrames}
                        durationInFrames={transFrames * 2}
                    >
                        <ShortsTransition
                            type={activeTransition}
                            durationInFrames={transFrames * 2}
                        />

                    </Sequence>
                ))}

                {/* ── Transition SFX at each segment boundary ────────── */}
                {transitionSfx &&
                    sequenceEntries.slice(1).map(({ startFrame }, i) => (
                        <Sequence
                            key={`sfx-${i}`}
                            from={Math.max(0, startFrame - transFrames)}
                            durationInFrames={transFrames * 3}
                        >
                            <Audio
                                src={staticFile(transitionSfx)}
                                volume={transitionSfxVolume}
                            />
                        </Sequence>
                    ))}
            </ShortsLayout>

            {/* ── Background music ───────────────────────────────── */}
            {bgMusic && (
                <Audio
                    src={staticFile(bgMusic)}
                    volume={bgMusicVolume}
                    loop
                />
            )}
        </AbsoluteFill>
    );
};

// ── Helper: simple text overlay for hook / outro segments ─────────────────────

const OverlayText: React.FC<{ text: string; theme: any; accentColor: string }> = ({
    text,
    theme,
    accentColor,
}) => {

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '10%',
                left: 0,
                right: 0,
                zIndex: 20,
                display: 'flex',
                justifyContent: 'center',
                padding: '0 36px',
            }}
        >
            <p
                style={{
                    fontSize: 45,
                    fontWeight: theme.typography.fontWeightPrimary,
                    fontFamily: theme.typography.titleFont,
                    color: theme.colors.textPrimary,
                    textAlign: 'center',
                    lineHeight: 1.3,
                    margin: 0,
                    textShadow: `0 2px 12px rgba(0,0,0,0.8), 0 0 30px ${theme.colors.shadow}`,
                }}
            >

                {text}
            </p>
        </div>
    );
};
