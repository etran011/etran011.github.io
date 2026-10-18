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
    if (!element || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forced = window.matchMedia("(forced-colors: active)");
    const compact = window.matchMedia("(max-width: 767px)");
    const animations = new Map<Element, Animation>();
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || seen.has(entry.target)) continue;
        seen.add(entry.target);
        observer.unobserve(entry.target);
        if (preference.matches || forced.matches || entry.target.contains(document.activeElement)) continue;
        const target = entry.target;
        // Islands rise once in document flow; reading never depends on scroll progress.
        const frames = [{ opacity: 0.92, transform: `translateY(${compact.matches ? 6 : 10}px)` }, { opacity: 1, transform: "none" }];
        const animation = target.animate(frames, {
          duration: compact.matches ? 320 : cinematicMotion.quietEntrance,
          easing: cinematicMotion.easing,
        });
        animations.set(target, animation);
        animation.onfinish = () => { animations.delete(target); };
        if (document.hidden) animation.pause();
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -32px 0px" });
    element.querySelectorAll(".section-heading, .workspace-heading, .content-island, .case-content section").forEach((target) => { if (!target.closest("#skills, #education")) observer.observe(target); });
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
