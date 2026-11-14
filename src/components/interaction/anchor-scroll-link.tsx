"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// Only explicit navigation owns this slot; ordinary scrolling has no controller.
let cancelNavigation: (() => void) | undefined;

export function AnchorScrollLink({ children, href, className, toTop = false }: {
  children: ReactNode; href: `#${string}`; className: string; toTop?: boolean;
}) {
  const cancel = useRef<(() => void) | undefined>(undefined);
  const pathname = usePathname();
  useEffect(() => () => cancel.current?.(), [pathname]);

  return <a className={className} href={href} onClick={(event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    cancelNavigation?.();
    const target = document.getElementById(href.slice(1));
    if (!target) return; // Preserve the real anchor fallback.
    event.preventDefault();
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const destination = toTop ? 0 : Math.max(0, Math.min(
      target.getBoundingClientRect().top + scrollY - padding - margin,
      document.documentElement.scrollHeight - innerHeight,
    ));
    const focus = () => target.focus({ preventScroll: true });
    if (location.hash !== href) history.pushState(history.state, "", href);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || Math.abs(scrollY - destination) < 1) {
      window.scrollTo({ top: destination, behavior: "instant" }); focus(); return;
    }

    const listeners = new AbortController();
    let active = true;
    const cleanup = () => {
      active = false; listeners.abort(); clearTimeout(timeout);
      if (cancelNavigation === interrupt) cancelNavigation = undefined;
      cancel.current = undefined;
    };
    const interrupt = () => {
      if (!active) return;
      cleanup();
      window.scrollTo({ top: scrollY, left: scrollX, behavior: "instant" });
    };
    const finish = () => {
      // Ignore a queued scrollend from an animation that was just superseded.
      if (!active || Math.abs(scrollY - destination) > 2) return;
      cleanup(); focus();
    };
    cancelNavigation = interrupt; cancel.current = interrupt;
    for (const name of ["wheel", "touchstart", "pointerdown", "keydown", "popstate", "hashchange", "resize", "blur"]) {
      window.addEventListener(name, interrupt, { passive: true, signal: listeners.signal });
    }
    reduced.addEventListener("change", () => {
      if (!reduced.matches) return;
      cleanup(); window.scrollTo({ top: destination, behavior: "instant" }); focus();
    }, { signal: listeners.signal });
    document.addEventListener("visibilitychange", () => { if (document.hidden) interrupt(); }, { signal: listeners.signal });
    window.addEventListener("scrollend", finish, { signal: listeners.signal });
    // Bounded listener lifetime for engines without scrollend; never force a late jump.
    const timeout = setTimeout(() => { finish(); if (active) cleanup(); }, 2000);
    // Browser-native easing adapts to travel distance; no global smooth-scroll CSS.
    window.scrollTo({ top: destination, behavior: "smooth" });
  }}>{children}</a>;
}
