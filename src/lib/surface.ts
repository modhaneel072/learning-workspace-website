/**
 * Geometry for z = x²·eʸ on [−1, 1]², drawn with an orthographic camera.
 * Along y = x the surface height is x²·eˣ — exactly the 2D curve f(x).
 */

export type Vec3 = [number, number, number];
export type Projected = [number, number, number]; // screen x, screen y, depth

export const SURFACE_VIEW = { width: 640, height: 520 };
export const DEFAULT_AZIMUTH = -50;
export const DEFAULT_ELEVATION = 30;
const TARGET: Vec3 = [0, 0, 1.15];

export const surfaceZ = (x: number, y: number) => x * x * Math.exp(y);
export const curveF = (x: number) => x * x * Math.exp(x);

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: Vec3): Vec3 => {
  const m = Math.sqrt(dot(a, a));
  return [a[0] / m, a[1] / m, a[2] / m];
};

function basis(azimuthDeg: number, elevationDeg: number) {
  const az = (azimuthDeg * Math.PI) / 180;
  const el = (elevationDeg * Math.PI) / 180;
  const eye: Vec3 = [Math.cos(el) * Math.cos(az), Math.cos(el) * Math.sin(az), Math.sin(el)];
  const forward: Vec3 = [-eye[0], -eye[1], -eye[2]];
  const right = unit(cross(forward, [0, 0, 1]));
  const up = cross(right, forward);
  return { eye, forward, right, up };
}

/** Scale and centre are fitted once to the default view, then held fixed while the view turns. */
const FIT = (() => {
  const { right, up } = basis(DEFAULT_AZIMUTH, DEFAULT_ELEVATION);
  const probes: Vec3[] = [
    [-1.14, -1.14, 0], [1.2, -1.14, 0], [1.14, 1.2, 0], [-1.14, 1.2, 0], [-1.14, -1.14, 2.95],
    [1, 1, Math.E], [-1, 1, Math.E], [1, -1, 1 / Math.E], [1, 1, 0], [-1, -1, 1 / Math.E],
  ];
  const xs = probes.map((p) => dot(sub(p, TARGET), right));
  const ys = probes.map((p) => -dot(sub(p, TARGET), up));
  const pad = { x: 56, top: 44, bottom: 52 };
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = Math.min(
    (SURFACE_VIEW.width - 2 * pad.x) / (maxX - minX),
    (SURFACE_VIEW.height - pad.top - pad.bottom) / (maxY - minY),
  );
  return {
    scale,
    cx: SURFACE_VIEW.width / 2 - (scale * (minX + maxX)) / 2,
    cy: pad.top - scale * minY + (SURFACE_VIEW.height - pad.top - pad.bottom - scale * (maxY - minY)) / 2,
  };
})();

export function makeCamera(azimuthDeg = DEFAULT_AZIMUTH, elevationDeg = DEFAULT_ELEVATION) {
  const { forward, right, up } = basis(azimuthDeg, elevationDeg);
  return (p: Vec3): Projected => {
    const v = sub(p, TARGET);
    return [FIT.cx + FIT.scale * dot(v, right), FIT.cy - FIT.scale * dot(v, up), dot(v, forward)];
  };
}

const LIGHT = unit([-0.28, -0.47, 1]);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export type Face = {
  points: Projected[];
  depth: number;
  fill: string;
  /** Edges of this face that lie on the coarse grid lines (drawn after the fill). */
  gridEdges: [Projected, Projected][];
};

/**
 * Quads of the surface, sorted back-to-front. `gridEvery` cells form one grid
 * interval, so grid lines are hidden correctly by nearer faces.
 */
export function surfaceFaces(project: (p: Vec3) => Projected, n: number, gridEvery: number): Face[] {
  const faces: Face[] = [];
  const step = 2 / n;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x0 = -1 + i * step, y0 = -1 + j * step, x1 = x0 + step, y1 = y0 + step;
      const a: Vec3 = [x0, y0, surfaceZ(x0, y0)];
      const b: Vec3 = [x1, y0, surfaceZ(x1, y0)];
      const c: Vec3 = [x1, y1, surfaceZ(x1, y1)];
      const d: Vec3 = [x0, y1, surfaceZ(x0, y1)];
      let normal = unit(cross(sub(b, a), sub(d, a)));
      if (normal[2] < 0) normal = [-normal[0], -normal[1], -normal[2]];
      const shade = 0.5 + 0.42 * Math.max(0, dot(normal, LIGHT));
      const rgb = [mix(170, 233, shade), mix(192, 239, shade), mix(174, 231, shade)].map(Math.round);
      const pa = project(a), pb = project(b), pc = project(c), pd = project(d);
      const gridEdges: [Projected, Projected][] = [];
      if (i % gridEvery === 0) gridEdges.push([pa, pd]);
      if (i === n - 1) gridEdges.push([pb, pc]);
      if (j % gridEvery === 0) gridEdges.push([pa, pb]);
      if (j === n - 1) gridEdges.push([pd, pc]);
      faces.push({
        points: [pa, pb, pc, pd],
        depth: (pa[2] + pb[2] + pc[2] + pd[2]) / 4,
        fill: `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`,
        gridEdges,
      });
    }
  }
  return faces.sort((p, q) => q.depth - p.depth);
}

