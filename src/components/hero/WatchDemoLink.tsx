"use client";

import type { ReactNode } from "react";

export const PLAY_FILM_EVENT = "lw:play-film";

/**
 * Jumps to the film and starts it. The click is the user action that allows
 * playback with sound; without JavaScript it is still a plain anchor link.
 */
export function WatchDemoLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a
      href="#film"
      className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent(PLAY_FILM_EVENT));
      }}
    >
      {children}
    </a>
  );
}
