import { Container } from "@/components/ui/container";
import { profile } from "@/data/portfolio";

export default function Home() {
  return (
    <main id="main-content" className="flex min-h-svh items-center py-(--space-section)">
      <Container>
        <p className="mb-8 font-mono text-xs tracking-[0.18em] text-accent uppercase">
          Personal portfolio / In development
        </p>
        <h1 className="text-display font-medium">{profile.name}</h1>
        <p className="mt-6 max-w-xl text-lg text-muted sm:text-xl">
          {profile.discipline} at {profile.institution}<br />
          Class of {profile.graduationYear}
        </p>
        <div className="mt-12 flex flex-wrap gap-8 border-t border-border pt-6">
          {profile.links.map((link) => (
            <a key={link.label} href={link.href} className="text-sm underline decoration-border transition-colors duration-150 hover:text-accent">
              {link.label}
            </a>
          ))}
        </div>
      </Container>
    </main>
  );
}
