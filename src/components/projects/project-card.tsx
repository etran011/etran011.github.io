import type { Project } from "@/types/portfolio";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className="project-card" aria-labelledby={`project-${project.slug}`}>
      <div className="project-card-copy">
        <p className="eyebrow project-category"><span>{String(index + 1).padStart(2, "0")}</span> / {project.category}</p>
        <h3 id={`project-${project.slug}`}>{project.title}</h3>
        <p className="project-summary">{project.summary}</p>
        <ul className="project-highlights" aria-label={`${project.title} highlights`}>
          {project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
        <ul className="technology-list" aria-label={`${project.title} technologies`}>
          {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
        </ul>
      </div>
    </article>
  );
}
