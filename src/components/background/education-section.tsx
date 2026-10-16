import { Container } from "@/components/ui/container";
import { education } from "@/data/background";

export function EducationSection() {
  return (
    <section id="education" className="background-section education-section" aria-labelledby="education-heading">
      <Container>
        <div className="section-heading"><div><p className="eyebrow">Education / 03</p><h2 id="education-heading">A foundation in data.</h2></div></div>
        <div className="education-layout">
          <div className="education-school">
            <p className="education-location">{education.location}</p>
            <h3>{education.institution}</h3>
            <p className="education-degree">{education.degree}</p>
            <dl className="education-facts"><div><dt>Graduation</dt><dd>{education.graduation}</dd></div><div><dt>Overall GPA</dt><dd>{education.gpa}</dd></div></dl>
          </div>
          <div className="education-coursework"><h3>Relevant coursework</h3><ul>{education.coursework.map((course) => <li key={course}>{course}</li>)}</ul></div>
        </div>
      </Container>
    </section>
  );
}
