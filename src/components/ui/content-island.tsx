import type { HTMLAttributes } from "react";

/** A shared quiet surface; content decides its size and semantic heading. */
export function ContentIsland({ as: Tag = "div", className = "", ...props }: HTMLAttributes<HTMLElement> & { as?: "article" | "div" }) {
  return <Tag className={`content-island ${className}`} {...props} />;
}
