import { ArrowUpRight, Download, Mail } from "lucide-react";
import { profile } from "@/data/portfolio";

export function HeroActions() {
  return (
    <div className="hero-actions">
      <div className="hero-buttons">
        <a className="button button-primary" href="#projects">Explore my work <ArrowUpRight size={17} aria-hidden="true" /></a>
        <a className="button" href={`mailto:${profile.email}`}>Get in touch <Mail size={16} aria-hidden="true" /></a>
      </div>
      <div className="hero-socials">
        <a className="text-link" href={profile.links[1].href}>LinkedIn <ArrowUpRight size={14} aria-hidden="true" /></a>
        <span aria-hidden="true" className="social-divider" />
        <a className="text-link" href={profile.resumePath} download>Download résumé <Download size={14} aria-hidden="true" /><span className="sr-only"> (PDF)</span></a>
      </div>
    </div>
  );
}
