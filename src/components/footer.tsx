import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Container } from "@/components/ui/container";
import { profile } from "@/data/portfolio";

export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-top">
          <div><p className="footer-name">{profile.name}<span aria-hidden="true">.</span></p><p className="footer-description">Data, software, and thoughtful experiences.</p></div>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/#contact">Contact</Link>
            {profile.links.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {profile.name}</p>
          <a className="footer-top-link" href="#main-content">Back to top <ArrowUp size={16} aria-hidden="true" /></a>
        </div>
      </Container>
    </footer>
  );
}
