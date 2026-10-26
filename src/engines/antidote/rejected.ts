/**
 * rejected.ts — the timing of a REJECTED claim (10x pilot C, 2026-10-26). Pure, so node can test it;
 * components/RejectedMark.tsx draws it.
 *
 * Blind viewers read a struck-through phrase both ways ("NOT HEARTBROKEN" -> "he IS heartbroken"; a struck
 * "COMPLETELY USELESS" -> "it is NOT useless"): 41 of 299 WRONG reads across 31 books had a strike on screen.
 * A rejected beat instead SHOWS the claim as a picture, and on the narrator's cue the whole picture drains to grey
 * while a big red ✗ is drawn across it. The truth then arrives in colour on its own beat. Polarity is carried by
 * order and colour (the last full-colour picture is the truth), never by a stroke through words.
 *
 * `local` = frames since the cue (negative before it).
 */
export const REJECT_DRAIN = 10; // frames for the picture to go grey
export const REJECT_STROKE = 9; // frames per arm of the ✗

const ramp = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a)));

/** CSS filter of the claim's picture: full colour before the cue, grey and slightly faded after it */
export function rejectedFilter(local: number): string {
  const g = ramp(local, 0, REJECT_DRAIN);
  return `grayscale(${g.toFixed(3)}) contrast(${(1 - 0.25 * g).toFixed(3)}) brightness(${(1 + 0.08 * g).toFixed(3)})`;
}

/** 0..1 draw progress of the two arms of the ✗ (the second starts when the first is done) */
export function rejectedStrokes(local: number): [number, number] {
  return [ramp(local, 2, 2 + REJECT_STROKE), ramp(local, 4 + REJECT_STROKE, 4 + 2 * REJECT_STROKE)];
}
