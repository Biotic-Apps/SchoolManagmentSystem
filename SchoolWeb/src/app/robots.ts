import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site/links";

/** Crawlers may read the public marketing pages; the portal and auth screens are not for indexing. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/contact", "/privacy-policy", "/terms"],
      disallow: ["/api/", "/login", "/forgot-password", "/reset-password", "/admissions/"],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
