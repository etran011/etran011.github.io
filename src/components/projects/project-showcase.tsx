import { Container } from "@/components/ui/container";
import { projects } from "@/data/portfolio";
import { ProjectCard } from "./project-card";

export function ProjectShowcase() {
  return (
    <section id="projects" className="project-section" aria-labelledby="projects-heading">
      <Container>
        <div className="section-heading">
          <div><p className="eyebrow">Selected work / 02</p><h2 id="projects-heading">Ideas, put to work.</h2></div>
          <p>Exploring financial models and machine learning through software you can understand.</p>
        </div>
        <div className="project-list">
          {projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
        </div>
      </Container>
    </section>
  );
}
