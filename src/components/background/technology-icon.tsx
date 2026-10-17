import icons from "@/data/technology-icons.json";
import Image from "next/image";
import { technologyBrand } from "@/data/technology-brands";

/** Decorative beside a visible skill name; never a substitute for its label. */
export function TechnologyIcon({ name }: { name: string }) {
  const { asset, color } = technologyBrand(name);
  if (asset) return <Image className="technology-icon" src={`/images/technologies/${asset}.svg`} width={44} height={44} alt="" aria-hidden="true" data-technology-icon={asset.replace("-original", "")} />;
  const icon = icons[name as keyof typeof icons];
  if (icon) return <svg className="technology-icon" style={{ color }} viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-technology-icon={icon.slug}><path fill="currentColor" d={icon.path} /></svg>;
  return <span className="technology-icon technology-initials" aria-hidden="true">{name}</span>;
}