/**
 * Axes run along edges of the base square that the default camera can see:
 * x along the front edge, y along the front-right edge, z up the front-left corner.
 */
export const AXES: { from: Vec3; to: Vec3; label: string }[] = [
  { from: [-1.14, -1.14, 0], to: [1.2, -1.14, 0], label: "x" },
  { from: [1.14, -1.14, 0], to: [1.14, 1.2, 0], label: "y" },
  { from: [-1.14, -1.14, 0], to: [-1.14, -1.14, 2.95], label: "z" },
];

/** Base grid in the z = 0 plane. */
export function baseGrid(project: (p: Vec3) => Projected): [Projected, Projected][] {
  const lines: [Projected, Projected][] = [];
  for (let i = 0; i <= 4; i++) {
    const u = -1 + i / 2;
    lines.push([project([-1, u, 0]), project([1, u, 0])]);
    lines.push([project([u, -1, 0]), project([u, 1, 0])]);
  }
  return lines;
}

export type Scene = {
  faces: Face[];
  /** Visible runs of the y = x slice, drawn over the surface. */
  slice: Projected[][];
  /** Runs hidden behind the sheet, drawn dashed like hidden edges in a textbook figure. */
  sliceHidden: Projected[][];
  grid: [Projected, Projected][];
  axes: { from: Projected; to: Projected; label: string }[];
  ticks: { at: Projected; text: string; dx: number; dy: number; anchor: "start" | "middle" | "end" }[];
};

/**
 * The slice lies on the sheet, so it is visible from either side. A point is
 * hidden only when the ray from it toward the camera crosses the sheet again.
 * The sheet is a height field over a convex square, so a short march is exact
 * enough: once the ray leaves the square or rises above max z, nothing can cover it.
 */
function sliceVisible(t: number, eye: Vec3): boolean {
  const p: Vec3 = [t, t, curveF(t)];
  let side = 0;
  for (let s = 0.02; s < 6; s += 0.02) {
    const x = p[0] + eye[0] * s, y = p[1] + eye[1] * s, z = p[2] + eye[2] * s;
    if (Math.abs(x) > 1 || Math.abs(y) > 1 || (eye[2] >= 0 && z > Math.E)) return true;
    const d = z - surfaceZ(x, y);
    if (Math.abs(d) < 1e-4) continue;
    const sign = d > 0 ? 1 : -1;
    if (side === 0) side = sign;
    else if (sign !== side) return false;
  }
  return true;
}

export function buildScene(azimuth = DEFAULT_AZIMUTH, elevation = DEFAULT_ELEVATION, n = 18, gridEvery = 3): Scene {
  const project = makeCamera(azimuth, elevation);
  const { eye } = basis(azimuth, elevation);
  const faces = surfaceFaces(project, n, gridEvery);

  const slice: Projected[][] = [];
  const sliceHidden: Projected[][] = [];
  const samples = 200;
  let run: Projected[] = [];
  let runVisible: boolean | null = null;
  for (let i = 0; i <= samples; i++) {
    const t = -1 + (2 * i) / samples;
    const point = project([t, t, curveF(t)]);
    const visible = sliceVisible(t, eye);
    if (runVisible !== null && visible !== runVisible) {
      run.push(point);
      (runVisible ? slice : sliceHidden).push(run);
      run = [];
    }
    run.push(point);
    runVisible = visible;
  }
  if (run.length > 1 && runVisible !== null) (runVisible ? slice : sliceHidden).push(run);

  const axes = AXES.map((axis) => ({ from: project(axis.from), to: project(axis.to), label: axis.label }));
  const ticks: Scene["ticks"] = [];
  for (const z of [0, 1, 2]) ticks.push({ at: project([-1.14, -1.14, z]), text: String(z), dx: -10, dy: 5, anchor: "end" });
  for (const v of [-1, 0, 1]) ticks.push({ at: project([v, -1.14, 0]), text: v < 0 ? "−1" : String(v), dx: 0, dy: 20, anchor: "middle" });
  for (const v of [0, 1]) ticks.push({ at: project([1.14, v, 0]), text: String(v), dx: 10, dy: 12, anchor: "start" });
  return { faces, slice, sliceHidden, grid: baseGrid(project), axes, ticks };
}

export const SURFACE_STYLE = {
  grid: "#e2e8e1",
  gridLine: "rgba(120, 146, 125, 0.55)",
  axis: "#8a9c8d",
  label: "#4f6a57",
  tick: "#7a8680",
  slice: "#3f6a50",
  halo: "rgba(250, 252, 248, 0.9)",
};
