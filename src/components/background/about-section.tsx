import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ContentIsland } from "@/components/ui/content-island";
import { about, education } from "@/data/background";
import { projects } from "@/data/portfolio";

export function AboutSection() {
  const [background, building, approach] = about.chapters;
  return (
    <section id="about" className="background-section about-section" aria-labelledby="about-heading">
      <Container>
        <header className="workspace-heading about-heading">
          <p className="workspace-path"><span>portfolio</span><span aria-hidden="true">/</span>about.md <span className="workspace-index">{"// 01"}</span></p>
          <h2 id="about-heading">Curiosity,<br /><span>put into practice.</span></h2>
        </header>
        <div className="about-islands">
          <ContentIsland as="article" className="about-editor" aria-labelledby="about-background-heading">
            <div className="editor-tab"><span className="editor-status" aria-hidden="true" />about.md<span className="editor-format">Markdown</span></div>
            <div className="editor-content">
              <div className="editor-block" data-line="01">
                <p className="eyebrow">{background.label}</p>
                <h3 id="about-background-heading">{background.title}</h3>
                <p>{background.body}</p>
              </div>
              <div className="editor-block" data-line="05">
                <p className="eyebrow">{approach.label}</p>
                <h3 id="about-approach-heading">{approach.title}</h3>
                <p>{approach.body}</p>
              </div>
              <p className="editor-note" data-line="09">Check the model. Explain the result.</p>
            </div>
          </ContentIsland>
          <div className="about-support">
            <div className="about-facts">
              <ContentIsland className="about-fact"><p className="eyebrow">William &amp; Mary</p><p className="about-fact-value">2028<span>Class of</span></p><a className="text-link" href="#education">B.S. Data Science <ArrowUpRight size={14} aria-hidden="true" /></a></ContentIsland>
              <ContentIsland className="about-fact"><p className="eyebrow">Cumulative GPA</p><p className="about-fact-value">{education.gpa.split(" / ")[0]}<span>/ 4.00</span></p><p className="about-fact-caption">Learning through practice.</p></ContentIsland>
            </div>
            <ContentIsland as="article" className="about-building" aria-labelledby="about-building-heading">
              <p className="eyebrow">{building.label}</p>
              <h3 id="about-building-heading">{building.title}</h3>
              <p>{building.body}</p>
              <ul className="about-project-links" aria-label="Projects mentioned">{projects.map(project => <li key={project.slug}><Link className="text-link" href={`/projects/${project.slug}/`}>{project.title}<ArrowUpRight size={14} aria-hidden="true" /></Link></li>)}</ul>
            </ContentIsland>
            <a className="text-link about-story-next" href="#projects">See what I’m building <ArrowDown size={16} aria-hidden="true" /></a>
          </div>
        </div>
      </Container>
    </section>
  );
}
