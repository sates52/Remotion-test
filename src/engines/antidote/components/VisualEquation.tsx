import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { VisualEquationSpec } from "../schema";
import { DEFAULT_BODY_FONT, DEFAULT_DISPLAY_FONT, resolveArtPalette, toneColor, useArtDirection, type StageMoodName } from "./artDirection";

/**
 * VisualEquation — Antidote 2.0 explanatory mental-model flow.
 *
 * Replaces flat puppets standing in grey rooms on abstract/psychological beats with
 * crisp visual equations: [Node A] ──► [Mechanism B] ──► [Outcome C].
 * Supports bespoke Flux editorial cutouts/illustrations (or clean symbolic cards for minorHarm books).
 */
export const VisualEquation: React.FC<{ spec: VisualEquationSpec; localFrame?: number; stageMood?: StageMoodName }> = ({ spec, localFrame, stageMood }) => {
  const ctxFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = Math.max(0, (localFrame ?? ctxFrame) - (spec.at ?? 0));
  const ad = useArtDirection();
  const palette = resolveArtPalette(ad, stageMood);
  const displayFont = ad?.fontDisplay ?? DEFAULT_DISPLAY_FONT;
  const bodyFont = ad?.fontBody ?? DEFAULT_BODY_FONT;

  const nodes = spec.nodes.slice(0, 4);
  const n = nodes.length;
  const operator = spec.operator ?? "arrow";

  // Title waterfall entrance (cut-the-curve power4.out feel)
  const titleP = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.poly(4)),
  });

  const cardWidth = n <= 2 ? 500 : n === 3 ? 430 : 340;
  const arrowWidth = n <= 2 ? 120 : n === 3 ? 88 : 56;
  const cardHeight = n <= 3 ? 410 : 370;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "76px 88px 110px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      {(spec.title || spec.subtitle) && (
        <div
          style={{
            textAlign: "center",
            marginBottom: 46,
            opacity: titleP,
            transform: `translateY(${(1 - titleP) * 24}px)`,
          }}
        >
          {spec.title && (
            <div
              style={{
                fontFamily: displayFont,
                fontWeight: 800,
                fontSize: 58,
                lineHeight: 1.08,
                letterSpacing: "0.02em",
                color: palette.accent,
                textShadow: "0 6px 24px rgba(0,0,0,0.4)",
              }}
            >
              {spec.title}
            </div>
          )}
          {spec.subtitle && (
            <div
              style={{
                fontFamily: bodyFont,
                fontWeight: 500,
                fontSize: 28,
                color: palette.muted,
                marginTop: 10,
              }}
            >
              {spec.subtitle}
            </div>
          )}
        </div>
      )}

      {/* Horizontal Visual Equation Row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {nodes.map((node, i) => {
          const delay = 6 + i * 9;
          const nodeP = spring({
            frame: Math.max(0, frame - delay),
            fps,
            config: { damping: 16, stiffness: 140, mass: 0.9 },
          });
          const accent = toneColor(node.tone, palette);
          const hasTone = node.tone && node.tone !== "neutral";
          const arrowP = interpolate(frame, [delay + 6, delay + 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.poly(3)),
          });

          return (
            <React.Fragment key={i}>
              <div
                style={{
                  width: cardWidth,
                  minHeight: cardHeight,
                  borderRadius: 28,
                  background: palette.surface,
                  border: `3px solid ${hasTone ? accent : palette.surfaceBorder}`,
                  boxShadow: hasTone
                    ? `0 24px 60px rgba(0,0,0,0.42), 0 0 0 1px ${accent}44`
                    : "0 24px 54px rgba(0,0,0,0.36)",
                  padding: "28px 28px 30px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: nodeP,
                  transform: `translateY(${(1 - nodeP) * 34}px) scale(${0.94 + nodeP * 0.06})`,
                }}
              >
                {/* Top step badge */}
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: displayFont,
                      fontWeight: 800,
                      fontSize: 18,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: hasTone ? accent : palette.muted,
                      padding: "6px 14px",
                      borderRadius: 999,
                      background: hasTone ? `${accent}22` : "rgba(255,255,255,0.06)",
                    }}
                  >
                    {node.badge ?? `0${i + 1}`}
                  </span>
                </div>

                {/* Bespoke Flux illustration / cutout OR crisp symbolic emblem */}
                <div
                  style={{
                    width: "100%",
                    height: 196,
                    margin: "16px 0",
                    borderRadius: 18,
                    overflow: "hidden",
                    background: node.image ? "rgba(0,0,0,0.22)" : `${accent}14`,
                    border: `1.5px solid ${hasTone ? `${accent}44` : "rgba(255,255,255,0.08)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {node.image ? (
                    <Img
                      src={staticFile(node.image)}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: node.imageFit ?? "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontFamily: displayFont,
                        fontWeight: 900,
                        fontSize: 64,
                        color: accent,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {node.glyph ?? String(i + 1)}
                    </div>
                  )}
                </div>

                {/* Teaching label & crisp sublabel */}
                <div style={{ textAlign: "center", width: "100%" }}>
                  <div
                    style={{
                      fontFamily: displayFont,
                      fontWeight: 800,
                      fontSize: n <= 3 ? 31 : 26,
                      lineHeight: 1.15,
                      color: hasTone ? accent : palette.ink,
                    }}
                  >
                    {node.label}
                  </div>
                  {node.sublabel && (
                    <div
                      style={{
                        fontFamily: bodyFont,
                        fontWeight: 500,
                        fontSize: 21,
                        lineHeight: 1.32,
                        color: palette.muted,
                        marginTop: 8,
                      }}
                    >
                      {node.sublabel}
                    </div>
                  )}
                </div>
              </div>

              {/* Animated connector arrow / VS symbol */}
              {i < n - 1 && (
                <div
                  style={{
                    width: arrowWidth,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: arrowP,
                    transform: `translateX(${(1 - arrowP) * -14}px)`,
                  }}
                >
                  {operator === "versus" ? (
                    <div
                      style={{
                        fontFamily: displayFont,
                        fontWeight: 900,
                        fontSize: 34,
                        color: palette.danger,
                        background: `${palette.danger}20`,
                        border: `2px solid ${palette.danger}`,
                        borderRadius: "50%",
                        width: 68,
                        height: 68,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      VS
                    </div>
                  ) : (
                    <svg width={arrowWidth} height={64} viewBox={`0 0 ${arrowWidth} 64`}>
                      <line
                        x1={8}
                        y1={32}
                        x2={arrowWidth - 22}
                        y2={32}
                        stroke={palette.accent}
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeDasharray={arrowWidth}
                        strokeDashoffset={(1 - arrowP) * arrowWidth}
                      />
                      <polygon
                        points={`${arrowWidth - 26},18 ${arrowWidth - 4},32 ${arrowWidth - 26},46`}
                        fill={palette.accent}
                        opacity={arrowP > 0.65 ? 1 : 0}
                      />
                    </svg>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom synthesis callout */}
      {spec.footnote && (
        <div
          style={{
            marginTop: 40,
            padding: "14px 32px",
            borderRadius: 14,
            background: `${palette.accent}1E`,
            border: `2px solid ${palette.accent}77`,
            fontFamily: bodyFont,
            fontWeight: 700,
            fontSize: 27,
            color: palette.ink,
            opacity: interpolate(frame, [20, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {spec.footnote}
        </div>
      )}
    </div>
  );
};
