import { ProjectShowcase } from "@/components/projects/project-showcase";
import { AboutSection } from "@/components/background/about-section";
import { SkillsSection } from "@/components/background/skills-section";
import { EducationSection } from "@/components/background/education-section";
import { ExperienceSection } from "@/components/background/experience-section";
import { Hero } from "@/components/hero/hero";

export default function Home() {
  return <main id="main-content" tabIndex={-1}><Hero /><ProjectShowcase /><ExperienceSection /><EducationSection /><SkillsSection /><AboutSection /></main>;
}
