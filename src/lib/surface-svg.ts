import { AXIS_GLYPHS, LABEL_FONT_UPM, TICK_GLYPHS } from "./label-glyphs";
import { SURFACE_STYLE as S, SURFACE_VIEW, buildScene, type Projected } from "./surface";

const r = (n: number) => Math.round(n * 10) / 10;
const pt = (p: Projected) => `${r(p[0])},${r(p[1])}`;

type Options = {
  /** Larger labels and strokes for phones, where the figure renders at about half size. */
  compact?: boolean;
};

/** Text as Atkinson Hyperlegible Next outlines, so the <img> matches the page typeface. */
function label(
  text: string,
  x: number,
  y: number,
  size: number,
  glyphs: Record<string, { d: string; adv: number }>,
  fill: string,
  anchor: "start" | "middle" | "end" = "start",
) {
  const chars = Array.from(text);
  const k = size / LABEL_FONT_UPM;
  const width = chars.reduce((sum, c) => sum + (glyphs[c]?.adv ?? 0), 0) * k;
  let cursor = x - (anchor === "end" ? width : anchor === "middle" ? width / 2 : 0);
  return chars
    .map((c) => {
      const glyph = glyphs[c];
      if (!glyph) throw new Error(`surface-svg: no outline for "${c}"`);
      const out = `<path transform="translate(${r(cursor)} ${r(y)}) scale(${k})" d="${glyph.d}" fill="${fill}"/>`;
      cursor += glyph.adv * k;
      return out;
    })
    .join("");
}

/** A static, lightweight rendering of the surface for small screens and reduced motion. */
export function renderSurfaceSvg({ compact = false }: Options = {}): string {
  const scene = buildScene(undefined, undefined, 18, 3);
  const z = compact ? 1.75 : 1; // label scale
  const w = compact ? 1.45 : 1; // stroke scale
  const out: string[] = [];
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SURFACE_VIEW.width} ${SURFACE_VIEW.height}" width="${SURFACE_VIEW.width}" height="${SURFACE_VIEW.height}">`,
  );

  // The base grid and the axes in the z = 0 plane sit behind the surface.
  out.push(`<g fill="none" stroke-linecap="round">`);
  for (const [a, b] of scene.grid) out.push(`<path d="M${pt(a)}L${pt(b)}" stroke="${S.grid}" stroke-width="${w}"/>`);
  for (const axis of scene.axes.filter((a) => a.label !== "z")) {
    out.push(`<path d="M${pt(axis.from)}L${pt(axis.to)}" stroke="${S.axis}" stroke-width="${1.4 * w}"/>`);
  }
  out.push(`</g><g stroke-linejoin="round" stroke-linecap="round">`);
  for (const face of scene.faces) {
    out.push(`<polygon points="${face.points.map(pt).join(" ")}" fill="${face.fill}" stroke="${face.fill}" stroke-width="0.6"/>`);
    if (face.gridEdges.length) {
      out.push(`<path d="${face.gridEdges.map(([a, b]) => `M${pt(a)}L${pt(b)}`).join("")}" stroke="${S.gridLine}" stroke-width="${0.8 * w}" fill="none"/>`);
    }
  }
  for (const run of scene.sliceHidden) {
    out.push(`<polyline points="${run.map(pt).join(" ")}" stroke="${S.slice}" stroke-opacity="0.55" stroke-width="${2 * w}" stroke-dasharray="4 5" fill="none"/>`);
  }
  for (const run of scene.slice) {
    const points = run.map(pt).join(" ");
    out.push(`<polyline points="${points}" stroke="${S.halo}" stroke-width="${7 * w}" fill="none"/>`);
    out.push(`<polyline points="${points}" stroke="${S.slice}" stroke-width="${3.6 * w}" fill="none"/>`);
  }
  out.push(`</g>`);

  for (const axis of scene.axes.filter((a) => a.label === "z")) {
    out.push(`<path d="M${pt(axis.from)}L${pt(axis.to)}" stroke="${S.axis}" stroke-width="${1.4 * w}" stroke-linecap="round"/>`);
  }
  for (const axis of scene.axes) {
    const [x, y] = axis.to;
    const dx = axis.label === "z" ? -6 * z : 10 * z;
    const dy = axis.label === "z" ? -10 * z : axis.label === "x" ? 18 * z : 4 * z;
    out.push(label(axis.label, x + dx, y + dy, 20 * z, AXIS_GLYPHS, S.label));
  }
  for (const t of scene.ticks) {
    out.push(label(t.text, t.at[0] + t.dx * z, t.at[1] + t.dy * z, 15 * z, TICK_GLYPHS, S.tick, t.anchor));
  }
  out.push(`</svg>`);
  return out.join("");
}
