"use client";

import { profile } from "@/data/portfolio";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "/#home" },
  { label: "Projects", href: "/#projects" },
  { label: "GitHub", href: profile.links[0].href },
  { label: "Contact", href: `mailto:${profile.email}` },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    const closeOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnResize = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    desktop.addEventListener("change", closeOnResize);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
      desktop.removeEventListener("change", closeOnResize);
    };
  }, [open]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header ref={header} className="site-header">
        <div className="nav-bar">
          <Link className="brand" href="/#home" aria-label="Erik Tran — home" onClick={() => setOpen(false)}>
            <span className="brand-mark" aria-hidden="true">et<span>.</span></span>
            <span>Erik Tran</span>
          </Link>
          <nav aria-label="Main navigation" className="desktop-nav">
            {links.map((link) => <a key={link.label} className="nav-link" href={link.href}>{link.label}{!link.href.startsWith("/") && <ArrowUpRight size={13} aria-hidden="true" />}</a>)}
          </nav>
          <button ref={toggle} className="menu-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-nav" hidden={!open} onBlur={(event) => {
          if (!header.current?.contains(event.relatedTarget)) setOpen(false);
        }}>
          {links.map((link) => <a key={link.label} href={link.href} onClick={() => setOpen(false)}>{link.label}<ArrowUpRight size={16} aria-hidden="true" /></a>)}
        </nav>
      </header>
    </>
  );
}
