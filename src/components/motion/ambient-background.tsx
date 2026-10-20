"use client";

import { motion, useSpring } from "motion/react";
import { scroll } from "motion";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { AtmosphereContext, AtmosphereScene } from "@/lib/atmosphere-scene";
import { useDataParticles } from "./use-data-particles";

/** Cached document measurements feed the existing shared scroll observer. */
export function AmbientBackground() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const input = useRef<AtmosphereContext>({ scene: pathname === "/" ? "hero" : "quiet", heroProgress: 0 });
  useDataParticles(canvas, root, input);
  const shift = useSpring(0, { stiffness: 55, damping: 28, mass: 0.8 });

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const desktop = matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    const coarse = matchMedia("(any-pointer: coarse)");
    let frame = 0, y = scrollY, enabled = false;
    let sections: { id: string; top: number }[] = [];
    let hero: HTMLElement | null = null;
    const update = () => {
      const index = sections.findLastIndex((section) => section.top <= y + innerHeight * 0.4);
      const current = sections[index];
      const scene: AtmosphereScene = current?.id === "home" ? "hero" : current?.id === "about" || current?.id === "projects" || current?.id === "skills" ? current.id : "quiet";
      input.current.scene = scene;
      // Continuous document travel, independent of content scenes or pinning.
      input.current.heroProgress = hero ? Math.max(0, Math.min(1, y / Math.max(1, hero.offsetHeight * 0.85))) : 1;
      element.style.setProperty("--atmosphere-progress", input.current.heroProgress.toFixed(4));
      const section = current?.id ?? "home";
      if (element.dataset.section !== section) element.dataset.section = section;
      if (element.dataset.scene !== scene) element.dataset.scene = scene;
      if (enabled) shift.set(-Math.min(80, Math.max(0, y * 0.012)));
    };
    const measure = () => {
      frame = 0;
      sections = Array.from(document.querySelectorAll<HTMLElement>("main > section[id]"), (section) => ({ id: section.id, top: section.getBoundingClientRect().top + scrollY }));
      hero = document.getElementById("home");
      y = scrollY; update();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const configure = () => {
      enabled = desktop.matches && !reduce.matches && !forced.matches && !coarse.matches && navigator.maxTouchPoints === 0;
      element.dataset.animated = String(enabled);
      if (!enabled) shift.jump(0);
      schedule();
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    const stop = scroll((_progress, info) => { y = info.y.current; update(); });
    for (const query of [desktop, reduce, forced, coarse]) query.addEventListener("change", configure);
    window.addEventListener("resize", schedule);
    configure();
    return () => {
      stop(); observer.disconnect(); cancelAnimationFrame(frame);
      for (const query of [desktop, reduce, forced, coarse]) query.removeEventListener("change", configure);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname, shift]);

  return <div ref={root} className="ambient-background" data-scene={pathname === "/" ? "hero" : "quiet"} aria-hidden="true">
    <div className="ambient-halo" />
    <motion.div className="ambient-scroll-layer" style={{ y: shift }}>
      <div className="ambient-grid" />
      <div className="ambient-formation"><Image src="/images/atmosphere/data-formation.svg" fill sizes="100vw" style={{ objectFit: "contain" }} alt="" preload /></div>
    </motion.div>
    <canvas ref={canvas} className="ambient-canvas" aria-hidden="true" />
  </div>;
}
