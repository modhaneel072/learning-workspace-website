# Learning Workspace: marketing website

The launch site for Learning Workspace, an intelligent notebook and whiteboard that follows a student's handwritten math, points to the step where reasoning slips, and builds practice around the idea behind it.

**Live:** https://modhaneel072.github.io/learning-workspace-website/

Built with Next.js 16 (App Router), React 19, TypeScript and GSAP 3. The site is fully static: `npm run build` writes plain HTML, CSS, JS and media to `out/`. It is hosted free on GitHub Pages.

## Run it

```bash
npm install
npm run dev        # development server at http://localhost:3000
npm run build      # static site in out/
npm run preview    # serve out/ at http://localhost:3200 (same sub-path as the build)
npm run lint
npm run typecheck
```

Node 20.9 or newer is required.

## Deployment (GitHub Pages)

Every push to `main` runs `.github/workflows/deploy.yml`. The workflow lints, type-checks and builds the static site, then publishes `out/` to GitHub Pages. The build gets the Pages sub-path (`/learning-workspace-website`) and full URL from `actions/configure-pages`, so asset links, canonical URLs, the sitemap and social cards all point at the live address.

To deploy somewhere else (Vercel, Netlify, Cloudflare Pages, a custom domain), build with `NEXT_PUBLIC_BASE_PATH` empty and `NEXT_PUBLIC_SITE_URL` set to that address, then serve `out/`.

## Early-access sign-up (not connected yet)

No submission service is configured, so the form is in its explicit unconfigured state. It validates the email, then tells the visitor that nothing was sent or stored. It never shows a fake success.

Because the site is static, the browser posts the form straight to a form service. To connect it:

1. Create a form endpoint that accepts JSON and allows cross-origin requests. For example, [Formspree](https://formspree.io) gives you a URL like `https://formspree.io/f/xxxxxxx`.
2. In the GitHub repository, go to **Settings → Secrets and variables → Actions → Variables** and add `EARLY_ACCESS_ENDPOINT` with that URL.
3. Re-run the **Deploy to GitHub Pages** workflow (Actions tab → Run workflow), or push any commit.

The form sends:

```json
{ "email": "student@example.com", "role": "university", "source": "learning-workspace-website" }
```

The visitor sees "Request received" only after the service answers with a 2xx status; otherwise it asks them to try again. A hidden honeypot field silently drops automated submissions. Server-side email validation and spam filtering are the form service's job.

## What is on the page

| Section | Notes |
| --- | --- |
| Hero | Headline, both calls to action, and a large canvas preview at the moment guidance appears. The canvas is drawn in HTML and SVG, so it stays sharp at any size and needs no JavaScript. |
| Film (`#film`) | The 55-second product film, with a poster frame, English captions (WebVTT) and the narration as text. Sound plays only after a click, either on the play button or on "Watch the demo". |
| How it works (`#how-it-works`) | The "Interactive preview" is one GSAP timeline that goes write → guidance → correct → practice. The film's own handwriting glyphs are drawn stroke by stroke, and the film's writing-hand image follows the pen. **At 1024px and wider it is scrollytelling.** The canvas stays in view (CSS `position: sticky`, so nothing is pinned or hijacked) while the four steps scroll past, and the scroll position drives the timeline. Scrolling back rewinds it. Replay plays the story in place, and the next scroll hands control back to the page. **Below 1024px** the story plays once when it comes into view, with Pause/Play, Replay and a button for each step. **With reduced motion** nothing autoplays or scrubs: each step shows its finished state, and the writing hand is hidden. |
| Practice (`#practice`) | A labelled illustrative example: one sign slip in three different problems, the pattern behind it, and three practice questions aimed at it. On wide screens the board assembles left to right as it scrolls into view: items rise into place, the arrows draw, and the pattern card fills. Text is never faded, so it stays readable, and passes contrast checks, at every moment. |
| Graphs (`#graphs`) | f(x) = x²eˣ in 2D with the area e − 2 shaded, and z = x²eʸ in 3D with the y = x slice. Phones and reduced-motion visitors get a static SVG (`graphs/surface.svg`, about 8 KB gzipped). Wider screens load a canvas that turns slowly, with Pause, a Turn slider and drag to rotate. Where the surface actually covers the slice, that part is drawn dashed; this is checked by ray-marching toward the camera. |
| Closing (`#early-access`) | "Don't just find your mistakes. Stop repeating them.", what is available first (math) and what comes later, and the early-access form. |

All math shown on the site has been checked. The worked example is
`I = ∫ x²eˣ dx = x²eˣ − 2∫ xeˣ dx = eˣ(x² − 2x + 2) + C`. The slip is the final `− 2`, and the corrected result gives `∫₀¹ x²eˣ dx = e − 2`.

## Media

- `public/media/learning-workspace-film-v4.mp4`: the 55-second v4 film. H.264 1920×1080 at 24 fps, with AAC 256 kbps audio (voice and continuous music, −16 LUFS) and `+faststart` for quick web playback.
- `public/media/film-poster.jpg`: the film's first frame.
- `public/media/learning-workspace-film.en.vtt`: captions made from the film's narration timing.
- `public/images/writing-hand.webp`: the film's writing-hand cut-out, resized.
- `src/app/opengraph-image.png`: a frame from the film at the moment of guidance.

## Structure

```
.github/workflows/deploy.yml   build + publish to GitHub Pages
scripts/serve-out.mjs          dependency-free static preview server (sub-path aware, supports video seeking)
src/
  app/                         layout, page, metadata routes, graphs/surface.svg
  components/
    canvas/                    product canvas pieces shared by the hero and the interactive preview
    hero/  film/  story/  practice/  graphs/  closing/  header/
  lib/
    ink.ts                     the film's single-stroke handwriting as deterministic SVG paths
    ink-writer.ts              stroke-by-stroke drawing and pen-tip tracking for the preview
    canvas-content.ts          the worked example and its layout
    surface*.ts                3D geometry, plus SVG and canvas renderers
    site.ts                    site constants and the base-path-aware asset() helper
```

## Honesty notes

- No testimonials, logos, pricing, user counts, outcome statistics or app-store links.
- Copy says "feedback as you work". It makes no latency promises.
- The practice visual is labelled "Illustrative example".
- Programming, engineering, circuits, diagrams and CAD are described as longer-term plans, not available yet.
