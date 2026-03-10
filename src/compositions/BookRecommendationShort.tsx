import React from 'react';
import {
    AbsoluteFill,
    Audio,
    Sequence,
    staticFile,
    useVideoConfig,
} from 'remotion';
import { z } from 'zod';
import {
    ShortsLayout,
    FaceVideoSegment,
    BookInfoOverlay,
    ShortsTransition,
    pickTransition,
} from '../components/shorts';
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
    accentColor: z.string().optional(),
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
    accentColor = '#ff6b35',
    segmentDurations,
}) => {
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

    return (
        <AbsoluteFill>
            <ShortsLayout accentColor={accentColor}>
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
                                accentColor={accentColor}
                            />
                        )}

                        {/* Hook / Outro text overlay */}
                        {(segment.type === 'hook' || segment.type === 'outro') &&
                            segment.overlayText && (
                                <OverlayText text={segment.overlayText} accentColor={accentColor} />
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
                            type={pickTransition(i)}
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

const OverlayText: React.FC<{ text: string; accentColor: string }> = ({
    text,
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
                    fontWeight: 800,
                    fontFamily: "'Inter', 'Segoe UI', sans-serif",
                    color: '#fff',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    margin: 0,
                    textShadow: `0 2px 12px rgba(0,0,0,0.8), 0 0 30px ${accentColor}40`,
                }}
            >
                {text}
            </p>
        </div>
    );
};
