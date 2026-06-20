import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";

// Disallowed paths shared across all crawlers: APIs, locale-prefixed auth
// pages (/{locale}/login, /{locale}/signup), and the admin console.
const DISALLOW = ["/api/", "/*/login", "/*/signup", "/console"];

/**
 * Answer-engine / LLM crawlers we explicitly welcome (AEO). Listing them by
 * name — rather than relying on the `*` fallback — makes our consent to being
 * cited in AI answers unambiguous and lets us tune per-bot access later if
 * needed. Each inherits the same disallow list as generic crawlers.
 */
const AI_CRAWLERS = [
  "GPTBot", // OpenAI (ChatGPT training + browsing)
  "OAI-SearchBot", // OpenAI SearchGPT
  "ChatGPT-User", // ChatGPT on-demand fetch
  "PerplexityBot", // Perplexity index
  "Perplexity-User", // Perplexity on-demand fetch
  "ClaudeBot", // Anthropic Claude
  "Claude-User", // Claude on-demand fetch
  "Google-Extended", // Google Gemini / AI Overviews
  "Applebot-Extended", // Apple Intelligence
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
