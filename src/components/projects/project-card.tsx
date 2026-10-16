import Image from "next/image";
import type { Project } from "@/types/portfolio";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className={`project-card ${project.featured ? "project-featured" : "project-secondary"}`} aria-labelledby={`project-${project.slug}`}>
      <div className="project-card-copy">
        <div className="project-intro">
        <p className="eyebrow project-category"><span>{String(index + 1).padStart(2, "0")}</span> / {project.category}</p>
        <h3 id={`project-${project.slug}`}>{project.title}</h3>
        <p className="project-summary">{project.summary}</p>
        <p className="project-period">{project.period}</p>
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
      {project.screenshots[0] && <figure className="project-preview">
        <Image src={project.screenshots[0].src} alt={project.screenshots[0].alt} width={project.screenshots[0].width} height={project.screenshots[0].height} sizes="(max-width: 767px) 100vw, 1100px" />
        <figcaption>{project.screenshots[0].caption}</figcaption>
      </figure>}
    </article>
  );
}
