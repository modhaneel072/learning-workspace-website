import { EM, glyphBox, inkWidth } from "@/lib/ink";
import { Ink } from "../canvas/Ink";

type InkSnippetProps = {
  text: string;
  /** Character and 0-based occurrence to highlight as the slip. */
  slip?: [string, number];
  seed?: number;
  className?: string;
};

const SIZE = 40;
const r = (n: number) => Math.round(n * 100) / 100;

/** A short handwritten expression with its slip marked, sized by CSS height. */
export function InkSnippet({ text, slip, seed = 3, className }: InkSnippetProps) {
  const width = inkWidth(text, SIZE);
  const k = SIZE / EM;
  const top = -14;
  const height = SIZE * 1.6;
  const box = slip ? glyphBox(text, slip[0], slip[1], SIZE, seed) : null;
  return (
    <svg
      className={className}
      viewBox={`-6 ${top} ${r(width + 12)} ${height}`}
      style={{ aspectRatio: `${r(width + 12)} / ${height}` }}
      aria-hidden="true"
    >
      {box ? (
        <g>
          <rect x={r(box.x0 - 2)} y={r(4 * k)} width={r(29 * k + 4)} height={r(30 * k)} rx="5" fill="#f8e8e4" />
          <path d={`M${r(box.x0)} ${r(38 * k)}H${r(box.x0 + 29 * k)}`} stroke="#ac4237" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      ) : null}
      <Ink text={text} x={0} y={0} size={SIZE} seed={seed} />
    </svg>
  );
}
