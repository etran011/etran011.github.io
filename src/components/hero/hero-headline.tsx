"use client";

import { Fragment, useEffect, useRef } from "react";
import { characterDelay, heroHeadlineLines, heroHeadlineText } from "@/lib/hero-typing";

/** Full-size, accessible SSR text; only the decorative character visibility changes. */
export function HeroHeadline() {
  const headline = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const element = headline.current;
    if (!element || !("IntersectionObserver" in window)) {
      delete document.documentElement.dataset.heroTyping;
      return;
    }
    const root = document.documentElement;
    const preference = matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    const characters = Array.from(element.querySelectorAll<HTMLElement>(".hero-character"));
    let timer: ReturnType<typeof setTimeout> | undefined;
    let next = 0, started = false, done = false, visible = false, preparing = false, disposed = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      delete root.dataset.heroTyping;
      element.dataset.typing = "complete";
      characters.forEach(character => character.removeAttribute("data-caret"));
      if (started) characters[characters.length - 1].dataset.caret = "after";
    };
    const type = () => {
      if (disposed || done) return;
      characters[next - 1]?.removeAttribute("data-caret");
      const character = characters[next];
      character.dataset.typed = "true";
      character.dataset.caret = "after";
      next++;
      if (next === characters.length) { finish(); return; }
      timer = setTimeout(type, characterDelay(character.textContent || "", next - 1));
    };
    const begin = () => {
      if (disposed || done || started || preparing || !visible || document.hidden || root.hasAttribute("data-intro")) return;
      if (preference.matches || !root.dataset.heroTyping) { finish(); return; }
      preparing = true;
      // Font readiness is bounded; the final text always reserves its layout footprint.
      void Promise.race([document.fonts.ready, new Promise(resolve => { timer = setTimeout(resolve, 500); })]).then(() => {
        preparing = false;
        clearTimeout(timer);
        if (disposed || done) return;
        if (root.hasAttribute("data-intro")) return;
        started = true;
        root.dataset.heroTyping = "typing";
        element.dataset.typing = "typing";
        characters[0].dataset.caret = "before";
        timer = setTimeout(type, 420);
      });
    };
    const observer = new MutationObserver(() => {
      if (!root.dataset.heroTyping) finish();
      else begin();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["data-intro", "data-hero-typing"] });
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; begin(); }, { threshold: .1 });
    intersection.observe(element);
    const preferenceChanged = () => { if (preference.matches) finish(); };
    const visibility = () => { if (document.hidden && started) finish(); else if (!document.hidden) begin(); };
    preference.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", visibility);
    if (preference.matches || !root.dataset.heroTyping) finish();
    return () => {
      disposed = true;
      clearTimeout(timer);
      observer.disconnect(); intersection.disconnect();
      preference.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", visibility);
      // The bootstrap watchdog releases its scoped flag even if hydration unmounts.
    };
  }, []);

  return (
    <p ref={headline} className="hero-headline">
      <span className="sr-only">{heroHeadlineText}</span>
      {heroHeadlineLines.map((line, lineIndex) => <span className="hero-headline-line" aria-hidden="true" key={line}>
        {line.split(" ").map((word, wordIndex) => <Fragment key={wordIndex}><span className="hero-word">{Array.from(word).map((character, i) => <span className="hero-character" key={i}>{character}</span>)}</span>{wordIndex < line.split(" ").length - 1 ? " " : null}</Fragment>)}{lineIndex === 0 ? " " : null}
      </span>)}
    </p>
  );
}
