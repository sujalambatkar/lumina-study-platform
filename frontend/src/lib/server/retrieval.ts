import "server-only";

/** Source markers inserted at extraction time, e.g. ⟦p. 3⟧ or ⟦02:10⟧. */
const MARKER = /⟦([^⟧]+)⟧/g;

export interface Chunk {
  ref: string | null;
  text: string;
}

const STOP = new Set("the and for are but not you all can had her was one our out has have this that with from they been what when where which who how why does about into than then them their there these those will would could should your just also more some such only over very".split(" "));

export function chunkText(text: string, size = 1100): Chunk[] {
  const chunks: Chunk[] = [];
  let ref: string | null = null;
  let buf = "";
  let bufRef: string | null = null;

  const flush = () => {
    const t = buf.replace(/\s+/g, " ").trim();
    if (t.length > 40) chunks.push({ ref: bufRef, text: t });
    buf = "";
    bufRef = ref;
  };

  const pieces = text.split(MARKER);
  for (let i = 0; i < pieces.length; i++) {
    if (i % 2 === 1) { ref = pieces[i]; if (!buf) bufRef = ref; continue; }
    for (const para of pieces[i].split(/\n{2,}|(?<=[.!?])\s+/)) {
      if (!buf) bufRef = ref;
      buf += para + " ";
      if (buf.length >= size) flush();
    }
  }
  flush();
  return chunks;
}

export function topChunks(chunks: Chunk[], query: string, k = 5): Chunk[] {
  if (chunks.length <= k) return chunks;
  const words = query.toLowerCase().match(/[a-z0-9]{3,}/g)?.filter((w) => !STOP.has(w)) ?? [];
  const scored = chunks.map((c, i) => {
    const t = c.text.toLowerCase();
    let score = 0;
    for (const w of words) {
      let at = t.indexOf(w);
      while (at !== -1 && score < 50) { score++; at = t.indexOf(w, at + w.length); }
    }
    return { c, i, score };
  });
  const best = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
  if (best.length >= 2) return best.sort((a, b) => a.i - b.i).map((s) => s.c);
  return spread(chunks, k);
}

/** Evenly spaced chunks, for broad requests like "summarize". */
export function spread(chunks: Chunk[], k: number): Chunk[] {
  if (chunks.length <= k) return chunks;
  return Array.from({ length: k }, (_, j) => chunks[Math.floor((j * chunks.length) / k)]);
}

export function formatExcerpts(chunks: Chunk[]): string {
  return chunks.map((c) => `${c.ref ? `[Source: ${c.ref}]` : "[Excerpt]"}\n${c.text}`).join("\n\n");
}

export function stripMarkers(text: string): string {
  return text.replace(MARKER, " ");
}
