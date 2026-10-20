"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Opt in for this CTA only; wheel/touch scrolling elsewhere stays native. */
export function ProjectScrollLink({ children }: { children: ReactNode }) {
  const cancel = useRef<(() => void) | null>(null);
  useEffect(() => () => cancel.current?.(), []);

  return <a className="text-link about-story-next" href="#projects" onClick={(event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    cancel.current?.();
    const target = document.getElementById("projects");
    // Let the real anchor handle reduced motion and missing-target fallbacks.
    if (!target || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();

    const listeners = new AbortController();
    const cleanup = () => {
      listeners.abort();
      clearTimeout(timeout);
      cancel.current = null;
    };
    const interrupt = () => {
      cleanup();
      // Stop only this in-flight native animation, without consuming user input.
      window.scrollTo({ top: window.scrollY, left: window.scrollX, behavior: "instant" });
    };
    const finish = () => {
      cleanup();
      target.focus({ preventScroll: true });
    };
    cancel.current = interrupt;
    for (const name of ["wheel", "touchstart", "pointerdown", "keydown", "popstate", "hashchange", "resize"]) {
      window.addEventListener(name, interrupt, { passive: true, signal: listeners.signal });
    }
    window.addEventListener("scrollend", finish, { signal: listeners.signal });
    // Release listeners if a browser doesn't emit scrollend (including no travel).
    const timeout = setTimeout(cleanup, 2000);
    if (location.hash !== "#projects") history.pushState(history.state, "", "#projects");
    // Native easing/duration adapts to distance; existing scroll-padding clears the nav.
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }}>{children}</a>;
}
