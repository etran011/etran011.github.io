import icons from "@/data/technology-icons.json";

const initials: Record<string, string> = {
  SQL: "SQL", Tableau: "Tb", Matplotlib: "Mp", Seaborn: "Sb", "AWS EC2": "EC2", Excel: "XL", Stata: "St",
};

/** Decorative beside a visible skill name; never a substitute for its label. */
export function TechnologyIcon({ name }: { name: string }) {
  const icon = icons[name as keyof typeof icons];
  if (icon) return <svg className="technology-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-technology-icon={icon.slug}><path fill="currentColor" d={icon.path} /></svg>;
  return initials[name] ? <span className="technology-icon technology-initials" aria-hidden="true">{initials[name]}</span> : null;
}
