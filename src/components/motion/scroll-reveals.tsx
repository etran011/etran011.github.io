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
        const pinned = Boolean(target.closest("[data-scroll-story]"));
        const quiet = Boolean(target.closest("#experience, #education"));
        const layers = target.matches(".project-card")
          ? target.querySelectorAll(".project-intro, .project-details, .screenshot-gallery")
          : target.matches(".contact-layout, .education-layout, .experience-entry, .section-heading")
            ? target.children : [target];
        Array.from(layers).forEach((layer, index) => {
          const distance = compact.matches ? 6 : quiet ? 10 : 16;
          const frames = pinned && !target.matches(".project-card")
            ? [{ opacity: 0.9 }, { opacity: 1 }]
            : [{ opacity: 0.86, transform: `translateY(${distance}px)` }, { opacity: 1, transform: "none" }];
          const animation = layer.animate(frames, {
            duration: compact.matches ? 320 : quiet ? cinematicMotion.quietEntrance : cinematicMotion.entrance,
            delay: index * (compact.matches ? 35 : 70), easing: cinematicMotion.easing,
          });
          animations.set(layer, animation);
          animation.onfinish = () => { animations.delete(layer); };
          if (document.hidden) animation.pause();
        });
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -32px 0px" });
    element.querySelectorAll(".section-heading, .about-intro, .project-card, .experience-entry, .education-layout, .contact-layout, .case-content section").forEach((target) => { if (!target.closest("[data-skills-motion]")) observer.observe(target); });
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
