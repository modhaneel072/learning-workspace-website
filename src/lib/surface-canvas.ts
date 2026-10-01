import { SURFACE_STYLE as S, SURFACE_VIEW, buildScene } from "./surface";

/** Draws the surface scene into a 2D canvas context sized SURFACE_VIEW × dpr. */
export function drawSurface(ctx: CanvasRenderingContext2D, azimuth: number, elevation: number, dpr: number) {
  const scene = buildScene(azimuth, elevation, 30, 5);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, SURFACE_VIEW.width, SURFACE_VIEW.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const line = (a: number[], b: number[], color: string, width: number) => {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  };

  for (const [a, b] of scene.grid) line(a, b, S.grid, 1);
  for (const axis of scene.axes) if (axis.label !== "z") line(axis.from, axis.to, S.axis, 1.4);

  for (const { points, fill, gridEdges } of scene.faces) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = fill;
    ctx.lineWidth = 0.6;
    ctx.stroke();
    for (const [a, b] of gridEdges) line(a, b, S.gridLine, 0.8);
  }

  ctx.save();
  ctx.setLineDash([4, 5]);
  ctx.globalAlpha = 0.55;
  for (const run of scene.sliceHidden) {
    ctx.beginPath();
    ctx.moveTo(run[0][0], run[0][1]);
    for (let i = 1; i < run.length; i++) ctx.lineTo(run[i][0], run[i][1]);
    ctx.strokeStyle = S.slice;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();

  for (const [color, width] of [[S.halo, 7], [S.slice, 3.6]] as const) {
    for (const run of scene.slice) {
      ctx.beginPath();
      ctx.moveTo(run[0][0], run[0][1]);
      for (let i = 1; i < run.length; i++) ctx.lineTo(run[i][0], run[i][1]);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    }
  }

  for (const axis of scene.axes) if (axis.label === "z") line(axis.from, axis.to, S.axis, 1.4);

  ctx.font = `600 20px ${getComputedStyle(ctx.canvas).fontFamily || "system-ui"}`;
  ctx.fillStyle = S.label;
  for (const axis of scene.axes) {
    const dx = axis.label === "z" ? -6 : 10;
    const dy = axis.label === "z" ? -10 : axis.label === "x" ? 18 : -6;
    ctx.textAlign = "left";
    ctx.fillText(axis.label, axis.to[0] + dx, axis.to[1] + dy);
  }
  ctx.font = `400 15px ${getComputedStyle(ctx.canvas).fontFamily || "system-ui"}`;
  ctx.fillStyle = S.tick;
  for (const t of scene.ticks) {
    ctx.textAlign = t.anchor === "middle" ? "center" : t.anchor === "end" ? "right" : "left";
    ctx.fillText(t.text, t.at[0] + t.dx, t.at[1] + t.dy);
  }
}
