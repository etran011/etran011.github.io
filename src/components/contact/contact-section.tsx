import { ArrowUpRight, Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ContentIsland } from "@/components/ui/content-island";
import { profile } from "@/data/portfolio";

export function ContactSection() {
  return (
    <section id="contact" tabIndex={-1} className="contact-section" aria-labelledby="contact-heading">
      <Container>
        <div className="contact-layout">
          <ContentIsland className="contact-intro">
            <p className="eyebrow">Contact / 06</p>
            <h2 id="contact-heading">Let’s build<br /><span>something useful.</span></h2>
            <p>Have a project, a question, or an opportunity in data science or software engineering? I’d like to hear from you.</p>
            <a className="contact-email" href={`mailto:${profile.email}`}><Mail size={22} aria-hidden="true" /><span>{profile.email}</span><ArrowUpRight size={22} aria-hidden="true" /></a>
          </ContentIsland>
          <ContentIsland className="contact-resources">
            <p className="eyebrow">Find me online</p>
            {profile.links.map((link) => <a key={link.label} className="contact-resource" href={link.href}><span><strong>{link.label}</strong><span>{link.label === "GitHub" ? "Code & projects" : "Professional profile"}</span></span><ArrowUpRight size={20} aria-hidden="true" /></a>)}
          </ContentIsland>
        </div>
      </Container>
    </section>
  );
}
