import { curveF } from "@/lib/surface";

const W = 640;
const H = 520;
const P = { left: 78, right: 600, top: 60, bottom: 440 };
const Y_MAX = 2.9;

const X = (x: number) => P.left + ((x + 1) / 2) * (P.right - P.left);
const Y = (y: number) => P.bottom - (y / Y_MAX) * (P.bottom - P.top);
const f1 = (n: number) => n.toFixed(1);

function curvePath(from: number, to: number, samples: number) {
  let d = "";
  for (let i = 0; i <= samples; i++) {
    const x = from + ((to - from) * i) / samples;
    d += `${i ? "L" : "M"}${f1(X(x))} ${f1(Y(curveF(x)))}`;
  }
  return d;
}

const CURVE = curvePath(-1, 1, 160);
const AREA = `${curvePath(0, 1, 80)}L${f1(X(1))} ${f1(Y(0))}L${f1(X(0))} ${f1(Y(0))}Z`;

/** f(x) = x²eˣ on [−1, 1], with the area from 0 to 1 (e − 2) shaded. */
export function Graph2D() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      role="img"
      aria-label="Graph of f of x equals x squared e to the x, for x from minus 1 to 1. The curve starts near 0.37, touches 0 at x equals 0, and rises to e at x equals 1. The area under the curve from 0 to 1 is shaded."
      style={{ width: "100%", height: "auto" }}
    >
      <g stroke="#edf1ec" strokeWidth="1">
        {[1, 2].map((y) => (
          <path key={y} d={`M${P.left} ${f1(Y(y))}H${P.right}`} />
        ))}
        {[-0.5, 0, 0.5, 1].map((x) => (
          <path key={x} d={`M${f1(X(x))} ${P.top}V${P.bottom}`} />
        ))}
      </g>
      <path d={AREA} fill="#dfe9e1" />
      <path d={`M${f1(X(1))} ${f1(Y(Math.E))}V${P.bottom}`} stroke="#b9cbbc" strokeWidth="1.1" strokeDasharray="4 5" />
      <g stroke="#9aab9d" strokeWidth="1.4" fill="none">
        <path d={`M${P.left} ${P.bottom}H${P.right + 18}`} />
        <path d={`M${P.left} ${P.top - 14}V${P.bottom}`} />
      </g>
      <path d={CURVE} fill="none" stroke="#3f6a50" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <g fill="#3f6a50">
        {[-1, 0, 1].map((x) => (
          <circle key={x} cx={f1(X(x))} cy={f1(Y(curveF(x)))} r="4.2" />
        ))}
      </g>
      <g fill="#6a7771" fontSize="16" fontFamily="inherit">
        {[0, 1, 2].map((y) => (
          <text key={y} x={P.left - 14} y={f1(Y(y) + 5)} textAnchor="end">
            {y}
          </text>
        ))}
        {[-1, -0.5, 0, 0.5, 1].map((x) => (
          <text key={x} x={f1(X(x))} y={P.bottom + 28} textAnchor="middle">
            {x < 0 ? `−${Math.abs(x)}` : x}
          </text>
        ))}
      </g>
      <g fill="#4f6a57" fontSize="19" fontWeight="600" fontFamily="inherit">
        <text x={P.right + 24} y={P.bottom + 6}>
          x
        </text>
        <text x={P.left - 4} y={P.top - 24} textAnchor="middle">
          f(x)
        </text>
        <text x={f1(X(1) - 14)} y={f1(Y(Math.E) + 2)} textAnchor="end">
          (1, e)
        </text>
      </g>
    </svg>
  );
}
