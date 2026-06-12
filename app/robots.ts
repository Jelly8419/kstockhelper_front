import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Locale-prefixed auth pages (/{locale}/login, /{locale}/signup) + APIs.
      disallow: ["/api/", "/*/login", "/*/signup", "/console"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
