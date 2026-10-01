"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { asset } from "@/lib/site";
import { DEFAULT_AZIMUTH, DEFAULT_ELEVATION, SURFACE_VIEW } from "@/lib/surface";
import styles from "./Graphs.module.css";

type Draw = typeof import("@/lib/surface-canvas").drawSurface;

const ALT =
  "3D surface z equals x squared times e to the y, over x and y from minus 1 to 1. A dark line marks the slice where y equals x; along it the height is x squared e to the x, the same curve as the 2D graph.";

const AZ_MIN = -140;
const AZ_MAX = 40;

/**
 * A static SVG by default (phones, reduced motion, no JavaScript). On wide
 * screens a canvas takes over with a slow turn, drag-to-rotate and a slider.
 */
export function Surface3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const engine = useRef<{ render: () => void; start: () => void } | null>(null);
  const view = useRef({ az: DEFAULT_AZIMUTH, el: DEFAULT_ELEVATION, base: DEFAULT_AZIMUTH, t0: 0 });
  const rotatingRef = useRef(true);
  const [interactive, setInteractive] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [rotating, setRotating] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
    const update = () => setInteractive(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!interactive || !canvas || !wrap) return;
    let draw: Draw | null = null;
    let frame = 0;
    let visible = false;
    let cancelled = false;

    const render = () => {
      const ctx = canvas.getContext("2d");
      if (!draw || !ctx) return;
      draw(ctx, view.current.az, view.current.el, canvas.width / SURFACE_VIEW.width);
      if (sliderRef.current) sliderRef.current.value = String(Math.round(view.current.az));
    };
    const tick = (now: number) => {
      frame = 0;
      if (!visible || !rotatingRef.current) return;
      if (!view.current.t0) view.current.t0 = now;
      const t = (now - view.current.t0) / 1000;
      view.current.az = view.current.base + 11 * Math.sin((2 * Math.PI * t) / 20);
      render();
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (frame || !draw || !visible || !rotatingRef.current) return;
      view.current.t0 = 0;
      view.current.base = view.current.az;
      frame = requestAnimationFrame(tick);
    };
    engine.current = { render, start };

    import("@/lib/surface-canvas").then((mod) => {
      if (cancelled) return;
      draw = mod.drawSurface;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(SURFACE_VIEW.width * dpr);
      canvas.height = Math.round(SURFACE_VIEW.height * dpr);
      render();
      setDrawn(true);
      start();
    });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(wrap);

    return () => {
      cancelled = true;
      engine.current = null;
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [interactive]);

  const setRotation = (next: boolean) => {
    rotatingRef.current = next;
    setRotating(next);
    if (next) engine.current?.start();
  };

  const setAngle = (az: number) => {
    view.current.az = Math.max(AZ_MIN, Math.min(AZ_MAX, az));
    engine.current?.render();
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    setRotation(false);
    let lastX = event.clientX;
    let lastY = event.clientY;
    const move = (e: PointerEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      view.current.el = Math.max(14, Math.min(58, view.current.el + dy * 0.25));
      setAngle(view.current.az - dx * 0.45);
    };
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      target.removeEventListener("pointercancel", up);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
  };

  return (
    <div className={styles.surfaceWrap} ref={wrapRef}>
      <div className={styles.surfaceStage}>
        <picture>
          {/* Phones get the same figure with labels sized for a half-width render. */}
          <source media="(max-width: 600px)" srcSet={asset("/graphs/surface-compact.svg")} />
          <img
            src={asset("/graphs/surface.svg")}
            width={SURFACE_VIEW.width}
            height={SURFACE_VIEW.height}
            alt={drawn ? "" : ALT}
            aria-hidden={drawn || undefined}
            loading="lazy"
            decoding="async"
            className={styles.surfaceImage}
            style={drawn ? { visibility: "hidden" } : undefined}
          />
        </picture>
        {interactive ? (
          <canvas
            ref={canvasRef}
            className={styles.surfaceCanvas}
            role="img"
            aria-label={ALT}
            onPointerDown={onPointerDown}
            style={{ opacity: drawn ? 1 : 0 }}
          />
        ) : null}
      </div>

      {interactive ? (
        <div className={styles.surfaceControls}>
          <button type="button" className={styles.smallButton} onClick={() => setRotation(!rotating)}>
            {rotating ? "Pause rotation" : "Resume rotation"}
          </button>
          <label className={styles.slider}>
            <span>Turn</span>
            <input
              ref={sliderRef}
              type="range"
              min={AZ_MIN}
              max={AZ_MAX}
              step={1}
              defaultValue={DEFAULT_AZIMUTH}
              onInput={(e) => {
                setRotation(false);
                setAngle(Number(e.currentTarget.value));
              }}
            />
          </label>
          <span className={styles.hint}>or drag the surface</span>
        </div>
      ) : null}
    </div>
  );
}
