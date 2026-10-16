import { ArrowUpRight, Mail } from "lucide-react";
import { profile } from "@/data/portfolio";

export function HeroActions() {
  return (
    <div className="hero-actions">
      <div className="hero-buttons">
        <a className="button button-primary" href="#projects">Explore my work <ArrowUpRight size={17} aria-hidden="true" /></a>
        <a className="button" href="#contact">Get in touch <Mail size={16} aria-hidden="true" /></a>
      </div>
      <div className="hero-socials">
        {profile.links.map((link) => <a key={link.label} className="text-link" href={link.href}>{link.label} <ArrowUpRight size={14} aria-hidden="true" /></a>)}
      </div>
    </div>
  );
}
