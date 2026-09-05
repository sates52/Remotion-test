import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { INK, RED, PAPER, HEADLINE, SERIF } from "./palette";
import { MarkerUnderline } from "./shared";

/**
 * infographics.tsx — Gerçek Veri Gazeteciliği ve İnfografikler (Data Journalism)
 *
 * Vox'un "veriyle anlatma" gücü:
 * - ScaleMatrix: Sayıyı soyut bırakmayıp ölçek matrisiyle gösterme (100 noktadan 65'i)
 * - ComparativeBarChart: İki veya üç verinin canlı sayaçlarla yarıştığı bar grafik
 * - BalanceScale: İki kavramın ağırlığını kıyaslayan dinamik terazi
 * - NetworkGraph: Karakterler ve kavramlar arası kırmızı bağlantı ağı (conspiracy board)
 */

// ── 1. ÖLÇEK MATRİSİ (SCALE MATRIX / PICTOGRAM GRID) ──────────────────────

export const ScaleMatrix: React.FC<{
  total?: number; // Genellikle 100 (yüzde için)
  highlightedCount: number;
  label: string;
  startFrame: number;
  unitLabel?: string;
}> = ({ total = 100, highlightedCount, label, startFrame, unitLabel = "%" }) => {
  const frame = useCurrentFrame();
  const cols = 10;

  // Sayacın 0'dan hedefe akması
  const counter = Math.round(
    interpolate(frame, [startFrame, startFrame + 30], [0, highlightedCount], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, zIndex: 12 }}>
      {/* Büyük Sayı ve Açıklama */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontFamily: HEADLINE, fontWeight: 900, fontSize: 130, color: RED, lineHeight: 0.9 }}>
          {counter}
        </span>
        <span style={{ fontFamily: HEADLINE, fontWeight: 900, fontSize: 70, color: INK }}>
          {unitLabel}
        </span>
      </div>

      <div style={{ fontFamily: HEADLINE, fontWeight: 900, fontSize: 40, color: INK, textTransform: "uppercase", letterSpacing: 2 }}>
        {label}
      </div>
      <MarkerUnderline startFrame={startFrame + 12} width={380} height={14} />

      {/* 10x10 Nokta Matrisi */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: "12px 14px",
          background: "rgba(0,0,0,0.04)",
          padding: "24px 28px",
          borderRadius: 8,
          border: `2px solid rgba(26,26,26,0.12)`,
        }}
      >
        {Array.from({ length: total }).map((_, i) => {
          const isTarget = i < highlightedCount;
          const popFrame = startFrame + Math.floor((i / total) * 28);
          const pop = interpolate(frame, [popFrame, popFrame + 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: isTarget && i < counter ? RED : "rgba(26,26,26,0.2)",
                transform: `scale(${isTarget && i < counter ? 0.8 + pop * 0.4 : 0.8})`,
                boxShadow: isTarget && i < counter ? `0 0 6px rgba(224,67,41,0.6)` : "none",
                transition: "background-color 0.15s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// ── 2. KARŞILAŞTIRMALI BAR GRAFİK (COMPARATIVE BAR CHART) ──────────────────

export const ComparativeBarChart: React.FC<{
  bars: { label: string; value: number; displayValue: string; color?: string }[];
  startFrame: number;
  width?: number;
}> = ({ bars, startFrame, width = 880 }) => {
  const frame = useCurrentFrame();
  const maxVal = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 28,
        width,
        background: "rgba(255,255,255,0.45)",
        padding: "36px 44px",
        borderRadius: 6,
        border: `3px solid ${INK}`,
        boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
        zIndex: 12,
      }}
    >
      {bars.map((b, i) => {
        const barStart = startFrame + i * 10;
        const p = interpolate(frame, [barStart, barStart + 22], [0, b.value / maxVal], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });

        const op = interpolate(frame, [barStart, barStart + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const barColor = b.color || (i === 0 ? RED : INK);

        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, opacity: op }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: HEADLINE, fontWeight: 900, fontSize: 32, color: INK, textTransform: "uppercase" }}>
                {b.label}
              </span>
              <span style={{ fontFamily: HEADLINE, fontWeight: 900, fontSize: 42, color: barColor }}>
                {b.displayValue}
              </span>
            </div>

            {/* İlerleme Çubuğu */}
            <div style={{ width: "100%", height: 38, background: "rgba(0,0,0,0.08)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  width: `${p * 100}%`,
                  height: "100%",
                  background: barColor,
                  borderRadius: 4,
                  boxShadow: `4px 0 0 ${INK}`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── 3. DİNAMİK KIYASLAMA TERAZİSİ (BALANCE SCALE) ──────────────────────────

export const BalanceScale: React.FC<{
  leftLabel: string;
  rightLabel: string;
  tiltSide?: "left" | "right" | "equal";
  startFrame: number;
}> = ({ leftLabel, rightLabel, tiltSide = "left", startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const targetAngle = tiltSide === "left" ? -14 : tiltSide === "right" ? 14 : 0;
  const s = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 10, mass: 0.9, stiffness: 100 },
    durationInFrames: 32,
  });

  const angle = interpolate(s, [0, 1], [0, targetAngle]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 900, zIndex: 12 }}>
      <svg width={800} height={420} viewBox="0 0 800 420" style={{ overflow: "visible" }}>
        {/* Terazi Ana Gövdesi (Center Stand) */}
        <line x1={400} y1={60} x2={400} y2={360} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <polygon points="340,360 460,360 400,310" fill={INK} />

        {/* Eğimli Dönen Üst Kol (Balance Beam) */}
        <g transform={`translate(400, 80) rotate(${angle})`}>
          <line x1={-300} y1={0} x2={300} y2={0} stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <circle cx={0} cy={0} r={14} fill={RED} stroke={INK} strokeWidth={4} />

          {/* Sol Kefe İpleri ve Tabağı */}
          <g transform="translate(-280, 0)">
            <line x1={0} y1={0} x2={-45} y2={120} stroke={INK} strokeWidth={2.5} strokeDasharray="4 3" />
            <line x1={0} y1={0} x2={45} y2={120} stroke={INK} strokeWidth={2.5} strokeDasharray="4 3" />
            <path d="M -70,120 Q 0,155 70,120 Z" fill={tiltSide === "left" ? RED : "#C5C2B8"} stroke={INK} strokeWidth={4} />
          </g>

          {/* Sağ Kefe İpleri ve Tabağı */}
          <g transform="translate(280, 0)">
            <line x1={0} y1={0} x2={-45} y2={120} stroke={INK} strokeWidth={2.5} strokeDasharray="4 3" />
            <line x1={0} y1={0} x2={45} y2={120} stroke={INK} strokeWidth={2.5} strokeDasharray="4 3" />
            <path d="M -70,120 Q 0,155 70,120 Z" fill={tiltSide === "right" ? RED : "#C5C2B8"} stroke={INK} strokeWidth={4} />
          </g>
        </g>
      </svg>

      {/* Alt Etiketler */}
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: -30 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 340 }}>
          <span style={{ fontFamily: HEADLINE, fontWeight: 900, fontSize: 38, color: tiltSide === "left" ? RED : INK, textAlign: "center", textTransform: "uppercase" }}>
            {leftLabel}
          </span>
          {tiltSide === "left" ? <MarkerUnderline startFrame={startFrame + 14} width={220} height={12} /> : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 340 }}>
          <span style={{ fontFamily: HEADLINE, fontWeight: 900, fontSize: 38, color: tiltSide === "right" ? RED : INK, textAlign: "center", textTransform: "uppercase" }}>
            {rightLabel}
          </span>
          {tiltSide === "right" ? <MarkerUnderline startFrame={startFrame + 14} width={220} height={12} /> : null}
        </div>
      </div>
    </div>
  );
};

