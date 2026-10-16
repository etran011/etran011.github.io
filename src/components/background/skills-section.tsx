import { Container } from "@/components/ui/container";
import { skillCategories } from "@/data/background";
import { TechnologyIcon } from "./technology-icon";
import { SkillsReveal } from "./skills-reveal";

export function SkillsSection() {
  return (
    <section id="skills" className="background-section skills-section" aria-labelledby="skills-heading">
      <Container className="skills-layout">
        <div className="section-heading skills-heading">
          <div><p className="eyebrow">Technical skills / 04</p><h2 id="skills-heading">From exploration<br />to implementation.</h2></div>
          <p>The languages, libraries, frameworks, and tools I use across my projects.</p>
        </div>
        <SkillsReveal>
          {skillCategories.map((category, index) => (
            <section className="skill-category" key={category.name} aria-labelledby={`skill-category-${index}`}>
              <span className="eyebrow" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <h3 id={`skill-category-${index}`}>{category.name}</h3>
              <ul>{category.items.map((skill) => <li key={skill} data-technology={skill}><TechnologyIcon name={skill} /><span>{skill}</span></li>)}</ul>
            </section>
          ))}
        </SkillsReveal>
      </Container>
    </section>
  );
}
