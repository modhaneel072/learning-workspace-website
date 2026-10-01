/**
 * Single-stroke handwriting, ported from the Learning Workspace product film.
 *
 * Glyphs are polylines in a 35-unit em (y grows downward, 0 = top, ~34 = baseline).
 * Each stroke is smoothed with the film's Hermite tangents and emitted as exact
 * cubic Bézier SVG path data. Jitter uses an integer hash instead of Math.sin,
 * so server and browser produce byte-identical markup.
 */

type Point = readonly [number, number];
type Polyline = readonly Point[];

export const EM = 35;

const BASE: Record<string, Polyline[]> = {
  "0": [[[14, 0], [5, 2], [1, 12], [2, 27], [8, 34], [17, 32], [22, 23], [22, 9], [17, 1], [14, 0]]],
  "1": [[[4, 8], [13, 0], [13, 34]], [[5, 34], [22, 34]]],
  "2": [[[1, 7], [6, 1], [15, 0], [22, 5], [22, 12], [17, 19], [2, 33], [24, 33]]],
  "3": [[[2, 3], [10, 0], [19, 2], [23, 7], [19, 13], [11, 17], [18, 18], [23, 24], [21, 31], [14, 35], [5, 33], [1, 28]]],
  "4": [[[19, 0], [2, 23], [25, 23]], [[19, 0], [19, 35]]],
  "5": [[[23, 1], [4, 1], [3, 16], [12, 14], [21, 18], [23, 25], [19, 33], [11, 35], [2, 31]]],
  "6": [[[21, 1], [12, 3], [5, 11], [1, 24], [4, 32], [12, 35], [21, 30], [22, 22], [16, 17], [8, 18], [2, 25]]],
  "7": [[[1, 1], [25, 1], [9, 34]]],
  "8": [[[12, 17], [3, 11], [3, 4], [11, 0], [20, 3], [22, 9], [12, 17], [3, 23], [2, 29], [10, 35], [19, 32], [23, 25], [12, 17]]],
  "9": [[[22, 15], [16, 20], [7, 19], [2, 12], [4, 4], [12, 0], [20, 3], [23, 11], [21, 26], [15, 33], [6, 35]]],
  x: [[[2, 9], [24, 33]], [[23, 8], [1, 34]]],
  "+": [[[13, 7], [13, 29]], [[2, 18], [25, 18]]],
  "/": [[[22, 0], [2, 35]]],
  u: [[[2, 10], [2, 26], [7, 33], [15, 31], [22, 22]], [[22, 10], [22, 34]]],
  v: [[[1, 10], [12, 34], [24, 9]]],
  "-": [[[2, 18], [25, 18]]],
  "=": [[[2, 12], [25, 12]], [[2, 24], [25, 24]]],
  "(": [[[17, -3], [8, 4], [3, 16], [5, 29], [17, 39]]],
  ")": [[[5, -3], [14, 4], [19, 16], [17, 29], [5, 39]]],
  s: [[[22, 11], [15, 7], [7, 9], [3, 14], [8, 18], [19, 22], [22, 27], [17, 33], [8, 34], [2, 29]]],
  i: [[[11, 12], [10, 33]], [[11, 3], [11, 4]]],
  n: [[[3, 11], [3, 34]], [[3, 18], [10, 10], [17, 10], [22, 16], [22, 34]]],
  c: [[[23, 11], [15, 8], [7, 11], [3, 19], [4, 28], [11, 34], [22, 31]]],
  o: [[[13, 9], [5, 13], [2, 23], [7, 32], [17, 33], [23, 25], [21, 15], [13, 9]]],
  d: [[[21, -2], [21, 34]], [[20, 13], [12, 9], [4, 14], [2, 25], [8, 33], [16, 31], [21, 24]]],
  C: [[[25, 4], [17, 0], [7, 3], [2, 13], [2, 25], [9, 34], [18, 35], [25, 29]]],
  "∫": [[[25, -9], [18, -12], [12, -8], [10, 1], [10, 29], [8, 42], [3, 46], [-3, 43]]],
  "|": [[[12, 0], [12, 35]]],
  m: [[[2, 10], [2, 34]], [[2, 17], [8, 10], [13, 14], [13, 34]], [[13, 18], [20, 10], [25, 14], [25, 34]]],
  ".": [[[12, 32], [12, 33]]],
  a: [[[21, 15], [15, 10], [7, 11], [2, 20], [5, 31], [13, 32], [21, 24]], [[21, 10], [21, 33]]],
  r: [[[3, 11], [3, 34]], [[3, 19], [9, 11], [16, 9], [23, 12]]],
  // Glyphs the film added on top of its base set.
  I: [[[2, 0], [25, 0]], [[14, 0], [14, 34]], [[2, 34], [25, 34]]],
  f: [[[24, 1], [19, -2], [13, 2], [11, 11], [9, 34], [6, 39], [2, 37]], [[3, 13], [23, 13]]],
  "×": [[[3, 10], [23, 31]], [[23, 10], [3, 31]]],
  "−": [[[2, 18], [25, 18]]],
  y: [[[2, 10], [11, 28], [22, 10]], [[22, 10], [10, 37], [4, 42], [0, 40]]],
  t: [[[13, 0], [11, 28], [14, 34], [22, 31]], [[3, 11], [23, 11]]],
  e: [[[3, 20], [21, 19], [21, 13], [15, 9], [7, 11], [2, 20], [5, 30], [14, 34], [23, 30]]],
  z: [[[3, 11], [24, 11], [2, 33], [25, 33]]],
  ",": [[[12, 31], [10, 39]]],
  "?": [[[2, 7], [8, 0], [18, 1], [23, 8], [19, 15], [12, 20], [12, 25]], [[12, 33], [12.1, 33.2]]],
};

