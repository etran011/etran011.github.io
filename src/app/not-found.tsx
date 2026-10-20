import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="case-study">
      <Container>
        <header className="case-header">
          <p className="eyebrow">404 / Page not found</p>
          <h1>This page isn’t here.</h1>
          <p className="case-summary">The link may be outdated, or the address may be incorrect.</p>
          <Link className="button" href="/">Return to portfolio</Link>
        </header>
      </Container>
    </main>
  );
}
