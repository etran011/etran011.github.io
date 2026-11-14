"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cinematicMotion } from "@/lib/cinematic-motion";
import { usePathname } from "next/navigation";

/** Animate only on entry; never hide waiting content or depend on JS for visibility. */
export function ScrollReveals({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forced = window.matchMedia("(forced-colors: active)");
    const animations = new Map<Element, Animation>();
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver((entries) => {
      const entering = entries.filter(entry => entry.isIntersecting && !seen.has(entry.target));
      entering.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      let rowTop = -Infinity;
      let rowIndex = 0;
      for (const entry of entering) {
        if (Math.abs(entry.boundingClientRect.top - rowTop) > 24) {
          rowTop = entry.boundingClientRect.top;
          rowIndex = 0;
        }
        const delay = Math.min(rowIndex++, 2) * cinematicMotion.cardStagger;
        if (!entry.isIntersecting || seen.has(entry.target)) continue;
        seen.add(entry.target);
        observer.unobserve(entry.target);
        // Never fade content that the reader already sees (initial load, restored
        // scroll position, anchor jump, or a fast fling). Start just offscreen instead.
        if (preference.matches || forced.matches || document.hidden ||
            entry.boundingClientRect.top < window.innerHeight - 24 ||
            entry.target.contains(document.activeElement)) continue;
        const target = entry.target;
        // Islands rise once in document flow; reading never depends on scroll progress.
        const frames = [{ opacity: 0, translate: `0 ${cinematicMotion.cardDistance}px` }, { opacity: 1, translate: "0 0" }];
        let animation: Animation;
        try { animation = target.animate(frames, {
          duration: cinematicMotion.cardEntrance,
          delay,
          fill: "backwards",
          easing: cinematicMotion.easing,
        }); } catch { continue; }
        animations.set(target, animation);
        animation.onfinish = () => { animations.delete(target); };
        if (document.hidden) animation.pause();
      }
    }, { threshold: 0, rootMargin: "0px 0px 80px 0px" });
    element.querySelectorAll(".content-island, .case-content section").forEach((target) => { if (!target.closest("#skills, #experience")) observer.observe(target); });
    const cancelAll = () => { if (preference.matches || forced.matches) { animations.forEach((animation) => animation.cancel()); animations.clear(); } };
    const revealFocused = (event: FocusEvent) => {
      animations.forEach((animation, target) => { if (target.contains(event.target as Node)) { animation.cancel(); animations.delete(target); } });
    };
    const visibility = () => {
      if (document.hidden) { animations.forEach(animation => animation.cancel()); animations.clear(); }
    };
    preference.addEventListener("change", cancelAll);
    forced.addEventListener("change", cancelAll);
    document.addEventListener("visibilitychange", visibility);
    element.addEventListener("focusin", revealFocused);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", cancelAll);
      forced.removeEventListener("change", cancelAll);
      document.removeEventListener("visibilitychange", visibility);
      element.removeEventListener("focusin", revealFocused);
    };
  }, [pathname]);

  return <div ref={root}>{children}</div>;
}
