"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Assembles `[data-reveal]` children in document order, once, when the block
 * comes into view: the slips rise into place, the arrows draw, the pattern card
 * fills, then the practice set rises. Text is never faded, so it is readable and
 * passes contrast in every state, and it plays to the end wherever the visitor
 * stops (including after a nav jump). Wide screens without a reduced-motion
 * preference only.
 *   data-reveal=""      rises into place
 *   data-reveal="draw"  scales in from the left (decorative arrows)
 *   data-reveal="fill"  rises while its background fills in
 */
export function ScrollSequence({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement | SVGElement>("[data-reveal]");
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 75%", once: true } });
        items.forEach((el, i) => {
          const at = i * 0.09;
          const kind = el.dataset.reveal;
          if (kind === "draw") {
            tl.from(el, { scaleX: 0, transformOrigin: "left center", duration: 0.5, ease: "power2.inOut" }, at);
          } else if (kind === "fill") {
            tl.from(el, { y: 16, backgroundColor: "#ffffff", duration: 0.75, ease: "power2.out" }, at);
          } else {
            tl.from(el, { y: 16, duration: 0.6, ease: "power2.out" }, at);
          }
        });
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
