import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { about } from "@/data/background";
import { projects } from "@/data/portfolio";

export function AboutSection() {
  return (
    <section id="about" className="background-section about-section" aria-labelledby="about-heading">

        <Container>
          <div className="about-layout">
            <div className="about-intro">
              <p className="eyebrow">About me / 01</p>
              <h2 id="about-heading"><span>Curiosity,</span><span>put into</span><span>practice.</span></h2>
              <ol className="about-chapters" aria-hidden="true">
                {about.chapters.map((chapter, index) => <li key={chapter.id}><span className="about-journey-number">{String(index + 1).padStart(2, "0")}</span><div><strong>{chapter.word}</strong><small>{chapter.label}</small></div></li>)}
              </ol>
              <a className="text-link about-story-next" href="#projects">See what I’m building <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
            <div className="about-copy">
              {about.chapters.map((chapter, index) => (
                <article className="about-chapter" key={chapter.id} data-about-chapter={index} aria-labelledby={`about-${chapter.id}-heading`}>
                  <span className="about-chapter-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <p className="eyebrow">{chapter.label}</p>
                  <h3 id={`about-${chapter.id}-heading`}>{chapter.title}</h3>
                  <p className="about-chapter-body">{chapter.body}</p>
                  {chapter.id === "background" && <a className="about-evidence text-link" href="#education">William &amp; Mary · Class of 2028 <ArrowUpRight size={14} aria-hidden="true" /></a>}
                  {chapter.id === "building" && <ul className="about-project-links" aria-label="Projects mentioned">{projects.map((project) => <li key={project.slug}><Link className="text-link" href={`/projects/${project.slug}/`}>{project.title} <ArrowUpRight size={14} aria-hidden="true" /></Link></li>)}</ul>}
                  {chapter.id === "approach" && <p className="about-evidence">Check the model. Explain the result.</p>}
                </article>
              ))}
            </div>
          </div>
        </Container>

    </section>
  );
}
