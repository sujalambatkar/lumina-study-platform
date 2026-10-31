import Link from "next/link";
import { DOCS } from "@/lib/data";

export default function Progress() {
  const avg = Math.round(DOCS.reduce((s, d) => s + d.mastery, 0) / DOCS.length);
  const label = (m: number) => (m >= 75 ? "Strong" : m >= 50 ? "Getting there" : "Needs review");

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Progress</h1>
      <p className="mt-2 text-[var(--muted)]">How well you know each document, based on quiz results.</p>

      <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--line)] text-center">
        {[
          [`${avg}%`, "Overall"],
          [String(DOCS.length), "Documents"],
          [String(DOCS.reduce((s, d) => s + d.quizzes, 0)), "Quizzes taken"],
        ].map(([v, l]) => (
          <div key={l} className="bg-white py-5">
            <div className="text-2xl font-semibold">{v}</div>
            <div className="text-xs text-[var(--muted)]">{l}</div>
          </div>
        ))}
      </div>

      <ul className="mt-8 space-y-6">
        {DOCS.map((d) => (
          <li key={d.id}>
            <div className="flex items-baseline justify-between gap-4">
              <Link href={`/doc/${d.id}`} className="font-medium hover:underline underline-offset-4">{d.title}</Link>
              <span className="text-sm text-[var(--muted)]">{label(d.mastery)} · {d.mastery}%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-[var(--soft)]">
              <div className="h-full rounded-full bg-black" style={{ width: `${d.mastery}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
