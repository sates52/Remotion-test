/**
 * AudioWaveform — Audiogram-style voice waveform visualizer
 *
 * Usage:
 *   <AudioWaveform audioSrc={staticFile('audio/myfile.mp3')} />
 *
 * Props:
 *   audioSrc        — path to audio file (use staticFile())
 *   color           — waveform stroke color (default: '#ffffff')
 *   strokeWidth     — line thickness (default: 3)
 *   height          — container height in px (default: 80)
 *   mirror          — mirror top+bottom (default: true)
 *   numberOfSamples — how many waveform samples (default: 64)
 *   style           — optional container style override
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useWindowedAudioData, visualizeAudioWaveform, createSmoothSvgPath } from '@remotion/media-utils';

interface AudioWaveformProps {
    audioSrc: string;
    color?: string;
    strokeWidth?: number;
    height?: number;
    mirror?: boolean;
    numberOfSamples?: number;
    style?: React.CSSProperties;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
    audioSrc,
    color = '#ffffff',
    strokeWidth = 3,
    height = 80,
    mirror = true,
    numberOfSamples = 64,
    style,
}) => {
    const frame = useCurrentFrame();
    const { fps, width } = useVideoConfig();

    const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
        src: audioSrc,
        frame,
        fps,
        windowInSeconds: 1 / fps,
    });

    if (!audioData) {
        return <div style={{ height, width: '100%', ...style }} />;
    }

    const waveformPoints = visualizeAudioWaveform({
        audioData,
        frame,
        fps,
        numberOfSamples,
        windowInSeconds: 1 / fps,
        dataOffsetInSeconds,
    });

    const svgWidth = width;
    const svgHeight = height;
    const midY = svgHeight / 2;

    const topPoints = waveformPoints.map((v, i) => ({
        x: (i / (waveformPoints.length - 1)) * svgWidth,
        y: midY - v * midY * 0.9,
    }));
    const topPath = createSmoothSvgPath({ points: topPoints });

    const bottomPoints = waveformPoints.map((v, i) => ({
        x: (i / (waveformPoints.length - 1)) * svgWidth,
        y: midY + v * midY * 0.9,
    }));
    const bottomPath = createSmoothSvgPath({ points: bottomPoints });

    return (
        <div style={{ width: '100%', height, ...style }}>
            <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                width="100%"
                height="100%"
                style={{ display: 'block' }}
            >
                <path
                    d={topPath}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {mirror && (
                    <path
                        d={bottomPath}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.6}
                    />
                )}
                <line
                    x1={0} y1={midY}
                    x2={svgWidth} y2={midY}
                    stroke={color}
                    strokeWidth={1}
                    opacity={0.2}
                />
            </svg>
        </div>
    );
};
