import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/portfolio";

/** A quiet, real example of the work introduced in the headline. */
export function HeroProject() {
  const project = projects.find((item) => item.featured);
  if (!project) return null;
  const screenshot = project.screenshots[0];

  return (
    <Link className="hero-project surface-panel" href={`/projects/${project.slug}/`}>
      <div className="hero-project-label"><span className="eyebrow">Currently building</span><ArrowUpRight size={18} aria-hidden="true" /></div>
      {screenshot && <div className="hero-project-image"><Image src={screenshot.src} alt="" loading="eager" width={screenshot.width} height={screenshot.height} sizes="(max-width: 767px) 280px, 320px" /></div>}
      <div className="hero-project-copy"><p className="hero-project-title">{project.title}</p><p>{project.summary}</p><span className="hero-project-cta">Explore the case study <ArrowUpRight size={14} aria-hidden="true" /></span></div>
    </Link>
  );
}
