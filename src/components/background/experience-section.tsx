import { Container } from "@/components/ui/container";
import { experience } from "@/data/background";

export function ExperienceSection() {
  return (
    <section id="experience" className="background-section" aria-labelledby="experience-heading">
      <Container>
        <div className="section-heading">
          <div><p className="eyebrow">Experience / 03</p><h2 id="experience-heading">Working with people.<br />Solving technical problems.</h2></div>
          <p>From campus support to data analysis, my work connects technical detail with clear communication.</p>
        </div>
        <ol className="experience-list">
          {experience.map((item) => (
            <li key={item.id} className="experience-entry content-island">
              <div className="experience-date"><p>{item.period}</p><span>{item.location}</span></div>
              <article aria-labelledby={`${item.id}-heading`}>
                <h3 id={`${item.id}-heading`}>{item.role}</h3>
                <p className="experience-organization">{item.organization}</p>
                <ul className="experience-highlights">{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
              </article>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
