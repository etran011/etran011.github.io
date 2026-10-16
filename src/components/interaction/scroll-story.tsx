"use client";

import { scroll } from "motion";
import { useEffect, useRef, type ReactNode } from "react";

type StoryKind = "hero" | "about" | "project";

/** Native sticky positioning and Motion's shared scroll observer; never a scroll trap. */
export function ScrollStory({ kind, steps, children }: { kind: StoryKind; steps: number; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
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
    const reset = () => {
      stop?.(); stop = undefined;
      delete element.dataset.pinned; delete element.dataset.activeStep;
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
      const travel = Math.min(innerHeight * (kind === "hero" ? 0.48 : 0.62), kind === "hero" ? 440 : 560);
      element.style.setProperty("--scene-height", `${height}px`);
      element.style.setProperty("--scene-travel", `${travel}px`);
      element.dataset.pinned = "true";
      let previous = -1;
      stop = scroll((progress) => {
        if (Math.abs(progress - previous) < 0.0001) return;
        previous = progress;
        const phase = progress * (steps - 1);
        element.style.setProperty("--story-progress", progress.toFixed(4));
        for (let i = 0; i < steps; i++) element.style.setProperty(`--story-weight-${i}`, Math.max(0, 1 - Math.abs(phase - i) * 1.8).toFixed(4));
        const step = String(Math.round(phase));
        if (element.dataset.activeStep !== step) {
          element.dataset.activeStep = step;
          element.dispatchEvent(new CustomEvent("story-step", { detail: { step: Number(step) } }));
        }
      }, { target: element, offset: [`start ${top}px`, `end ${height + top}px`] });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(content);
    for (const query of [desktop, reduce, coarse, forced]) query.addEventListener("change", schedule);
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame); reset(); observer.disconnect();
      for (const query of [desktop, reduce, coarse, forced]) query.removeEventListener("change", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [kind, steps]);
  return <div ref={root} className="scroll-story" data-scroll-story={kind}><div ref={stage} className="story-stage">{children}</div></div>;
}
