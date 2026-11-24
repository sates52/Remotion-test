import React from "react";

/**
 * Antidote 2.0 — Per-Book Art Direction Context & Rich Stage Moods.
 *
 * Breaks the monochrome grey template look that triggered YPP "generic/repetitive content"
 * while keeping every legacy Antidote config (where `artDirection` is absent) 100% unchanged.
 */

export type StageMoodName =
  | "obsidianGrid"
  | "deepViolet"
  | "warmParchment"
  | "crimsonNight"
  | "slateEditorial";

export type ArtPalette = {
  bg: string;
  bgAlt: string;
  surface: string;
  surfaceBorder: string;
  ink: string;
  muted: string;
  accent: string;
  accent2: string;
  danger: string;
  positive: string;
};

export type ArtDirectionConfig = {
  style?: string;
  mood?: StageMoodName;
  palette?: Partial<ArtPalette>;
  fontDisplay?: string;
  fontBody?: string;
  captions?: "off" | "minimal" | "box";
  hud?: "off" | "minimal" | "default";
  motionDoctrine?: boolean;
};

export const STAGE_MOODS: Record<
  StageMoodName,
  {
    background: string;
    gridColor: string;
    gridSize: number;
    gridOpacity: number;
    vignette: string;
    palette: ArtPalette;
  }
> = {
  obsidianGrid: {
    background: "radial-gradient(ellipse at 50% 38%, #1C2029 0%, #101319 65%, #090B0F 100%)",
    gridColor: "rgba(255, 255, 255, 0.08)",
    gridSize: 72,
    gridOpacity: 0.55,
    vignette: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.52) 100%)",
    palette: {
      bg: "#101319",
      bgAlt: "#1B202A",
      surface: "rgba(24, 29, 39, 0.92)",
      surfaceBorder: "rgba(255, 255, 255, 0.14)",
      ink: "#F7F4EC",
      muted: "#A6B0C2",
      accent: "#F7C948",
      accent2: "#56CFE1",
      danger: "#F05D5E",
      positive: "#4ADE80",
    },
  },
  deepViolet: {
    background: "linear-gradient(160deg, #2D1852 0%, #19102E 58%, #0E091B 100%)",
    gridColor: "rgba(232, 213, 255, 0.07)",
    gridSize: 84,
    gridOpacity: 0.4,
    vignette: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(8,4,18,0.56) 100%)",
    palette: {
      bg: "#19102E",
      bgAlt: "#2B194D",
      surface: "rgba(35, 22, 66, 0.9)",
      surfaceBorder: "rgba(216, 180, 254, 0.22)",
      ink: "#FAF6FF",
      muted: "#C4B5FD",
      accent: "#FACC15",
      accent2: "#C084FC",
      danger: "#FB7185",
      positive: "#34D399",
    },
  },
  warmParchment: {
    background: "radial-gradient(ellipse at 50% 40%, #F5EFE2 0%, #E7DEC9 72%, #D8CCB2 100%)",
    gridColor: "rgba(44, 34, 24, 0.07)",
    gridSize: 80,
    gridOpacity: 0.35,
    vignette: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 56%, rgba(42,30,16,0.22) 100%)",
    palette: {
      bg: "#EFE7D6",
      bgAlt: "#E3D8C1",
      surface: "rgba(252, 249, 242, 0.94)",
      surfaceBorder: "rgba(43, 33, 24, 0.18)",
      ink: "#1E1914",
      muted: "#5C5145",
      accent: "#C2410C",
      accent2: "#1D4ED8",
      danger: "#B91C1C",
      positive: "#15803D",
    },
  },
  crimsonNight: {
    background: "radial-gradient(ellipse at 50% 35%, #2E1418 0%, #170B0E 65%, #0B0507 100%)",
    gridColor: "rgba(255, 200, 190, 0.06)",
    gridSize: 76,
    gridOpacity: 0.45,
    vignette: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)",
    palette: {
      bg: "#170B0E",
      bgAlt: "#2B1318",
      surface: "rgba(38, 17, 22, 0.92)",
      surfaceBorder: "rgba(251, 146, 130, 0.22)",
      ink: "#FDF2F0",
      muted: "#D6A8A2",
      accent: "#F59E0B",
      accent2: "#FB7185",
      danger: "#EF4444",
      positive: "#4ADE80",
    },
  },
  slateEditorial: {
    background: "linear-gradient(155deg, #1A2433 0%, #121A26 60%, #0B1018 100%)",
    gridColor: "rgba(186, 214, 247, 0.07)",
    gridSize: 72,
    gridOpacity: 0.5,
    vignette: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 50%, rgba(5,10,18,0.52) 100%)",
    palette: {
      bg: "#121A26",
      bgAlt: "#1D2A3D",
      surface: "rgba(24, 35, 50, 0.92)",
      surfaceBorder: "rgba(148, 183, 224, 0.2)",
      ink: "#F4F7FB",
      muted: "#9FB2C9",
      accent: "#E8A838",
      accent2: "#38BDF8",
      danger: "#F87171",
      positive: "#34D399",
    },
  },
};

export const DEFAULT_DISPLAY_FONT =
  '"Poppins", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
export const DEFAULT_BODY_FONT =
  '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export function resolveArtPalette(ad?: ArtDirectionConfig | null, moodOverride?: StageMoodName): ArtPalette {
  const mood = moodOverride ?? ad?.mood ?? "obsidianGrid";
  const base = STAGE_MOODS[mood]?.palette ?? STAGE_MOODS.obsidianGrid.palette;
  return { ...base, ...(ad?.palette ?? {}) };
}

export function toneColor(
  tone: "neutral" | "accent" | "danger" | "positive" | undefined,
  palette: ArtPalette
): string {
  switch (tone) {
    case "accent":
      return palette.accent;
    case "danger":
      return palette.danger;
    case "positive":
      return palette.positive;
    default:
      return palette.ink;
  }
}

export const ArtDirectionContext = React.createContext<ArtDirectionConfig | null>(null);
export const useArtDirection = () => React.useContext(ArtDirectionContext);
