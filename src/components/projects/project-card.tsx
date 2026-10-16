import { ScrollStory } from "@/components/interaction/scroll-story";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ScreenshotGallery } from "./screenshot-gallery";
import type { Project } from "@/types/portfolio";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const storytelling = project.featured && project.screenshots.length > 1;
  const card = (
    <article className={`project-card ${project.featured ? "project-featured" : "project-secondary"}`} aria-labelledby={`project-${project.slug}`}>
      <div className="project-card-copy">
        <div className="project-intro">
        <p className="eyebrow project-category"><span>{String(index + 1).padStart(2, "0")}</span> / {project.category}</p>
        <h3 id={`project-${project.slug}`}>{project.title}</h3>
        <p className="project-summary">{project.summary}</p>
        <p className="project-period">{project.period}</p>
        <Link className="case-link" href={`/projects/${project.slug}/`}>Read case study <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only">: {project.title}</span></Link>
        </div>
        <div className="project-details">
        <ul className="project-highlights" aria-label={`${project.title} highlights`}>
          {project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
        <ul className="technology-list" aria-label={`${project.title} technologies`}>
          {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
        </ul>
        </div>
      </div>
      <ScreenshotGallery screenshots={project.screenshots} title={project.title} scrollLinked={storytelling} />
    </article>
  );
  return storytelling ? <ScrollStory kind="project" steps={project.screenshots.length}>{card}</ScrollStory> : card;
}
