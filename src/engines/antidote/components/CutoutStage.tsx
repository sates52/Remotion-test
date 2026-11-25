import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { CutoutStageSpec } from "../schema";
import { isLightPalette, resolveArtFonts, resolveArtPalette, toneColor, useArtDirection, type StageMoodName } from "./artDirection";

/**
 * CutoutStage — Book-Specific Illustrated Character & Prop Theatre.
 *
 * Renders transparent RGBA character/prop cutouts (generated in the book's exact Flux artLock)
 * over an `emptyStage: true` painted backdrop in the exact same art world.
 * Zero cartoon-vs-painting style collision.
 */
export const CutoutStage: React.FC<{ spec: CutoutStageSpec; localFrame?: number; stageMood?: StageMoodName }> = ({ spec, localFrame, stageMood }) => {
  const ctxFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = Math.max(0, (localFrame ?? ctxFrame) - (spec.at ?? 0));
  const ad = useArtDirection();
  const palette = resolveArtPalette(ad, stageMood);
  const light = isLightPalette(palette);
  const fonts = resolveArtFonts(ad);

  const kb = spec.backdrop.kenBurns ?? "pushIn";
  const bp = interpolate(frame, [0, 480], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bgScale = kb === "pushIn" ? 1.01 + bp * 0.04 : kb === "pullOut" ? 1.05 - bp * 0.04 : 1.0;
  const bgTx = kb === "panLeft" ? (0.5 - bp) * 32 : kb === "panRight" ? (bp - 0.5) * 32 : 0;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* 1. Empty Painted Stage Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${bgTx.toFixed(1)}px, 0) scale(${bgScale.toFixed(4)})`,
          transformOrigin: "center",
        }}
      >
        <Img src={staticFile(spec.backdrop.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {(spec.backdrop.dim ?? 0) > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: light ? `rgba(250,247,240,${spec.backdrop.dim})` : `rgba(8,10,15,${spec.backdrop.dim})`,
            }}
          />
        )}
      </div>

      {/* 2. Top Editorial Banner */}
      {spec.banner && frame >= (spec.banner.at ?? 0) && (() => {
        const p = interpolate(frame - (spec.banner.at ?? 0), [0, 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.poly(4)),
        });
        return (
          <div
            style={{
              position: "absolute",
              top: 30,
              left: "50%",
              transform: `translateX(-50%) translateY(${(1 - p) * -14}px)`,
              opacity: p,
              padding: "9px 26px",
              borderRadius: light ? 4 : 999,
              background: light ? palette.surface : "rgba(10,13,20,0.84)",
              border: `1.5px solid ${palette.accent}`,
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: "0.08em",
              color: palette.accent,
              whiteSpace: "nowrap",
              boxShadow: light ? "0 8px 24px rgba(24,24,27,0.12)" : "0 10px 28px rgba(0,0,0,0.45)",
            }}
          >
            {spec.banner.text}
          </div>
        );
      })()}

      {/* 3. Animated Cutout Props / Clutter */}
      {(spec.props ?? []).map((pr, pi) => {
        const dt = frame - (pr.at ?? 0);
        if (dt < 0) return null;
        const enterP = spring({ frame: dt, fps, config: { damping: 14, stiffness: 150 } });
        const fadeOut = pr.fadeAt != null && frame >= pr.fadeAt
          ? interpolate(frame - pr.fadeAt, [0, 16], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          : 1;
        if (fadeOut <= 0.01) return null;
        const x = pr.fromX != null ? interpolate(enterP, [0, 1], [pr.fromX, pr.x]) : pr.x;
        const y = pr.fromY != null ? interpolate(enterP, [0, 1], [pr.fromY, pr.y]) : pr.y;
        const col = toneColor(pr.tone ?? "accent", palette);
        const w = pr.width ?? 210;
        return (
          <div
            key={`prop-${pi}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%, -50%) rotate(${pr.rot ?? 0}deg) scale(${0.86 + enterP * 0.14})`,
              opacity: Math.min(1, enterP * 1.4) * fadeOut,
              pointerEvents: "none",
            }}
          >
            {pr.image ? (
              <Img
                src={staticFile(pr.image)}
                style={{
                  width: w,
                  height: "auto",
                  filter: "drop-shadow(0 16px 26px rgba(0,0,0,0.22))",
                }}
              />
            ) : (
              <div
                style={{
                  minWidth: w,
                  padding: "12px 18px",
                  borderRadius: 6,
                  background: palette.surface,
                  border: `2px solid ${col}`,
                  borderLeft: `6px solid ${col}`,
                  boxShadow: light ? "0 12px 26px rgba(24,24,27,0.14)" : "0 14px 30px rgba(0,0,0,0.45)",
                }}
              >
                {pr.label && (
                  <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 19, color: palette.ink, lineHeight: 1.15 }}>
                    {pr.label}
                  </div>
                )}
                {pr.sublabel && (
                  <div style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: 15, color: palette.muted, marginTop: 3 }}>
                    {pr.sublabel}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* 4. Book-Specific Illustrated Cutout Actors */}
      {spec.actors.map((actor, ai) => {
        const dt = frame - (actor.at ?? 0);
        if (dt < 0) return null;
        const ep = spring({ frame: dt, fps, config: { damping: 16, stiffness: 130 } });
        const enterDir = actor.enter ?? "fade";
        const enterTx = enterDir === "left" ? (1 - ep) * -140 : enterDir === "right" ? (1 - ep) * 140 : 0;
        const enterTy = enterDir === "up" ? (1 - ep) * 90 : 0;
        const enterScale = enterDir === "pop" ? 0.8 + ep * 0.2 : 1;

        const actAt = actor.actionAt ?? 36;
        const actP = frame >= actAt
          ? interpolate(frame - actAt, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.poly(3)) })
          : 0;
        const action = actor.action ?? "stand";
        const breath = 1 + Math.sin(frame * 0.06 + ai * 2.1) * 0.008;
        const actRot = action === "leanIn" ? actP * (actor.flip ? -4.5 : 4.5) : action === "overwhelmed" ? actP * -4 : 0;
        const actTx = action === "stepIn" ? actP * (actor.x < 960 ? 75 : -75) : action === "leanIn" ? actP * (actor.flip ? -18 : 18) : 0;
        const actTy = action === "nod" ? Math.sin(Math.max(0, frame - actAt) * 0.16) * 5 : action === "overwhelmed" ? actP * 14 : 0;

        const w = actor.width ?? 340;
        const h = actor.height ?? 560;
        const safeY = Math.min(820, actor.y);
        const ax = actor.x + enterTx + actTx;
        const ay = safeY + enterTy + actTy;

        return (
          <React.Fragment key={actor.id}>
            {/* Grounded floor contact shadow */}
            <div
              style={{
                position: "absolute",
                left: ax,
                top: ay + h * 0.46,
                width: w * 0.68,
                height: 28,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(16,18,22,0.34) 0%, rgba(16,18,22,0) 72%)",
                opacity: ep,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: ax,
                top: ay,
                width: w,
                height: h,
                transform: `translate(-50%, -50%) scale(${(enterScale * breath).toFixed(4)}) scaleX(${actor.flip ? -1 : 1}) rotate(${actRot.toFixed(2)}deg)`,
                transformOrigin: "center bottom",
                opacity: Math.min(1, ep * 1.4),
                pointerEvents: "none",
              }}
            >
              <Img
                src={staticFile(actor.image)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.20))",
                }}
              />
            </div>

            {/* Speech Callout Bubble */}
            {actor.says && frame >= (actor.says.at ?? 0) && (() => {
              const sp = spring({ frame: Math.max(0, frame - (actor.says!.at ?? 0)), fps, config: { damping: 14, stiffness: 165 } });
              const side = actor.says!.side ?? (actor.x < 960 ? "right" : "left");
              const bx = Math.max(240, Math.min(1680, side === "right" ? ax + w * 0.56 : ax - w * 0.56));
              const by = Math.max(92, ay - h * 0.42);
              const col = toneColor(actor.says!.tone ?? "accent", palette);
              return (
                <div
                  style={{
                    position: "absolute",
                    left: bx,
                    top: by,
                    transform: `translate(-50%, -50%) scale(${0.86 + sp * 0.14})`,
                    opacity: sp,
                    maxWidth: 400,
                    padding: "16px 24px",
                    borderRadius: 12,
                    background: palette.surface,
                    border: `2.5px solid ${col}`,
                    boxShadow: light ? "0 14px 32px rgba(24,24,27,0.16)" : "0 18px 40px rgba(0,0,0,0.52)",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: fonts.body,
                      fontWeight: 700,
                      fontSize: 25,
                      lineHeight: 1.28,
                      color: palette.ink,
                    }}
                  >
                    {actor.says!.text}
                  </div>
                </div>
              );
            })()}
          </React.Fragment>
        );
      })}

      {/* 5. Bottom-Safe Callout */}
      {spec.callout && frame >= (spec.calloutAt ?? 20) && (() => {
        const cp = interpolate(frame - (spec.calloutAt ?? 20), [0, 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.poly(4)),
        });
        return (
          <div
            style={{
              position: "absolute",
              bottom: 144,
              left: "50%",
              transform: `translateX(-50%) translateY(${(1 - cp) * 16}px)`,
              opacity: cp,
              padding: "12px 28px",
              borderRadius: 8,
              background: palette.surface,
              border: `2px solid ${palette.accent}`,
              fontFamily: fonts.body,
              fontWeight: 700,
              fontSize: 24,
              color: palette.ink,
              boxShadow: light ? "0 12px 28px rgba(24,24,27,0.14)" : "0 14px 36px rgba(0,0,0,0.48)",
              whiteSpace: "nowrap",
            }}
          >
            {spec.callout}
          </div>
        );
      })()}
    </div>
  );
};
