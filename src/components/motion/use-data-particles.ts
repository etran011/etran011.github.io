"use client";

import { useEffect, type RefObject } from "react";
import type { AtmospherePose, AtmosphereRenderer } from "@/lib/atmosphere-renderer";
import { poseKeys, resolveAtmospherePose, type AtmosphereContext } from "@/lib/atmosphere-scene";
import { chooseAtmosphereQuality, createAtmosphereBudget } from "@/lib/atmosphere-budget";

/** The SSR vector remains visible until a complete WebGL frame has rendered. */
export function useDataParticles(canvasRef: RefObject<HTMLCanvasElement | null>, rootRef: RefObject<HTMLDivElement | null>, input: RefObject<AtmosphereContext>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const desktop = matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    const coarse = matchMedia("(any-pointer: coarse)");
    let renderer: AtmosphereRenderer | undefined;
    let pose: AtmospherePose | undefined, basePose: AtmospherePose | undefined, targetPose: AtmospherePose | undefined;
    const pointer = { x: 0, y: 0 };
    const targetPointer = { x: 0, y: 0 };
    let frame = 0, generation = 0, previous = 0, previousFrame = 0, time = 0;
    let budget = createAtmosphereBudget("medium");
    let disposed = false, lost = false, needsResize = true;
    const eligible = () => desktop.matches && !reduce.matches && !forced.matches && !coarse.matches && navigator.maxTouchPoints === 0;
    const pause = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; previousFrame = 0; root.dataset.playing = "false"; };
    const fallback = () => { pause(); renderer?.destroy(); renderer = undefined; root.dataset.renderer = "static"; };
    const tick = (now: number) => {
      frame = 0;
      if (!renderer) return;
      // Recheck in-frame too: preference notifications can arrive after a frame
      // observes the new media state, particularly following context restoration.
      if (!eligible()) { fallback(); return; }
      if (document.hidden) { pause(); return; }
      if (previousFrame) budget.observe(now - previousFrame);
      previousFrame = now;
      const cadence = input.current.scene === "quiet" || input.current.scene === "projects" ? 30 : budget.frameRate;
      if (cadence === 30 && previous && now - previous < 1000 / 30 - 1) { frame = requestAnimationFrame(tick); return; }
      const delta = previous ? Math.min(50, now - previous) / 1000 : 1 / 60;
      time += previous ? delta : 0; previous = now;
      const follow = 1 - Math.exp(-delta / 0.18);
      pointer.x += (targetPointer.x - pointer.x) * follow; pointer.y += (targetPointer.y - pointer.y) * follow;
      if (pose && basePose && targetPose) {
        resolveAtmospherePose(input.current, targetPose);
        const sceneFollow = 1 - Math.exp(-delta / 0.85);
        for (const key of poseKeys) { basePose[key] += (targetPose[key] - basePose[key]) * sceneFollow; pose[key] = basePose[key]; }
        pose.yaw += pointer.x * 0.13; pose.pitch -= pointer.y * 0.08;
        pose.centerX += pointer.x * 0.025; pose.centerY += pointer.y * 0.018;
        pose.lightX = pointer.x; pose.lightY = pointer.y;
      }
      try {
        if (root.dataset.quality !== budget.quality) {
          renderer.setQuality(budget.quality); root.dataset.quality = budget.quality; needsResize = true;
        }
        if (needsResize) { renderer.resize(innerWidth, innerHeight); needsResize = false; }
        if (!renderer.render(time, pose)) { fallback(); return; }
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
        const { createAtmosphereRenderer, restingPose } = await import("@/lib/atmosphere-renderer");
        if (current !== generation || !eligible() || lost || disposed || document.hidden) return;
        const hex = getComputedStyle(root).getPropertyValue("--accent").trim();
        const color = /^#[0-9a-f]{6}$/i.test(hex) ? [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255) : [0.533, 0.678, 0.961];
        const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ?? false;
        const quality = chooseAtmosphereQuality(navigator.hardwareConcurrency || 4, saveData);
        budget = createAtmosphereBudget(quality);
        renderer = createAtmosphereRenderer(canvas, quality, color); root.dataset.quality = quality;
        basePose = { ...restingPose }; pose = { ...restingPose }; targetPose = { ...restingPose };
        needsResize = true; start();
      } catch { if (current === generation) fallback(); }
    };
    const visibility = () => { if (document.hidden) pause(); else if (renderer) start(); else void configure(); };
    const resize = () => { needsResize = true; };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !eligible()) return;
      targetPointer.x = Math.max(-1, Math.min(1, event.clientX / innerWidth * 2 - 1));
      targetPointer.y = Math.max(-1, Math.min(1, 1 - event.clientY / innerHeight * 2));
    };
    const leave = () => { targetPointer.x = 0; targetPointer.y = 0; };
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; generation++; fallback(); };
    const contextRestored = () => { lost = false; void configure(); };
    root.dataset.renderer = "static";
    for (const query of [desktop, reduce, forced, coarse]) query.addEventListener("change", configure);
    document.addEventListener("visibilitychange", visibility); window.addEventListener("resize", resize);
    document.addEventListener("pointermove", move, { passive: true }); document.addEventListener("pointerleave", leave); window.addEventListener("blur", leave);
    canvas.addEventListener("webglcontextlost", contextLost); canvas.addEventListener("webglcontextrestored", contextRestored);
    void configure();
    return () => {
      disposed = true; generation++; fallback();
      for (const query of [desktop, reduce, forced, coarse]) query.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", visibility); window.removeEventListener("resize", resize);
      document.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); window.removeEventListener("blur", leave);
      canvas.removeEventListener("webglcontextlost", contextLost); canvas.removeEventListener("webglcontextrestored", contextRestored);
    };
  }, [canvasRef, rootRef, input]);
}
