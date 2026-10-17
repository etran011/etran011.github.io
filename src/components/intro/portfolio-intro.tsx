"use client";

import { useEffect, useRef } from "react";

/** Visual introduction only: page assets load normally underneath its bounded lifetime. */
export function PortfolioIntro() {
  const screen = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "loading") return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    let finishTimer: ReturnType<typeof setTimeout> | undefined;
    const dismiss = () => { delete root.dataset.intro; delete root.dataset.introStart; };
    const reveal = () => {
      if (root.dataset.intro !== "loading") return;
      root.dataset.intro = "revealing";
      if (screen.current) screen.current.dataset.phase = "ready";
      finishTimer = setTimeout(dismiss, 620);
    };
    const elapsed = performance.now() - Number(root.dataset.introStart || performance.now());
    const timer = setTimeout(reveal, Math.max(0, 900 - elapsed));
    const preference = () => { if (reduced.matches) dismiss(); };
    reduced.addEventListener("change", preference);
    return () => { clearTimeout(timer); clearTimeout(finishTimer); reduced.removeEventListener("change", preference); };
  }, []);

  return <div ref={screen} className="portfolio-intro" role="status" aria-live="polite" aria-atomic="true">
    <span className="sr-only">Preparing Erik Tran’s portfolio.</span>
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
