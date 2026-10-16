"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";

/** Progressive enhancement: content stays visible without JavaScript. */
export function HeroMotion({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const bounds = useRef<DOMRect | null>(null);
  const follows = useRef(false);
  const x = useSpring(0, { stiffness: 85, damping: 22 });
  const y = useSpring(0, { stiffness: 85, damping: 22 });

  useEffect(() => {
    const fine = matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const coarse = matchMedia("(any-pointer: coarse)");
    const forced = matchMedia("(forced-colors: active)");
    const update = () => { follows.current = fine.matches && !coarse.matches && !forced.matches && navigator.maxTouchPoints === 0; bounds.current = null; if (!follows.current) { x.set(0); y.set(0); } };
    update();
    for (const query of [fine, coarse, forced]) query.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => { for (const query of [fine, coarse, forced]) query.removeEventListener("change", update); window.removeEventListener("resize", update); };
  }, [x, y]);

  const rotateX = useTransform(y, [-8, 8], [2, -2]);
  const rotateY = useTransform(x, [-8, 8], [-2, 2]);

  return (
    <motion.div
      className="hero-motion"
      style={{ x: reducedMotion ? 0 : x, y: reducedMotion ? 0 : y, rotateX: reducedMotion ? 0 : rotateX, rotateY: reducedMotion ? 0 : rotateY }}
      onPointerEnter={(event) => { if (follows.current) bounds.current = event.currentTarget.getBoundingClientRect(); }}
      onPointerMove={(event) => {
        if (reducedMotion || event.pointerType !== "mouse" || !follows.current) return;
        const rect = bounds.current ?? (bounds.current = event.currentTarget.getBoundingClientRect());
        x.set((event.clientX - rect.left - rect.width / 2) * 0.025);
        y.set((event.clientY - rect.top - rect.height / 2) * 0.025);
      }}
      onPointerLeave={() => { bounds.current = null; x.set(0); y.set(0); }}
    >
      <motion.span className="hero-pointer-glow" aria-hidden="true" style={{ x: reducedMotion ? 0 : x, y: reducedMotion ? 0 : y }} />
      {children}
    </motion.div>
  );
}
