import { Container } from "@/components/ui/container";
import { profile } from "@/data/portfolio";
import { HeroMotion } from "./hero-motion";
import { SignalGraphic } from "./signal-graphic";

export function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-heading">
      <Container>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-kicker"><span aria-hidden="true" />{profile.name} / Data &amp; software</p>
            <h1 id="hero-heading">Turning data<br />into <span>useful</span><br />experiences.</h1>
            <p className="hero-description">I’m Erik, a Data Science student at William &amp; Mary. I build at the intersection of software, machine learning, and thoughtful design.</p>
          </div>
          <HeroMotion><SignalGraphic /></HeroMotion>
        </div>
        <div className="hero-baseline">
          <p><span className="eyebrow">Currently</span><br />{profile.discipline} · {profile.institution}</p>
          <p><span className="eyebrow">Looking ahead</span><br />Class of {profile.graduationYear}</p>
          <span className="eyebrow hero-note">Curiosity, made practical.</span>
        </div>
      </Container>
    </section>
  );
}
