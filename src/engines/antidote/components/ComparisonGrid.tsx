import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { ComparisonGridSpec } from "../schema";
import { DEFAULT_BODY_FONT, DEFAULT_DISPLAY_FONT, resolveArtPalette, toneColor, useArtDirection, type StageMoodName } from "./artDirection";

/**
 * ComparisonGrid — Side-by-side framed mental-model contrast cards
 * (e.g. Anchoring $10,000 vs $3,000; Local Coffee Shop vs Starbucks; System 1 vs System 2).
 * Pairs bespoke Flux editorial illustrations with concise scannable takeaways.
 */
export const ComparisonGrid: React.FC<{ spec: ComparisonGridSpec; localFrame?: number; stageMood?: StageMoodName }> = ({ spec, localFrame, stageMood }) => {
  const ctxFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = Math.max(0, (localFrame ?? ctxFrame) - (spec.at ?? 0));
  const ad = useArtDirection();
  const palette = resolveArtPalette(ad, stageMood);
  const displayFont = ad?.fontDisplay ?? DEFAULT_DISPLAY_FONT;
  const bodyFont = ad?.fontBody ?? DEFAULT_BODY_FONT;

  const cols = spec.columns.slice(0, 3);
  const n = cols.length;
  const titleP = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.poly(4)),
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "70px 96px 104px",
        boxSizing: "border-box",
      }}
    >
      {(spec.title || spec.subtitle) && (
        <div
          style={{
            textAlign: "center",
            marginBottom: 40,
            opacity: titleP,
            transform: `translateY(${(1 - titleP) * 20}px)`,
          }}
        >
          {spec.title && (
            <div
              style={{
                fontFamily: displayFont,
                fontWeight: 900,
                fontSize: 58,
                lineHeight: 1.06,
                color: palette.accent,
                letterSpacing: "0.02em",
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
                fontSize: 26,
                color: palette.muted,
                marginTop: 10,
              }}
            >
              {spec.subtitle}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.max(1, n)}, minmax(0, 1fr))`,
          gap: 36,
          width: "100%",
          maxWidth: 1680,
          alignItems: "stretch",
        }}
      >
        {cols.map((col, i) => {
          const colP = spring({
            frame: Math.max(0, frame - (4 + i * 8)),
            fps,
            config: { damping: 16, stiffness: 135 },
          });
          const accent = toneColor(col.tone, palette);
          const hasTone = col.tone && col.tone !== "neutral";

          return (
            <div
              key={i}
              style={{
                background: palette.surface,
                border: `3px solid ${hasTone ? accent : palette.surfaceBorder}`,
                borderRadius: 28,
                padding: "30px 32px 32px",
                boxShadow: "0 24px 54px rgba(0,0,0,0.38)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                opacity: colP,
                transform: `translateY(${(1 - colP) * 30}px)`,
              }}
            >
              <div>
                {/* Top tag + Heading */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div
                    style={{
                      fontFamily: displayFont,
                      fontWeight: 800,
                      fontSize: n <= 2 ? 38 : 30,
                      lineHeight: 1.12,
                      color: hasTone ? accent : palette.ink,
                    }}
                  >
                    {col.heading}
                  </div>
                  {col.tag && (
                    <span
                      style={{
                        fontFamily: displayFont,
                        fontWeight: 800,
                        fontSize: 18,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "6px 14px",
                        borderRadius: 10,
                        background: `${accent}24`,
                        color: accent,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.tag}
                    </span>
                  )}
                </div>

                {/* Optional Flux visual */}
                {col.image && (
                  <div
                    style={{
                      width: "100%",
                      height: n <= 2 ? 260 : 210,
                      marginTop: 22,
                      borderRadius: 18,
                      overflow: "hidden",
                      border: `1.5px solid ${palette.surfaceBorder}`,
                      background: "rgba(0,0,0,0.25)",
                    }}
                  >
                    <Img
                      src={staticFile(col.image)}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}

                {/* Staggered bullet takeaways */}
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                  {col.bullets.slice(0, 5).map((b, bi) => {
                    const bp = interpolate(frame, [14 + i * 8 + bi * 5, 22 + i * 8 + bi * 5], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.out(Easing.cubic),
                    });
                    return (
                      <div
                        key={bi}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                          opacity: bp,
                          transform: `translateX(${(1 - bp) * 16}px)`,
                        }}
                      >
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            minWidth: 28,
                            borderRadius: "50%",
                            marginTop: 3,
                            background: `${accent}28`,
                            border: `2px solid ${accent}`,
                            color: accent,
                            fontFamily: displayFont,
                            fontWeight: 900,
                            fontSize: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {col.tone === "danger" ? "×" : col.tone === "positive" ? "✓" : "•"}
                        </span>
                        <span
                          style={{
                            fontFamily: bodyFont,
                            fontWeight: 600,
                            fontSize: n <= 2 ? 26 : 22,
                            lineHeight: 1.32,
                            color: palette.ink,
                          }}
                        >
                          {b}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom highlight bar */}
              {col.highlight && (
                <div
                  style={{
                    marginTop: 26,
                    padding: "14px 20px",
                    borderRadius: 14,
                    background: `${accent}22`,
                    borderLeft: `6px solid ${accent}`,
                    fontFamily: displayFont,
                    fontWeight: 800,
                    fontSize: n <= 2 ? 26 : 22,
                    color: hasTone ? accent : palette.ink,
                  }}
                >
                  {col.highlight}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
