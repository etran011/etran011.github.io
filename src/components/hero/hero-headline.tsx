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
      element.dataset.phase = phase === "typing" && count === 0 ? "prompt" : phase;
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
    observer.observe(root, {attributes:true,attributeFilter:["data-intro"]});
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, {threshold:.1});
    intersection.observe(element);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    // The document bootstrap prevents a first-load flash; it is not a mount signal.
    // Client navigation and restored routes must start without that temporary flag.
    if (preference.matches) staticText();
    return () => {
      disposed = true; clearTimeout(timer); clearTimeout(fontTimer);
      observer.disconnect(); intersection.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      // React may retain route DOM while stopping effects. Leave a clean static
      // fallback so the next effect owns exactly one cycle and one caret.
      for (const layer of layers) delete layer.dataset.active;
      for (const phrase of characters) for (const character of phrase) {
        delete character.dataset.typed;
        delete character.dataset.caret;
      }
      delete element.dataset.typing;
      delete element.dataset.phase;
      delete element.dataset.phrase;
      delete element.dataset.paused;
      if (copy) delete copy.dataset.headline;
    };
  }, []);

  return <div className="hero-terminal">
    <p className="hero-command-prompt" aria-hidden="true"><span>~/portfolio</span><b>❯</b></p>
    <p ref={headline} className="hero-headline">
    <span className="sr-only">{heroHeadlineText}</span>
    {heroHeadlinePhrases.map((phrase, phraseIndex) => <span className="hero-phrase" data-initial={phraseIndex === 0 ? "true" : undefined} aria-hidden="true" key={phraseIndex}>
      {phrase.lines.map((line, lineIndex) => <span className="hero-headline-line" key={line}>
        {line.split(" ").map((word, wordIndex, words) => <Fragment key={wordIndex}><span className="hero-word">{Array.from(word).map((character, i) => <span className="hero-character" key={i}>{character}</span>)}</span>{wordIndex < words.length - 1 ? <span className="hero-character hero-space"> </span> : null}</Fragment>)}{lineIndex < phrase.lines.length - 1 ? <span className="hero-character hero-space"> </span> : null}
      </span>)}
    </span>)}
    </p>
  </div>;
}
