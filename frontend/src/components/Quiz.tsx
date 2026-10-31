"use client";

import { useState } from "react";
import type { Doc } from "@/lib/data";

export default function Quiz({ doc }: { doc: Doc }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const total = doc.quiz.length;

  function restart() { setI(0); setPicked(null); setScore(0); }

  if (i >= total) {
    return (
      <div className="py-10 text-center">
        <div className="text-6xl font-semibold tracking-tight">{score}/{total}</div>
        <p className="mt-2 text-[var(--muted)]">
          {score === total ? "Perfect score." : score >= total / 2 ? "Nice work." : "Worth another look at the material."}
        </p>
        <button onClick={restart} className="mt-6 rounded-lg bg-black px-5 py-2.5 text-sm text-white">Try again</button>
      </div>
    );
  }

  const q = doc.quiz[i];
  const done = picked !== null;

  return (
    <div>
      <p className="text-xs text-[var(--muted)]">Question {i + 1} of {total}</p>
      <h2 className="mt-1 text-xl font-medium">{q.q}</h2>

      <div className="mt-5 space-y-2">
        {q.options.map((o, idx) => {
          const state = !done ? "" : idx === q.answer ? "border-black bg-black text-white"
            : idx === picked ? "border-black line-through opacity-60" : "opacity-40";
          return (
            <button key={o} disabled={done}
              onClick={() => { setPicked(idx); if (idx === q.answer) setScore((s) => s + 1); }}
              className={`block w-full rounded-lg border border-[var(--line)] px-4 py-3 text-left text-sm ${done ? state : "hover:border-black"}`}>
              {o}
            </button>
          );
        })}
      </div>

      {done && (
        <div className="mt-5">
          <p className="rounded-lg bg-[var(--soft)] px-4 py-3 text-sm">
            <span className="font-medium">{picked === q.answer ? "Correct. " : "Not quite. "}</span>{q.why}
          </p>
          <button onClick={() => { setI(i + 1); setPicked(null); }}
            className="mt-4 rounded-lg bg-black px-5 py-2.5 text-sm text-white">
            {i + 1 === total ? "See result" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
