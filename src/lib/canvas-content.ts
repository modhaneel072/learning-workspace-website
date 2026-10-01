import { EM, glyphBox, inkWidth } from "./ink";

/**
 * The worked example shown on every canvas. Coordinates are design units inside
 * the 860-unit-wide work area. Every line is mathematically checked:
 *   ∫ x²eˣ dx, u = x², dv = eˣ dx
 *   I = x²eˣ − 2∫ xeˣ dx,  ∫ xeˣ dx = xeˣ − eˣ
 *   I = x²eˣ − 2xeˣ + 2eˣ + C = eˣ(x² − 2x + 2) + C
 * The student's slip writes "− 2" for the last term.
 */
export const MATH_SIZE = 44;
export const MATH_X = 84;
export const STEP_X = 44;
export const WORK_WIDTH = 860;

export type WorkLine = {
  id: string;
  text: string;
  y: number;
  step?: number;
  seed: number;
};

export const WORK_LINES: WorkLine[] = [
  { id: "problem", text: "I = ∫ x^2e^x dx", y: 24, seed: 11 },
  { id: "s1", text: "u = x^2, dv = e^x dx", y: 140, step: 1, seed: 23 },
  { id: "s2", text: "I = x^2e^x − 2∫ xe^x dx", y: 256, step: 2, seed: 37 },
  { id: "s3", text: "∫ xe^x dx = xe^x − e^x", y: 372, step: 3, seed: 41 },
  { id: "s4", text: "I = e^x(x^2 − 2x − 2) + C", y: 488, step: 4, seed: 53 },
];

export const STEP4 = WORK_LINES[4];

/** The mistaken minus sign in step 4 (the second "−" on that line). */
export const SLIP = (() => {
  const box = glyphBox(STEP4.text, "−", 1, MATH_SIZE, STEP4.seed);
  const k = MATH_SIZE / EM;
  const x0 = MATH_X + box.x0;
  return {
    glyphIndex: box.glyphIndex,
    /** Highlight rectangle around the sign. */
    rect: { x: x0 - 2, y: STEP4.y + 4 * k, width: 29 * k + 4, height: 30 * k },
    /** Where the correcting vertical stroke goes (the "+" stem). */
    stemX: x0,
    stemY: STEP4.y,
    underlineY: STEP4.y + 38 * k,
    centerX: x0 + 13.5 * k,
  };
})();

export const STEP4_END_X = MATH_X + inkWidth(STEP4.text, MATH_SIZE);

/** Position a margin note under the slip; narrow canvases right-align it inside the 860-unit column. */
export function notePosition(y: number, narrowWidth = 560) {
  const x = Math.round(SLIP.centerX - 32);
  const xNarrow = WORK_WIDTH - narrowWidth;
  return {
    "--x": x,
    "--y": Math.round(y),
    "--caret": 26,
    "--x-narrow": xNarrow,
    "--caret-narrow": Math.round(SLIP.centerX - xNarrow - 6),
  } as Record<string, number>;
}
