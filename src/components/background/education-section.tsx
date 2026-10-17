import { Container } from "@/components/ui/container";
import { education } from "@/data/background";
import "./education-section.css";

/** Academic coordinate study: decorative geometry, never a claim about measured progress. */
function AcademicStudy() {
  return (
    <svg className="academic-study" viewBox="0 0 440 440" fill="none" aria-hidden="true">
      <g className="academic-grid">{[80, 150, 220, 290, 360].map((n) => <path key={n} d={`M${n} 45V395 M45 ${n}H395`} />)}</g>
      <circle className="academic-boundary" cx="220" cy="220" r="173" />
      <g className="academic-lattice">
        <path d="M82 280 148 133 270 84 361 193 302 330 174 362Z M148 133 302 330 82 280 361 193 174 362 270 84Z" />
        <path className="academic-signal" d="M82 280 148 133 270 84 361 193 302 330 174 362" />
        {[[82, 280], [148, 133], [270, 84], [361, 193], [302, 330], [174, 362]].map(([x, y], i) => <circle key={i} className={`academic-node academic-node-${i}`} cx={x} cy={y} r="3" />)}
      </g>
      <path className="academic-axis" d="M220 32v16m0 344v16M32 220h16m344 0h16" />
    </svg>
  );
}

export function EducationSection() {
  return (
    <section id="education" className="background-section education-section" aria-labelledby="education-heading">
      <Container>
        <header className="education-kicker"><p className="eyebrow">Education / 05</p><p className="education-location">{education.location}</p></header>
        <div className="education-composition">
          <div className="education-identity">
            <h2 id="education-heading" aria-label={education.institution}><span>William</span><span><em>&amp;</em> Mary<span className="education-period">.</span></span></h2>
            <div className="education-introduction"><p className="education-degree">Bachelor of Science<br /><span>in Data Science</span></p><p className="education-description">A foundation in statistics, computing,<br className="education-desktop-break" /> and machine learning.</p></div>
          </div>
          <div className="education-academic">
            <AcademicStudy />
            <dl className="education-metrics">
              <div className="education-graduation"><dt>Expected graduation</dt><dd>{education.graduation.replace("Expected ", "")}</dd></div>
              <div className="education-gpa"><dt>Cumulative GPA</dt><dd>{education.gpa.split(" / ")[0]} <span>/ {education.gpa.split(" / ")[1]}</span></dd></div>
            </dl>
            <p className="education-field eyebrow">Mathematics × Computing × Discovery</p>
          </div>
        </div>
        <div className="education-progression" aria-label="Degree in progress, expected graduation in 2028">
          <div className="education-progression-label"><span className="education-status-dot" aria-hidden="true" /><span>Degree in progress</span></div>
          <div className="education-timeline" aria-hidden="true"><span /><i /></div>
          <p>Expected <span>2028</span></p>
        </div>
        <details className="education-coursework"><summary><span>Academic foundations</span><span className="education-coursework-hint">Explore coursework <span aria-hidden="true">+</span></span></summary><ul>{education.coursework.map((course, i) => <li key={course}><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>{course}</li>)}</ul></details>
      </Container>
    </section>
  );
}
