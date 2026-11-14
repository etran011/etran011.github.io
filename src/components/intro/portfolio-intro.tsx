import { type CSSProperties } from "react";

/** The pre-hydration bootstrap owns the visual timeline independently of React. */
export function PortfolioIntro() {
  return <div suppressHydrationWarning className="portfolio-intro" role="status" aria-live="polite" aria-atomic="true">
    <span className="sr-only intro-status-loading">Preparing Erik Tran’s portfolio.</span>
    <span className="sr-only intro-status-ready">Portfolio ready.</span>
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
