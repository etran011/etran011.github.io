"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";

/** Progressive enhancement: content stays visible without JavaScript. */
export function HeroMotion({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const x = useSpring(0, { stiffness: 85, damping: 22 });
  const y = useSpring(0, { stiffness: 85, damping: 22 });

  return (
    <motion.div
      className="hero-motion"
      style={{ x: reducedMotion ? 0 : x, y: reducedMotion ? 0 : y }}
      onPointerMove={(event) => {
        if (reducedMotion || event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (min-width: 768px)").matches) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - bounds.left - bounds.width / 2) * 0.025);
        y.set((event.clientY - bounds.top - bounds.height / 2) * 0.025);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}
