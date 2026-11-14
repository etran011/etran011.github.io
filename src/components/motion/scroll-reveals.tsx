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
      const entering = entries.filter(entry => entry.isIntersecting && !seen.has(entry.target)
        && entry.intersectionRatio >= Math.min(0.15, window.innerHeight * 0.15 / Math.max(1, entry.boundingClientRect.height)));
      entering.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      let rowTop = -Infinity;
      let rowIndex = 0;
      for (const entry of entering) {
        if (Math.abs(entry.boundingClientRect.top - rowTop) > 24) {
          rowTop = entry.boundingClientRect.top;
          rowIndex = 0;
        }
        const delay = Math.min(rowIndex++, 2) * 90;
        if (!entry.isIntersecting || seen.has(entry.target)) continue;
        seen.add(entry.target);
        observer.unobserve(entry.target);
        if (preference.matches || forced.matches || entry.target.contains(document.activeElement)) continue;
        const target = entry.target;
        // Islands rise once in document flow; reading never depends on scroll progress.
        const frames = [{ opacity: 0, translate: "0 20px" }, { opacity: 1, translate: "0 0" }];
        const animation = target.animate(frames, {
          duration: 600,
          delay,
          fill: "backwards",
          easing: cinematicMotion.easing,
        });
        animations.set(target, animation);
        animation.onfinish = () => { animations.delete(target); };
        if (document.hidden) animation.pause();
      }
    }, { threshold: Array.from({ length: 16 }, (_, index) => index / 100) });
    element.querySelectorAll(".content-island, .case-content section").forEach((target) => { if (!target.closest("#skills, #experience")) observer.observe(target); });
    const cancelAll = () => { if (preference.matches || forced.matches) { animations.forEach((animation) => animation.cancel()); animations.clear(); } };
    const revealFocused = (event: FocusEvent) => {
      animations.forEach((animation, target) => { if (target.contains(event.target as Node)) { animation.cancel(); animations.delete(target); } });
    };
    const visibility = () => animations.forEach(animation => document.hidden ? animation.pause() : animation.play());
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
