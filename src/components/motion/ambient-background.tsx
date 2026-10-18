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
  const input = useRef<AtmosphereContext>({ scene: pathname === "/" ? "hero" : "quiet", progress: 0, heroProgress: 0, scroll: 0, aboutStep: 0, skillGroup: null });
  useDataParticles(canvas, root, input);
  const shift = useSpring(0, { stiffness: 55, damping: 28, mass: 0.8 });

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const desktop = matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    const coarse = matchMedia("(any-pointer: coarse)");
    let frame = 0, y = scrollY, enabled = false, documentHeight = 1;
    let sections: { id: string; top: number }[] = [];
    let stack: HTMLElement | null = null;
    let hero: HTMLElement | null = null;
    const update = () => {
      const index = sections.findLastIndex((section) => section.top <= y + innerHeight * 0.4);
      const current = sections[index];
      const scene: AtmosphereScene = current?.id === "home" ? "hero" : current?.id === "about" || current?.id === "projects" || current?.id === "skills" ? current.id : "quiet";
      input.current.scene = scene;
      input.current.scroll = Math.max(0, y / 1000);
      // Continuous document travel, independent of content scenes or pinning.
      input.current.heroProgress = hero ? Math.max(0, Math.min(1, y / Math.max(1, hero.offsetHeight * 1.2))) : 1;
      input.current.progress = current ? Math.max(0, Math.min(1, (y - current.top) / Math.max(1, (sections[index + 1]?.top ?? documentHeight) - current.top))) : 0;
      const section = current?.id ?? "home";
      if (element.dataset.section !== section) element.dataset.section = section;
      if (element.dataset.scene !== scene) element.dataset.scene = scene;
      if (enabled) shift.set(-Math.min(80, Math.max(0, y * 0.012)));
    };
    const skillSelection = () => {
      const group = stack?.dataset.activeGroup;
      input.current.skillGroup = group && ["languages", "libraries", "tools"].includes(group) ? group : null;
    };
    const selection = new MutationObserver(skillSelection);
    const measure = () => {
      frame = 0;
      sections = Array.from(document.querySelectorAll<HTMLElement>("main > section[id]"), (section) => ({ id: section.id, top: section.getBoundingClientRect().top + scrollY }));
      documentHeight = document.documentElement.scrollHeight;
      hero = document.getElementById("home");
      const nextStack = document.querySelector<HTMLElement>(".technology-stack");
      if (stack !== nextStack) { selection.disconnect(); stack = nextStack; if (stack) selection.observe(stack, { attributes: true, attributeFilter: ["data-active-group"] }); }
      skillSelection();
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
      stop(); observer.disconnect(); selection.disconnect(); cancelAnimationFrame(frame);
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
