import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from 'remotion';
import { Theme } from '../../themes';

interface EmotionalArcProps {
    /** Array of 0–1 intensity values, one per "chapter" or data segment */
    dataPoints: number[];
    theme: Theme;
    height?: number;
    position?: 'top' | 'bottom';
    /** Labels for each data point (e.g. chapter names) */
    labels?: string[];
}

export const EmotionalArc: React.FC<EmotionalArcProps> = ({
    dataPoints,
    theme,
    height = 60,
    position = 'bottom',
    labels,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames, width } = useVideoConfig();

    if (!dataPoints || dataPoints.length < 2) return null;

    const totalProgress = frame / durationInFrames;

    // Entry fade
    const entryOpacity = interpolate(frame, [0, fps * 2], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // SVG dimensions
    const svgWidth = width * 0.85;
    const svgHeight = height + 30; // extra for labels
    const padding = { left: 40, right: 40, top: 10, bottom: 20 };
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Generate smooth path through data points
    const points = dataPoints.map((val, i) => ({
        x: padding.left + (i / (dataPoints.length - 1)) * chartWidth,
        y: padding.top + chartHeight - val * chartHeight,
    }));

    // Create smooth bezier curve
    const pathData = points.reduce((acc, point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`;
        const prev = points[i - 1];
        const cpx1 = prev.x + (point.x - prev.x) * 0.4;
        const cpy1 = prev.y;
        const cpx2 = point.x - (point.x - prev.x) * 0.4;
        const cpy2 = point.y;
        return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${point.x} ${point.y}`;
    }, '');

    // Fill area path (closed)
    const fillPath = `${pathData} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

    // Current position indicator
    const currentX = padding.left + totalProgress * chartWidth;
    const currentIndex = totalProgress * (dataPoints.length - 1);
    const lowerIdx = Math.floor(currentIndex);
    const upperIdx = Math.min(Math.ceil(currentIndex), dataPoints.length - 1);
    const lerp = currentIndex - lowerIdx;
    const currentValue = dataPoints[lowerIdx] * (1 - lerp) + dataPoints[upperIdx] * lerp;
    const currentY = padding.top + chartHeight - currentValue * chartHeight;

    // Pulsing glow for current point
    const pulseScale = interpolate(
        Math.sin(frame * 0.15),
        [-1, 1],
        [0.8, 1.2]
    );

    // Draw progress line (portion already passed)
    const progressClipWidth = interpolate(frame, [0, durationInFrames], [0, chartWidth], {
        extrapolateRight: 'clamp',
    });

    // Emotion label
    const emotionLabels = ['😌', '😊', '😮', '😰', '🔥'];
    const emotionIdx = Math.min(
        Math.floor(currentValue * emotionLabels.length),
        emotionLabels.length - 1
    );

    return (
        <AbsoluteFill
            style={{
                pointerEvents: 'none',
                zIndex: 75000,
                opacity: entryOpacity * 0.75,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    [position]: '3%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: svgWidth,
                }}
            >
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                >
                    {/* Gradient definitions */}
                    <defs>
                        <linearGradient id="arcGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={theme.text.accent} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={theme.text.accent} stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={theme.text.accent} stopOpacity={0.3} />
                            <stop offset="50%" stopColor={theme.text.accent} stopOpacity={1} />
                            <stop offset="100%" stopColor={theme.text.accent} stopOpacity={0.3} />
                        </linearGradient>
                        <filter id="arcGlow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        {/* Clip path for progress */}
                        <clipPath id="progressClip">
                            <rect x={0} y={0} width={padding.left + progressClipWidth} height={svgHeight} />
                        </clipPath>
                    </defs>

                    {/* Background subtle line (full path, dimmed) */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={theme.text.secondary}
                        strokeWidth={1}
                        strokeDasharray="4 6"
                        opacity={0.2}
                    />

                    {/* Filled area under curve (progress-clipped) */}
                    <path
                        d={fillPath}
                        fill="url(#arcGradient)"
                        clipPath="url(#progressClip)"
                    />

                    {/* Active line (progress-clipped) */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={theme.text.accent}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        clipPath="url(#progressClip)"
                        filter="url(#arcGlow)"
                    />

                    {/* Data point dots */}
                    {points.map((p, i) => {
                        const pointProgress = i / (dataPoints.length - 1);
                        const isReached = totalProgress >= pointProgress;
                        const dotScale = spring({
                            frame: isReached ? frame - Math.floor(pointProgress * durationInFrames) : 0,
                            fps,
                            config: { damping: 12, stiffness: 200, mass: 0.5 },
                        });
                        return (
                            <g key={i}>
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={isReached ? 4 * Math.min(dotScale, 1) : 2}
                                    fill={isReached ? theme.text.accent : theme.text.secondary}
                                    opacity={isReached ? 0.9 : 0.3}
                                />
                                {/* Labels */}
                                {labels && labels[i] && isReached && (
                                    <text
                                        x={p.x}
                                        y={padding.top + chartHeight + 16}
                                        textAnchor="middle"
                                        fill={theme.text.secondary}
                                        fontSize={9}
                                        fontFamily="Inter, sans-serif"
                                        opacity={0.6}
                                    >
                                        {labels[i]}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Current position — glowing dot */}
                    <circle
                        cx={currentX}
                        cy={currentY}
                        r={6 * pulseScale}
                        fill={theme.text.accent}
                        filter="url(#arcGlow)"
                        opacity={0.95}
                    />
                    <circle
                        cx={currentX}
                        cy={currentY}
                        r={10 * pulseScale}
                        fill="none"
                        stroke={theme.text.accent}
                        strokeWidth={1}
                        opacity={0.3}
                    />

                    {/* Emotion emoji */}
                    <text
                        x={currentX}
                        y={currentY - 16}
                        textAnchor="middle"
                        fontSize={16}
                        opacity={0.9}
                    >
                        {emotionLabels[emotionIdx]}
                    </text>

                    {/* "Emotional Arc" label */}
                    <text
                        x={padding.left - 2}
                        y={padding.top - 2}
                        fill={theme.text.secondary}
                        fontSize={9}
                        fontFamily="Inter, sans-serif"
                        opacity={0.4}
                        letterSpacing={1.5}
                    >
                        EMOTIONAL ARC
                    </text>
                </svg>
            </div>
        </AbsoluteFill>
    );
};
