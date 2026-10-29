// Motive 1.0 (2026-10-29): pure geometry of the thought bubble (components/ThoughtBubble.tsx draws it). No React, so
// node tests can require it.

export const BUBBLE_R = 128; // bubble radius in stage px at k = 1 (the figure's scale, clamped)
const TOP_SAFE = 40, SIDE_SAFE = 40;
// the drawn cloud reaches past r: its lobes (ThoughtBubble.tsx) span x +-1.24 r, y -1.18 r .. +1.10 r
export const CLOUD = { side: 1.24, top: 1.18, bottom: 1.1 };

export type Box = { left: number; right: number; top: number; bottom: number };
// a callout's box on the stage (centre x/y, font size): KineticText wraps near 1000 px, ~0.62 em per character
// (DEV hate-u-give 20: "THE ANGRY BLACK GIRL TROPE" broke into two lines and the second covered the bubble)
export function textBox(t: { x: number; y: number; size: number; text?: string }): Box {
  const full = String(t.text || "").length * t.size * 0.62;
  const w = Math.min(1000, full), lines = Math.max(1, Math.ceil(full / 1000));
  // + the padding of a boxed / highlighted callout (DEV 19: a "box" label grazed the bubble)
  const pad = t.size * 0.35;
  return { left: t.x - w / 2 - pad, right: t.x + w / 2 + pad, top: t.y - t.size * 0.7 - pad, bottom: t.y - t.size * 0.7 + lines * t.size * 1.15 + pad };
}

export function cloudBox(cx: number, cy: number, r: number): Box {
  return { left: cx - CLOUD.side * r, right: cx + CLOUD.side * r, top: cy - CLOUD.top * r, bottom: cy + CLOUD.bottom * r };
}

export function thoughtLayout(head: { x: number; y: number }, scale: number, faceRight: boolean, avoid: Box[] = []) {
  const k = Math.max(0.62, Math.min(1.05, scale));
  const r = BUBBLE_R * k;
  // the bubble floats up and to the side the person faces (toward the frame), clear of the head
  const side = faceRight ? 1 : -1;
  const headR = 125 * scale; // the drawn head (rig radius ~120) at the figure's scale
  const xFit = (x: number) => Math.max(SIDE_SAFE + r * CLOUD.side, Math.min(1920 - SIDE_SAFE - r * CLOUD.side, x));
  let cx = xFit(head.x + side * 250 * k), cy = Math.max(TOP_SAFE + r * CLOUD.top, head.y - 230 * k);
  // never under a callout: drop below any box the cloud would overlap
  const hits = (b: Box) => { const c = cloudBox(cx, cy, r); return c.right > b.left && c.left < b.right && c.top < b.bottom && c.bottom > b.top; };
  for (const b of avoid) if (hits(b)) cy = Math.max(cy, b.bottom + r * CLOUD.top + 6);
  // no room above (a close-up near the top edge, or pushed down by a callout): the bubble moves SIDEWAYS until it
  // clears the face — to the other side when this one is too narrow
  if (cy + r * CLOUD.bottom > head.y - headR) {
    const need = r * CLOUD.side + headR + 10;
    const at = (sd: number) => xFit(head.x + sd * need);
    cx = Math.abs(at(side) - head.x) >= need - 1 ? at(side) : at(-side);
  }
  const sideNow = cx >= head.x ? 1 : -1;
  // three trailing dots from the head to the bubble, small to large
  const from = { x: head.x + sideNow * 70 * k, y: head.y - 95 * k };
  const dots = [0.22, 0.45, 0.68].map((t, i) => ({ x: from.x + (cx - from.x) * t * 0.85, y: from.y + (cy - from.y) * t * 0.85, r: (7 + i * 6) * k }));
  return { cx, cy, r, k, dots };
}
