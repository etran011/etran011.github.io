import { Container } from "@/components/ui/container";
import { experience } from "@/data/background";
import "./experience-section.css";
import { ExperienceTimeline } from "./experience-timeline";

export function ExperienceSection() {
  return (
    <section id="experience" className="background-section experience-section" aria-labelledby="experience-heading">
      <Container>
        <div className="section-heading">
          <div><p className="eyebrow">Experience / 03</p><h2 id="experience-heading">Working with people.<br />Solving technical problems.</h2></div>
          <p>From campus support to data analysis, my work connects technical detail with clear communication.</p>
        </div>
        <ExperienceTimeline>
          {experience.map((item) => (
            <li key={item.id} className="experience-entry">
              <span className="experience-milestone" aria-hidden="true" />
              <p className="experience-date">{item.period}</p>
              <article aria-labelledby={`${item.id}-heading`}>
                <h3 id={`${item.id}-heading`}>{item.role}</h3>
                <p className="experience-organization">{item.organization}</p>
                <p className="experience-location">{item.location}</p>
                <p className="experience-summary">{item.summary}</p>
                <ul className="experience-highlights">{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
                <ul className="experience-tags" aria-label={`${item.role} areas and tools`}>{item.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
              </article>
            </li>
          ))}
        </ExperienceTimeline>
      </Container>
    </section>
  );
}
