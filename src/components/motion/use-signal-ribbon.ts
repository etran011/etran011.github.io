"use client";

import { useEffect, type RefObject } from "react";
import type { AtmosphereRenderer } from "@/lib/atmosphere-renderer";

/** The SSR vector remains visible until a complete WebGL frame has rendered. */
export function useSignalRibbon(canvasRef: RefObject<HTMLCanvasElement | null>, rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const desktop = matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    const coarse = matchMedia("(any-pointer: coarse)");
    let renderer: AtmosphereRenderer | undefined;
    let frame = 0, generation = 0, previous = 0, time = 0;
    let disposed = false, lost = false, needsResize = true;
    const eligible = () => desktop.matches && !reduce.matches && !forced.matches && !coarse.matches && navigator.maxTouchPoints === 0;
    const pause = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; root.dataset.playing = "false"; };
    const fallback = () => { pause(); renderer?.destroy(); renderer = undefined; root.dataset.renderer = "static"; };
    const tick = (now: number) => {
      frame = 0;
      if (!renderer) return;
      // Recheck in-frame too: preference notifications can arrive after a frame
      // observes the new media state, particularly following context restoration.
      if (!eligible()) { fallback(); return; }
      if (document.hidden) { pause(); return; }
      time += previous ? Math.min(50, now - previous) / 1000 : 0; previous = now;
      try {
        if (needsResize) { renderer.resize(innerWidth, innerHeight); needsResize = false; }
        if (!renderer.render(time)) { fallback(); return; }
        if (root.dataset.renderer !== "webgl") root.dataset.renderer = "webgl";
        if (root.dataset.playing !== "true") root.dataset.playing = "true";
      } catch { fallback(); return; }
      frame = requestAnimationFrame(tick);
    };
    const start = () => { if (!frame && renderer && !document.hidden && eligible()) frame = requestAnimationFrame(tick); };
    const configure = async () => {
      const current = ++generation;
      fallback();
      if (!eligible() || lost || disposed || document.hidden) return;
      try {
        const { createAtmosphereRenderer } = await import("@/lib/atmosphere-renderer");
        if (current !== generation || !eligible() || lost || disposed || document.hidden) return;
        const hex = getComputedStyle(root).getPropertyValue("--accent").trim();
        const color = /^#[0-9a-f]{6}$/i.test(hex) ? [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255) : [0.533, 0.678, 0.961];
        renderer = createAtmosphereRenderer(canvas, "medium", color);
        needsResize = true; start();
      } catch { if (current === generation) fallback(); }
    };
    const visibility = () => { if (document.hidden) pause(); else if (renderer) start(); else void configure(); };
    const resize = () => { needsResize = true; };
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; generation++; fallback(); };
    const contextRestored = () => { lost = false; void configure(); };
    root.dataset.renderer = "static";
    for (const query of [desktop, reduce, forced, coarse]) query.addEventListener("change", configure);
    document.addEventListener("visibilitychange", visibility); window.addEventListener("resize", resize);
    canvas.addEventListener("webglcontextlost", contextLost); canvas.addEventListener("webglcontextrestored", contextRestored);
    void configure();
    return () => {
      disposed = true; generation++; fallback();
      for (const query of [desktop, reduce, forced, coarse]) query.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", visibility); window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", contextLost); canvas.removeEventListener("webglcontextrestored", contextRestored);
    };
  }, [canvasRef, rootRef]);
}
