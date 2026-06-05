import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Gnb() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 sm:px-6">
        {/* Left: logo + wordmark → home */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            K
          </span>
          <span className="text-base font-semibold tracking-tight text-foreground">
            K-Stock Helper
          </span>
        </Link>

        {/* Right: auth actions */}
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">
              Sign Up
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
