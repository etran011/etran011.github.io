import { Container } from "@/components/ui/container";
import { skillCategories } from "@/data/background";
import { TechnologyIcon } from "./technology-icon";
import { SkillsReveal } from "./skills-reveal";

export function SkillsSection() {
  return (
    <section id="skills" className="background-section skills-section" aria-labelledby="skills-heading">
      <Container>
        <header className="stack-header">
          <div><p className="eyebrow">Technical stack / 04</p><h2 id="skills-heading">The tools behind<br /><span>the work.</span></h2></div>
          <div className="stack-introduction"><p>The languages, libraries, and tools I bring into my projects.</p><dl className="stack-summary"><div><dt>Technologies</dt><dd>{skillCategories.reduce((total, category) => total + category.items.length, 0)}</dd></div><div><dt>Collections</dt><dd>{String(skillCategories.length).padStart(2, "0")}</dd></div></dl></div>
        </header>
        <SkillsReveal>
          {skillCategories.map((category, index) => (
            <section className="stack-collection" key={category.id} data-collection={category.id} aria-labelledby={`stack-${category.id}`}>
              <div className="stack-collection-heading"><span className="eyebrow" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3 id={`stack-${category.id}`}>{category.name}</h3></div>
              <ul className="stack-technologies" role="list">{category.items.map((skill) => <li className="technology-node" key={skill} data-technology={skill}><span className="technology-glyph"><TechnologyIcon name={skill} /></span><span className="technology-name">{skill}</span></li>)}</ul>
            </section>
          ))}
        </SkillsReveal>
      </Container>
    </section>
  );
}
