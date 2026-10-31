"use client";

import { useEffect, useRef, useState } from "react";
import type { Doc } from "@/lib/data";

interface Msg { role: "user" | "ai"; text: string }

function answerFor(doc: Doc, input: string) {
  const s = input.toLowerCase();
  const hit = doc.qa.find((x) => x.keywords.some((k) => s.includes(k)));
  return hit ? hit.a : doc.fallback;
}

export default function Chat({ doc }: { doc: Doc }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [msgs]);

  function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    const full = answerFor(doc, q);
    setInput("");
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", text: q }, { role: "ai", text: "" }]);

    let i = 0;
    timer.current = setInterval(() => {
      i += 3;
      setMsgs((m) => [...m.slice(0, -1), { role: "ai", text: full.slice(0, i) }]);
      if (i >= full.length) {
        clearInterval(timer.current!);
        setBusy(false);
      }
    }, 20);
  }

  return (
    <div>
      {msgs.length === 0 ? (
        <div>
          <p className="text-[var(--muted)]">Ask anything about this document, or start with one of these:</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {doc.qa.map((x) => (
              <button key={x.q} onClick={() => ask(x.q)}
                className="rounded-full border border-[var(--line)] px-3.5 py-1.5 text-sm hover:border-black">
                {x.q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl bg-black px-4 py-2 text-sm text-white">{m.text}</p>
              </div>
            ) : (
              <p key={i} className={`max-w-[90%] text-[15px] ${busy && i === msgs.length - 1 ? "caret" : ""}`}>{m.text}</p>
            )
          )}
          <div ref={end} />
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); ask(input); }}
        className="mt-8 flex gap-2 border-t border-[var(--line)] pt-5">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question…"
          className="min-w-0 flex-1 rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm" />
        <button disabled={busy || !input.trim()}
          className="rounded-lg bg-black px-5 text-sm text-white disabled:opacity-30">Send</button>
      </form>
      <p className="mt-3 text-xs text-[var(--muted)]">Demo: answers are pre-written samples, not live AI.</p>
    </div>
  );
}
