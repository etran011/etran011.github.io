import type { Metadata } from "next";

export const site = {
  url: "https://etran011.github.io",
  title: "Erik Tran | Data Science & Software Engineering",
  description: "Erik Tran’s portfolio: data science, machine learning, and software projects. Data Science student at William & Mary, Class of 2028.",
};

export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const image = { url: "/social-card.png", width: 1200, height: 630, alt: "Erik Tran — turning data into useful experiences. Data science and software engineering." };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: "Erik Tran", locale: "en_US", title, description, url: path, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [{ url: image.url, alt: image.alt }] },
  };
}
