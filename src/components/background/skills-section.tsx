import type { CSSProperties } from "react";
import { technologyBrand } from "@/data/technology-brands";
import { Container } from "@/components/ui/container";
import { projects } from "@/data/portfolio";
import { TechnologyButton, TechnologySelection, TechnologyStack } from "./technology-stack";
import { skillCategories } from "@/data/background";
import { TechnologyIcon } from "./technology-icon";
import { SkillsReveal } from "./skills-reveal";

export function SkillsSection() {
  return (
    <section id="skills" className="background-section skills-section" aria-labelledby="skills-heading">
      <Container>
        <TechnologyStack>
        <header className="stack-header">
          <div><p className="eyebrow">Technical stack / 04</p><h2 id="skills-heading">The tools behind<br /><span>the work.</span></h2></div>
          <TechnologySelection technologies={skillCategories.reduce((total, category) => total + category.items.length, 0)} collections={skillCategories.length} />
        </header>
        <SkillsReveal>
          {skillCategories.map((category, index) => (
            <section className="stack-collection" key={category.id} data-collection={category.id} aria-labelledby={`stack-${category.id}`}>
              <div className="stack-collection-heading"><span className="eyebrow" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3 id={`stack-${category.id}`}>{category.name}</h3></div>
              <ul className="stack-technologies" role="list">{category.items.map((skill) => <li className="technology-node" key={skill} data-technology={skill} data-brand-surface={technologyBrand(skill).lightSurface ? "light" : undefined} style={{ "--brand-color": technologyBrand(skill).color } as CSSProperties}><TechnologyButton technology={{ name: skill, category: category.name, group: category.id, projects: projects.filter((project) => (project.technologies as readonly string[]).includes(skill)).map((project) => ({ title: project.title, href: `/projects/${project.slug}/` })) }}><span className="technology-glyph"><TechnologyIcon name={skill} /></span><span className="technology-name">{skill}</span></TechnologyButton></li>)}</ul>
            </section>
          ))}
        </SkillsReveal>
      </TechnologyStack>
      </Container>
    </section>
  );
}
