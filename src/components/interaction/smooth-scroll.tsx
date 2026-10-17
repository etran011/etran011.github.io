"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";

/** Only wheel motion is enhanced; browser keys, touch, history and nested UI stay native. */
export function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    const desktop = matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    const forced = matchMedia("(forced-colors: active)");
    const coarse = matchMedia("(any-pointer: coarse)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let instance: Lenis | undefined;
    let generation = 0;
    let disposed = false;
    const eligible = () => desktop.matches && !coarse.matches && !forced.matches && navigator.maxTouchPoints === 0 && !reduce.matches;
    const modalState = () => {
      if (!instance) return;
      if (document.documentElement.hasAttribute("data-intro") || document.body.style.overflow === "hidden" || document.querySelector("dialog[open]")) { instance.stop(); }
      else if (instance.isStopped) instance.start();
    };
    const configure = async () => {
      const current = ++generation;
      instance?.destroy(); instance = undefined;
      delete document.documentElement.dataset.weightedScroll;
      if (!eligible()) return;
      try {
        const { default: Lenis } = await import("lenis");
        if (disposed || current !== generation || !eligible()) return;
        instance = new Lenis({
          autoRaf: true, lerp: 0.115, wheelMultiplier: 1, syncTouch: false,
          anchors: false, stopInertiaOnNavigate: true,
          prevent: (node) => Boolean(node.closest("dialog, .mobile-nav, input, textarea, select, [contenteditable], [data-lenis-prevent]")),
        });
        document.documentElement.dataset.weightedScroll = "true";
        modalState();
      } catch {
        if (current === generation) { instance?.destroy(); instance = undefined; delete document.documentElement.dataset.weightedScroll; }
      }
    };
    const interrupt = () => { if (instance && !instance.isStopped) { instance.stop(); instance.start(); } };
    const anchor = (event: MouseEvent) => {
      if (!instance || instance.isStopped || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
      let target: HTMLElement | null;
      try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
      if (!target) return;
      event.preventDefault();
      interrupt();
      if (location.hash !== url.hash) history.pushState(null, "", url.hash);
      instance.scrollTo(target, { onComplete: () => {
        const added = !target.hasAttribute("tabindex");
        if (added) { target.setAttribute("tabindex", "-1"); target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true }); }
        target.focus({ preventScroll: true });
      } });
    };
    const keyboard = (event: KeyboardEvent) => { if (["Tab", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) interrupt(); };
    const observer = new MutationObserver(modalState);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-intro"] });
    for (const query of [desktop, coarse, reduce, forced]) query.addEventListener("change", configure);
    document.addEventListener("click", anchor);
    document.addEventListener("keydown", keyboard);
    document.addEventListener("focusin", interrupt);
    document.addEventListener("toggle", modalState, true);
    window.addEventListener("popstate", interrupt);
    window.addEventListener("hashchange", interrupt);
    void configure();
    return () => {
      disposed = true; generation++;
      instance?.destroy(); delete document.documentElement.dataset.weightedScroll;
      observer.disconnect();
      for (const query of [desktop, coarse, reduce, forced]) query.removeEventListener("change", configure);
      document.removeEventListener("click", anchor);
      document.removeEventListener("keydown", keyboard); document.removeEventListener("focusin", interrupt);
      document.removeEventListener("toggle", modalState, true);
      window.removeEventListener("popstate", interrupt); window.removeEventListener("hashchange", interrupt);
    };
  }, [pathname]);
  return null;
}
