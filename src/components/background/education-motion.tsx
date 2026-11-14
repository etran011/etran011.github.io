"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** The shared island reveal owns entry; this observer only controls decorative idle motion. */
export function EducationMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    let visible = false;
    const sync = () => {
      element.dataset.active = String(visible && !document.hidden && !reduced.matches && !forced.matches);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: .06, rootMargin: "0px 0px -24px 0px" });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    forced.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      forced.removeEventListener("change", sync);
    };
  }, []);
  return <div ref={root} data-education-motion>{children}</div>;
}