const ANGULAR = new Set(["1", "4", "7", "x", "×", "+", "-", "−", "=", "/", "|", "v", "z"]);
const SUPERSCRIPT_DIGITS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const SUP_SCALE = 0.64;
const SUP_RISE = -9;
const TENSION = 0.35;

type Token = { c: string; sup: boolean };

function tokenize(text: string): Token[] {
  const chars = Array.from(text);
  const out: Token[] = [];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === "^" && i + 1 < chars.length) {
      if (chars[i + 1] === "{") {
        i += 2;
        while (i < chars.length && chars[i] !== "}") out.push({ c: chars[i++], sup: true });
      } else {
        out.push({ c: chars[++i], sup: true });
      }
    } else if (SUPERSCRIPT_DIGITS.includes(c)) {
      out.push({ c: String(SUPERSCRIPT_DIGITS.indexOf(c)), sup: true });
    } else {
      out.push({ c, sup: false });
    }
  }
  return out;
}

function advance(c: string): number {
  if (c === " ") return 15;
  if ([".", ",", "|", "i", "l"].includes(c)) return 19;
  if (["(", ")"].includes(c)) return 24;
  if (c === "∫") return 27;
  return 31.5;
}

/** Deterministic hash noise in [0, 1). Integer-only, identical on every engine. */
function noise(a: number, b: number, c: number, d: number): number {
  let h = 2166136261 ^ a;
  h = Math.imul(h ^ b, 16777619);
  h = Math.imul(h ^ c, 16777619);
  h = Math.imul(h ^ d, 16777619);
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

const fmt = (n: number) => {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
};

/** A drawable segment in glyph-local coordinates: a line (2 pts) or cubic (4 pts). */
export type Segment = readonly Point[];

export type InkStroke = {
  d: string;
  segments: Segment[];
  /** Approximate arc length in glyph-local units. */
  length: number;
};

export type InkGlyph = {
  char: string;
  sup: boolean;
  /** Index among tokens in the source text (spaces included). */
  index: number;
  tx: number;
  ty: number;
  /** Rotation in degrees. */
  rot: number;
  transform: string;
  strokes: InkStroke[];
  /** Horizontal extent in line units (before the line's size scale). */
  x0: number;
  x1: number;
};

export type InkLayout = {
  glyphs: InkGlyph[];
  width: number;
};

function segLength(seg: Segment): number {
  const len = (a: Point, b: Point) => Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2);
  if (seg.length === 2) return len(seg[0], seg[1]);
  let total = 0;
  let prev = seg[0];
  for (let i = 1; i <= 12; i++) {
    const p = bezierPoint(seg, i / 12);
    total += len(prev, p);
    prev = p;
  }
  return total;
}

