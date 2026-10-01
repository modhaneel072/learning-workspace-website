import type { CSSProperties } from "react";
import { MATH_SIZE, MATH_X, SLIP, WORK_LINES, WORK_WIDTH, notePosition } from "@/lib/canvas-content";
import { Ink } from "../canvas/Ink";
import { Check, Dock, InlineInk, PanelLabel, SlipMark, StepNumbers, TopBar } from "../canvas/CanvasChrome";
import s from "../canvas/canvas.module.css";
import h from "./Hero.module.css";

/** The canvas at the moment guidance appears: steps 1–3 checked, step 4's sign flagged. */
export function HeroCanvas() {
  return (
    <div
      className={s.screen}
      role="img"
      aria-label="The Learning Workspace canvas. A student's handwritten integration by parts of x squared e to the x. Steps 1 to 3 are checked. In step 4 the sign before the final 2 is highlighted with the hint: What does negative times negative give?"
    >
      <div className={s.ui} aria-hidden="true">
        <TopBar />
        <div className={s.main}>
          <div className={s.work}>
            <p className={s.subject}>Calculus</p>
            <div className={s.workArea}>
              <svg viewBox={`0 0 ${WORK_WIDTH} 690`} className={s.workSvg}>
                <SlipMark className={h.reveal} />
                <StepNumbers />
                <text x={44} y={WORK_LINES[4].y + 33} className={`${s.stepNo} ${s.stepNoRed} ${h.reveal}`}>
                  4
                </text>
                {WORK_LINES.map((line) => (
                  <Ink key={line.id} text={line.text} x={MATH_X} y={line.y} size={MATH_SIZE} seed={line.seed} />
                ))}
              </svg>
              <div className={`${s.note} ${h.revealNote}`} style={notePosition(SLIP.underlineY + 24) as CSSProperties}>
                <p className={s.noteTitle}>Check this sign</p>
                <p className={s.noteBody}>What does negative × negative give?</p>
              </div>
            </div>
          </div>

          <div className={s.panel}>
            <PanelLabel>Live guidance</PanelLabel>
            <p className={s.panelTitle}>Check step 4</p>
            <div className={`${s.card} ${s.cardRed} ${h.reveal}`}>
              <p className={s.cardTitle}>Distribute −2 to both terms.</p>
              <InlineInk text="−2(xe^x − e^x)" />
              <p className={s.cardHint}>Check negative × negative.</p>
            </div>
            <div className={s.divider} />
            <PanelLabel>Checked in this work</PanelLabel>
            <ul className={s.checklist}>
              <li>
                <Check /> Choice of u and dv
              </li>
              <li>
                <Check /> First reduction
              </li>
              <li>
                <Check /> Second reduction
              </li>
            </ul>
          </div>
        </div>
        <Dock />
      </div>
    </div>
  );
}
