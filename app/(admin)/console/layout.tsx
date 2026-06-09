import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin — K-Stock Helper",
  robots: { index: false, follow: false },
};

/**
 * Admin console layout. The login page renders without the shell chrome
 * (it returns its own full-screen layout), so AdminShell only wraps the
 * authenticated pages via the `bare` escape inside each page as needed.
 * Here we wrap everything; the login page opts out by rendering plainly.
 */
export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
