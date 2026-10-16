"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X, ZoomIn, ZoomOut } from "lucide-react";
import type { Project } from "@/types/portfolio";

export function ScreenshotGallery({ screenshots, title }: { screenshots: Project["screenshots"]; title: string }) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const shot = screenshots[selected];
  const select = (index: number) => { setSelected(index); setZoomed(false); };
  const move = (direction: number) => { setSelected((current) => (current + direction + screenshots.length) % screenshots.length); setZoomed(false); };

  useEffect(() => { viewport.current?.scrollTo(0, 0); }, [selected, zoomed]);

  useEffect(() => {
    if (!expanded) return;
    const element = dialog.current;
    const trigger = expandButton.current;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [expanded]);

  if (!shot) return null;
  return (
    <div className="screenshot-gallery" role="region" aria-label={`${title} screenshots`}>
      <figure className="project-preview">
        <button ref={expandButton} className="gallery-stage" aria-label={`Enlarge ${title} screenshot: ${shot.caption}`} onClick={() => { if (swiped.current) { swiped.current = false; return; } setZoomed(false); setExpanded(true); }}
          onPointerDown={(event) => { swiped.current = false; if (event.pointerType === "touch") { gesture.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); } }}
          onPointerCancel={() => { gesture.current = null; }}
          onPointerUp={(event) => {
            if (!gesture.current) return;
            const dx = event.clientX - gesture.current.x;
            const dy = event.clientY - gesture.current.y;
            gesture.current = null;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped.current = true; move(dx < 0 ? 1 : -1); }
          }}>
          <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="(max-width: 767px) 100vw, 1000px" />
          <span className="expand-label"><Expand size={15} aria-hidden="true" /> Enlarge</span>
        </button>
        <figcaption aria-live="polite">{shot.caption}</figcaption>
        <div className="gallery-controls">
          <div className="gallery-selectors">
            {screenshots.map((image, index) => <button key={image.src} aria-pressed={selected === index} onClick={() => select(index)}>{image.caption.split(" · ")[0]}</button>)}
          </div>
          {screenshots.length > 1 && <div className="gallery-arrows"><button aria-label="Previous screenshot" onClick={() => move(-1)}><ChevronLeft size={18} aria-hidden="true" /></button><span aria-hidden="true">{selected + 1} / {screenshots.length}</span><button aria-label="Next screenshot" onClick={() => move(1)}><ChevronRight size={18} aria-hidden="true" /></button></div>}
        </div>
      </figure>
      <dialog ref={dialog} className="gallery-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-help`} onCancel={() => setExpanded(false)} onClose={() => setExpanded(false)} onClick={(event) => { if (event.target === event.currentTarget) setExpanded(false); }} onKeyDown={(event) => {
        if (event.key === "Tab") {
          const controls = event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled]), [tabindex='0']");
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
        if (zoomed && event.target === viewport.current) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      }}>
        <div className="gallery-dialog-content">
          <div className="gallery-dialog-header"><h2 id={`${id}-title`}>{title} / Screenshots</h2><button className="zoom-toggle" aria-pressed={zoomed} aria-label={zoomed ? "Fit screenshot" : "Zoom screenshot"} onClick={() => setZoomed(!zoomed)}>{zoomed ? <ZoomOut size={20} aria-hidden="true" /> : <ZoomIn size={20} aria-hidden="true" />}</button><button aria-label="Close screenshot viewer" onClick={() => setExpanded(false)}><X size={22} aria-hidden="true" /></button></div>
          <div ref={viewport} className={`gallery-viewport ${zoomed ? "is-zoomed" : ""}`} tabIndex={zoomed ? 0 : -1} role="region" aria-label={zoomed ? "Zoomed screenshot; scroll to explore" : "Full screenshot"} aria-describedby={zoomed ? `${id}-help` : undefined}>
            <div className="gallery-image-canvas">{expanded && <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="95vw" />}</div>
          </div>
          <p id={`${id}-help`} className="gallery-help">Use arrow keys to change screenshots. When zoomed, focus the image to scroll. Press Escape to close.</p>
          <div className="gallery-dialog-footer"><p aria-live="polite">{shot.caption}</p><div className="gallery-arrows"><button aria-label="Previous screenshot" onClick={() => move(-1)}><ChevronLeft size={20} aria-hidden="true" /></button><span>{selected + 1} / {screenshots.length}</span><button aria-label="Next screenshot" onClick={() => move(1)}><ChevronRight size={20} aria-hidden="true" /></button></div></div>
        </div>
      </dialog>
    </div>
  );
}
