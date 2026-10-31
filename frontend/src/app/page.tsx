import Link from "next/link";
import { DOCS } from "@/lib/data";

export default function Library() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Your library</h1>
      <p className="mt-2 text-[var(--muted)]">
        Pick a document to chat with it, take a quiz, or explore its key concepts.
      </p>

      <ul className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {DOCS.map((d) => (
          <li key={d.id}>
            <Link href={`/doc/${d.id}`} className="group flex items-center justify-between gap-4 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded border border-[var(--line)] px-1.5 text-xs text-[var(--muted)]">{d.source}</span>
                  <h2 className="font-medium group-hover:underline underline-offset-4">{d.title}</h2>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">{d.blurb}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{d.meta}</p>
              </div>
              <span aria-hidden className="text-xl transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-[var(--muted)]">
        This is a demo with sample documents. Uploads and the live AI are disabled.
      </p>
    </>
  );
}
