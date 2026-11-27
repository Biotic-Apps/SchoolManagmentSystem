import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site/links";

/** The public marketing pages (app/(site)). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_ORIGIN, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_ORIGIN}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_ORIGIN}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_ORIGIN}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
