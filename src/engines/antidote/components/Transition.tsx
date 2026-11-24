import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import type { TransitionSpec } from "../schema";

/**
 * Transition — how a scene arrives.
 *
 * Scenes are mounted `transition.frames` EARLY (see index.tsx), so during that
 * window the outgoing scene is still on screen underneath. Everything here is
 * therefore a self-reveal of the incoming scene — clip, slide, blur or flash —
 * which reads as a real transition without any cross-scene wiring.
 */

export type TransitionRender = {
  /** Applied to the incoming scene's outermost wrapper. */
  style: React.CSSProperties;
  /** Full-frame flash / streak drawn above the scene, if any. */
  overlay: React.ReactNode;
};

const ease = (p: number) => interpolate(p, [0, 1], [0, 1], { easing: Easing.out(Easing.cubic) });
const easeP4 = (p: number) => interpolate(p, [0, 1], [0, 1], { easing: Easing.out(Easing.poly(4)) });

export function transitionRender(spec: TransitionSpec, localFrame: number): TransitionRender {
  const frames = Math.max(1, spec.frames);
  const raw = interpolate(localFrame, [0, frames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p = ease(raw);
  const p4 = easeP4(raw);
  const color = spec.color || "#FFFFFF";
  const done = raw >= 1;
  const none: TransitionRender = { style: {}, overlay: null };
  if (spec.type === "cut" || done) return none;

  switch (spec.type) {
    case "dissolve":
      return { style: { opacity: p }, overlay: null };
    case "wipeRight":
      return { style: { clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }, overlay: null };
    case "wipeLeft":
      return { style: { clipPath: `inset(0 0 0 ${(1 - p) * 100}%)` }, overlay: null };
    case "wipeUp":
      return { style: { clipPath: `inset(${(1 - p) * 100}% 0 0 0)` }, overlay: null };
    case "slideUp":
      return { style: { transform: `translateY(${(1 - p) * 100}%)` }, overlay: null };
    // ── Antidote 2.0 (motion-doctrine / cut-the-curve partial-travel seams) ──
    // ~12% partial-travel velocity-matched entry with power4.out & size-scaled blur.
    case "slideCarryLeft": {
      const blur = (1 - p4) * 12;
      return {
        style: {
          opacity: Math.min(1, raw * 2.4),
          transform: `translateX(${(1 - p4) * 12}%)`,
          filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
        },
        overlay: null,
      };
    }
    case "slideCarryUp": {
      const blur = (1 - p4) * 10;
      return {
        style: {
          opacity: Math.min(1, raw * 2.4),
          transform: `translateY(${(1 - p4) * 10}%)`,
          filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
        },
        overlay: null,
      };
    }
    case "zoomPush": {
      // Scale-sign rule (Z forward): incoming grows cleanly from 0.90 → 1.00
      const blur = (1 - p4) * 14;
      return {
        style: {
          opacity: Math.min(1, raw * 2.2),
          transform: `scale(${(0.9 + p4 * 0.1).toFixed(4)})`,
          filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
        },
        overlay: null,
      };
    }
    case "zoomPull": {
      // Scale-sign rule (Z backward / inverse zoom): incoming pulls back 1.12 → 1.00
      const blur = (1 - p4) * 14;
      return {
        style: {
          opacity: Math.min(1, raw * 2.2),
          transform: `scale(${(1.12 - p4 * 0.12).toFixed(4)})`,
          filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
        },
        overlay: null,
      };
    }
    case "blurCut": {
      // Rack-focus blur-cut (18px peak full-frame blur)
      const blur = (1 - p4) * 18;
      return {
        style: {
          opacity: p4,
          filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
        },
        overlay: null,
      };
    }
    case "whipLeft":
    case "whipRight": {
      const dir = spec.type === "whipLeft" ? -1 : 1;
      const blur = (1 - p) * 22;
      return {
        style: {
          transform: `translateX(${dir * (1 - p) * 52}%) scale(${1 + (1 - p) * 0.05})`,
          filter: blur > 0.4 ? `blur(${blur}px)` : undefined,
        },
        overlay: (
          <AbsoluteFill
            style={{
              background: `linear-gradient(${dir > 0 ? 90 : 270}deg, ${color}00, ${color}66, ${color}00)`,
              opacity: Math.max(0, 1 - p * 1.6),
            }}
          />
        ),
      };
    }
    case "irisIn":
      return {
        style: { clipPath: `circle(${8 + p * 78}% at 50% 50%)` },
        overlay: (
          <AbsoluteFill
            style={{
              border: `${Math.max(0, (1 - p) * 26)}px solid ${color}`,
              borderRadius: "50%",
              margin: `${(1 - p) * 12}%`,
              opacity: Math.max(0, 1 - p * 1.3),
            }}
          />
        ),
      };
    case "flash":
      return {
        style: {},
        overlay: <AbsoluteFill style={{ background: color, opacity: Math.max(0, 1 - p * 1.25) }} />,
      };
    default:
      return none;
  }
}
