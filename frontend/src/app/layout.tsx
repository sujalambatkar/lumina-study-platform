import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina",
  description: "Study smarter from your own material. Demo with sample data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-[var(--line)]">
          <nav className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
            <Link href="/" className="text-lg font-semibold tracking-tight">Lumina</Link>
            <div className="flex items-center gap-5 text-sm">
              <Link href="/" className="hover:underline underline-offset-4">Library</Link>
              <Link href="/progress" className="hover:underline underline-offset-4">Progress</Link>
              <span className="hidden rounded-full border border-[var(--line)] px-2.5 py-0.5 text-xs text-[var(--muted)] sm:inline">Demo</span>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-5 py-10">{children}</main>
      </body>
    </html>
  );
}
