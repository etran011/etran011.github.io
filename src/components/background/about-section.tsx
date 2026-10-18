import { ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ContentIsland } from "@/components/ui/content-island";
import { about } from "@/data/background";

export function AboutSection() {
  return (
    <section id="about" tabIndex={-1} className="background-section about-section" aria-labelledby="about-heading">
      <Container>
        <ContentIsland className="about-introduction">
          <p className="about-label">About me</p>
          <div className="about-layout">
            <header className="about-heading">
              <h2 id="about-heading">{about.heading}<br /><span>{about.emphasis}</span></h2>
            </header>
            <div className="about-copy">
              {about.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              <a className="text-link about-story-next" href="#projects">See what I’m building <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </ContentIsland>
      </Container>
    </section>
  );
}
