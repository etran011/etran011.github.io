"use client";

import { profile } from "@/data/portfolio";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Experience", href: "/#experience" },
  { label: "Skills", href: "/#skills" },
  { label: "Education", href: "/#education" },
  { label: "Contact", href: "/#contact" },
  { label: "GitHub", href: profile.links[0].href },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const pathname = usePathname();
  const progress = useRef<HTMLDivElement>(null);
  const activeHref = pathname === "/" ? `/#${active}` : pathname.startsWith("/projects/") ? "/#projects" : undefined;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${maximum > 0 ? Math.min(1, Math.max(0, window.scrollY / maximum)) : 0})`;
      if (pathname !== "/") return;
      const sections = links.filter((link) => link.href.startsWith("/#")).map((link) => document.getElementById(link.href.slice(2))).filter((section): section is HTMLElement => Boolean(section));
      let current = sections[0]?.id ?? "home";
      for (const section of sections) if (section.getBoundingClientRect().top <= 170) current = section.id;
      if (maximum > 0 && window.scrollY >= maximum - 2) current = sections.at(-1)?.id ?? current;
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, [pathname]);
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
    const desktop = window.matchMedia("(min-width: 1024px)");
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
          <Link className="brand" href="/#home" onClick={() => setOpen(false)}>
            <span className="brand-mark" aria-hidden="true">et<span>.</span></span>
            <span>Erik Tran<span className="sr-only"> — home</span></span>
          </Link>
          <nav aria-label="Main navigation" className="desktop-nav">
            {links.map((link) => <a key={link.label} className="nav-link" href={link.href} aria-current={activeHref === link.href ? "location" : undefined}>{link.label}{!link.href.startsWith("/") && <ArrowUpRight size={13} aria-hidden="true" />}</a>)}
          </nav>
          <button ref={toggle} className="menu-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
            <span className={`menu-icon ${open ? "is-open" : ""}`} aria-hidden="true">{open ? <X size={22} /> : <Menu size={22} />}</span>
          </button>
        </div>
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-nav" hidden={!open} onBlur={(event) => {
          if (!header.current?.contains(event.relatedTarget)) setOpen(false);
        }}>
          {links.map((link) => <a key={link.label} href={link.href} aria-current={activeHref === link.href ? "location" : undefined} onClick={() => setOpen(false)}>{link.label}<ArrowUpRight size={16} aria-hidden="true" /></a>)}
        </nav>
        <noscript>
          <style>{"@media(max-width:1023px){.menu-toggle{display:none}.site-header{position:relative;top:0}}"}</style>
          <nav className="mobile-nav" aria-label="Section navigation">
            {links.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
          </nav>
        </noscript>
        <div ref={progress} className="nav-progress" aria-hidden="true" />
      </header>
    </>
  );
}
