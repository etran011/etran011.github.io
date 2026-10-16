"use client";

import Link from "next/link";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";

export interface StackTechnology {
  name: string;
  category: string;
  group: string;
  projects: { title: string; href: string }[];
}

const StackContext = createContext<{
  selected: StackTechnology | null;
  select: (technology: StackTechnology | null, trigger?: HTMLButtonElement) => void;
  clear: () => void;
}>({ selected: null, select: () => {}, clear: () => {} });

/** Only deliberate activation changes selection; pointer movement stays in CSS. */
export function TechnologyStack({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<StackTechnology | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const select = (technology: StackTechnology | null, button?: HTMLButtonElement) => { if (button) trigger.current = button; setSelected(technology); };
  const clear = () => { trigger.current?.focus(); setSelected(null); };
  return <StackContext.Provider value={{ selected, select, clear }}><div className="technology-stack" data-active-group={selected?.group}>{children}</div></StackContext.Provider>;
}

export function TechnologySelection({ technologies, collections }: { technologies: number; collections: number }) {
  const { selected, clear } = useContext(StackContext);
  return (
    <div className="stack-introduction">
      <div id="stack-selection" className="stack-selection" aria-live="polite" aria-atomic="true">
        <div className="stack-selection-overview" aria-hidden={selected ? true : undefined}>
          <p className="stack-selection-prompt">Select a technology to explore the stack and its project connections.</p>
          <dl className="stack-summary"><div><dt>Technologies</dt><dd>{technologies}</dd></div><div><dt>Collections</dt><dd>{String(collections).padStart(2, "0")}</dd></div></dl>
        </div>
        {selected && <div className="stack-selection-detail">
          <p className="stack-selection-category">{selected.category}</p>
          <p className="stack-selection-name">{selected.name}</p>
          {selected.projects.length ? <div className="stack-project-links">{selected.projects.map((project) => <Link key={project.href} href={project.href}>{project.title}<span aria-hidden="true"> ↗</span></Link>)}</div> : <p className="stack-selection-note">Part of my technical toolkit.</p>}
        </div>}
      </div>
      {selected && <button className="stack-reset" type="button" onClick={clear}>Clear selection <span aria-hidden="true">×</span></button>}
    </div>
  );
}

export function TechnologyButton({ technology, children }: { technology: StackTechnology; children: ReactNode }) {
  const { selected, select } = useContext(StackContext);
  return <button className="technology-button" type="button" aria-pressed={selected?.name === technology.name} aria-controls="stack-selection" data-cursor="Select" onClick={(event) => select(selected?.name === technology.name ? null : technology, event.currentTarget)}>{children}</button>;
}
