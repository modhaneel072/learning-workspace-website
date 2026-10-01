import { EM, layoutInk } from "@/lib/ink";

type InkProps = {
  text: string;
  x: number;
  y: number;
  /** Glyph size in design units (one em). */
  size: number;
  seed?: number;
  className?: string;
  /** Identifies the line for the interactive preview's timeline. */
  inkId?: string;
};

/** A line of handwriting as SVG strokes. Pure and deterministic: safe on server and client. */
export function Ink({ text, x, y, size, seed = 0, className, inkId }: InkProps) {
  const layout = layoutInk(text, seed);
  const scale = Math.round((size / EM) * 10000) / 10000;
  return (
    <g
      className={className ? `ink ${className}` : "ink"}
      transform={`translate(${x} ${y}) scale(${scale})`}
      data-ink={inkId}
    >
      {layout.glyphs.map((glyph) => (
        <g key={glyph.index} transform={glyph.transform}>
          {glyph.strokes.map((stroke, i) => (
            <path key={i} d={stroke.d} />
          ))}
        </g>
      ))}
    </g>
  );
}
