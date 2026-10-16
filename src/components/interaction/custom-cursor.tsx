"use client";

import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

/** One persistent pointer controller; routes only refresh the target beneath it. */
export function CustomCursor() {
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const refresh = useRef<() => void>(() => {});
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 850, damping: 45, mass: 0.25 });
  const ringY = useSpring(y, { stiffness: 850, damping: 45, mass: 0.25 });

  useEffect(() => {
    const fine = matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    const coarse = matchMedia("(any-pointer: coarse)");
    const forced = matchMedia("(forced-colors: active)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const element = root.current;
    const pointer = dot.current;
    if (!element || !pointer) return;
    let keyboardMode = false;
    let inside = false;
    let point = { x: -100, y: -100 };
    let frame = 0;
    const hide = () => {
      delete document.documentElement.dataset.customCursor;
      delete element.dataset.visible;
      delete element.dataset.pressed;
    };
    const eligible = () => fine.matches && !coarse.matches && !forced.matches && navigator.maxTouchPoints === 0 && !reduce.matches;
    const update = () => {
      const target = inside ? document.elementFromPoint(point.x, point.y) : null;
      if (keyboardMode || !eligible() || document.hidden || !document.hasFocus() || !target || !element.isConnected || !pointer.isConnected || target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false']), iframe, dialog, [data-native-cursor]") || getSelection()?.isCollapsed === false) { hide(); return; }
      // Position the exact dot synchronously before hiding the native pointer.
      // Motion's spring only drives the decorative trailing ring.
      element.style.setProperty("--cursor-x", `${point.x}px`);
      element.style.setProperty("--cursor-y", `${point.y}px`);
      if (!element.dataset.visible) {
        if (pointer.getBoundingClientRect().width === 0) { hide(); return; }
        ringX.jump(point.x); ringY.jump(point.y);
      }
      x.set(point.x); y.set(point.y);
      const control = target.closest("a, button, [role='button']");
      const text = control?.matches(".hero-project, .case-link") ? "Explore" : control?.matches(".gallery-stage") ? "View" : control?.getAttribute("data-cursor") ?? "";
      const mode = text ? "context" : control ? "link" : "default";
      if (element.dataset.mode !== mode) element.dataset.mode = mode;
      if (label.current && label.current.textContent !== text) label.current.textContent = text;
      if (!element.dataset.visible) element.dataset.visible = "true";
      if (!document.documentElement.dataset.customCursor) document.documentElement.dataset.customCursor = "true";
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; update(); }); };
    refresh.current = schedule;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") { inside = false; hide(); return; }
      inside = true; keyboardMode = false; point = { x: event.clientX, y: event.clientY }; update();
    };
    const over = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      inside = true; point = { x: event.clientX, y: event.clientY }; update();
    };
    const leave = () => { inside = false; hide(); };
    const press = (event: PointerEvent) => { move(event); if (element.dataset.visible) element.dataset.pressed = "true"; };
    const release = () => { delete element.dataset.pressed; schedule(); };
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Tab" || event.key === "Escape") { keyboardMode = true; hide(); } };
    const visibility = () => { if (document.hidden) hide(); else schedule(); };
    const changed = () => { if (!eligible()) hide(); else schedule(); };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerdown", press, { passive: true });
    document.addEventListener("pointerup", release, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("keydown", keyboard);
    document.addEventListener("selectionchange", schedule);
    document.addEventListener("scroll", schedule, { passive: true, capture: true });
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", hide);
    window.addEventListener("focus", schedule);
    window.addEventListener("resize", schedule);
    for (const query of [fine, coarse, reduce, forced]) query.addEventListener("change", changed);
    return () => {
      cancelAnimationFrame(frame); refresh.current = () => {}; hide();
      document.removeEventListener("pointermove", move); document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerdown", press); document.removeEventListener("pointerup", release);
      document.removeEventListener("pointerleave", leave); document.removeEventListener("keydown", keyboard);
      document.removeEventListener("selectionchange", schedule); document.removeEventListener("scroll", schedule, true);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", hide); window.removeEventListener("focus", schedule); window.removeEventListener("resize", schedule);
      for (const query of [fine, coarse, reduce, forced]) query.removeEventListener("change", changed);
    };
  }, [x, y, ringX, ringY]);

  useEffect(() => { refresh.current(); }, [pathname]);

  return <div ref={root} className="custom-cursor" aria-hidden="true"><span ref={dot} className="cursor-dot" /><motion.span className="cursor-ring" style={{ x: ringX, y: ringY }}><span ref={label} /></motion.span></div>;
}
