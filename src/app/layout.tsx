import { HoverEffects } from "@/components/interaction/hover-effects";
import { AmbientBackground } from "@/components/motion/ambient-background";
import { SmoothScroll } from "@/components/interaction/smooth-scroll";
import { ScrollbarVisibility } from "@/components/interaction/scrollbar-visibility";
import { CustomCursor } from "@/components/interaction/custom-cursor";
import { pageMetadata, site } from "@/lib/site-metadata";
import { Footer } from "@/components/footer";
import { ScrollReveals } from "@/components/motion/scroll-reveals";
import { Navigation } from "@/components/navigation";
import type { Metadata } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "lenis/dist/lenis.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  ...pageMetadata({ title: site.title, description: site.description, path: "/" }),
  authors: [{ name: "Erik Tran" }],
  creator: "Erik Tran",
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", sizes: "any", type: "image/svg+xml" }, { url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" data-scrollbar-state="idle"><body><AmbientBackground /><HoverEffects /><SmoothScroll /><CustomCursor /><Navigation /><ScrollbarVisibility /><ScrollReveals>{children}</ScrollReveals><Footer /></body></html>;
}
