import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Gnb } from "@/components/layout/Gnb";
import { Footer } from "@/components/layout/Footer";

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

export const metadata: Metadata = {
  title: "K-Stock Helper",
  description: "Korean stock news, disclosures, and market data for global investors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Gnb />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
