"use client";

import { useEffect, useRef } from "react";

/** A fading visual thumb over native document scrolling; no wheel interception or scroll engine. */
export function ScrollbarVisibility() {
  const thumb = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const handle = thumb.current;
    if (!handle) return;
    const desktop = matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine) and (forced-colors: none)");
    const coarse = matchMedia("(any-pointer: coarse)");
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let nearEdge = false;
    let enabled = false;
    let drag: { pointer: number; y: number; scroll: number } | undefined;
    const clear = () => { clearTimeout(timer); timer = undefined; };
    const show = () => {
      if (!enabled) return;
      clear();
      if (root.dataset.scrollbarState !== "visible") root.dataset.scrollbarState = "visible";
      if (!nearEdge && !drag) timer = setTimeout(() => { root.dataset.scrollbarState = "idle"; }, 1200);
    };
    const measure = () => {
      frame = 0;
      if (!enabled) return;
      const maximum = Math.max(0, root.scrollHeight - innerHeight);
      const height = Math.min(innerHeight, Math.max(44, innerHeight * innerHeight / root.scrollHeight));
      const fraction = maximum > 0 ? Math.max(0, Math.min(1, scrollY / maximum)) : 0;
      handle.style.height = `${height}px`;
      handle.style.transform = `translateY(${fraction * (innerHeight - height)}px)`;
      handle.setAttribute("aria-valuenow", String(Math.round(fraction * 100)));
      handle.setAttribute("aria-valuetext", `${Math.round(fraction * 100)}% of page`);
    };
    const schedule = () => { if (enabled && !frame) frame = requestAnimationFrame(measure); };
    const scroll = () => { schedule(); show(); };
    const pointer = (event: PointerEvent) => {
      if (!enabled || event.pointerType === "touch") return;
      const next = event.clientX >= innerWidth - 24 && event.clientX <= innerWidth;
      if (next !== nearEdge) { nearEdge = next; show(); }
    };
    const finish = () => {
      if (!drag) return;
      const pointer = drag.pointer;
      drag = undefined;
      delete handle.dataset.dragging;
      if (handle.hasPointerCapture(pointer)) handle.releasePointerCapture(pointer);
      if (document.activeElement === handle) handle.blur();
      show();
    };
    const blur = () => { nearEdge = false; finish(); clear(); if (enabled) root.dataset.scrollbarState = "idle"; };
    const down = (event: PointerEvent) => {
      if (!enabled || event.button !== 0) return;
      event.preventDefault();
      // Keep the accessible thumb focused during its native-position drag.
      handle.focus({ preventScroll: true });
      drag = { pointer: event.pointerId, y: event.clientY, scroll: scrollY };
      handle.dataset.dragging = "true";
      handle.setPointerCapture(event.pointerId);
      show();
    };
    const move = (event: PointerEvent) => {
      if (!drag || drag.pointer !== event.pointerId) return;
      const travel = innerHeight - handle.getBoundingClientRect().height;
      if (travel > 0) window.scrollTo({ top: drag.scroll + (event.clientY - drag.y) * (root.scrollHeight - innerHeight) / travel, behavior: "instant" });
    };
    const leave = () => { if (nearEdge && !drag) { nearEdge = false; show(); } };
    const configure = () => {
      clear(); finish(); clear(); nearEdge = false;
      enabled = desktop.matches && !coarse.matches && navigator.maxTouchPoints === 0;
      if (enabled) { root.dataset.scrollbarState = "idle"; measure(); }
      else delete root.dataset.scrollbarState;
    };
    configure();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("blur", blur);
    handle.addEventListener("pointerdown", down);
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", finish);
    handle.addEventListener("pointercancel", finish);
    handle.addEventListener("lostpointercapture", finish);
    handle.addEventListener("focus", show);
    desktop.addEventListener("change", configure);
    coarse.addEventListener("change", configure);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      finish(); clear(); cancelAnimationFrame(frame); observer.disconnect();
      delete root.dataset.scrollbarState;
      window.removeEventListener("scroll", scroll); window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", pointer); document.removeEventListener("pointerleave", leave); window.removeEventListener("blur", blur);
      handle.removeEventListener("pointerdown", down); handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", finish); handle.removeEventListener("pointercancel", finish); handle.removeEventListener("lostpointercapture", finish); handle.removeEventListener("focus", show);
      desktop.removeEventListener("change", configure); coarse.removeEventListener("change", configure);
    };
  }, []);
  return <>
    <div className="auto-scrollbar" role="region" aria-label="Page scrolling"><div ref={thumb} className="auto-scrollbar-thumb" role="scrollbar" tabIndex={0} aria-label="Page scroll" aria-controls="main-content" aria-orientation="vertical" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} /></div>
    <noscript><style>{"html[data-scrollbar-state]{scrollbar-width:auto!important}html[data-scrollbar-state]::-webkit-scrollbar{display:block!important}.auto-scrollbar{display:none!important}"}</style></noscript>
  </>;
}
