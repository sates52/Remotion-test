import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { RealAnchorSpec } from "../schema";
import { DEFAULT_BODY_FONT, DEFAULT_DISPLAY_FONT, resolveArtPalette, useArtDirection, type StageMoodName } from "./artDirection";

/**
 * RealAnchorCard — Real-world book cover / author portrait / research document / quote
 * with animated curved editorial pointer arrows and callout notes.
 * Strong YPP educational-commentary signal (direct parallel to Real Antidote's Deep Work & Art of War anchors).
 */
export const RealAnchorCard: React.FC<{ spec: RealAnchorSpec; localFrame?: number; stageMood?: StageMoodName; sideInsetLeft?: number }> = ({ spec, localFrame, stageMood, sideInsetLeft = 0 }) => {
  const ctxFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = Math.max(0, (localFrame ?? ctxFrame) - (spec.at ?? 0));
  const ad = useArtDirection();
  const palette = resolveArtPalette(ad, stageMood);
  const displayFont = ad?.fontDisplay ?? DEFAULT_DISPLAY_FONT;
  const bodyFont = ad?.fontBody ?? DEFAULT_BODY_FONT;
  const captionPad = ad?.captions === "minimal" ? 148 : 104;
  const noteColW = sideInsetLeft ? 340 : 420;
  const plateW = sideInsetLeft ? 560 : 620;

  const cardP = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.95 },
  });

  const leftNotes = spec.annotations.filter((a) => a.side === "left").slice(0, 3);
  const rightNotes = spec.annotations.filter((a) => a.side !== "left").slice(0, 3);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: sideInsetLeft ? 32 : 44,
        padding: `70px 72px ${captionPad}px ${sideInsetLeft + 72}px`,
        boxSizing: "border-box",
      }}
    >
      {/* Left-hand editorial annotations */}
      {leftNotes.length > 0 && (
        <div style={{ width: noteColW, display: "flex", flexDirection: "column", gap: 36, alignItems: "flex-end" }}>
          {leftNotes.map((note, i) => {
            const np = interpolate(frame, [10 + i * 9, 22 + i * 9], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.poly(3)),
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: np,
                  transform: `translateX(${(1 - np) * -22}px)`,
                }}
              >
                <div
                  style={{
                    textAlign: "right",
                    fontFamily: displayFont,
                    fontWeight: 800,
                    fontSize: 30,
                    lineHeight: 1.2,
                    color: palette.accent,
                    textShadow: "0 4px 18px rgba(0,0,0,0.45)",
                  }}
                >
                  {note.text}
                </div>
                <svg width={76} height={36} viewBox="0 0 76 36" style={{ flexShrink: 0 }}>
                  <path
                    d="M 4 22 Q 36 8, 66 18"
                    fill="none"
                    stroke={palette.accent}
                    strokeWidth={4.5}
                    strokeLinecap="round"
                    strokeDasharray={100}
                    strokeDashoffset={(1 - np) * 100}
                  />
                  <polygon points="58,10 72,19 57,26" fill={palette.accent} opacity={np > 0.65 ? 1 : 0} />
                </svg>
              </div>
            );
          })}
        </div>
      )}

      {/* Center Anchor Plate (Book Cover / Study Document / Author Quote) */}
      <div
        style={{
          width: spec.image ? plateW : (sideInsetLeft ? 680 : 780),
          maxWidth: 840,
          borderRadius: 28,
          background: palette.surface,
          border: `3px solid ${palette.accent}`,
          boxShadow: "0 30px 76px rgba(0,0,0,0.52)",
          padding: "36px 42px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          opacity: cardP,
          transform: `translateY(${(1 - cardP) * 32}px) scale(${0.94 + cardP * 0.06})`,
        }}
      >
        {spec.badge && (
          <div
            style={{
              fontFamily: displayFont,
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: palette.bg,
              background: palette.accent,
              padding: "6px 18px",
              borderRadius: 999,
              marginBottom: 20,
            }}
          >
            {spec.badge}
          </div>
        )}

        {spec.image && (
          <div
            style={{
              width: "100%",
              height: 360,
              borderRadius: 18,
              overflow: "hidden",
              marginBottom: 24,
              border: `1.5px solid ${palette.surfaceBorder}`,
              background: "rgba(0,0,0,0.28)",
            }}
          >
            <Img src={staticFile(spec.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 900,
            fontSize: 44,
            lineHeight: 1.12,
            color: palette.ink,
          }}
        >
          {spec.title}
        </div>

        {spec.subtitle && (
          <div
            style={{
              fontFamily: bodyFont,
              fontWeight: 600,
              fontSize: 24,
              color: palette.muted,
              marginTop: 10,
            }}
          >
            {spec.subtitle}
          </div>
        )}

        {spec.quote && (
          <div
            style={{
              marginTop: 24,
              padding: "22px 28px",
              borderRadius: 18,
              background: "rgba(255,255,255,0.05)",
              borderLeft: `6px solid ${palette.accent}`,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: 30,
              lineHeight: 1.38,
              color: palette.ink,
              textAlign: "left",
            }}
          >
            “{spec.quote}”
            {spec.attribution && (
              <div
                style={{
                  fontFamily: displayFont,
                  fontStyle: "normal",
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: palette.accent,
                  marginTop: 12,
                }}
              >
                — {spec.attribution}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right-hand editorial annotations */}
      {rightNotes.length > 0 && (
        <div style={{ width: noteColW, display: "flex", flexDirection: "column", gap: 36, alignItems: "flex-start" }}>
          {rightNotes.map((note, i) => {
            const np = interpolate(frame, [14 + i * 9, 26 + i * 9], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.poly(3)),
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: np,
                  transform: `translateX(${(1 - np) * 22}px)`,
                }}
              >
                <svg width={76} height={36} viewBox="0 0 76 36" style={{ flexShrink: 0 }}>
                  <path
                    d="M 72 22 Q 40 8, 10 18"
                    fill="none"
                    stroke={palette.accent}
                    strokeWidth={4.5}
                    strokeLinecap="round"
                    strokeDasharray={100}
                    strokeDashoffset={(1 - np) * 100}
                  />
                  <polygon points="18,10 4,19 19,26" fill={palette.accent} opacity={np > 0.65 ? 1 : 0} />
                </svg>
                <div
                  style={{
                    textAlign: "left",
                    fontFamily: displayFont,
                    fontWeight: 800,
                    fontSize: 30,
                    lineHeight: 1.2,
                    color: palette.accent,
                    textShadow: "0 4px 18px rgba(0,0,0,0.45)",
                  }}
                >
                  {note.text}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
