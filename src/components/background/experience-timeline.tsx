"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cinematicMotion } from "@/lib/cinematic-motion";

/** Decorative progress follows native document travel; content is never gated by it. */
export function ExperienceTimeline({ children }: { children: ReactNode }) {
  const root = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    const compact = matchMedia("(max-width: 767px)");
    const entries = Array.from(element.querySelectorAll<HTMLElement>(".experience-entry"));
    const animations = new Map<Element, Animation>();
    const seen = new WeakSet<Element>();
    let visible = false, frame = 0, start = 0, length = 1;
    let positions: number[] = [];
    const permitted = () => !reduce.matches && !forced.matches;
    const update = () => {
      frame = 0;
      if (!visible || document.hidden || !permitted()) return;
      const readingLine = scrollY + innerHeight * .55;
      const progress = Math.max(0, Math.min(1, (readingLine - start) / length)).toFixed(4);
      if (element.style.getPropertyValue("--timeline-progress") !== progress) element.style.setProperty("--timeline-progress", progress);
      const active = positions.findLastIndex(position => position <= readingLine);
      entries.forEach((entry, index) => {
        const state = index < active ? "completed" : index === active ? "current" : "upcoming";
        if (entry.dataset.timelineState !== state) entry.dataset.timelineState = state;
      });
    };
    const schedule = () => { if (!frame && visible && permitted() && !document.hidden) frame = requestAnimationFrame(update); };
    const measure = () => {
      const rect = element.getBoundingClientRect(), rail = getComputedStyle(element, "::before");
      start = rect.top + scrollY + parseFloat(rail.top);
      length = Math.max(1, rect.height - parseFloat(rail.top) - parseFloat(rail.bottom));
      positions = entries.map(entry => {
        const marker = entry.querySelector(".experience-milestone")!.getBoundingClientRect();
        return marker.top + marker.height / 2 + scrollY;
      });
      schedule();
    };
    const sync = () => {
      element.dataset.timelineActive = String(visible && !document.hidden && permitted());
      if (!permitted()) {
        animations.forEach(animation => animation.cancel()); animations.clear();
        element.style.removeProperty("--timeline-progress");
        entries.forEach(entry => delete entry.dataset.timelineState);
      } else {
        animations.forEach(animation => document.hidden || !visible ? animation.pause() : animation.play());
        measure();
      }
    };
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    visibility.observe(element);
    const entrances = new IntersectionObserver(records => {
      for (const record of records) {
        if (!record.isIntersecting || seen.has(record.target)) continue;
        seen.add(record.target); entrances.unobserve(record.target);
        if (!permitted() || record.target.contains(document.activeElement)) continue;
        const layers = record.target.querySelectorAll("article, .experience-date, .experience-highlights li");
        layers.forEach((layer, index) => {
          const animation = layer.animate([
            { opacity: .92, translate: `0 ${compact.matches ? 4 : 8}px` },
            { opacity: 1, translate: "0 0" },
          ], { duration: compact.matches ? 320 : cinematicMotion.quietEntrance, delay: Math.min(index * 35, 140), easing: cinematicMotion.easing });
          animations.set(layer, animation);
          animation.onfinish = () => animations.delete(layer);
          if (document.hidden || !visible) animation.pause();
        });
      }
    }, { threshold: .08, rootMargin: "0px 0px -24px 0px" });
    entries.forEach(entry => entrances.observe(entry));
    // Earlier sections can reflow without changing the list’s own height.
    const observer = new ResizeObserver(measure); observer.observe(element); observer.observe(document.body);
    const focus = () => { animations.forEach(animation => animation.cancel()); animations.clear(); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", sync);
    element.addEventListener("focusin", focus);
    reduce.addEventListener("change", sync); forced.addEventListener("change", sync);
    measure();
    return () => {
      cancelAnimationFrame(frame); animations.forEach(animation => animation.cancel());
      observer.disconnect(); visibility.disconnect(); entrances.disconnect();
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", sync); element.removeEventListener("focusin", focus);
      reduce.removeEventListener("change", sync); forced.removeEventListener("change", sync);
    };
  }, []);
  return <ol ref={root} className="experience-list">{children}</ol>;
}
