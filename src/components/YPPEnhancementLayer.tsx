import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Theme } from '../themes';

interface YPPEnhancementLayerProps {
    theme: Theme;
    currentTime: number; // seconds
    totalDuration?: number; // seconds – for accurate progress bar
}

export const YPPEnhancementLayer: React.FC<YPPEnhancementLayerProps> = ({
    theme,
    currentTime,
    totalDuration = 300,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // ── Progress bar ──────────────────────────────────────────────────────
    // Use actual composition duration instead of a hardcoded guess
    const actualDuration = durationInFrames / fps;
    const progressWidth = Math.min((currentTime / actualDuration) * 100, 100);

    // ── Pulsing accent ────────────────────────────────────────────────────
    const pulseOpacity = spring({
        frame: frame % (fps * 3),
        fps,
        config: { damping: 100, stiffness: 200 },
    });

    // ── Rotating dashed ring ──────────────────────────────────────────────
    const borderRotation = interpolate(frame, [0, fps * 8], [0, 360], {
        extrapolateRight: 'wrap',
    });

    // ── Breath scale on geometric shape ──────────────────────────────────
    const shapeScale = spring({
        frame: frame % (fps * 4),
        fps,
        from: 0.8,
        to: 1.2,
        config: { damping: 100 },
    });

    // ── Floating ambient particles ────────────────────────────────────────
    const particleY = interpolate(frame % (fps * 5), [0, fps * 5], [100, -10]);

    // ── Slow chromatic streak (top-right decorative) ──────────────────────
    const streakX = interpolate(frame % (fps * 7), [0, fps * 7], [-20, 120], {
        extrapolateRight: 'wrap',
    });
    const streakOpacity = interpolate(
        frame % (fps * 7),
        [0, fps * 0.5, fps * 3, fps * 3.5, fps * 7],
        [0, 0.6, 0.6, 0, 0],
        { extrapolateRight: 'clamp' }
    );

    // ── Scanline intensity (very subtle) ────────────────────────────────
    const scanlineOpacity = 0.4;

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 100 }}>

            {/* ── Top progress bar ────────────────────────────────────── */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 5,
                    background: 'rgba(255,255,255,0.08)',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${progressWidth}%`,
                        background: `linear-gradient(90deg, ${theme.text.accent}, ${theme.effects.glowColor})`,
                        boxShadow: `0 0 14px ${theme.effects.glowColor}, 0 0 4px ${theme.text.accent}`,
                    }}
                />
                {/* Glowing dot at progress head */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: `${progressWidth}%`,
                        transform: 'translate(-50%, -50%)',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: theme.text.accent,
                        boxShadow: `0 0 12px 4px ${theme.text.accent}`,
                        opacity: progressWidth > 1 ? 1 : 0,
                    }}
                />
            </div>

            {/* ── Top-left rotating dashed ring ───────────────────────── */}
            <svg
                style={{
                    position: 'absolute',
                    top: 18,
                    left: 18,
                    width: 64,
                    height: 64,
                    opacity: 0.35 + pulseOpacity * 0.25,
                    transform: `rotate(${borderRotation}deg)`,
                }}
            >
                <circle
                    cx="32" cy="32" r="26"
                    fill="none"
                    stroke={theme.text.accent}
                    strokeWidth="2"
                    strokeDasharray="12 6"
                />
            </svg>
            {/* Inner static dot */}
            <div
                style={{
                    position: 'absolute',
                    top: 42,
                    left: 42,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: theme.text.accent,
                    boxShadow: `0 0 8px 2px ${theme.text.accent}`,
                    opacity: 0.7 + pulseOpacity * 0.3,
                }}
            />

            {/* ── Bottom-right counter-rotating ring ──────────────────── */}
            <svg
                style={{
                    position: 'absolute',
                    bottom: 18,
                    right: 18,
                    width: 64,
                    height: 64,
                    opacity: 0.35 + pulseOpacity * 0.25,
                    transform: `rotate(${-borderRotation}deg)`,
                }}
            >
                <circle
                    cx="32" cy="32" r="26"
                    fill="none"
                    stroke={theme.text.accent}
                    strokeWidth="2"
                    strokeDasharray="12 6"
                />
            </svg>

            {/* ── Floating ambient particles ───────────────────────────── */}
            {[...Array(10)].map((_, i) => {
                const xPos = 5 + i * 10;
                const delay = i * 18;
                const adjustedY = (particleY + delay) % 120;
                const opacity = interpolate(
                    adjustedY,
                    [-10, 10, 90, 110],
                    [0, 0.45, 0.45, 0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );
                const size = 4 + (i % 3) * 2;

                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: `${xPos}%`,
                            top: `${adjustedY}%`,
                            width: size,
                            height: size,
                            borderRadius: '50%',
                            backgroundColor: theme.background.particleColor,
                            opacity,
                            boxShadow: `0 0 ${size * 2}px ${theme.background.particleColor}`,
                        }}
                    />
                );
            })}

            {/* ── Rotating triangle (bottom-left) ─────────────────────── */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 90,
                    left: 28,
                    width: 50,
                    height: 50,
                    opacity: 0.22,
                    transform: `scale(${shapeScale}) rotate(${frame * 0.4}deg)`,
                }}
            >
                <svg viewBox="0 0 100 100">
                    <polygon
                        points="50,8 94,92 6,92"
                        fill="none"
                        stroke={theme.text.primary}
                        strokeWidth="3"
                    />
                </svg>
            </div>

            {/* ── Decorative diamond (top-right) ──────────────────────── */}
            <div
                style={{
                    position: 'absolute',
                    top: 80,
                    right: 28,
                    width: 36,
                    height: 36,
                    opacity: 0.18,
                    transform: `rotate(${45 + frame * 0.25}deg) scale(${0.9 + Math.sin(frame * 0.06) * 0.15})`,
                }}
            >
                <svg viewBox="0 0 100 100">
                    <rect x="10" y="10" width="80" height="80"
                        fill="none"
                        stroke={theme.text.accent}
                        strokeWidth="4"
                    />
                </svg>
            </div>

            {/* ── Chromatic light streak (sweeps across occasionally) ── */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: `${streakX}%`,
                    width: '6%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${theme.text.accent}22, transparent)`,
                    opacity: streakOpacity,
                    pointerEvents: 'none',
                    transform: 'skewX(-15deg)',
                }}
            />

            {/* ── Subtle CRT scanline overlay ──────────────────────────── */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `repeating-linear-gradient(
                        0deg,
                        rgba(0, 0, 0, 0) 0px,
                        rgba(0, 0, 0, 0.025) 2px,
                        rgba(0, 0, 0, 0) 4px
                    )`,
                    pointerEvents: 'none',
                    opacity: scanlineOpacity,
                }}
            />
        </AbsoluteFill>
    );
};
