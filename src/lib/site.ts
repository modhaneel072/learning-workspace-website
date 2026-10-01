export const SITE_NAME = "Learning Workspace";

/** Sub-path the site is served from, e.g. "/learning-workspace-website" on GitHub Pages; "" at a domain root. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

/** Full public URL of the site, including BASE_PATH. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:3000${BASE_PATH}`).replace(/\/$/, "");

/** Prefix a file from /public with the base path. Next.js does this for its own links, not for raw src/href strings. */
export const asset = (path: string) => `${BASE_PATH}${path}`;

export const SITE_DESCRIPTION =
  "Learning Workspace is an intelligent notebook and whiteboard for students. It follows your handwritten math, points to the step where your reasoning slips, and builds practice around the ideas you need.";

export const NAV_LINKS = [
  { href: "#film", label: "Film" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#practice", label: "Practice" },
  { href: "#graphs", label: "Graphs" },
] as const;

export const FILM = {
  src: asset("/media/learning-workspace-film-v4.mp4"),
  poster: asset("/media/film-poster.jpg"),
  captions: asset("/media/learning-workspace-film.en.vtt"),
  durationLabel: "55 seconds",
  lengthAdjective: "55-second",
};

/** Narration from the film, with its cue times in seconds. */
export const FILM_TRANSCRIPT: ReadonlyArray<readonly [number, number, string]> = [
  [0.45, 3.29, "Learn from your mistakes, while you work."],
  [3.8, 6.22, "Learning Workspace guides you as you write."],
  [10.0, 13.0, "Feedback at every step, right where you need it."],
  [25.7, 28.8, "When something goes wrong, you see exactly where to look."],
  [29.6, 32.84, "A nudge that helps you understand, without taking over."],
  [36.3, 39.3, "Then, practice built around what you need to learn."],
  [45.6, 47.46, "So the next time, you’re ready."],
  [50.2, 51.82, "Don’t just find your mistakes."],
  [52.6, 53.72, "Stop repeating them."],
];
