import { ArrowDown } from "lucide-react";
import { HeroHeadline } from "./hero-headline";
import { Container } from "@/components/ui/container";
import { heroTypingBootstrap } from "@/lib/hero-typing";
import { profile } from "@/data/portfolio";

export function Hero() {
  return (
    <section id="home" tabIndex={-1} className="hero" aria-labelledby="hero-heading">
      <script dangerouslySetInnerHTML={{ __html: heroTypingBootstrap }} />
      <Container className="hero-scene">
        <div className="hero-grid hero-identity">
          <div className="hero-copy">
            <h1 id="hero-heading">{profile.name}<span>.</span></h1>
            <p className="hero-role">{profile.institution} <span aria-hidden="true">·</span> {profile.discipline} <span aria-hidden="true">·</span> Class of {profile.graduationYear}</p>
            <div className="hero-narrative">
              <HeroHeadline />
            </div>
          </div>
        </div>
        <a className="hero-scroll-link text-link" href="#about"><span className="eyebrow">Scroll to discover</span><span className="hero-scroll-track" aria-hidden="true" /><ArrowDown size={16} aria-hidden="true" /><span className="sr-only">About Erik</span></a>
      </Container>
    </section>
  );
}
