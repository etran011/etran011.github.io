import icons from "@/data/technology-icons.json";
import Image from "next/image";

const localLogos: Record<string, string> = {
  Matplotlib: "matplotlib", "AWS EC2": "aws", Stata: "stata",
};

/** Decorative beside a visible skill name; never a substitute for its label. */
export function TechnologyIcon({ name }: { name: string }) {
  const icon = icons[name as keyof typeof icons];
  if (icon) return <svg className="technology-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-technology-icon={icon.slug}><path fill="currentColor" d={icon.path} /></svg>;
  const logo = localLogos[name];
  if (logo) return <span className="technology-icon technology-logo" aria-hidden="true" data-technology-icon={logo} style={{ maskImage: `url(/images/technologies/${logo}.svg)` }} />;
  if (name === "Seaborn") return <Image className="technology-icon" src="/images/technologies/seaborn.svg" width={44} height={44} alt="" aria-hidden="true" data-technology-icon="seaborn" />;
  return <span className="technology-icon technology-initials" aria-hidden="true">{name}</span>;
}
