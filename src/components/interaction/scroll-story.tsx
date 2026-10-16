"use client";

import { scroll } from "motion";
import { createStoryPacer } from "@/lib/story-pacer";
import { useEffect, useRef, type ReactNode } from "react";

type StoryKind = "hero" | "about" | "project";
const sceneTravel = { hero: [0.65, 600], about: [0.4, 360], project: [0.5, 480] } as const;

/** Native sticky positioning and Motion's shared scroll observer; never a scroll trap. */
export function ScrollStory({ kind, steps, children }: { kind: StoryKind; steps: number; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const typeScale = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = root.current;
    const content = stage.current;
    if (!element || !content) return;
    const desktop = matchMedia("(min-width: 1024px) and (min-height: 720px) and (hover: hover) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(any-pointer: coarse)");
    const forced = matchMedia("(forced-colors: active)");
    let stop: (() => void) | undefined;
    let frame = 0;
    let signature = "";
    let pacingFrame = 0;
    let target = 0;
    let visible = false;
    const pacer = createStoryPacer(steps);
    const render = (progress: number) => {
      // Publish the already paced hero value; the atmosphere never controls scrolling.
      if (kind === "hero") element.dispatchEvent(new CustomEvent("story-progress", { detail: { progress } }));
      const phase = progress * (steps - 1);
      element.style.setProperty("--story-progress", progress.toFixed(4));
      for (let i = 0; i < steps; i++) {
        const weight = Math.max(0, Math.min(1, (0.88 - Math.abs(phase - i)) / 0.76));
        element.style.setProperty(`--story-weight-${i}`, weight.toFixed(4));
      }
      const current = element.dataset.activeStep;
      const step = current === undefined || Math.abs(phase - Number(current)) > 0.58 ? String(Math.round(phase)) : current;
      if (element.dataset.activeStep !== step) {
        element.dataset.activeStep = step;
        element.dispatchEvent(new CustomEvent("story-step", { detail: { step: Number(step) } }));
      }
    };
    const settle = () => { cancelAnimationFrame(pacingFrame); pacingFrame = 0; if (element.dataset.pinned) render(pacer.snap(target)); };
    const animate = () => {
      if (pacingFrame) return;
      let previous = performance.now();
      const tick = (now: number) => {
        const value = pacer.advance(target, now - previous);
        previous = now;
        render(value);
        pacingFrame = value === target ? 0 : requestAnimationFrame(tick);
      };
      pacingFrame = requestAnimationFrame(tick);
    };
    const reset = () => {
      stop?.(); stop = undefined; cancelAnimationFrame(pacingFrame); pacingFrame = 0;
      delete element.dataset.pinned; delete element.dataset.activeStep; delete element.dataset.storyTravel;
      element.style.removeProperty("--scene-height"); element.style.removeProperty("--scene-travel"); element.style.removeProperty("--story-progress");
      for (let i = 0; i < steps; i++) element.style.removeProperty(`--story-weight-${i}`);
    };
    const measure = () => {
      frame = 0;
      const height = Math.ceil(content.getBoundingClientRect().height);
      const top = kind === "hero" ? 0 : 112;
      const enabled = desktop.matches && !reduce.matches && !coarse.matches && !forced.matches && navigator.maxTouchPoints === 0 && parseFloat(getComputedStyle(document.documentElement).fontSize) <= 20 && height <= innerHeight - (kind === "hero" ? 0 : 136);
      const next = `${enabled}:${height}:${innerHeight}:${innerWidth}`;
      if (signature === next) return;
      signature = next; reset();
      if (!enabled) return;
      const [fraction, maximum] = sceneTravel[kind];
      const travel = Math.min(innerHeight * fraction, maximum);
      element.style.setProperty("--scene-height", `${height}px`);
      element.style.setProperty("--scene-travel", `${travel}px`);
      element.dataset.pinned = "true";
      element.dataset.storyTravel = String(travel);
      let previous = -1;
      stop = scroll((progress) => {
        if (Math.abs(progress - previous) < 0.0001) return;
        previous = progress;
        target = progress;
        if (!visible || document.hidden) settle();
        else animate();
      }, { target: element, offset: [`start ${top}px`, `end ${height + top}px`] });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) settle(); });
    visibility.observe(element);
    const onVisibility = () => { if (document.hidden) settle(); };
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new ResizeObserver(schedule);
    observer.observe(content);
    // A full-height stage may keep its size when root text grows; observe rem size too.
    if (typeScale.current) observer.observe(typeScale.current);
    for (const query of [desktop, reduce, coarse, forced]) query.addEventListener("change", schedule);
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame); reset(); observer.disconnect(); visibility.disconnect(); document.removeEventListener("visibilitychange", onVisibility);
      for (const query of [desktop, reduce, coarse, forced]) query.removeEventListener("change", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [kind, steps]);
  return <div ref={root} className="scroll-story" data-scroll-story={kind}><span ref={typeScale} className="story-type-probe" aria-hidden="true" /><div ref={stage} className="story-stage">{children}</div></div>;
}
