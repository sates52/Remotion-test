import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { BOOK_BG_TINT } from "../../books.generated";
import type { VoxConfig } from "./schema";
import { PAPER, resolvePalette, resolveCaptionHighlight } from "./palette";
import { PaperBackground, FloatingSpecks, Grain, Vignette, PlaceImage, placeRuns } from "./backgrounds";
import { SCENES, StatementScene } from "./scenes";
import { CaptionLayer } from "./captions";
import { ChapterOverlay, ProgressRail, formChapters } from "./overlays";
import { SfxLayer } from "./sfx";
import { ForegroundOcclusion } from "./desk";
import { CardHandContext, cardHandOf } from "./cardHand";
import { ProducerNote, variantOf } from "../../components/ProducerNote";
import { ArtContext, CINEMA_SCENES, CinemaCaptions } from "./cinema";

export { voxBookSchema } from "./schema";
export { VoxThumbnail, thumbnailSchema } from "./thumbnail";
export * from "./documents";
export * from "./desk";
export * from "./cartography";
export * from "./infographics";
export * from "./scenes-journalism";

export const VoxBook: React.FC<{ config: VoxConfig }> = ({ config }) => {
  const pal = resolvePalette(config.meta.slug);
  const captionHighlight = resolveCaptionHighlight(pal);
  // the film follows what the hosts announced (meta.form, ≥ 3 parts); otherwise the planner's chapters, as before
  // the book's art direction (cinema pilot 2026-11-24): its own pictures fill the frame, none of the channel's furniture
  const art = config.meta.artDirection;
  const parts = formChapters(config.meta.form), chapters = parts || config.chapters;
  const paletteVars = {
    "--vox-paper": pal.paper,
    "--vox-ink": pal.ink,
    "--vox-red": pal.red,
    "--vox-gold": pal.gold,
    "--vox-caption-highlight": captionHighlight,
  } as React.CSSProperties;
  return (
  <CardHandContext.Provider value={cardHandOf(config.meta.skin)}>
  <ArtContext.Provider value={art || { paper: pal.paper, ink: pal.ink, accent: pal.red }}>
  <AbsoluteFill style={{ ...paletteVars, backgroundColor: art ? art.ink : PAPER }}>
    <Audio src={staticFile(config.meta.audio)} />
    <SfxLayer beats={config.beats} enabled={config.meta.sfx === true} />
    {art ? null : <PaperBackground tint={BOOK_BG_TINT[config.meta.slug ?? ""] ?? false} />}
    {/* the book's own places (meta.places): the film stands where the book is, not on the channel's paper */}
    {config.meta.places && Object.keys(config.meta.places).length
      ? placeRuns(config.beats, config.meta.places, config.meta.home).map((r) => (
          <Sequence key={`place-${r.from}`} from={r.from} durationInFrames={r.frames} name={`place · ${r.id}`}>
            <PlaceImage asset={r.asset} paper={pal.paper} />
          </Sequence>
        ))
      : null}
    {art ? null : <FloatingSpecks />}
    {config.beats.map((beat) => {
      const S = (art && CINEMA_SCENES[beat.type]) || SCENES[beat.type] || StatementScene;
      return (
        <Sequence key={beat.id} from={beat.fromFrame} durationInFrames={beat.durationFrames} name={`${beat.id} · ${beat.type}`}>
          <S beat={beat} />
        </Sequence>
      );
    })}
    <ProducerNote note={config.meta.take?.note} accent={pal.red} variant={variantOf(config.meta.skin)} />
    {art ? <CinemaCaptions captions={config.captions} /> : <CaptionLayer captions={config.captions} skin={config.meta.skin} />}
    <ChapterOverlay chapters={chapters} word={parts && config.meta.form ? config.meta.form.part : undefined} />
    {config.meta.progress === false || art ? null : (
      <ProgressRail chapters={chapters} total={config.beats.reduce((m, b) => Math.max(m, b.fromFrame + b.durationFrames), 0)} />
    )}
    {art ? null : <ForegroundOcclusion showLampGlow={true} />}
    <Vignette />
    <Grain />
  </AbsoluteFill>
  </ArtContext.Provider>
  </CardHandContext.Provider>
  );
};
