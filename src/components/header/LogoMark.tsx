type LogoMarkProps = { size?: number; className?: string };

/** An ink "L" — the margin of a notebook page — with the sage guidance dot. */
export function LogoMark({ size = 28, className }: LogoMarkProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M9.5 5v17.6c0 2.6 1.6 4.2 4.2 4.2H26"
        stroke="#1e2a27"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21.5" cy="10.5" r="4" fill="#587c65" />
    </svg>
  );
}
