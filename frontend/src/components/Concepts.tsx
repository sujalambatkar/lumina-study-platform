"use client";

import { useState } from "react";
import type { Doc } from "@/lib/data";

export default function Concepts({ doc }: { doc: Doc }) {
  const [active, setActive] = useState(doc.concepts[0].name);
  const current = doc.concepts.find((c) => c.name === active)!;

  return (
    <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
      <ul className="flex flex-wrap gap-2 sm:flex-col sm:gap-0 sm:border-l sm:border-[var(--line)]">
        {doc.concepts.map((c) => (
          <li key={c.name}>
            <button onClick={() => setActive(c.name)}
              className={`w-full rounded-full border px-3.5 py-1.5 text-left text-sm sm:-ml-px sm:rounded-none sm:border-0 sm:border-l-2 sm:py-2 ${
                active === c.name ? "border-black font-medium" : "border-[var(--line)] text-[var(--muted)] hover:text-black sm:border-transparent"
              }`}>
              {c.name}
            </button>
          </li>
        ))}
      </ul>

      <div>
        <h2 className="text-xl font-medium">{current.name}</h2>
        <p className="mt-2 text-[15px]">{current.summary}</p>
        {current.related.length > 0 && (
          <>
            <p className="mt-6 text-xs uppercase tracking-wide text-[var(--muted)]">Related</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {current.related.map((r) => (
                <button key={r} onClick={() => setActive(r)}
                  className="rounded-full border border-[var(--line)] px-3 py-1 text-sm hover:border-black">{r}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
