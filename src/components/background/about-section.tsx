import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { about } from "@/data/background";

export function AboutSection() {
  return (
    <section id="about" className="background-section about-section" aria-labelledby="about-heading">
      <Container>
        <div className="about-layout">
          <div className="about-intro">
            <p className="eyebrow">About me / 01</p>
            <h2 id="about-heading">Curious about data.<br /><span>Careful about the experience.</span></h2>
          </div>
          <div className="about-copy">
            {about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <div className="about-interests"><h3 className="eyebrow">Areas of interest</h3><ul>{about.interests.map((interest) => <li key={interest}>{interest}</li>)}</ul></div>
            <a className="text-link about-education-link" href="#education">Education &amp; coursework <ArrowUpRight size={15} aria-hidden="true" /></a>
          </div>
        </div>
      </Container>
    </section>
  );
}
