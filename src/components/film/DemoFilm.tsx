"use client";

import { useEffect, useRef, useState } from "react";
import { FILM, FILM_TRANSCRIPT } from "@/lib/site";
import { PLAY_FILM_EVENT } from "../hero/WatchDemoLink";
import styles from "./DemoFilm.module.css";

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export function DemoFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    setStarted(true);
    video.muted = false;
    video.play().catch(() => {
      // Playback was refused; leave the native controls available.
    });
    // The play button disappears once the film starts; keep keyboard focus on the player.
    requestAnimationFrame(() => video.focus({ preventScroll: true }));
  };

  useEffect(() => {
    const onRequest = () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      playerRef.current?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      if (location.hash !== "#film") history.pushState(null, "", "#film");
      play();
    };
    window.addEventListener(PLAY_FILM_EVENT, onRequest);
    return () => window.removeEventListener(PLAY_FILM_EVENT, onRequest);
  }, []);

  return (
    <section id="film" className={`section ${styles.section}`} aria-labelledby="film-title">
      <div className="container">
        <div className={styles.head}>
          <h2 id="film-title" className="section-title">
            One problem, start to finish.
          </h2>
          <p className="section-lede">
            In this {FILM.lengthAdjective} film, a student works through an integral, gets a nudge at the step that went
            wrong, fixes it, and practices the idea behind it. Best with sound on.
          </p>
        </div>

        <div className={styles.player} data-started={started || undefined} ref={playerRef}>
          <video
            ref={videoRef}
            className={styles.video}
            poster={FILM.poster}
            preload="none"
            playsInline
            controls={started}
            width={1920}
            height={1080}
            onPlay={() => setStarted(true)}
            onError={() => setFailed(true)}
            aria-label="Learning Workspace product film"
          >
            <source src={FILM.src} type="video/mp4" />
            <track kind="captions" src={FILM.captions} srcLang="en" label="English" />
          </video>

          {!started ? (
            <button type="button" className={styles.playButton} onClick={play}>
              <span className={styles.playIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path d="M8 5.5v13a.8.8 0 001.2.7l10.2-6.5a.8.8 0 000-1.4L9.2 4.8A.8.8 0 008 5.5z" fill="currentColor" />
                </svg>
              </span>
              <span className={styles.playText}>
                <span className={styles.playTitle}>Play the film</span>
                <span className={styles.playMeta}>{FILM.durationLabel}, with sound</span>
              </span>
            </button>
          ) : null}
        </div>

        {failed ? (
          <p className={styles.error} role="status">
            The film could not be loaded. <a href={FILM.src}>Open the video file directly</a>.
          </p>
        ) : null}

        <details className={styles.transcript}>
          <summary>Read the narration</summary>
          <ol>
            {FILM_TRANSCRIPT.map(([start, , line]) => (
              <li key={start}>
                <span className={styles.time}>{clock(start)}</span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </section>
  );
}
