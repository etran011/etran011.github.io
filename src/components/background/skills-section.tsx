import { Container } from "@/components/ui/container";
import { skillCategories } from "@/data/background";

export function SkillsSection() {
  return (
    <section id="skills" className="background-section" aria-labelledby="skills-heading">
      <Container>
        <div className="section-heading">
          <div><p className="eyebrow">Technical skills / 04</p><h2 id="skills-heading">From exploration<br />to implementation.</h2></div>
          <p>The languages, methods, and tools I use across data analysis, machine learning, and software projects.</p>
        </div>
        <div className="skills-grid">
          {skillCategories.map((category, index) => (
            <section className="skill-category" key={category.name} aria-labelledby={`skill-category-${index}`}>
              <span className="eyebrow" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <h3 id={`skill-category-${index}`}>{category.name}</h3>
              <ul>{category.items.map((skill) => <li key={skill}>{skill}</li>)}</ul>
            </section>
          ))}
        </div>
      </Container>
    </section>
  );
}
