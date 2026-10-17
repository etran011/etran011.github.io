"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/** Visual introduction only: page assets load normally underneath its bounded lifetime. */
export function PortfolioIntro() {
  const screen = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "loading") return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    let finishTimer: ReturnType<typeof setTimeout> | undefined;
    let sequenceReady = false;
    let assetsReady = false;
    let disposed = false;
    const dismiss = () => { delete root.dataset.intro; delete root.dataset.introStart; };
    const reveal = () => {
      if (root.dataset.intro !== "loading") return;
      root.dataset.intro = "revealing";
      if (screen.current) screen.current.dataset.phase = "ready";
      if (status.current) status.current.textContent = "Portfolio ready.";
      finishTimer = setTimeout(dismiss, 620);
    };
    const maybeReveal = () => {
      if (!disposed && sequenceReady && assetsReady && document.querySelector<HTMLElement>(".ambient-background")?.dataset.rendererReady === "true") reveal();
    };
    const elapsed = performance.now() - Number(root.dataset.introStart || performance.now());
    const timer = setTimeout(() => { sequenceReady = true; maybeReveal(); }, Math.max(0, 900 - elapsed));
    const deadline = setTimeout(reveal, Math.max(0, 1800 - elapsed));
    const atmosphere = document.querySelector(".ambient-background");
    const observer = new MutationObserver(maybeReveal);
    if (atmosphere) observer.observe(atmosphere, { attributes: true, attributeFilter: ["data-renderer-ready"] });
    const image = atmosphere?.querySelector("img");
    void Promise.allSettled([document.fonts.ready, image?.decode()]).then(() => { assetsReady = true; maybeReveal(); });
    const preference = () => { if (reduced.matches) dismiss(); };
    const visibility = () => { if (document.hidden) dismiss(); };
    reduced.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => { disposed = true; clearTimeout(timer); clearTimeout(deadline); clearTimeout(finishTimer); observer.disconnect(); reduced.removeEventListener("change", preference); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  return <div ref={screen} className="portfolio-intro" role="status" aria-live="polite" aria-atomic="true">
    <span ref={status} className="sr-only">Preparing Erik Tran’s portfolio.</span>
    <div className="intro-curtain" aria-hidden="true" />
    <div className="intro-fragments" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <span key={index} style={{ "--fragment-start-x": `${(index % 6 - 2.5) * 42}px`, "--fragment-start-y": `${(Math.floor(index / 6) - 1) * 24}px`, "--fragment-end-x": `${160 + index % 6 * 35}px`, "--fragment-end-y": `${-100 + Math.floor(index / 6) * 75}px`, "--fragment-delay": `${index % 3 * 20}ms` } as CSSProperties} />)}</div>
    <div className="intro-terminal" aria-hidden="true">
      <div className="intro-terminal-header"><span className="intro-brackets">&#123; &#125;</span><span>erik / initialize.ts</span><span className="intro-runtime">ES MODULE</span></div>
      <div className="intro-code">
        <div className="intro-line"><span className="intro-line-number">01</span><span><b>const</b> developer = &#123;</span></div>
        <div className="intro-line"><span className="intro-line-number">02</span><span>&nbsp; name: <em>&quot;Erik Tran&quot;</em>,</span></div>
        <div className="intro-line"><span className="intro-line-number">03</span><span>&nbsp; focus: [<em>&quot;Software&quot;</em>, <em>&quot;Data&quot;</em>, <em>&quot;AI&quot;</em>]</span></div>
        <div className="intro-line"><span className="intro-line-number">04</span><span>&#125;;</span></div>
      </div>
      <div className="intro-terminal-footer"><span className="intro-command">&gt; initialize(developer)<span className="intro-caret" /></span><span className="intro-ready">ready <span>↗</span></span></div>
    </div>
  </div>;
}
