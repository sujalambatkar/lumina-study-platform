"use client";

import { useState } from "react";
import type { Doc } from "@/lib/data";
import Chat from "./Chat";
import Quiz from "./Quiz";
import Concepts from "./Concepts";

const TABS = ["Chat", "Quiz", "Concepts"] as const;

export default function DocTabs({ doc }: { doc: Doc }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Chat");

  return (
    <div className="mt-8">
      <div role="tablist" className="flex gap-1 border-b border-[var(--line)]">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${
              tab === t ? "border-black font-medium" : "border-transparent text-[var(--muted)] hover:text-black"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="pt-6">
        {tab === "Chat" && <Chat doc={doc} />}
        {tab === "Quiz" && <Quiz doc={doc} />}
        {tab === "Concepts" && <Concepts doc={doc} />}
      </div>
    </div>
  );
}
