import React from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { GOLD, INK, RED } from "./palette";
import { useCardHand } from "./cardHand";

export const BG = "broll-ocean-tanker/mo-photoshop-background.png";

export const PaperBackground: React.FC<{ tint?: boolean }> = ({ tint = false }) => {
  return (
    <>
      <Img src={staticFile(BG)} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.06)", zIndex: 0 }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(63,54,42,0.16)), radial-gradient(circle at 50% 52%, rgba(255,255,255,0.20), transparent 46%)", mixBlendMode: "soft-light", zIndex: 1 }} />
      {tint ? (
        <>
          <AbsoluteFill style={{ zIndex: 1, mixBlendMode: "multiply", opacity: 0.22, background: `radial-gradient(circle at 26% 22%, ${GOLD}, transparent 55%), radial-gradient(circle at 82% 82%, ${RED}, transparent 60%)` }} />
          <AbsoluteFill style={{ zIndex: 1, mixBlendMode: "soft-light", opacity: 0.18, background: `linear-gradient(150deg, ${INK}, transparent 70%)` }} />
        </>
      ) : null}
    </>
  );
};

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = (frame % 6) * 13;
  return (
    <AbsoluteFill
      style={{
        zIndex: 60,
        pointerEvents: "none",
        opacity: 0.06,
        backgroundImage: `radial-gradient(${INK} 0.5px, transparent 0.6px)`,
        backgroundSize: "3px 3px",
        backgroundPosition: `${shift}px ${shift * 1.3}px`,
        mixBlendMode: "multiply",
      }}
    />
  );
};

export const Vignette: React.FC<{ intensity?: number }> = ({ intensity = 0.28 }) => (
  <AbsoluteFill style={{ zIndex: 58, pointerEvents: "none", boxShadow: `inset 0 0 460px rgba(20,15,10,${intensity})` }} />
);

export const AccentBurst: React.FC<{ seed: number; x?: number; y?: number; startFrame?: number }> = ({ seed, x = 50, y = 46, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - startFrame, fps, config: { damping: 20, mass: 1, stiffness: 90 }, durationInFrames: 40 });
  const size = 620 + Math.floor(seed * 260);
  const color = seed > 0.5 ? GOLD : RED;
  const rot = frame * 0.15 * (seed > 0.5 ? 1 : -1);
  // THE BOOK'S CARD HAND (cardHand.tsx): what stands behind the words of a text card. "dark" = the ring, as before.
  const hand = useCardHand();
  if (hand === "paper") {
    // a tilted ruled sheet
    const w = size * 1.15, h = size * 0.78, tilt = seed > 0.5 ? 2.2 : -2.6;
    return (
      <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: w, height: h, transform: `translate(-50%,-50%) rotate(${tilt}deg) scale(${s})`, opacity: 0.9, zIndex: 4 }}>
        <div style={{ position: "absolute", inset: 0, border: `5px solid ${INK}`, opacity: 0.14, background: "rgba(255,255,255,0.10)" }} />
        <div style={{ position: "absolute", inset: "12% 6% 10% 6%", backgroundImage: `linear-gradient(${INK} 2px, transparent 2px)`, backgroundSize: "100% 46px", opacity: 0.09 }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "9%", width: 3, background: color, opacity: 0.3 }} />
      </div>
    );
  }
  if (hand === "sharp") {
    // corner brackets
    const w = size * 1.2, h = size * 0.74, L = 110, T = 16, corner = (pos: React.CSSProperties, b: React.CSSProperties) => <div style={{ position: "absolute", width: L, height: L, ...pos, ...b }} />;
    return (
      <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: w, height: h, transform: `translate(-50%,-50%) scale(${s})`, opacity: 0.26, zIndex: 4 }}>
        {corner({ left: 0, top: 0 }, { borderLeft: `${T}px solid ${color}`, borderTop: `${T}px solid ${color}` })}
        {corner({ right: 0, top: 0 }, { borderRight: `${T}px solid ${INK}`, borderTop: `${T}px solid ${INK}` })}
        {corner({ left: 0, bottom: 0 }, { borderLeft: `${T}px solid ${INK}`, borderBottom: `${T}px solid ${INK}` })}
        {corner({ right: 0, bottom: 0 }, { borderRight: `${T}px solid ${color}`, borderBottom: `${T}px solid ${color}` })}
      </div>
    );
  }
  if (hand === "accent") {
    // a slanted band of the book's colour at one side
    const left = seed > 0.5;
    return (
      <div style={{ position: "absolute", top: "-10%", bottom: "-10%", [left ? "left" : "right"]: "-6%", width: "34%", background: color, opacity: 0.13 * s, transform: `skewX(${left ? -9 : 9}deg)`, zIndex: 4 }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, [left ? "right" : "left"]: -26, width: 10, background: INK, opacity: 0.5 }} />
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: size, height: size, transform: `translate(-50%,-50%) scale(${s})`, opacity: 0.9, zIndex: 4 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `18px solid ${color}`, opacity: 0.18 }} />
      <div style={{ position: "absolute", inset: "16%", borderRadius: "50%", backgroundImage: `radial-gradient(${color} 2px, transparent 2.6px)`, backgroundSize: "16px 16px", opacity: 0.16, transform: `rotate(${rot}deg)` }} />
    </div>
  );
};

export const FloatingSpecks: React.FC = () => {
  const frame = useCurrentFrame();
  const specks = Array.from({ length: 26 }, (_, i) => {
    const s = (i * 97.13) % 100;
    const x = (s * 1.7 + Math.sin(frame / (40 + (i % 7) * 8) + i) * 3) % 100;
    const y = ((i * 61.7) % 100 + frame / (5 + (i % 5))) % 100;
    const size = 2 + (i % 4);
    return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: size, height: size, borderRadius: "50%", background: i % 3 === 0 ? RED : INK, opacity: 0.08 }} />;
  });
  return <AbsoluteFill style={{ zIndex: 3, pointerEvents: "none" }}>{specks}</AbsoluteFill>;
};