export function bezierPoint(seg: Segment, t: number): Point {
  if (seg.length === 2) {
    return [seg[0][0] + (seg[1][0] - seg[0][0]) * t, seg[0][1] + (seg[1][1] - seg[0][1]) * t];
  }
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [
    a * seg[0][0] + b * seg[1][0] + c * seg[2][0] + d * seg[3][0],
    a * seg[0][1] + b * seg[1][1] + c * seg[2][1] + d * seg[3][1],
  ];
}

function buildStroke(raw: Polyline, scale: number, straight: boolean): InkStroke {
  const pts = raw.map(([x, y]) => [x * scale, y * scale] as const);
  const segments: Segment[] = [];
  if (pts.length < 2) return { d: "", segments, length: 0 };
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i], p2 = pts[i + 1];
    if (straight) {
      segments.push([p1, p2]);
      continue;
    }
    // Same Hermite tangents the film used, expressed as Bézier control points.
    const p0 = pts[Math.max(0, i - 1)];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1: Point = [p1[0] + (TENSION * (p2[0] - p0[0])) / 3, p1[1] + (TENSION * (p2[1] - p0[1])) / 3];
    const c2: Point = [p2[0] - (TENSION * (p3[0] - p1[0])) / 3, p2[1] - (TENSION * (p3[1] - p1[1])) / 3];
    segments.push([p1, c1, c2, p2]);
  }
  let d = `M${fmt(segments[0][0][0])} ${fmt(segments[0][0][1])}`;
  for (const s of segments) {
    d += s.length === 2
      ? `L${fmt(s[1][0])} ${fmt(s[1][1])}`
      : `C${fmt(s[1][0])} ${fmt(s[1][1])} ${fmt(s[2][0])} ${fmt(s[2][1])} ${fmt(s[3][0])} ${fmt(s[3][1])}`;
  }
  const length = segments.reduce((sum, s) => sum + segLength(s), 0);
  return { d, segments, length: Math.max(length, 0.5) };
}

const strokeCache = new Map<string, InkStroke[]>();

function glyphStrokes(c: string, sup: boolean): InkStroke[] {
  const key = `${c}|${sup ? 1 : 0}`;
  const cached = strokeCache.get(key);
  if (cached) return cached;
  const source = BASE[c] ?? BASE["?"];
  const strokes = source.map((p) => buildStroke(p, sup ? SUP_SCALE : 1, ANGULAR.has(c) || p.length === 2));
  strokeCache.set(key, strokes);
  return strokes;
}

/** Lay out a line of handwriting. `^x` / `^{..}` / ² mark superscripts. */
export function layoutInk(text: string, seed = 0): InkLayout {
  const glyphs: InkGlyph[] = [];
  let cursor = 0;
  tokenize(text).forEach(({ c, sup }, index) => {
    const scale = sup ? SUP_SCALE : 1;
    const code = c.codePointAt(0) ?? 0;
    if (c !== " ") {
      const rotRad = (noise(seed, index, code, 1) - 0.5) * 0.023;
      const baseline = (noise(seed, index, code, 2) - 0.5) * 0.75;
      const horizontal = (noise(seed, index, code, 3) - 0.5) * 0.32;
      const tx = Math.round((cursor + horizontal) * 1000) / 1000;
      const ty = Math.round(((sup ? SUP_RISE : 0) + baseline) * 1000) / 1000;
      const rot = Math.round(rotRad * 57.29577951308232 * 1000) / 1000;
      glyphs.push({
        char: c,
        sup,
        index,
        tx,
        ty,
        rot,
        transform: `translate(${fmt(tx)} ${fmt(ty)}) rotate(${rot})`,
        strokes: glyphStrokes(c, sup),
        x0: cursor,
        x1: cursor + advance(c) * scale,
      });
    }
    cursor += advance(c) * scale;
  });
  return { glyphs, width: cursor };
}

/** Width of a line in design units at a given glyph size. */
export function inkWidth(text: string, size: number): number {
  return (layoutInk(text).width * size) / EM;
}

/** Find the n-th glyph (0-based) matching `char` and return its design-unit box. */
export function glyphBox(text: string, char: string, occurrence: number, size: number, seed = 0) {
  const layout = layoutInk(text, seed);
  const hits = layout.glyphs.filter((g) => g.char === char);
  const g = hits[occurrence];
  if (!g) throw new Error(`glyphBox: "${char}" #${occurrence} not found in "${text}"`);
  const k = size / EM;
  return { x0: g.x0 * k, x1: g.x1 * k, glyphIndex: layout.glyphs.indexOf(g) };
}
