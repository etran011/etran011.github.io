"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";

/** Progressive enhancement: content stays visible without JavaScript. */
export function HeroMotion({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const x = useSpring(0, { stiffness: 85, damping: 22 });
  const y = useSpring(0, { stiffness: 85, damping: 22 });

  const rotateX = useTransform(y, [-8, 8], [2, -2]);
  const rotateY = useTransform(x, [-8, 8], [-2, 2]);

  return (
    <motion.div
      className="hero-motion"
      style={{ x: reducedMotion ? 0 : x, y: reducedMotion ? 0 : y, rotateX: reducedMotion ? 0 : rotateX, rotateY: reducedMotion ? 0 : rotateY, transformPerspective: reducedMotion ? undefined : 900 }}
      onPointerMove={(event) => {
        if (reducedMotion || event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (min-width: 768px)").matches) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - bounds.left - bounds.width / 2) * 0.025);
        y.set((event.clientY - bounds.top - bounds.height / 2) * 0.025);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      <motion.span className="hero-pointer-glow" aria-hidden="true" style={{ x: reducedMotion ? 0 : x, y: reducedMotion ? 0 : y }} />
      {children}
    </motion.div>
  );
}
