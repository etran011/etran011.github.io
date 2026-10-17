"use client";

import { Fragment, useEffect, useRef } from "react";
import { createHeroTypingCycle, heroHeadlinePhrases, heroHeadlineText } from "@/lib/hero-typing";

/** All phrases share a layout cell; only decorative glyphs are typed and erased. */
export function HeroHeadline() {
  const headline = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const element = headline.current;
    const root = document.documentElement;
    if (!element || !("IntersectionObserver" in window)) { delete root.dataset.heroTyping; return; }
    const preference = matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    const copy = element.closest<HTMLElement>(".hero-copy");
    const layers = Array.from(element.querySelectorAll<HTMLElement>(".hero-phrase"));
    const characters = layers.map(layer => Array.from(layer.querySelectorAll<HTMLElement>(".hero-character")));
    const cycle = createHeroTypingCycle();
    let timer: ReturnType<typeof setTimeout> | undefined, fontTimer: ReturnType<typeof setTimeout> | undefined;
    let started = false, disabled = false, visible = false, preparing = false, disposed = false;
    let remaining = cycle.state.delay, deadline = 0, caret: HTMLElement | undefined;
    const active = () => visible && !document.hidden && !preference.matches && !root.hasAttribute("data-intro");
    const pause = () => {
      if (timer !== undefined) { remaining = Math.max(0, deadline - performance.now()); clearTimeout(timer); timer = undefined; }
      element.dataset.paused = "true";
    };
    const staticText = () => {
      disabled = true; pause(); clearTimeout(fontTimer);
      delete root.dataset.heroTyping;
      element.dataset.typing = "static";
      if (copy) copy.dataset.headline = "ready";
      caret?.removeAttribute("data-caret");
    };
    const render = () => {
      const { phrase, count, phase } = cycle.state;
      layers.forEach((layer, index) => { if (index === phrase) layer.dataset.active = "true"; else delete layer.dataset.active; });
      characters[phrase].forEach((character, index) => {
        if (index < count && !character.hasAttribute("data-typed")) character.dataset.typed = "true";
        else if (index >= count && character.hasAttribute("data-typed")) character.removeAttribute("data-typed");
      });
      caret?.removeAttribute("data-caret");
      caret = characters[phrase][Math.max(0, count - 1)];
      caret.dataset.caret = count ? "after" : "before";
      element.dataset.phrase = String(phrase);
      element.dataset.phase = phase;
      if (phase === "hold" && copy) copy.dataset.headline = "ready";
    };
    const schedule = () => {
      if (timer !== undefined || !started || disabled || disposed || !active()) return;
      delete element.dataset.paused;
      deadline = performance.now() + remaining;
      timer = setTimeout(() => {
        timer = undefined;
        if (!active()) { remaining = 0; pause(); return; }
        cycle.advance(); render(); remaining = cycle.state.delay; schedule();
      }, remaining);
    };
    const sync = () => {
      if (disposed || disabled) return;
      if (preference.matches) { staticText(); return; }
      if (started) { if (active()) schedule(); else pause(); return; }
      if (!root.dataset.heroTyping) { staticText(); return; }
      if (!active() || preparing) return;
      preparing = true;
      void Promise.race([document.fonts.ready, new Promise(resolve => { fontTimer = setTimeout(resolve, 500); })]).then(() => {
        clearTimeout(fontTimer); preparing = false;
        if (disposed || disabled) return;
        if (!active()) return;
        started = true;
        element.dataset.typing = "cycling";
        if (copy) copy.dataset.headline = "typing";
        render();
        // The bootstrap only guards hydration; its watchdog must not stop a live loop.
        delete root.dataset.heroTyping;
        schedule();
      });
    };
    const observer = new MutationObserver(sync);
    observer.observe(root, {attributes:true,attributeFilter:["data-intro", "data-hero-typing"]});
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, {threshold:.1});
    intersection.observe(element);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    if (preference.matches || !root.dataset.heroTyping) staticText();
    return () => {
      disposed = true; clearTimeout(timer); clearTimeout(fontTimer);
      observer.disconnect(); intersection.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <p ref={headline} className="hero-headline">
    <span className="sr-only">{heroHeadlineText}</span>
    {heroHeadlinePhrases.map((phrase, phraseIndex) => <span className="hero-phrase" data-initial={phraseIndex === 0 ? "true" : undefined} aria-hidden="true" key={phraseIndex}>
      {phrase.lines.map((line, lineIndex) => <span className="hero-headline-line" data-tone={phrase.tone === "accent" || phrase.tone === "mixed" && lineIndex > 0 ? "accent" : undefined} key={line}>
        {line.split(" ").map((word, wordIndex, words) => <Fragment key={wordIndex}><span className="hero-word">{Array.from(word).map((character, i) => <span className="hero-character" key={i}>{character}</span>)}</span>{wordIndex < words.length - 1 ? " " : null}</Fragment>)}{lineIndex < phrase.lines.length - 1 ? " " : null}
      </span>)}
    </span>)}
  </p>;
}
