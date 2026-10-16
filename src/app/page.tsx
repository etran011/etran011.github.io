import { ProjectShowcase } from "@/components/projects/project-showcase";
import { ExperienceSection } from "@/components/background/experience-section";
import { Hero } from "@/components/hero/hero";

export default function Home() {
  return <main id="main-content" tabIndex={-1}><Hero /><ProjectShowcase /><ExperienceSection /></main>;
}
