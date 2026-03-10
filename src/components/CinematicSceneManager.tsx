import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { SceneConfig, TransitionType } from '../types/scene';
import { getActiveScenesAtTime, calculateSceneOpacity } from '../utils/sceneGenerator';
import { CinematicSceneRenderer } from './CinematicSceneRenderer';

interface CinematicSceneManagerProps {
    config: SceneConfig;
}

// Advanced transition renderer
const TransitionOverlay: React.FC<{
    transitionType: TransitionType;
    progress: number;
}> = ({ transitionType, progress }) => {
    switch (transitionType) {
        case 'whiteFlash': {
            const flashOpacity = interpolate(progress, [0, 0.3, 1], [0, 1, 0]);
            return (
                <AbsoluteFill
                    style={{
                        backgroundColor: '#ffffff',
                        opacity: flashOpacity,
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'glitch': {
            const glitchOffset = Math.random() * 10 - 5;
            const glitchOpacity = interpolate(progress, [0, 0.5, 1], [1, 0.5, 0]);
            return (
                <AbsoluteFill
                    style={{
                        transform: `translateX(${glitchOffset}px)`,
                        opacity: glitchOpacity,
                        filter: `contrast(${2 - progress}) saturate(${2 - progress})`,
                        mixBlendMode: 'difference',
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'filmBurn': {
            const burnProgress = interpolate(progress, [0, 1], [0, 100]);
            return (
                <AbsoluteFill
                    style={{
                        background: `radial-gradient(circle at 50% 50%, transparent ${burnProgress}%, #ff6600 ${burnProgress + 10}%)`,
                        opacity: progress,
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'wipe': {
            const wipeProgress = interpolate(progress, [0, 1], [0, 100]);
            return (
                <AbsoluteFill
                    style={{
                        background: `linear-gradient(to right, #000 ${wipeProgress}%, transparent ${wipeProgress}%)`,
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'rotate': {
            const rotateAngle = interpolate(progress, [0, 1], [0, 90]);
            const rotateOpacity = interpolate(progress, [0, 0.5, 1], [0, 1, 0]);
            return (
                <AbsoluteFill
                    style={{
                        backgroundColor: '#000',
                        opacity: rotateOpacity,
                        transform: `perspective(1000px) rotateY(${rotateAngle}deg)`,
                        transformOrigin: 'center',
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'circleWipe': {
            const circleSize = interpolate(progress, [0, 1], [0, 150]);
            return (
                <AbsoluteFill
                    style={{
                        background: `radial-gradient(circle at 50% 50%, transparent ${circleSize}%, #000 ${circleSize}%)`,
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'pixelate': {
            const pixelSize = interpolate(progress, [0, 0.5, 1], [1, 20, 1]);
            const pixelOpacity = interpolate(progress, [0, 0.5, 1], [0, 1, 0]);
            return (
                <AbsoluteFill
                    style={{
                        backgroundColor: '#000',
                        opacity: pixelOpacity,
                        filter: `blur(${pixelSize}px)`,
                        imageRendering: pixelSize > 5 ? 'pixelated' : 'auto',
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'colorShift': {
            const shiftAmount = interpolate(progress, [0, 1], [0, 20]);
            const shiftOpacity = interpolate(progress, [0, 0.5, 1], [0, 0.8, 0]);
            return (
                <>
                    <AbsoluteFill
                        style={{
                            transform: `translateX(${shiftAmount}px)`,
                            opacity: shiftOpacity,
                            mixBlendMode: 'screen',
                            filter: 'sepia(1) saturate(3) hue-rotate(0deg)',
                            pointerEvents: 'none',
                        }}
                    />
                    <AbsoluteFill
                        style={{
                            transform: `translateX(${-shiftAmount}px)`,
                            opacity: shiftOpacity,
                            mixBlendMode: 'screen',
                            filter: 'sepia(1) saturate(3) hue-rotate(120deg)',
                            pointerEvents: 'none',
                        }}
                    />
                </>
            );
        }

        case 'slide': {
            const slideProgress = interpolate(progress, [0, 1], [-100, 0]);
            return (
                <AbsoluteFill
                    style={{
                        backgroundColor: '#000',
                        transform: `translateX(${slideProgress}%)`,
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'morph': {
            const morphScale = interpolate(progress, [0, 0.5, 1], [1, 1.3, 1]);
            const morphRotate = interpolate(progress, [0, 0.5, 1], [0, 15, 0]);
            const morphOpacity = interpolate(progress, [0, 0.5, 1], [0, 0.6, 0]);
            return (
                <AbsoluteFill
                    style={{
                        backgroundColor: '#000',
                        opacity: morphOpacity,
                        transform: `scale(${morphScale}) rotate(${morphRotate}deg)`,
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'spiral': {
            const spiralRotate = interpolate(progress, [0, 1], [0, 360]);
            const spiralScale = interpolate(progress, [0, 1], [0, 1.5]);
            const spiralOpacity = interpolate(progress, [0, 0.5, 1], [0, 1, 0]);
            return (
                <AbsoluteFill
                    style={{
                        backgroundColor: '#000',
                        opacity: spiralOpacity,
                        transform: `rotate(${spiralRotate}deg) scale(${spiralScale})`,
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'pushSlide': {
            const pushProgress = interpolate(progress, [0, 1], [100, 0]);
            return (
                <AbsoluteFill
                    style={{
                        backgroundColor: '#000',
                        transform: `translateX(${pushProgress}%)`,
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'diagonalWipe': {
            const diagProgress = interpolate(progress, [0, 1], [-50, 150]);
            return (
                <AbsoluteFill
                    style={{
                        background: `linear-gradient(135deg, #000 ${diagProgress}%, transparent ${diagProgress + 5}%)`,
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'zoom': {
            const zoomScale = interpolate(progress, [0, 0.5, 1], [1, 3, 1]);
            const zoomOpacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
            return (
                <AbsoluteFill
                    style={{
                        backgroundColor: '#000',
                        opacity: zoomOpacity,
                        transform: `scale(${zoomScale})`,
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'blur': {
            const blurAmount = interpolate(progress, [0, 0.5, 1], [0, 30, 0]);
            const blurOpacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 0.8, 0.8, 0]);
            return (
                <AbsoluteFill
                    style={{
                        backgroundColor: '#000',
                        opacity: blurOpacity,
                        backdropFilter: `blur(${blurAmount}px)`,
                        WebkitBackdropFilter: `blur(${blurAmount}px)`,
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'blinds': {
            const blindsProgress = interpolate(progress, [0, 1], [0, 100]);
            const stripes = 8;
            const stripeHeight = 100 / stripes;
            const blindsOpacity = interpolate(progress, [0, 0.5, 1], [0, 1, 0]);
            return (
                <AbsoluteFill style={{ pointerEvents: 'none', opacity: blindsOpacity }}>
                    {Array.from({ length: stripes }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                top: `${i * stripeHeight}%`,
                                left: 0,
                                width: '100%',
                                height: `${Math.min(blindsProgress, stripeHeight)}%`,
                                backgroundColor: '#000',
                            }}
                        />
                    ))}
                </AbsoluteFill>
            );
        }

        case 'pageTurn': {
            const turnAngle = interpolate(progress, [0, 1], [0, -90]);
            const turnOpacity = interpolate(progress, [0, 0.5, 1], [0, 1, 0]);
            const turnShadow = interpolate(progress, [0, 0.5, 1], [0, 0.8, 0]);
            return (
                <AbsoluteFill
                    style={{
                        backgroundColor: '#111',
                        opacity: turnOpacity,
                        transform: `perspective(1500px) rotateY(${turnAngle}deg)`,
                        transformOrigin: 'left center',
                        boxShadow: `inset -30px 0 60px rgba(0,0,0,${turnShadow})`,
                        pointerEvents: 'none',
                    }}
                />
            );
        }

        case 'gridReveal': {
            const gridSize = 4;
            const cellDelay = 1 / (gridSize * gridSize);
            const gridOpacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
            return (
                <AbsoluteFill style={{ pointerEvents: 'none', opacity: gridOpacity }}>
                    {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                        const row = Math.floor(i / gridSize);
                        const col = i % gridSize;
                        const cellProgress = interpolate(progress, [i * cellDelay, (i + 1) * cellDelay], [0, 1], {
                            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                        });
                        return (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    top: `${row * (100 / gridSize)}%`,
                                    left: `${col * (100 / gridSize)}%`,
                                    width: `${100 / gridSize}%`,
                                    height: `${100 / gridSize}%`,
                                    backgroundColor: '#000',
                                    opacity: cellProgress,
                                    transform: `scale(${cellProgress})`,
                                }}
                            />
                        );
                    })}
                </AbsoluteFill>
            );
        }

        default:
            return null;
    }
};

export const CinematicSceneManager: React.FC<CinematicSceneManagerProps> = ({ config }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;

    // Get active scenes (may be multiple during transitions)
    const activeScenes = getActiveScenesAtTime(config.scenes, currentTime);

    // Cinematic bars (letterboxing for 2.39:1 aspect ratio)
    const cinematicBars = config.cinematicBars;
    const barHeight = cinematicBars ? 8 : 0; // percentage

    return (
        <AbsoluteFill>
            {/* Scene layers */}
            {activeScenes.map((scene, index) => {
                const nextScene = config.scenes[config.scenes.indexOf(scene) + 1];
                const opacity = calculateSceneOpacity(scene, currentTime, nextScene);

                // Calculate transition progress if applicable
                let transitionProgress = 0;
                if (nextScene && scene.transition && currentTime >= scene.endTime - scene.transition.duration) {
                    const transitionStart = scene.endTime - scene.transition.duration;
                    transitionProgress = (currentTime - transitionStart) / scene.transition.duration;
                }

                return (
                    <React.Fragment key={scene.id}>
                        <CinematicSceneRenderer scene={scene} opacity={opacity} />

                        {/* Transition overlay */}
                        {scene.transition && transitionProgress > 0 && transitionProgress < 1 && (
                            <TransitionOverlay
                                transitionType={scene.transition.type}
                                progress={transitionProgress}
                            />
                        )}
                    </React.Fragment>
                );
            })}

            {/* Cinematic letterboxing bars */}
            {cinematicBars && (
                <>
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${barHeight}%`,
                            backgroundColor: '#000',
                            zIndex: 9999,
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: `${barHeight}%`,
                            backgroundColor: '#000',
                            zIndex: 9999,
                        }}
                    />
                </>
            )}

            {/* Global film grain overlay */}
            {config.globalFilmGrain && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0.2,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        mixBlendMode: 'overlay',
                        pointerEvents: 'none',
                        zIndex: 9998,
                    }}
                />
            )}
        </AbsoluteFill>
    );
};
