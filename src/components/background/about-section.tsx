import { ScrollStory } from "@/components/interaction/scroll-story";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { about } from "@/data/background";

export function AboutSection() {
  return (
    <section id="about" className="background-section about-section" aria-labelledby="about-heading">
      <ScrollStory kind="about" steps={3}><Container>
        <div className="about-layout">
          <div className="about-intro">
            <p className="eyebrow">About me / 01</p>
            <h2 id="about-heading">Curious about data.<br /><span>Careful about the experience.</span></h2>
            <ol className="about-chapters" aria-hidden="true"><li><span>01</span> Background &amp; studies</li><li><span>02</span> What I build</li><li><span>03</span> What motivates me</li></ol>
            <a className="text-link about-story-next" href="#projects">See my projects <ArrowDown size={16} aria-hidden="true" /></a>
          </div>
          <div className="about-copy">
            {about.paragraphs.map((paragraph, index) => <p key={paragraph} data-story-paragraph={index}>{paragraph}</p>)}
            <div className="about-interests"><h3 className="eyebrow">Areas of interest</h3><ul>{about.interests.map((interest) => <li key={interest}>{interest}</li>)}</ul></div>
            <a className="text-link about-education-link" href="#education">Education &amp; coursework <ArrowUpRight size={15} aria-hidden="true" /></a>
          </div>
        </div>
      </Container></ScrollStory>
    </section>
  );
}
