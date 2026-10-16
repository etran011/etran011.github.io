import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ScreenshotGallery } from "@/components/projects/screenshot-gallery";
import { projects } from "@/data/portfolio";
import type { Project } from "@/types/portfolio";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return pageMetadata({ title: `${project.title} | Erik Tran`, description: project.summary, path: `/projects/${project.slug}/` });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project: Project | undefined = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const nextProject = projects[(projects.findIndex((item) => item.slug === slug) + 1) % projects.length];
  const study = project.caseStudy;

  return (
    <main id="main-content" tabIndex={-1} className="case-study">
      <Container>
        <Link className="case-back text-link" href="/#projects"><ArrowLeft size={16} aria-hidden="true" /> All projects</Link>
        <header className="case-header">
          <p className="eyebrow">{project.category} / Case study</p>
          <h1>{project.title}</h1>
          <p className="case-summary">{project.summary}</p>
          <div className="case-meta"><p>{project.period}</p><ul className="technology-list" aria-label="Technologies">{project.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul></div>
          {(project.repositoryUrl || project.demoUrl) && <div className="hero-buttons">
            {project.repositoryUrl && <a className="button" href={project.repositoryUrl}>Source code <ArrowUpRight size={16} /></a>}
            {project.demoUrl && <a className="button" href={project.demoUrl}>Live demo <ArrowUpRight size={16} /></a>}
          </div>}
        </header>
        {project.screenshots.length > 0 && <div className="case-gallery surface-panel"><ScreenshotGallery screenshots={project.screenshots} title={project.title} /></div>}
        <div className="case-body">
          <aside className="case-sidebar"><nav aria-label="Case study sections">
            <p className="eyebrow">In this project</p>
            <a href="#overview">Overview</a><a href="#problem">The problem</a><a href="#approach">Technical approach</a><a href="#engineering">Engineering notes</a><a href="#outcome">Outcome &amp; takeaways</a>
          </nav></aside>
          <div className="case-content">
            <section id="overview"><p className="eyebrow">01 / Context</p><h2>Overview</h2><p>{study.overview}</p></section>
            <section id="problem"><p className="eyebrow">02 / Motivation</p><h2>The problem</h2><p>{study.problem}</p></section>
            <section id="approach"><p className="eyebrow">03 / Implementation</p><h2>Technical approach</h2><p>{study.approach}</p>
              <ol className="architecture-list">{study.architecture.map((step, index) => <li key={step}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
              <h3>Key capabilities</h3><ul className="project-highlights">{project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
            </section>
            <section id="engineering"><p className="eyebrow">04 / Decisions &amp; challenges</p><h2>Engineering notes</h2>
              <div className="engineering-notes">{study.challenges.map((challenge) => <div key={challenge.title}><h3>{challenge.title}</h3><p>{challenge.description}</p></div>)}</div>
            </section>
            <section id="outcome"><p className="eyebrow">05 / Reflection</p><h2>Outcome &amp; takeaways</h2><p>{study.outcome}</p></section>
          </div>
        </div>
        {nextProject.slug !== project.slug && <Link className="next-project" href={`/projects/${nextProject.slug}/`}><div><span className="eyebrow">Next project</span><p>{nextProject.title}</p></div><ArrowUpRight size={28} aria-hidden="true" /></Link>}
      </Container>
    </main>
  );
}
