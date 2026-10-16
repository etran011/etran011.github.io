"use client";

import { usePathname } from "next/navigation";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

/** An exact pointer plus a light trailing ring; native input and keyboard fallbacks. */
export function CustomCursor() {
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
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
    if (!element) return;
    let keyboardMode = false;
    const hide = () => { delete document.documentElement.dataset.customCursor; delete element.dataset.visible; };
    const eligible = () => fine.matches && !coarse.matches && !forced.matches && navigator.maxTouchPoints === 0 && !reduce.matches;
    const update = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (keyboardMode || !eligible() || event.pointerType !== "mouse" || !target || target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false']), iframe, dialog, [data-native-cursor]") || !getSelection()?.isCollapsed) { hide(); return; }
      if (!element.dataset.visible) { ringX.jump(event.clientX); ringY.jump(event.clientY); }
      x.set(event.clientX); y.set(event.clientY);
      const control = target.closest("a, button, [role='button']");
      const text = control?.matches(".hero-project, .case-link") ? "Explore" : control?.matches(".gallery-stage") ? "View" : control?.getAttribute("data-cursor") ?? "";
      const mode = text ? "context" : control ? "link" : "default";
      if (element.dataset.mode !== mode) element.dataset.mode = mode;
      if (label.current && label.current.textContent !== text) label.current.textContent = text;
      if (!element.dataset.visible) element.dataset.visible = "true";
      if (!document.documentElement.dataset.customCursor) document.documentElement.dataset.customCursor = "true";
    };
    const press = () => { element.dataset.pressed = "true"; };
    const release = () => { delete element.dataset.pressed; };
    const move = (event: PointerEvent) => { keyboardMode = false; update(event); };
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Tab" || event.key === "Escape") { keyboardMode = true; hide(); } };
    const changed = () => { if (!eligible()) hide(); };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", update, { passive: true });
    document.addEventListener("pointerdown", press, { passive: true });
    document.addEventListener("pointerup", release, { passive: true });
    document.addEventListener("pointerleave", hide);
    document.addEventListener("keydown", keyboard);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", hide);
    for (const query of [fine, coarse, reduce, forced]) query.addEventListener("change", changed);
    return () => {
      hide();
      document.removeEventListener("pointermove", move); document.removeEventListener("pointerover", update);
      document.removeEventListener("pointerdown", press); document.removeEventListener("pointerup", release);
      document.removeEventListener("pointerleave", hide); document.removeEventListener("keydown", keyboard);
      document.removeEventListener("visibilitychange", hide); window.removeEventListener("blur", hide);
      for (const query of [fine, coarse, reduce, forced]) query.removeEventListener("change", changed);
    };
  }, [x, y, ringX, ringY, pathname]);

  return <div ref={root} className="custom-cursor" aria-hidden="true"><motion.span className="cursor-dot" style={{ x, y }} /><motion.span className="cursor-ring" style={{ x: ringX, y: ringY }}><span ref={label} /></motion.span></div>;
}
