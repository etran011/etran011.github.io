"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { Project } from "@/types/portfolio";

export function ScreenshotGallery({ screenshots, title }: { screenshots: Project["screenshots"]; title: string }) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const shot = screenshots[selected];
  const move = (direction: number) => setSelected((current) => (current + direction + screenshots.length) % screenshots.length);

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
        <button ref={expandButton} className="gallery-stage" aria-label={`Expand ${title} screenshot: ${shot.caption}`} onClick={() => setExpanded(true)}>
          <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="(max-width: 767px) 100vw, 1000px" />
          <span className="expand-label"><Expand size={15} aria-hidden="true" /> Enlarge</span>
        </button>
        <figcaption aria-live="polite">{shot.caption}</figcaption>
        <div className="gallery-controls">
          <div className="gallery-selectors">
            {screenshots.map((image, index) => <button key={image.src} aria-pressed={selected === index} onClick={() => setSelected(index)}>{image.caption.split(" · ")[0]}</button>)}
          </div>
          {screenshots.length > 1 && <div className="gallery-arrows"><button aria-label="Previous screenshot" onClick={() => move(-1)}><ChevronLeft size={18} /></button><span aria-hidden="true">{selected + 1} / {screenshots.length}</span><button aria-label="Next screenshot" onClick={() => move(1)}><ChevronRight size={18} /></button></div>}
        </div>
      </figure>
      <dialog ref={dialog} className="gallery-dialog" aria-labelledby={`${id}-title`} onCancel={() => setExpanded(false)} onClose={() => setExpanded(false)} onClick={(event) => { if (event.target === event.currentTarget) setExpanded(false); }} onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      }}>
        <div className="gallery-dialog-content">
          <div className="gallery-dialog-header"><h2 id={`${id}-title`}>{title} / Screenshots</h2><button aria-label="Close screenshot viewer" onClick={() => setExpanded(false)}><X size={22} /></button></div>
          {expanded && <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="95vw" />}
          <div className="gallery-dialog-footer"><p aria-live="polite">{shot.caption}</p><div className="gallery-arrows"><button aria-label="Previous screenshot" onClick={() => move(-1)}><ChevronLeft size={20} /></button><span>{selected + 1} / {screenshots.length}</span><button aria-label="Next screenshot" onClick={() => move(1)}><ChevronRight size={20} /></button></div></div>
        </div>
      </dialog>
    </div>
  );
}
