/**
 * MusicVisualizer — Music spectrum bar visualizer (CapCut / music template style)
 *
 * Usage:
 *   <MusicVisualizer audioSrc={staticFile('audio/song.mp3')} />
 *
 * Props:
 *   audioSrc        — path to audio file (use staticFile())
 *   barCount        — number of spectrum bars (default: 64)
 *   color           — bar base color (default: '#6c63ff')
 *   accentColor     — highlight color for tall bars (default: '#ff6584')
 *   height          — container height in px (default: 200)
 *   visualStyle     — 'bars' | 'rounded' | 'mirror' (default: 'mirror')
 *   noiseAmount     — organic noise on bars 0-1 (default: 0.15)
 *   containerStyle  — optional container style override
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useWindowedAudioData, visualizeAudio } from '@remotion/media-utils';
import { noise2D } from '@remotion/noise';

type VisualizerStyle = 'bars' | 'rounded' | 'mirror';

interface MusicVisualizerProps {
    audioSrc: string;
    barCount?: number;
    color?: string;
    accentColor?: string;
    height?: number;
    visualStyle?: VisualizerStyle;
    noiseAmount?: number;
    containerStyle?: React.CSSProperties;
}

export const MusicVisualizer: React.FC<MusicVisualizerProps> = ({
    audioSrc,
    barCount = 64,
    color = '#6c63ff',
    accentColor = '#ff6584',
    height = 200,
    visualStyle = 'mirror',
    noiseAmount = 0.15,
    containerStyle,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
        src: audioSrc,
        frame,
        fps,
        windowInSeconds: 1 / fps,
    });

    if (!audioData) {
        return <div style={{ height, width: '100%', ...containerStyle }} />;
    }

    const frequencyData = visualizeAudio({
        audioData,
        frame,
        fps,
        numberOfSamples: barCount,
        dataOffsetInSeconds,
    });

    const barWidth = 100 / barCount;
    const gap = barWidth * 0.15;

    return (
        <div
            style={{
                width: '100%',
                height,
                display: 'flex',
                alignItems: 'flex-end',
                overflow: 'hidden',
                ...containerStyle,
            }}
        >
            {frequencyData.map((value, i) => {
                const noiseVal = noise2D('bar', i / barCount, frame / 60);
                const noisedValue = Math.max(0, Math.min(1, value + noiseVal * noiseAmount));
                const barHeightPct = noisedValue * 100;
                const isAccent = noisedValue > 0.7;
                const barColor = isAccent ? accentColor : color;

                if (visualStyle === 'mirror') {
                    return (
                        <div
                            key={i}
                            style={{
                                width: `${barWidth - gap}%`,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: `${gap}%`,
                            }}
                        >
                            <div style={{
                                width: '100%',
                                height: `${barHeightPct / 2}%`,
                                background: `linear-gradient(to top, ${barColor}, ${accentColor}88)`,
                                borderRadius: '3px 3px 0 0',
                                marginBottom: 1,
                            }} />
                            <div style={{
                                width: '100%',
                                height: `${barHeightPct / 2}%`,
                                background: `linear-gradient(to bottom, ${barColor}, ${barColor}44)`,
                                borderRadius: '0 0 3px 3px',
                                opacity: 0.6,
                            }} />
                        </div>
                    );
                }

                if (visualStyle === 'rounded') {
                    return (
                        <div
                            key={i}
                            style={{
                                width: `${barWidth - gap}%`,
                                height: `${Math.max(2, barHeightPct)}%`,
                                background: `linear-gradient(to top, ${barColor}, ${accentColor})`,
                                borderRadius: '4px',
                                marginRight: `${gap}%`,
                                alignSelf: 'flex-end',
                                boxShadow: isAccent ? `0 0 8px ${accentColor}88` : 'none',
                            }}
                        />
                    );
                }

                // Default: 'bars'
                return (
                    <div
                        key={i}
                        style={{
                            width: `${barWidth - gap}%`,
                            height: `${Math.max(2, barHeightPct)}%`,
                            backgroundColor: barColor,
                            marginRight: `${gap}%`,
                            alignSelf: 'flex-end',
                        }}
                    />
                );
            })}
        </div>
    );
};
