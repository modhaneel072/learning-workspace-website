import type { CSSProperties, ReactNode } from "react";
import { EM, layoutInk } from "@/lib/ink";
import { MATH_SIZE, MATH_X, SLIP, STEP4, STEP_X, WORK_LINES } from "@/lib/canvas-content";
import { Ink } from "./Ink";
import s from "./canvas.module.css";

export function TopBar() {
  return (
    <div className={s.topbar}>
      <span className={s.topBrand}>Learning Workspace</span>
      <span className={s.topMeta}>Personal canvas</span>
      <span className={s.topStatus} />
    </div>
  );
}

export function Dock() {
  return (
    <div className={s.dock}>
      <svg viewBox="0 0 24 24" className={s.dockActive}>
        <path d="M5 19l1-4L16 5l3 3L9 18l-4 1zM14 7l3 3" />
      </svg>
      <svg viewBox="0 0 24 24">
        <path d="M8 19h11M6.5 15.5l7.8-7.8a2 2 0 012.8 0l1.2 1.2a2 2 0 010 2.8L13 17H9l-2.5-1.5z" />
      </svg>
      <svg viewBox="0 0 24 24">
        <path d="M9 7L5 11l4 4M5 11h9a5 5 0 010 10h-2" />
      </svg>
      <svg viewBox="0 0 24 24">
        <path d="M7 7l10 10M17 7L7 17" />
      </svg>
    </div>
  );
}

export function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className ? `${s.check} ${className}` : s.check} aria-hidden="true">
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

/** Inline handwriting inside UI text, e.g. the expression on a guidance card. */
export function InlineInk({ text, size = 30, seed = 7, className }: { text: string; size?: number; seed?: number; className?: string }) {
  const width = (layoutInk(text, seed).width * size) / EM;
  const height = size * 1.55;
  return (
    <svg
      className={className ? `${s.inlineInk} ${className}` : s.inlineInk}
      viewBox={`-4 ${-size * 0.32} ${width + 8} ${height}`}
      style={{ "--w": width + 8, "--h": height } as CSSProperties}
      aria-hidden="true"
    >
      <Ink text={text} x={0} y={0} size={size} seed={seed} />
    </svg>
  );
}

/** Step numbers in the margin. */
export function StepNumbers({ redStep }: { redStep?: number }) {
  return (
    <>
      {WORK_LINES.filter((l) => l.step).map((line) => (
        <text
          key={line.id}
          x={STEP_X}
          y={line.y + 33}
          className={line.step === redStep ? `${s.stepNo} ${s.stepNoRed}` : s.stepNo}
          data-step={line.step}
        >
          {line.step}
        </text>
      ))}
    </>
  );
}

/** Highlight box and underline behind the mistaken sign. */
export function SlipMark({ className }: { className?: string }) {
  const { rect, underlineY } = SLIP;
  return (
    <g className={className ? `${s.slip} ${className}` : s.slip} data-slip="">
      <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} rx={5} className={s.slipFill} />
      <path d={`M${rect.x + 2} ${underlineY}H${rect.x + rect.width - 2}`} className={s.slipLine} />
    </g>
  );
}

/** The single stroke that turns the mistaken "−" into "+". */
export function CorrectionStem({ hidden = false }: { hidden?: boolean }) {
  const layout = layoutInk(STEP4.text, STEP4.seed);
  const glyph = layout.glyphs[SLIP.glyphIndex];
  const scale = Math.round((MATH_SIZE / EM) * 10000) / 10000;
  return (
    <g className="ink" transform={`translate(${MATH_X} ${STEP4.y}) scale(${scale})`} data-ink="stem" opacity={hidden ? 0 : undefined}>
      <g transform={glyph.transform}>
        <path d="M13 7L13 29" />
      </g>
    </g>
  );
}

export function PanelLabel({ children }: { children: ReactNode }) {
  return <p className={s.panelLabel}>{children}</p>;
}
