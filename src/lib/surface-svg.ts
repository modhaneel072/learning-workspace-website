import { SURFACE_STYLE as S, SURFACE_VIEW, buildScene, type Projected } from "./surface";

const r = (n: number) => Math.round(n * 10) / 10;
const pt = (p: Projected) => `${r(p[0])},${r(p[1])}`;

/** A static, lightweight rendering of the surface for small screens and reduced motion. */
export function renderSurfaceSvg(): string {
  const scene = buildScene(undefined, undefined, 18, 3);
  const out: string[] = [];
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SURFACE_VIEW.width} ${SURFACE_VIEW.height}" width="${SURFACE_VIEW.width}" height="${SURFACE_VIEW.height}" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif">`,
  );
  out.push(`<g stroke="${S.grid}" stroke-width="1" fill="none">`);
  for (const [a, b] of scene.grid) out.push(`<path d="M${pt(a)}L${pt(b)}"/>`);
  // Axes in the z = 0 plane sit behind the surface; the vertical z axis is drawn last.
  for (const axis of scene.axes.filter((a) => a.label !== "z")) {
    out.push(`<path d="M${pt(axis.from)}L${pt(axis.to)}" stroke="${S.axis}" stroke-width="1.4"/>`);
  }
  out.push(`</g><g stroke-linejoin="round" stroke-linecap="round">`);
  for (const face of scene.faces) {
    out.push(`<polygon points="${face.points.map(pt).join(" ")}" fill="${face.fill}" stroke="${face.fill}" stroke-width="0.6"/>`);
    if (face.gridEdges.length) {
      out.push(`<path d="${face.gridEdges.map(([a, b]) => `M${pt(a)}L${pt(b)}`).join("")}" stroke="${S.gridLine}" stroke-width="0.8" fill="none"/>`);
    }
  }
  for (const run of scene.sliceHidden) {
    out.push(`<polyline points="${run.map(pt).join(" ")}" stroke="${S.slice}" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="4 5" fill="none"/>`);
  }
  for (const run of scene.slice) {
    const points = run.map(pt).join(" ");
    out.push(`<polyline points="${points}" stroke="${S.halo}" stroke-width="7" fill="none"/>`);
    out.push(`<polyline points="${points}" stroke="${S.slice}" stroke-width="3.6" fill="none"/>`);
  }
  out.push(`</g><g stroke="${S.axis}" stroke-width="1.4">`);
  for (const axis of scene.axes.filter((a) => a.label === "z")) out.push(`<path d="M${pt(axis.from)}L${pt(axis.to)}"/>`);
  out.push(`</g><g font-size="20" font-weight="600" fill="${S.label}">`);
  for (const axis of scene.axes) {
    const [x, y] = axis.to;
    const dx = axis.label === "z" ? -6 : 10;
    const dy = axis.label === "z" ? -10 : axis.label === "x" ? 18 : -6;
    out.push(`<text x="${r(x + dx)}" y="${r(y + dy)}">${axis.label}</text>`);
  }
  out.push(`</g><g font-size="15" fill="${S.tick}">`);
  for (const t of scene.ticks) {
    out.push(`<text x="${r(t.at[0] + t.dx)}" y="${r(t.at[1] + t.dy)}" text-anchor="${t.anchor}">${t.text}</text>`);
  }
  out.push(`</g></svg>`);
  return out.join("");
}
