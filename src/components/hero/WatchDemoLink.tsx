"use client";

import type { ReactNode } from "react";

export const PLAY_FILM_EVENT = "lw:play-film";

/**
 * Brings the film into view and starts it. The click is the user action that
 * allows playback with sound. Without JavaScript it is a plain anchor link.
 */
export function WatchDemoLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a
      href="#film"
      className={className}
      onClick={(event) => {
        // The film scrolls its own player into view (whole video and controls).
        event.preventDefault();
        window.dispatchEvent(new CustomEvent(PLAY_FILM_EVENT));
      }}
    >
      {children}
    </a>
  );
}
