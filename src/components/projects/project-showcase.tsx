import { Container } from "@/components/ui/container";
import { projects } from "@/data/portfolio";
import { ProjectCard } from "./project-card";

export function ProjectShowcase() {
  const [leading, ...remaining] = projects;
  const heading = (
    <div className="section-heading project-scene-heading">
      <div><p className="eyebrow">Selected work / 02</p><h2 id="projects-heading">Software &amp; data projects.</h2></div>
      <p>Interactive tools for option pricing and calorie estimation, with documented methods and results.</p>
    </div>
  );
  const introduction = <>{heading}{leading && <ProjectCard project={leading} index={0} />}</>;
  return (
    <section id="projects" tabIndex={-1} className="project-section" aria-labelledby="projects-heading">
      <Container>
        <div className="project-list">
          <div>{introduction}</div>
          {remaining.map((project, index) => <ProjectCard key={project.slug} project={project} index={index + 1} />)}
        </div>
      </Container>
    </section>
  );
}
