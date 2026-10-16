import type { MetadataRoute } from "next";
import { projects } from "@/data/portfolio";
import { site } from "@/lib/site-metadata";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${site.url}/` }, ...projects.map((project) => ({ url: `${site.url}/projects/${project.slug}/` }))];
}
