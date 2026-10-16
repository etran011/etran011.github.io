"use client";

import { motion, useSpring } from "motion/react";
import { scroll } from "motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** One shared atmosphere, driven by cached section positions and the existing scroll observer. */
export function AmbientBackground() {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const shift = useSpring(0, { stiffness: 55, damping: 28, mass: 0.8 });
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const desktop = matchMedia("(min-width: 1024px) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    const coarse = matchMedia("(any-pointer: coarse)");
    let stop: (() => void) | undefined;
    let frame = 0;
    let enabled = false;
    let sections: { id: string; top: number }[] = [];
    let y = window.scrollY;
    const update = () => {
      const current = sections.findLast((section) => section.top <= y + innerHeight * 0.4)?.id;
      const scene = current === "home" ? "hero" : ["about", "projects", "skills"].includes(current ?? "") ? current! : "quiet";
      if (element.dataset.scene !== scene) element.dataset.scene = scene;
      shift.set(-Math.min(80, Math.max(0, y * 0.012)));
    };
    const measure = () => {
      frame = 0;
      sections = Array.from(document.querySelectorAll<HTMLElement>("main > section[id]"), (section) => ({ id: section.id, top: section.getBoundingClientRect().top + window.scrollY }));
      y = window.scrollY; update();
    };
    const schedule = () => { if (enabled && !frame) frame = requestAnimationFrame(measure); };
    const playback = () => { element.dataset.playing = String(!document.hidden); };
    const observer = new ResizeObserver(schedule);
    const configure = () => {
      stop?.(); stop = undefined; observer.disconnect(); cancelAnimationFrame(frame); frame = 0;
      enabled = desktop.matches && !reduce.matches && !forced.matches && !coarse.matches && navigator.maxTouchPoints === 0;
      element.dataset.animated = String(enabled);
      if (!enabled) { shift.jump(0); return; }
      measure(); playback(); observer.observe(document.body);
      stop = scroll((_progress, info) => { y = info.y.current; update(); });
    };
    for (const query of [desktop, reduce, forced, coarse]) query.addEventListener("change", configure);
    window.addEventListener("resize", schedule); document.addEventListener("visibilitychange", playback);
    configure();
    return () => { stop?.(); observer.disconnect(); cancelAnimationFrame(frame); for (const query of [desktop, reduce, forced, coarse]) query.removeEventListener("change", configure); window.removeEventListener("resize", schedule); document.removeEventListener("visibilitychange", playback); };
  }, [pathname, shift]);
  return <div ref={root} className="ambient-background" data-scene={pathname === "/" ? "hero" : "quiet"} aria-hidden="true">
    <div className="ambient-halo" />
    <motion.div className="ambient-scroll-layer" style={{ y: shift }}>
      <div className="ambient-grid" />
      <svg className="ambient-lines" viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice" focusable="false"><g fill="none" stroke="currentColor" strokeWidth="0.7"><path d="M520 820C720 760 690 280 1440 190M460 880C860 700 720 380 1440 300M640 960C940 700 900 510 1440 430M900 1000C1080 700 1170 650 1440 600" /></g></svg>
      <div className="ambient-orbit"><span /><span /><span /></div>
    </motion.div>
  </div>;
}
