import type { ReactNode } from "react";
import { AnchorScrollLink } from "./anchor-scroll-link";

export function ProjectScrollLink({ children }: { children: ReactNode }) {
  return <AnchorScrollLink className="text-link about-story-next" href="#projects">{children}</AnchorScrollLink>;
}
