import { ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ContentIsland } from "@/components/ui/content-island";
import { about } from "@/data/background";
import { ProjectScrollLink } from "@/components/interaction/project-scroll-link";

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
              <ProjectScrollLink>See what I’m building <ArrowDown size={16} aria-hidden="true" /></ProjectScrollLink>
            </div>
          </div>
        </ContentIsland>
      </Container>
    </section>
  );
}
