"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Cache bounds on entry/resize; batch pointer writes once per frame. */
export function HoverEffects() {
  const pathname = usePathname();
  useEffect(() => {
    const fine = matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(any-pointer: coarse)");
    const forced = matchMedia("(forced-colors: active)");
    let button: HTMLElement | null = null;
    let card: HTMLElement | null = null;
    let buttonRect: DOMRect | undefined;
    let cardRect: DOMRect | undefined;
    let frame = 0, x = 0, y = 0;
    let dirty = true, keyboard = false;
    const resetButton = () => { button?.style.removeProperty("--magnet-x"); button?.style.removeProperty("--magnet-y"); };
    const resetCard = () => { if (card) { delete card.dataset.pointerLight; card.style.removeProperty("--light-x"); card.style.removeProperty("--light-y"); } };
    const reset = () => { cancelAnimationFrame(frame); frame = 0; resetButton(); resetCard(); button = card = null; };
    const eligible = () => fine.matches && !reduce.matches && !coarse.matches && !forced.matches && navigator.maxTouchPoints === 0;
    const write = () => {
      frame = 0;
      if (dirty) { buttonRect = button?.getBoundingClientRect(); cardRect = card?.getBoundingClientRect(); dirty = false; }
      if (button && buttonRect) {
        const clamp = (value: number) => Math.max(-3.5, Math.min(3.5, value));
        button.style.setProperty("--magnet-x", `${clamp((x - buttonRect.left - buttonRect.width / 2) * 0.08)}px`);
        button.style.setProperty("--magnet-y", `${clamp((y - buttonRect.top - buttonRect.height / 2) * 0.08)}px`);
      }
      if (card && cardRect) { if (!card.dataset.pointerLight) card.dataset.pointerLight = "true"; card.style.setProperty("--light-x", `${x - cardRect.left}px`); card.style.setProperty("--light-y", `${y - cardRect.top}px`); }
    };
    const update = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!eligible() || keyboard || event.pointerType !== "mouse" || !target || target.closest("dialog") || !getSelection()?.isCollapsed) { reset(); return; }
      const nextButton = target.closest<HTMLElement>(".button:not([disabled]):not([aria-disabled='true'])");
      const nextCard = target.closest<HTMLElement>(".project-card, .hero-project");
      if (nextButton !== button) { resetButton(); button = nextButton; dirty = true; }
      if (nextCard !== card) { resetCard(); card = nextCard; dirty = true; }
      x = event.clientX; y = event.clientY;
      if (!frame) frame = requestAnimationFrame(write);
    };
    const move = (event: PointerEvent) => { keyboard = false; update(event); };
    const key = (event: KeyboardEvent) => { if (event.key === "Tab" || event.key === "Escape") { keyboard = true; reset(); } };
    const invalidate = () => { dirty = true; };
    document.addEventListener("pointermove", move, { passive: true }); document.addEventListener("pointerover", update, { passive: true });
    document.addEventListener("pointerleave", reset); document.addEventListener("keydown", key);
    window.addEventListener("scroll", invalidate, { passive: true }); window.addEventListener("resize", invalidate); window.addEventListener("blur", reset);
    for (const query of [fine, reduce, coarse, forced]) query.addEventListener("change", reset);
    return () => {
      reset(); document.removeEventListener("pointermove", move); document.removeEventListener("pointerover", update);
      document.removeEventListener("pointerleave", reset); document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", invalidate); window.removeEventListener("resize", invalidate); window.removeEventListener("blur", reset);
      for (const query of [fine, reduce, coarse, forced]) query.removeEventListener("change", reset);
    };
  }, [pathname]);
  return null;
}
