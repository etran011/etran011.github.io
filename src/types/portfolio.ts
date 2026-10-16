export interface Profile {
  name: string;
  discipline: string;
  institution: string;
  graduationYear: number;
  links: ReadonlyArray<{ label: string; href: `https://${string}` }>;
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  technologies: readonly string[];
  screenshots: ReadonlyArray<{ src: `/${string}`; alt: string; width: number; height: number }>;
  repositoryUrl?: `https://${string}`;
  demoUrl?: `https://${string}`;
}
