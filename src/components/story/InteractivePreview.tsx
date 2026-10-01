"use client";

import { useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { layoutInk, type InkGlyph } from "@/lib/ink";
import { createWriter, type Writer } from "@/lib/ink-writer";
import { MATH_SIZE, MATH_X, SLIP, STEP4, WORK_LINES, WORK_WIDTH, notePosition } from "@/lib/canvas-content";
import { asset } from "@/lib/site";
import { Ink } from "../canvas/Ink";
import { Check, CorrectionStem, Dock, InlineInk, PanelLabel, SlipMark, StepNumbers, TopBar } from "../canvas/CanvasChrome";
import s from "../canvas/canvas.module.css";
import st from "./story.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STAGES = [
  { id: "write", title: "Write", body: "Work the problem by hand, the way you already do. Each step is checked as you go." },
  { id: "guidance", title: "Get guidance", body: "When a step slips, the exact term is marked, with a question instead of the answer." },
  { id: "correct", title: "Correct it", body: "You make the fix yourself, and the workspace confirms it." },
  { id: "practice", title: "Practice", body: "New problems focus on the idea behind the slip." },
] as const;

type Mode = "rail" | "scroll";

const VIEW_H = 740;
const PRACTICE = { text: "= 2x cos x − 2 sin x", x: MATH_X, y: 552, size: 34, seed: 67 };
const SHRINK = 0.58;
const HAND = { href: asset("/images/writing-hand.webp"), size: 627, nibX: 145, nibY: 122, scale: 1.22, angle: 33.2 };
const COLORS = { gray: "#8a958f", red: "#ac4237", redTint: "#f8e8e4", sage: "#587c65", sageTint: "#e9f0ea" };

type Stroke = { writer: Writer; start: number; dur: number };

const smooth = (x: number) => x * x * (3 - 2 * x);

