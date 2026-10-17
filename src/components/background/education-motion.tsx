"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cinematicMotion } from "@/lib/cinematic-motion";

/** Progressive enhancement: all academic information is visible before JavaScript. */
export function EducationMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    const compact = matchMedia("(max-width: 767px)");
    const animations = new Set<Animation>();
    let entered = false, visible = false;
    const permitted = () => !reduced.matches && !forced.matches;
    const sync = () => {
      element.dataset.active = String(visible && !document.hidden && permitted());
      for (const animation of animations) {
        if (!permitted()) animation.cancel();
        else if (!visible || document.hidden) animation.pause();
        else animation.play();
      }
      if (!permitted()) animations.clear();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !entered) {
        entered = true;
        if (permitted()) {
          const stages = [
            [".education-kicker", 0], [".education-identity h2 > span:first-child", 90],
            [".education-identity h2 > span:last-child", 190], [".education-introduction", 320],
            [".education-graduation", 440], [".education-gpa", 550],
            [".academic-study, .education-field", 650],
            [".education-coursework", 850],
          ] as const;
          for (const [selector, delay] of stages) {
            for (const target of element.querySelectorAll(selector)) {
              const frames = [{ opacity: .08, translate: `0 ${compact.matches ? 8 : 18}px` }, { opacity: 1, translate: "0 0" }];
              const animation = target.animate(frames, {
                duration: compact.matches ? 500 : 800, delay: delay * (compact.matches ? .65 : 1),
                easing: cinematicMotion.easing, fill: "backwards",
              });
              animations.add(animation);
              animation.onfinish = () => { animations.delete(animation); };
            }
          }
        }
      }
      sync();
    }, { threshold: .06, rootMargin: "0px 0px -24px 0px" });
    observer.observe(element);
    const focus = () => { animations.forEach(animation => animation.cancel()); animations.clear(); };
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    forced.addEventListener("change", sync);
    element.addEventListener("focusin", focus);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      forced.removeEventListener("change", sync);
      element.removeEventListener("focusin", focus);
    };
  }, []);
  return <div ref={root} data-education-motion>{children}</div>;
}
