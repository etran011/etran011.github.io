"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** One short assembly per category; labels never wait in a hidden state. */
export function SkillsReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    const desktop = matchMedia("(min-width: 1024px) and (pointer: fine)");
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (reduce.matches || forced.matches) continue;
        entry.target.querySelectorAll("li").forEach((skill, index) => {
          const animation = skill.animate([
            { opacity: 0.88, transform: `translate(${desktop.matches ? (index % 2 ? 6 : -6) : 0}px, ${desktop.matches ? 12 : 6}px) scale(0.98)` },
            { opacity: 1, transform: "none" },
          ], { duration: desktop.matches ? 520 : 320, delay: Math.min(index * 40, 200), easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        });
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
    element.querySelectorAll(".stack-collection").forEach((category) => observer.observe(category));
    const cancel = () => { if (reduce.matches || forced.matches) { animations.forEach((animation) => animation.cancel()); animations.clear(); } };
    reduce.addEventListener("change", cancel); forced.addEventListener("change", cancel);
    return () => { observer.disconnect(); animations.forEach((animation) => animation.cancel()); reduce.removeEventListener("change", cancel); forced.removeEventListener("change", cancel); };
  }, []);
  return <div ref={root} className="stack-collections" data-skills-motion>{children}</div>;
}
