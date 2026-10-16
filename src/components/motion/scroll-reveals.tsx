"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Animate only on entry; never hide waiting content or depend on JS for visibility. */
export function ScrollReveals({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Map<Element, Animation>();
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || seen.has(entry.target)) continue;
        seen.add(entry.target);
        observer.unobserve(entry.target);
        if (preference.matches || entry.target.contains(document.activeElement)) continue;
        const animation = entry.target.animate([
          { opacity: 0.92, transform: "translateY(20px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 650, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
        animations.set(entry.target, animation);
        animation.onfinish = () => { animations.delete(entry.target); };
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -32px 0px" });
    element.querySelectorAll(".section-heading, .project-card, .experience-entry, .education-layout, .skill-category, .about-layout, .case-content section").forEach((target) => { if (!target.closest("[data-scroll-story]")) observer.observe(target); });
    const cancelAll = () => { if (preference.matches) { animations.forEach((animation) => animation.cancel()); animations.clear(); } };
    const revealFocused = (event: FocusEvent) => {
      animations.forEach((animation, target) => { if (target.contains(event.target as Node)) { animation.cancel(); animations.delete(target); } });
    };
    preference.addEventListener("change", cancelAll);
    element.addEventListener("focusin", revealFocused);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", cancelAll);
      element.removeEventListener("focusin", revealFocused);
    };
  }, [pathname]);

  return <div ref={root}>{children}</div>;
}
