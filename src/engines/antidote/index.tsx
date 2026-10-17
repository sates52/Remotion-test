import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Scene } from "./components/Scene";
import { RelationshipHold, HOLD_FRAMES } from "./components/RelationshipStage";
import { CaptionLayer } from "./components/CaptionLayer";
import { AudioEngine } from "./components/AudioEngine";
import { RetentionHUD } from "./components/RetentionHUD";
import { antidoteBookSchema, DEFAULT_TRANSITION, type AntidoteConfig } from "./schema";

export { antidoteBookSchema };
export type { AntidoteConfig };
export { AntidoteThumbnail, antidoteThumbPropsSchema } from "./Thumbnail";
export type { AntidoteThumbProps } from "./Thumbnail";

/**
 * AntidoteBook — the Antidote engine's renderer. Data-driven: it takes a scene
 * JSON (books/<slug>/config.antidote.json) and lays every scene onto the
 * timeline as a <Sequence>, with the narration audio playing across the whole
 * composition. No per-video code — a new book is a new JSON.
 */
export const AntidoteBook: React.FC<{ config: AntidoteConfig }> = ({ config }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0b" }}>
      {config.meta.audio ? <Audio src={staticFile(config.meta.audio)} /> : null}
      {config.scenes.map((scene, i) => {
        // NOTE: Remotion hands `defaultProps` to the renderer as-is — it does NOT
        // run them through the zod schema — so fields added after a config was
        // written are genuinely undefined here. Every read of a post-shot-grammar
        // field must therefore carry its own runtime default.
        const transition = scene.transition ?? DEFAULT_TRANSITION;
        // Mount each scene `transition.frames` EARLY so the outgoing scene is
        // still on screen while the incoming one wipes/whips/irises in. The
        // scene compensates internally (transIn) so callouts stay on narration.
        // EXPERIMENT: a scene that follows a relationship-staged scene enters on a hard cut, so its
        // transition never draws over the staged scene's narration-locked ending (only when staging exists).
        const afterStaged = i > 0 && !!(config.scenes[i - 1] as { relationshipStaging?: unknown }).relationshipStaging;
        const transIn = i === 0 || transition.type === "cut" || afterStaged ? 0 : Math.min(transition.frames, Math.max(0, scene.fromFrame));
        return (
          <Sequence
            key={scene.id}
            from={scene.fromFrame - transIn}
            durationInFrames={scene.durationFrames + transIn}
            name={scene.id}
          >
            <Scene scene={afterStaged ? { ...scene, transition: { ...transition, type: "cut" as const, frames: 0 } } : scene} transIn={transIn} cast={config.meta.cast} multiplane={config.meta.multiplane} />
          </Sequence>
        );
      })}
      {/* EXPERIMENT: hold the staged announcement panel and LIE mark briefly into the next scene (no timing or audio change). */}
      {config.scenes.map((scene) => {
        const st = (scene as { relationshipStaging?: Parameters<typeof RelationshipHold>[0]["spec"] }).relationshipStaging;
        if (!st) return null;
        return (
          <Sequence key={`hold-${scene.id}`} from={scene.fromFrame + scene.durationFrames} durationInFrames={HOLD_FRAMES} name={`hold-${scene.id}`}>
            <RelationshipHold spec={st} />
          </Sequence>
        );
      })}
      {/* Subtitles sit above every scene, on the absolute timeline, in the reserved bottom band. */}
      <CaptionLayer captions={config.captions} />
      {/* Top safe-zone retention HUD: timeline progress & insight trackers */}
      {config.meta.hud?.enabled !== false && <RetentionHUD config={config} />}
      {/* Frame-accurate sound design (transitions, ticks, chapter hits) */}
      <AudioEngine config={config} />
    </AbsoluteFill>
  );
};
