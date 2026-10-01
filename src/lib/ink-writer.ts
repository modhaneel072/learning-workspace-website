import { EM, bezierPoint, type InkGlyph, type InkStroke, type Segment } from "./ink";

type Vec = [number, number];

type InkItem = {
  kind: "ink";
  path: SVGPathElement;
  stroke: InkStroke;
  segLengths: number[];
  dash: number;
  toLine: (p: readonly [number, number]) => Vec;
  start: number;
  cost: number;
};

type MoveItem = { kind: "move"; from: Vec; to: Vec; start: number; cost: number };

export type Writer = {
  /** Total "pen distance" in glyph units, including pen-up travel. */
  total: number;
  /** Draw the line up to pen distance `t`. */
  render: (t: number) => void;
  /** Pen tip in work-area design units at pen distance `t`. */
  tipAt: (t: number) => Vec;
};

const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const dist = (a: Vec, b: Vec) => Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2);

function segLength(seg: Segment): number {
  let total = 0;
  let prev = bezierPoint(seg, 0);
  const steps = seg.length === 2 ? 1 : 10;
  for (let i = 1; i <= steps; i++) {
    const p = bezierPoint(seg, i / steps);
    total += Math.sqrt((p[0] - prev[0]) ** 2 + (p[1] - prev[1]) ** 2);
    prev = p;
  }
  return total;
}

/**
 * Animates an <Ink> group stroke by stroke with dash offsets, following the
 * film's pen model: strokes cost their length, pen-up travel costs a little.
 */
export function createWriter(
  group: SVGGElement,
  glyphs: InkGlyph[],
  origin: { x: number; y: number; size: number },
): Writer {
  const k = origin.size / EM;
  const paths = Array.from(group.querySelectorAll("path"));
  const items: (InkItem | MoveItem)[] = [];
  let total = 0;
  let last: Vec | null = null;
  let pathIndex = 0;

  for (const glyph of glyphs) {
    const rad = (glyph.rot * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const toLine = (p: readonly [number, number]): Vec => [glyph.tx + p[0] * cos - p[1] * sin, glyph.ty + p[0] * sin + p[1] * cos];
    for (const stroke of glyph.strokes) {
      const path = paths[pathIndex++];
      if (!path || stroke.segments.length === 0) continue;
      const first = toLine(stroke.segments[0][0]);
      if (last) {
        const cost = Math.max(2.2, dist(last, first) * 0.32);
        items.push({ kind: "move", from: last, to: first, start: total, cost });
        total += cost;
      }
      const segLengths = stroke.segments.map(segLength);
      const length = segLengths.reduce((a, b) => a + b, 0);
      const dash = length + 1;
      path.style.strokeDasharray = `${dash} ${dash + 2}`;
      items.push({ kind: "ink", path, stroke, segLengths, dash, toLine, start: total, cost: Math.max(0.5, length) });
      total += Math.max(0.5, length);
      const lastSeg = stroke.segments[stroke.segments.length - 1];
      last = toLine(lastSeg[lastSeg.length - 1]);
    }
  }

  let rendered = -1;
  const render = (t: number) => {
    if (t === rendered) return;
    rendered = t;
    for (const item of items) {
      if (item.kind !== "ink") continue;
      const f = clamp01((t - item.start) / item.cost);
      if (f <= 0) {
        item.path.style.opacity = "0";
        item.path.style.strokeDashoffset = `${item.dash + 1}`;
      } else {
        item.path.style.opacity = "1";
        item.path.style.strokeDashoffset = `${item.dash * (1 - f)}`;
      }
    }
  };

  const toDesign = (p: Vec): Vec => [origin.x + p[0] * k, origin.y + p[1] * k];

  const tipAt = (t: number): Vec => {
    if (items.length === 0) return [origin.x, origin.y];
    const first = items[0];
    if (t <= 0) return toDesign(first.kind === "move" ? first.from : first.toLine(first.stroke.segments[0][0]));
    for (const item of items) {
      if (t > item.start + item.cost) continue;
      const f = clamp01((t - item.start) / item.cost);
      if (item.kind === "move") {
        const a = smooth(f);
        return toDesign([item.from[0] + (item.to[0] - item.from[0]) * a, item.from[1] + (item.to[1] - item.from[1]) * a]);
      }
      let along = f * item.segLengths.reduce((a, b) => a + b, 0);
      for (let i = 0; i < item.stroke.segments.length; i++) {
        const len = item.segLengths[i];
        if (along <= len || i === item.stroke.segments.length - 1) {
          return toDesign(item.toLine(bezierPoint(item.stroke.segments[i], len > 0 ? clamp01(along / len) : 1)));
        }
        along -= len;
      }
    }
    const end = items[items.length - 1];
    if (end.kind === "move") return toDesign(end.to);
    const seg = end.stroke.segments[end.stroke.segments.length - 1];
    return toDesign(end.toLine(seg[seg.length - 1]));
  };

  return { total, render, tipAt };
}
