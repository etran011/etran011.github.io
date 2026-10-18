import { Container } from "@/components/ui/container";
import { projects } from "@/data/portfolio";
import { ProjectCard } from "./project-card";

export function ProjectShowcase() {
  const [leading, ...remaining] = projects;
  const heading = (
    <div className="section-heading project-scene-heading">
      <div><p className="eyebrow">Selected work / 02</p><h2 id="projects-heading">Ideas, put to work.</h2></div>
      <p>Exploring financial models and machine learning through software you can understand.</p>
    </div>
  );
  const introduction = <>{heading}{leading && <ProjectCard project={leading} index={0} />}</>;
  return (
    <section id="projects" className="project-section" aria-labelledby="projects-heading">
      <Container>
        <div className="project-list">
          <div>{introduction}</div>
          {remaining.map((project, index) => <ProjectCard key={project.slug} project={project} index={index + 1} />)}
        </div>
      </Container>
    </section>
  );
}
