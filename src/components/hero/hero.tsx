import { ScrollStory } from "@/components/interaction/scroll-story";
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
      <ScrollStory kind="hero" steps={4}><Container>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-kicker"><span aria-hidden="true" />Hello, I’m</p>
            <h1 id="hero-heading">{profile.name}<span>.</span></h1>
            <p className="hero-role">{profile.institution} <span aria-hidden="true">·</span> {profile.discipline} <span aria-hidden="true">·</span> Class of {profile.graduationYear}</p>
            <div className="hero-narrative">
              <div className="hero-narrative-original"><HeroHeadline /></div>
              <p className="hero-story-phrase hero-story-software" aria-hidden="true">Building software.</p>
              <p className="hero-story-phrase hero-story-intelligence" aria-hidden="true">Exploring AI &amp;<br />machine learning.</p>
              <p className="hero-story-phrase hero-story-finance" aria-hidden="true">Applying data<br />to finance.</p>
            </div>
            <HeroActions />
          </div>
          <HeroMotion><HeroProject /></HeroMotion>
        </div>
        <div className="hero-baseline">
          <p><span className="eyebrow">Interested in</span><br />Software engineering · AI &amp; machine learning · Financial technology</p>
          <a className="hero-note text-link" href="#about">A little about me <ArrowDown size={16} aria-hidden="true" /></a>
        </div>
      </Container></ScrollStory>
    </section>
  );
}
