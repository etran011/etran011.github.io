"use client";

import { cinematicMotion } from "@/lib/cinematic-motion";
import { useEffect, useRef, type ReactNode } from "react";

/** Short, once-only assembly; text and button hit targets remain in place. */
export function SkillsReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    const desktop = matchMedia("(min-width: 1024px) and (pointer: fine)");
    const animations = new Map<Element, Animation>();
    const play = (target: Element, frames: Keyframe[], delay = 0) => {
      const animation = target.animate(frames, { duration: desktop.matches ? cinematicMotion.entrance : 300, delay, easing: cinematicMotion.easing });
      animations.set(target, animation);
      if (document.hidden) animation.pause();
      animation.onfinish = () => animations.delete(target);
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (reduce.matches || forced.matches) continue;
        if (entry.target.matches(".stack-header")) {
          const heading = entry.target.querySelector("h2");
          if (heading) play(heading, [{ opacity: 0.84, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }]);
          continue;
        }
        const heading = entry.target.querySelector(".stack-collection-heading");
        if (heading) play(heading, [{ opacity: 0.8, transform: "translateX(-8px)" }, { opacity: 1, transform: "none" }]);
        entry.target.querySelectorAll(".technology-icon").forEach((icon, index) => {
          play(icon, [
            { opacity: 0.7, transform: `translate(${desktop.matches ? (index % 2 ? 8 : -8) : 0}px, ${desktop.matches ? 16 : 6}px) scale(${desktop.matches ? 0.9 : 0.96})` },
            { opacity: 1, transform: "none" },
          ], Math.min(index * (desktop.matches ? 28 : 18), desktop.matches ? 160 : 90));
        });
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
    const header = element.parentElement?.querySelector(".stack-header");
    if (header) observer.observe(header);
    element.querySelectorAll(".stack-collection").forEach((category) => observer.observe(category));
    const cancel = () => { if (reduce.matches || forced.matches) { animations.forEach((animation) => animation.cancel()); animations.clear(); } };
    const focus = (event: FocusEvent) => {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (button) animations.forEach((animation, target) => { if (button.contains(target)) { animation.cancel(); animations.delete(target); } });
    };
    const visibility = () => animations.forEach(animation => document.hidden ? animation.pause() : animation.play());
    element.addEventListener("focusin", focus);
    document.addEventListener("visibilitychange", visibility);
    reduce.addEventListener("change", cancel); forced.addEventListener("change", cancel);
    return () => { element.removeEventListener("focusin", focus); document.removeEventListener("visibilitychange", visibility); observer.disconnect(); animations.forEach((animation) => animation.cancel()); reduce.removeEventListener("change", cancel); forced.removeEventListener("change", cancel); };
  }, []);
  return <div ref={root} className="stack-collections" data-skills-motion>{children}</div>;
}
