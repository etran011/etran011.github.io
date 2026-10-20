export interface Profile {
  name: string;
  discipline: string;
  institution: string;
  graduationYear: number;
  email: string;
  links: ReadonlyArray<{ label: string; href: `https://${string}` }>;
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  category: string;
  period: string;
  featured: boolean;
  highlights: readonly string[];
  caseStudy: {
    overview: string;
    problem: string;
    approach: string;
    architecture: readonly string[];
    challenges: readonly { title: string; description: string }[];
    outcome: string;
  };
  technologies: readonly string[];
  screenshots: ReadonlyArray<{ src: `/${string}`; alt: string; width: number; height: number; caption: string; previewSrcSet?: string }>;
  repositoryUrl?: `https://${string}`;
  demoUrl?: `https://${string}`;
}
