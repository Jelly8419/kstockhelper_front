import type { Metadata } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Gnb } from "@/components/layout/Gnb";
import { Footer } from "@/components/layout/Footer";
import { ADMIN_BASE_PATH, PATHNAME_HEADER } from "@/lib/admin/constants";
import { SITE_URL, SITE_NAME } from "@/lib/constants/site";
import { getServerLocale } from "@/lib/i18n/getServerLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { translate } from "@/lib/i18n/translate";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

/**
 * Locale-aware SEO metadata (PRD §5.1 SEO, §10.4). Title/description come from
 * the active locale's `seo.*` keys, falling back to `en`. hreflang alternates
 * are deferred to a later iteration (MVP excludes them).
 */
export function generateMetadata(): Metadata {
  const locale = getServerLocale();
  const dict = getDictionary(locale);
  const title = translate(dict, "seo.title");
  const description = translate(dict, "seo.description");

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: SITE_NAME,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
        { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: SITE_URL,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Admin console renders its own chrome — skip the public Gnb/Footer there.
  const pathname = headers().get(PATHNAME_HEADER) ?? "";
  const isAdmin = pathname.startsWith(ADMIN_BASE_PATH);

  // Active UI locale (resolved by middleware, forwarded via x-locale). The
  // dictionary is passed into the client provider so client components share
  // the same translations without re-fetching. `ur` ships LTR-only in the MVP.
  const locale = getServerLocale();
  const dictionary = getDictionary(locale);

  return (
    <html lang={locale} className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <I18nProvider locale={locale} dictionary={dictionary}>
          {isAdmin ? (
            children
          ) : (
            <>
              <Gnb />
              <main className="flex-1">{children}</main>
              <Footer />
            </>
          )}
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
