"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Reveals `[data-reveal]` children in document order, once, when the block comes
 * into view: slips, then the pattern, then the practice set. It plays to the end
 * wherever the visitor stops scrolling (including after a nav jump). Opacity only,
 * so content always stays in the accessibility tree. Wide screens without a
 * reduced-motion preference only.
 */
export function ScrollSequence({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        gsap.fromTo(
          items,
          { opacity: 0.08, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