// ── 4. BAĞLANTI AĞI (CONSPIRACY / EVIDENCE NETWORK GRAPH) ─────────────────

export const NetworkGraph: React.FC<{
  nodes: { id: string; label: string; sub?: string; x: number; y: number }[];
  links: { from: string; to: string; label?: string }[];
  startFrame: number;
}> = ({ nodes, links, startFrame }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ position: "relative", width: 1100, height: 620, zIndex: 12 }}>
      <svg width={1100} height={620} style={{ position: "absolute", inset: 0 }}>
        {/* Kırmızı Yün İpler (Connecting Strings) */}
        {links.map((lnk, i) => {
          const n1 = nodes.find((n) => n.id === lnk.from);
          const n2 = nodes.find((n) => n.id === lnk.to);
          if (!n1 || !n2) return null;

          const linkStart = startFrame + i * 8 + 6;
          const p = interpolate(frame, [linkStart, linkStart + 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });

          const len = Math.hypot(n2.x - n1.x, n2.y - n1.y);

          return (
            <g key={i}>
              <line
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke={RED}
                strokeWidth={3.5}
                strokeDasharray={len}
                strokeDashoffset={len * (1 - p)}
                strokeLinecap="round"
                opacity={0.88}
              />
              {lnk.label && p > 0.8 ? (
                <g transform={`translate(${(n1.x + n2.x) / 2}, ${(n1.y + n2.y) / 2 - 12})`}>
                  <rect x={-50} y={-14} width={100} height={24} fill={PAPER} stroke={INK} strokeWidth={1.5} rx={3} />
                  <text x={0} y={3} fill={RED} fontFamily={HEADLINE} fontWeight={900} fontSize={12} textAnchor="middle">
                    {lnk.label.toUpperCase()}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Düğümler (Pin & Photo Cards) */}
      {nodes.map((node, i) => {
        const nodeStart = startFrame + i * 5;
        const op = interpolate(frame, [nodeStart, nodeStart + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.x,
              top: node.y,
              transform: "translate(-50%, -50%)",
              opacity: op,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            {/* Kırmızı Harita İğnesi */}
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: RED, border: `3px solid ${INK}`, boxShadow: "0 2px 5px rgba(0,0,0,0.4)" }} />

            {/* Düğüm Kartı */}
            <div style={{ background: "#F6F4ED", border: `2px solid ${INK}`, padding: "8px 16px", borderRadius: 4, boxShadow: "0 6px 14px rgba(0,0,0,0.18)", minWidth: 120, textAlign: "center" }}>
              <div style={{ fontFamily: HEADLINE, fontWeight: 900, fontSize: 18, color: INK, textTransform: "uppercase" }}>
                {node.label}
              </div>
              {node.sub ? (
                <div style={{ fontFamily: SERIF, fontSize: 13, color: RED, fontStyle: "italic", fontWeight: 700 }}>
                  {node.sub}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
