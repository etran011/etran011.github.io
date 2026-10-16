import { ArrowDown } from "lucide-react";
import { HeroHeadline } from "./hero-headline";
import { HeroActions } from "./hero-actions";
import { HeroProject } from "./hero-project";
import { Container } from "@/components/ui/container";
import { profile } from "@/data/portfolio";
import { HeroMotion } from "./hero-motion";

export function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-heading">
      <Container>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-kicker"><span aria-hidden="true" />Hello, I’m</p>
            <h1 id="hero-heading">{profile.name}<span>.</span></h1>
            <p className="hero-role">{profile.institution} <span aria-hidden="true">·</span> {profile.discipline} <span aria-hidden="true">·</span> Class of {profile.graduationYear}</p>
            <HeroHeadline />
            <HeroActions />
          </div>
          <HeroMotion><HeroProject /></HeroMotion>
        </div>
        <div className="hero-baseline">
          <p><span className="eyebrow">Interested in</span><br />Software engineering · AI &amp; machine learning · Financial technology</p>
          <a className="hero-note text-link" href="#about">A little about me <ArrowDown size={16} aria-hidden="true" /></a>
        </div>
      </Container>
    </section>
  );
}