export function InteractivePreview() {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const stageTimes = useRef<number[]>([]);
  const railRefs = useRef<(HTMLLIElement | null)[]>([]);
  const userPaused = useRef(false);
  const autoPaused = useRef(false);
  const started = useRef(false);
  const reduced = useRef(false);
  const listRef = useRef<HTMLOListElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<Mode>("rail");
  const replaying = useRef<{ active: boolean; scrollY: number }>({ active: false, scrollY: 0 });
  const [mode, setMode] = useState<Mode>("rail");
  const [stage, setStage] = useState(STAGES.length - 1);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const one = <T extends Element>(sel: string) => el.querySelector(sel) as unknown as T;

      // Writers for every handwritten line the student produces.
      const lineGroup = (id: string) => one<SVGGElement>(`[data-ink="${id}"]`);
      const writers: Record<string, Writer> = {};
      for (const line of WORK_LINES.slice(1)) {
        writers[line.id] = createWriter(lineGroup(line.id), layoutInk(line.text, line.seed).glyphs, {
          x: MATH_X,
          y: line.y,
          size: MATH_SIZE,
        });
      }
      const slipGlyph = layoutInk(STEP4.text, STEP4.seed).glyphs[SLIP.glyphIndex];
      const stemGlyph: InkGlyph = {
        ...slipGlyph,
        strokes: [{ d: "", segments: [[[13, 7], [13, 29]]], length: 22 }],
      };
      writers.stem = createWriter(lineGroup("stem"), [stemGlyph], { x: MATH_X, y: STEP4.y, size: MATH_SIZE });
      writers.practice = createWriter(lineGroup("practice"), layoutInk(PRACTICE.text, PRACTICE.seed).glyphs, PRACTICE);

      const hand = one<SVGGElement>("[data-hand]");
      const handImage = one<SVGImageElement>("[data-hand] image");
      const steps = [1, 2, 3, 4].map((n) => one<SVGTextElement>(`[data-step="${n}"]`));
      const checks = q("[data-check]");
      const slip = one<SVGGElement>("[data-slip]");
      const slipRect = slip.querySelector("rect");
      const slipLine = slip.querySelector("path");
      const work = one<SVGGElement>("[data-work]");
      const panel = (id: string) => one<HTMLElement>(`[data-panel="${id}"]`);
      const note = (id: string) => one<HTMLElement>(`[data-note="${id}"]`);
      const practiceBlock = one<HTMLElement>("[data-practice]");

      // Start-of-story state. The server rendered the finished story.
      gsap.set(steps, { autoAlpha: 0 });
      gsap.set(steps[3], { fill: COLORS.gray });
      gsap.set(checks, { autoAlpha: 0, y: 4 });
      gsap.set(slip, { autoAlpha: 0 });
      gsap.set(slipRect, { fill: COLORS.redTint });
      gsap.set(slipLine, { stroke: COLORS.red });
      gsap.set([note("slip"), note("fixed"), note("practice")], { autoAlpha: 0, y: 6 });
      gsap.set([panel("guidance"), panel("correct"), panel("practice")], { autoAlpha: 0 });
      gsap.set(panel("write"), { autoAlpha: 1 });
      gsap.set(work, { scale: 1, svgOrigin: `${MATH_X} 0` });
      gsap.set(practiceBlock, { autoAlpha: 0, y: 8 });
      gsap.set(hand, { autoAlpha: 0 });

      const tl = gsap.timeline({ paused: true, defaults: { duration: 0.4, ease: "power2.out" } });
      const strokes: Stroke[] = [];
      const write = (writer: Writer, start: number, speed: number) => {
        const dur = writer.total / speed;
        strokes.push({ writer, start, dur });
        tl.to({}, { duration: dur }, start);
        return dur;
      };

      // 1. Write
      let t = 0.15;
      tl.addLabel("write", 0);
      tl.to(hand, { autoAlpha: 1, duration: 0.35 }, t);
      t += 0.3;
      WORK_LINES.slice(1, 4).forEach((line, i) => {
        tl.to(steps[i], { autoAlpha: 1, duration: 0.3 }, t);
        t += write(writers[line.id], t, 600);
        tl.to(checks[i], { autoAlpha: 1, y: 0, duration: 0.35 }, t + 0.05);
        t += 0.26;
      });
      tl.to(steps[3], { autoAlpha: 1, duration: 0.3 }, t);
      t += write(writers.s4, t, 430) + 0.2;

      // 2. Guidance
      tl.addLabel("guidance", t);
      tl.to(hand, { autoAlpha: 0, duration: 0.35 }, t);
      tl.to(slip, { autoAlpha: 1 }, t + 0.1);
      tl.to(steps[3], { fill: COLORS.red, duration: 0.3 }, t + 0.1);
      tl.to(panel("write"), { autoAlpha: 0, duration: 0.25 }, t + 0.1);
      tl.to(panel("guidance"), { autoAlpha: 1, duration: 0.35 }, t + 0.3);
      tl.to(note("slip"), { autoAlpha: 1, y: 0, duration: 0.45 }, t + 0.3);
      t += 0.75 + 2.5;

      // 3. Correct
      tl.addLabel("correct", t);
      tl.to(hand, { autoAlpha: 1, duration: 0.3 }, t);
      t += 0.4;
      t += write(writers.stem, t, 60);
      tl.to(slipRect, { fill: COLORS.sageTint }, t);
      tl.to(slipLine, { stroke: COLORS.sage }, t);
      tl.to(steps[3], { fill: COLORS.gray, duration: 0.3 }, t);
      tl.to(note("slip"), { autoAlpha: 0, duration: 0.25 }, t);
      tl.to(note("fixed"), { autoAlpha: 1, y: 0 }, t + 0.15);
      tl.to(panel("guidance"), { autoAlpha: 0, duration: 0.25 }, t);
      tl.to(panel("correct"), { autoAlpha: 1, duration: 0.35 }, t + 0.15);
      tl.to(checks[3], { autoAlpha: 1, y: 0, duration: 0.35 }, t + 0.3);
      tl.to(hand, { autoAlpha: 0, duration: 0.35 }, t + 0.25);
      t += 0.6 + 1.9;

      // 4. Practice
      tl.addLabel("practice", t);
      tl.to([note("fixed"), slip], { autoAlpha: 0, duration: 0.3 }, t);
      tl.to(work, { scale: SHRINK, svgOrigin: `${MATH_X} 0`, duration: 0.85, ease: "power2.inOut" }, t + 0.15);
      tl.to(panel("correct"), { autoAlpha: 0, duration: 0.25 }, t + 0.1);
      tl.to(panel("practice"), { autoAlpha: 1, duration: 0.35 }, t + 0.3);
      tl.to(practiceBlock, { autoAlpha: 1, y: 0, duration: 0.5 }, t + 0.8);
      tl.to(hand, { autoAlpha: 1, duration: 0.3 }, t + 1.1);
      t += 1.5;
      t += write(writers.practice, t, 430);
      tl.to(hand, { autoAlpha: 0, duration: 0.35 }, t + 0.1);
      tl.to(note("practice"), { autoAlpha: 1, y: 0 }, t + 0.2);
      t += 0.6 + 1.8;
      tl.to({}, { duration: 0.01 }, t);

      const labels = ["write", "guidance", "correct", "practice"].map((l) => tl.labels[l]);
      stageTimes.current = labels;
      const end = tl.duration();

      // Ink and the hand are pure functions of the playhead, so seeking always draws correctly.
      const setHand = (x: number, y: number) =>
        hand.setAttribute(
          "transform",
          `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${HAND.angle}) scale(${HAND.scale}) translate(${-HAND.nibX} ${-HAND.nibY})`,
        );
      const tipAt = (time: number): [number, number] => {
        for (let i = 0; i < strokes.length; i++) {
          const { writer, start, dur } = strokes[i];
          if (time < start) {
            if (i === 0) return writer.tipAt(0);
            const prev = strokes[i - 1];
            const from = prev.writer.tipAt(prev.writer.total);
            const to = writer.tipAt(0);
            const a = smooth((time - (prev.start + prev.dur)) / (start - (prev.start + prev.dur)));
            return [from[0] + (to[0] - from[0]) * a, from[1] + (to[1] - from[1]) * a];
          }
          if (time <= start + dur) return writer.tipAt(((time - start) / dur) * writer.total);
        }
        const last = strokes[strokes.length - 1];
        return last.writer.tipAt(last.writer.total);
      };

      let shownStage = -1;
      const sync = () => {
        const time = tl.time();
        for (const { writer, start, dur } of strokes) {
          writer.render(Math.max(0, Math.min(1, (time - start) / dur)) * writer.total);
        }
        const [x, y] = tipAt(time);
        setHand(x, y);
        let idx = 0;
        for (let i = 0; i < labels.length; i++) if (time >= labels[i]) idx = i;
        labels.forEach((startAt, i) => {
          const stop = labels[i + 1] ?? end;
          const p = i < idx ? 1 : i > idx ? 0 : Math.min(1, (time - startAt) / (stop - startAt));
          railRefs.current[i]?.style.setProperty("--p", p.toFixed(3));
        });
        if (idx !== shownStage) {
          shownStage = idx;
          setStage(idx);
        }
      };
      tl.eventCallback("onUpdate", sync);
      tl.eventCallback("onComplete", () => setPlaying(false));
      tlRef.current = tl;
      const loadHand = () => {
        if (!handImage.getAttribute("href")) handImage.setAttribute("href", HAND.href);
      };

      // Wide screens: the page scroll drives the story (sticky canvas, steps scroll past).
      // Narrower screens: the story plays once in view, with Play, Replay and step buttons.
      const mm = gsap.matchMedia();
      // The handler only runs while at least one condition matches, so "rail" complements "scroll".
      mm.add(
        { scroll: "(min-width: 1024px)", rail: "(max-width: 1023.98px)", reduce: "(prefers-reduced-motion: reduce)" },
        (context) => {
          const { scroll, reduce } = context.conditions as { scroll: boolean; reduce: boolean };
          reduced.current = reduce;
          modeRef.current = scroll ? "scroll" : "rail";
          setMode(modeRef.current);
          replaying.current.active = false;
          tl.pause();
          setPlaying(false);

          if (scroll) {
            const list = listRef.current;
            if (!list) return;
            const items = Array.from(list.children) as HTMLElement[];
            let bounds: { top: number; height: number }[] = [];
            const measure = () => {
              const top = list.getBoundingClientRect().top;
              bounds = items.map((item) => {
                const r = item.getBoundingClientRect();
                return { top: r.top - top, height: r.height };
              });
            };
            let shown = -1;
            const follow = (progress: number, immediate: boolean) => {
              if (!bounds.length) measure();
              const probe = progress * list.offsetHeight;
              let i = 0;
              while (i < bounds.length - 1 && probe >= bounds[i + 1].top) i++;
              const local = Math.max(0, Math.min(1, (probe - bounds[i].top) / bounds[i].height));
              const from = labels[i];
              const to = labels[i + 1] ?? end;
              if (reduce) {
                // No motion: each step simply shows its finished state.
                if (i !== shown || immediate) tl.time(labels[i + 1] !== undefined ? to - 0.01 : end);
                shown = i;
                return;
              }
              const target = from + local * (to - from);
              if (immediate) tl.time(target);
              else gsap.to(tl, { time: target, duration: 0.45, ease: "power2.out", overwrite: true });
            };
            const trigger = ScrollTrigger.create({
              trigger: list,
              start: "top 55%",
              end: "bottom 55%",
              onRefresh: (self) => {
                measure();
                if (!replaying.current.active) follow(self.progress, true);
              },
              onToggle: (self) => {
                if (self.isActive) loadHand();
              },
              onUpdate: (self) => {
                const replay = replaying.current;
                if (replay.active) {
                  if (Math.abs(window.scrollY - replay.scrollY) < 40) return;
                  replay.active = false;
                  tl.pause();
                  setPlaying(false);
                }
                follow(self.progress, false);
              },
            });
            measure();
            follow(trigger.progress, true);
            return () => trigger.kill();
          }

          if (reduce) {
            tl.progress(1);
            return;
          }
          tl.progress(0);
          started.current = false;
          // Play when the preview comes into view; pause when it leaves.
          const io = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                loadHand();
                if (userPaused.current) return;
                if (!started.current) {
                  started.current = true;
                  tl.play(0);
                  setPlaying(true);
                } else if (autoPaused.current) {
                  autoPaused.current = false;
                  tl.resume();
                  setPlaying(true);
                }
              } else if (tl.isActive()) {
                autoPaused.current = true;
                tl.pause();
                setPlaying(false);
              }
            },
            { threshold: 0.3 },
          );
          io.observe(el);
          return () => io.disconnect();
        },
      );

      sync();
      setReady(true);
      return () => mm.revert();
    },
    { scope: root },
  );

  const ensureHand = () => {
    const img = root.current?.querySelector("[data-hand] image");
    if (img && !img.getAttribute("href")) img.setAttribute("href", HAND.href);
  };

  // These handlers only steer the existing timeline; they create no new tweens,
  // so they do not need GSAP's contextSafe wrapper.
  const togglePlay = () => {
    const tl = tlRef.current;
    if (!tl) return;
    ensureHand();
    if (modeRef.current === "scroll") {
      if (tl.isActive()) {
        tl.pause();
        setPlaying(false);
      } else {
        replay();
      }
      return;
    }
    started.current = true;
    autoPaused.current = false;
    if (tl.isActive()) {
      tl.pause();
      userPaused.current = true;
      setPlaying(false);
    } else {
      userPaused.current = false;
      if (tl.progress() >= 1) tl.restart();
      else tl.play();
      setPlaying(true);
    }
  };

  function replay() {
    const tl = tlRef.current;
    if (!tl) return;
    ensureHand();
    if (modeRef.current === "scroll") {
      // Play the whole story in place; the next scroll hands control back to the page.
      replaying.current = { active: true, scrollY: window.scrollY };
    }
    started.current = true;
    userPaused.current = false;
    autoPaused.current = false;
    tl.restart();
    setPlaying(true);
  }

  const goTo = (index: number) => {
    const tl = tlRef.current;
    if (!tl) return;
    ensureHand();
    if (modeRef.current === "scroll") {
      const item = listRef.current?.children[index] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "center", behavior: reduced.current ? "auto" : "smooth" });
      return;
    }
    started.current = true;
    autoPaused.current = false;
    const times = stageTimes.current;
    // Bring the canvas into view when it sits below the step buttons (tablets in portrait).
    const frame = frameRef.current;
    if (frame && frame.getBoundingClientRect().bottom > window.innerHeight) {
      frame.scrollIntoView({ block: "nearest", behavior: reduced.current ? "auto" : "smooth" });
    }
    if (reduced.current) {
      // Show the finished state of that stage without animating. Events must fire
      // (suppressEvents=false) so the ink, rail and step state are redrawn.
      const stop = times[index + 1] !== undefined ? times[index + 1] - 0.01 : tl.duration();
      tl.pause(stop, false);
      userPaused.current = true;
      setPlaying(false);
      return;
    }
    userPaused.current = false;
    tl.play(times[index]);
    setPlaying(true);
  };

  return (
    <div ref={root} className={st.preview} data-mode={mode}>
      <ol ref={listRef} className={st.rail} aria-label="Learning steps">
        {STAGES.map((item, i) => (
          <li
            key={item.id}
            ref={(node) => {
              railRefs.current[i] = node;
            }}
            className={st.railItem}
            data-active={i === stage || undefined}
            data-done={i < stage || undefined}
            style={{ "--p": 1 } as CSSProperties}
          >
            <button
              type="button"
              className={st.railButton}
              onClick={() => goTo(i)}
              aria-current={i === stage ? "step" : undefined}
              disabled={!ready}
            >
              <span className={st.railNumber}>{i + 1}</span>
              <span className={st.railText}>
                <span className={st.railTitle}>{item.title}</span>
                <span className={st.railBody}>{item.body}</span>
              </span>
            </button>
            <span className={st.railBar} aria-hidden="true" />
          </li>
        ))}
      </ol>

      <div className={st.stage}>
        <div className={st.frameBar}>
          <p className={st.previewLabel}>
            <span className={st.previewDot} aria-hidden="true" />
            Interactive preview
            {mode === "scroll" ? <span className={st.scrollHint}>Scroll to step through</span> : null}
          </p>
          <div className={st.controls}>
            <button
              type="button"
              className={st.control}
              onClick={togglePlay}
              disabled={!ready}
              hidden={mode === "scroll" && !playing}
            >
              {playing ? (
                <>
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M5 3.5v9M11 3.5v9" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M5 3.2v9.6l7.5-4.8z" className={st.fill} />
                  </svg>
                  Play
                </>
              )}
            </button>
            <button type="button" className={st.control} onClick={replay} disabled={!ready}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3.5 8a4.5 4.5 0 104.5-4.5H5.5M7.5 1.5l-2 2 2 2" />
              </svg>
              Replay
            </button>
          </div>
        </div>

        <div className={st.frame} ref={frameRef}>
          <div
            className={s.screen}
            role="img"
            aria-label="Interactive preview of the canvas. A student writes the integration by parts of x squared e to the x. In step 4 the workspace highlights the sign before the final 2 and asks: What does negative times negative give? The student turns the minus into a plus, the workspace confirms the correction, and a practice problem on distributing a negative sign follows: expanding minus 2 times (minus x cos x plus sin x) to 2x cos x minus 2 sin x."
          >
            <div className={s.ui} aria-hidden="true">
              <TopBar />
              <div className={s.main}>
                <div className={s.work}>
                  <p className={s.subject}>Calculus</p>
                  <div className={s.workArea}>
                    <svg viewBox={`0 0 ${WORK_WIDTH} ${VIEW_H}`} className={s.workSvg}>
                      <g data-work="" transform={`matrix(${SHRINK} 0 0 ${SHRINK} ${MATH_X * (1 - SHRINK)} 0)`}>
                        <SlipMark className={st.initiallyHidden} />
                        <StepNumbers />
                        {WORK_LINES.map((line) => (
                          <Ink
                            key={line.id}
                            inkId={line.id}
                            text={line.text}
                            x={MATH_X}
                            y={line.y}
                            size={MATH_SIZE}
                            seed={line.seed}
                          />
                        ))}
                        <CorrectionStem />
                      </g>
                      <Ink
                        inkId="practice"
                        text={PRACTICE.text}
                        x={PRACTICE.x}
                        y={PRACTICE.y}
                        size={PRACTICE.size}
                        seed={PRACTICE.seed}
                      />
                    </svg>

                    <div
                      className={`${s.note} ${st.initiallyHidden}`}
                      data-note="slip"
                      style={notePosition(SLIP.underlineY + 24) as CSSProperties}
                    >
                      <p className={s.noteTitle}>Check this sign</p>
                      <p className={s.noteBody}>What does negative × negative give?</p>
                    </div>
                    <div
                      className={`${s.note} ${s.noteOk} ${st.initiallyHidden}`}
                      data-note="fixed"
                      style={notePosition(SLIP.underlineY + 24) as CSSProperties}
                    >
                      <p className={s.noteTitle}>
                        <Check /> Sign corrected
                      </p>
                      <p className={s.noteBody}>The second product is positive.</p>
                    </div>

                    <div className={st.practice} data-practice="">
                      <p className={st.practiceTitle}>Practice: sign distribution</p>
                      <p className={st.practicePrompt}>
                        New problem:{" "}
                        <span className="math">
                          ∫ x<sup>2</sup> cos x dx
                        </span>
                        . Expand this term:
                      </p>
                      <p className={st.practiceExpr}>−2(−x cos x + sin x)</p>
                    </div>
                    <div
                      className={`${s.note} ${s.noteOk}`}
                      data-note="practice"
                      style={{ "--x": 70, "--y": 618, "--caret": 26, "--x-narrow": 70, "--caret-narrow": 26 } as CSSProperties}
                    >
                      <p className={s.noteTitle}>
                        <Check /> Both signs checked
                      </p>
                      <p className={s.noteBody}>You applied −2 to both terms.</p>
                    </div>

                    <svg viewBox={`0 0 ${WORK_WIDTH} ${VIEW_H}`} className={s.handLayer}>
                      <g data-hand="" opacity={0}>
                        <image width={HAND.size} height={HAND.size} />
                      </g>
                    </svg>
                  </div>
                </div>

                <div className={s.panel}>
                  <PanelLabel>Live guidance</PanelLabel>
                  <div className={st.panelStack}>
                    <div data-panel="write" className={st.initiallyHidden}>
                      <p className={s.panelTitle}>Working with you</p>
                      <div className={s.card}>
                        <p className={`${s.cardTitle} ${s.cardRow}`}>
                          <Check /> Following your work
                        </p>
                        <p className={s.cardBody}>Each step is checked as you write it.</p>
                      </div>
                    </div>
                    <div data-panel="guidance" className={st.initiallyHidden}>
                      <p className={s.panelTitle}>Check step 4</p>
                      <div className={`${s.card} ${s.cardRed}`}>
                        <p className={s.cardTitle}>Distribute −2 to both terms.</p>
                        <InlineInk text="−2(xe^x − e^x)" />
                        <p className={s.cardHint}>Check negative × negative.</p>
                      </div>
                    </div>
                    <div data-panel="correct" className={st.initiallyHidden}>
                      <p className={s.panelTitle}>Sign corrected</p>
                      <div className={s.card}>
                        <p className={`${s.cardTitle} ${s.cardRow}`}>
                          <Check /> Step 4 is right now
                        </p>
                        <p className={`${s.cardBody} math`}>
                          −2 × (−e<sup>x</sup>) = +2e<sup>x</sup>
                        </p>
                      </div>
                    </div>
                    <div data-panel="practice">
                      <p className={s.panelTitle}>Targeted practice</p>
                      <div className={s.card}>
                        <p className={s.cardTitle}>Sign distribution</p>
                        <p className={s.cardBody}>Built from the slip in step 4.</p>
                      </div>
                    </div>
                  </div>
                  <div className={s.divider} />
                  <PanelLabel>Checked in this work</PanelLabel>
                  <ul className={s.checklist}>
                    {["Choice of u and dv", "First reduction", "Second reduction", "Sign correction"].map((label) => (
                      <li key={label} data-check="">
                        <Check /> {label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Dock />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
