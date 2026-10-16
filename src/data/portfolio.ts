import type { Profile, Project } from "@/types/portfolio";

// Provenance and omissions are documented in docs/content-audit.md.
export const profile = {
  name: "Erik Tran",
  discipline: "Data Science",
  institution: "William & Mary",
  graduationYear: 2028,
  links: [
    { label: "GitHub", href: "https://github.com/etran011" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/erik-tran-tech" },
  ],
} as const satisfies Profile;

export const projects = [
  {
    slug: "optionlab",
    title: "OptionLab",
    summary: "European option pricing, analytical Greeks, implied volatility, and interactive sensitivity analysis.",
    technologies: ["Python", "FastAPI", "Next.js", "TypeScript", "Recharts", "Pytest"],
    screenshots: [],
  },
  {
    slug: "platepredict",
    title: "PlatePredict",
    summary: "Predicting menu item calories from nutritional features with six regression model families.",
    technologies: ["Python", "scikit-learn", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    screenshots: [],
  },
] as const satisfies readonly Project[];
