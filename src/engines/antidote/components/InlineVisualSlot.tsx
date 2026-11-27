import React from "react";
import { Motif } from "../motifs";
import type { PropSpec } from "../schema";

export type InlineCustomSvg =
  | string
  | {
      viewBox?: string;
      paths: Array<{
        d: string;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        opacity?: number;
      }>;
      title?: string;
    };

/**
 * InlineVisualSlot — Renders a book-own `customSvg` drawing (from motifs.json / entities.json)
 * or stock Antidote `icon` motif inside text-heavy 10x devices when no raster `image` is set.
 * Keeps CPU-safe vector rendering with zero drop-shadow/filter overhead.
 */
export const InlineVisualSlot: React.FC<{
  customSvg?: InlineCustomSvg;
  icon?: string;
  accent: string;
  ink: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ customSvg, icon, accent, ink, size = 128, style }) => {
  if (customSvg && typeof customSvg === "object" && Array.isArray(customSvg.paths) && customSvg.paths.length > 0) {
    const viewBox = customSvg.viewBox || "0 0 520 520";
    return (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          ...style,
        }}
      >
        <svg viewBox={viewBox} width={size} height={size} style={{ overflow: "visible", display: "block" }}>
          {customSvg.paths.map((p, idx) => {
            const fill = p.fill === "accent" ? accent : p.fill === "ink" ? ink : p.fill || "none";
            const stroke = p.stroke === "accent" ? accent : p.stroke === "ink" ? ink : p.stroke || ink;
            const strokeWidth = p.strokeWidth ?? (fill === "none" ? 7 : 0);
            return (
              <path
                key={idx}
                d={p.d}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={p.opacity ?? 1}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  if (typeof customSvg === "string" && customSvg.trim()) {
    const trimmed = customSvg.trim();
    const isPathData = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s+-]+$/.test(trimmed);
    if (isPathData) {
      return (
        <div
          style={{
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            ...style,
          }}
        >
          <svg viewBox="0 0 520 520" width={size} height={size} style={{ overflow: "visible", display: "block" }}>
            <path d={trimmed} fill="none" stroke={accent} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
    }
  }

  if (icon && icon.trim()) {
    // Stock Antidote Motif renders inside a 520×520 stage centered at (x, y).
    const motifScale = size / 520;
    const spec = {
      type: icon.trim(),
      x: 260,
      y: 260,
      scale: 1,
      enter: "none",
      at: 0,
      color: accent,
      color2: ink,
    } as unknown as PropSpec;
    return (
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          overflow: "hidden",
          flexShrink: 0,
          ...style,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 520,
            height: 520,
            transform: `scale(${motifScale.toFixed(4)})`,
            transformOrigin: "top left",
          }}
        >
          <Motif spec={spec} accent={accent} ink={ink} />
        </div>
      </div>
    );
  }

  return null;
};
