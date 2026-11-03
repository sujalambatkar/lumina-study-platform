import type {
  Document,
  DocumentStatusResponse,
  URLIngestionRequest,
  QuizGenerateResponse,
  QuizSubmitRequest,
  QuizSubmitResponse,
  ConceptMapResponse,
  TopicMastery,
  TrackerSummary,
  MasteryStatus,
} from "@/types";
import { SEED_DOCS, hashString, type SeedDoc } from "./mockData";

/**
 * Demo API. Everything runs in the browser against built-in sample data.
 * Uploaded documents and quiz results are kept in localStorage.
 */

const PROCESS_MS = 4000;
const DAY = 86_400_000;
const KEY_DOCS = "lumina_demo_docs";
const KEY_REMOVED = "lumina_demo_removed";
const KEY_SCORES = "lumina_demo_scores";
const KEY_TEXT = "lumina_demo_text_";
const KEY_MAP = "lumina_demo_map_";

interface Extracted {
  title: string;
  text: string;
  chunk_count: number;
  topics: string[];
}

interface StoredDoc {
  id: string;
  title: string;
  source_type: Document["source_type"];
  source_url: string | null;
  created: number;
  seed?: string; // legacy: id of a sample doc whose content an old fake upload borrowed
  live?: boolean; // real upload: text is stored under KEY_TEXT and AI routes are used
  chunk_count?: number;
  topics?: string[];
}

type ScoreMap = Record<string, Record<string, { total: number; attempts: number; last: string }>>;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: demo still works for this session */
  }
}

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const now = () => Date.now();

function seedToDocument(s: SeedDoc, base: number): Document {
  const created = new Date(base - s.daysAgo * DAY).toISOString();
  return {
    id: s.id,
    title: s.title,
    source_type: s.source_type,
    source_url: s.source_url,
    status: "ready",
    progress: 100,
    chunk_count: s.chunk_count,
    error_message: null,
    created_at: created,
    updated_at: created,
  };
}

function storedToDocument(d: StoredDoc): Document {
  const progress = d.live ? 100 : Math.min(100, Math.round(((now() - d.created) / PROCESS_MS) * 100));
  const iso = new Date(d.created).toISOString();
  return {
    id: d.id,
    title: d.title,
    source_type: d.source_type,
    source_url: d.source_url,
    status: progress >= 100 ? "ready" : "processing",
    progress,
    chunk_count: progress >= 100 ? (d.chunk_count ?? 20 + (hashString(d.title) % 40)) : 0,
    error_message: null,
    created_at: iso,
    updated_at: iso,
  };
}

function allDocuments(): Document[] {
  const removed = new Set(load<string[]>(KEY_REMOVED, []));
  const base = now();
  const seeds = SEED_DOCS.filter((s) => !removed.has(s.id)).map((s) => seedToDocument(s, base));
  const mine = load<StoredDoc[]>(KEY_DOCS, []).map(storedToDocument);
  return [...mine, ...seeds].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** Resolve the sample content behind any document id. */
function contentFor(id: string): SeedDoc {
  const seed = SEED_DOCS.find((s) => s.id === id);
  if (seed) return seed;
  const mine = load<StoredDoc[]>(KEY_DOCS, []).find((d) => d.id === id);
  return SEED_DOCS.find((s) => s.id === mine?.seed) ?? SEED_DOCS[0];
}

function liveDoc(id: string): StoredDoc | undefined {
  return load<StoredDoc[]>(KEY_DOCS, []).find((d) => d.id === id && d.live);
}

async function post<T>(path: string, body: BodyInit | Record<string, unknown>): Promise<T> {
  const isForm = body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: isForm ? undefined : { "Content-Type": "application/json" },
      body: isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
  return data as T;
}

function statusFor(avg: number | null): MasteryStatus {
  if (avg === null) return "not_explored";
  return avg >= 75 ? "strong" : avg < 60 ? "needs_review" : "not_explored";
}

class ApiClient {
  async uploadDocument(file: File): Promise<Document> {
    const form = new FormData();
    form.append("file", file);
    return this.addLive(await post<Extracted>("/api/extract", form), "pdf", null);
  }

  async ingestUrl(payload: URLIngestionRequest): Promise<Document> {
    const form = new FormData();
    form.append("url", payload.url);
    form.append("type", payload.type);
    const out = await post<Extracted>("/api/extract", form);
    if (payload.title?.trim()) out.title = payload.title.trim();
    return this.addLive(out, payload.type === "youtube" ? "youtube" : "web", payload.url);
  }

  private addLive(out: Extracted, type: Document["source_type"], url: string | null): Document {
    const entry: StoredDoc = {
      id: `up-${now().toString(36)}`,
      title: out.title,
      source_type: type,
      source_url: url,
      created: now(),
      live: true,
      chunk_count: out.chunk_count,
      topics: out.topics,
    };
    try {
      localStorage.setItem(KEY_TEXT + entry.id, out.text);
    } catch {
      throw new Error("This document is too large for your browser's storage. Try a smaller file.");
    }
    save(KEY_DOCS, [entry, ...load<StoredDoc[]>(KEY_DOCS, [])]);
    return storedToDocument(entry);
  }

  /** Full text of a real (uploaded) document, or null for the built-in samples. */
  getLiveText(id: string): string | null {
    if (!liveDoc(id)) return null;
    try { return localStorage.getItem(KEY_TEXT + id); } catch { return null; }
  }

  getTitle(id: string): string {
    return allDocuments().find((d) => d.id === id)?.title ?? "Untitled";
  }

  async listDocuments(): Promise<Document[]> {
    await wait(150);
    return allDocuments();
  }

  async getDocument(id: string): Promise<Document> {
    const doc = allDocuments().find((d) => d.id === id);
    if (!doc) throw new Error("Document not found");
    return doc;
  }

  async getDocumentStatus(id: string): Promise<DocumentStatusResponse> {
    const d = await this.getDocument(id);
    return { status: d.status, progress: d.progress, chunk_count: d.chunk_count, error_message: null };
  }

  async deleteDocument(id: string): Promise<void> {
    await wait(150);
    if (SEED_DOCS.some((s) => s.id === id)) {
      save(KEY_REMOVED, [...load<string[]>(KEY_REMOVED, []), id]);
    } else {
      save(KEY_DOCS, load<StoredDoc[]>(KEY_DOCS, []).filter((d) => d.id !== id));
      try { localStorage.removeItem(KEY_TEXT + id); localStorage.removeItem(KEY_MAP + id); } catch { /* ignore */ }
    }
  }

  async generateQuiz(document_id: string, topic: string, count = 5): Promise<QuizGenerateResponse> {
    const text = this.getLiveText(document_id);
    if (text) {
      const r = await post<{ questions: QuizGenerateResponse["questions"] }>("/api/quiz", { text, topic, count });
      return { document_id, topic, questions: r.questions };
    }
    await wait(900);
    const bank = contentFor(document_id).quiz;
    const questions = Array.from({ length: Math.min(count, bank.length) }, (_, i) => {
      const q = bank[i];
      return { question: q.question, options: [...q.options], correct: q.correct, explanation: q.explanation };
    });
    return { document_id, topic, questions };
  }

  async submitQuiz(p: QuizSubmitRequest): Promise<QuizSubmitResponse> {
    const percentage = Math.round((p.score / p.total) * 100);
    const scores = load<ScoreMap>(KEY_SCORES, {});
    const key = p.topic.trim().toLowerCase();
    const prev = scores[p.document_id]?.[key];
    scores[p.document_id] = {
      ...scores[p.document_id],
      [key]: {
        total: (prev?.total ?? 0) + percentage,
        attempts: (prev?.attempts ?? 0) + 1,
        last: new Date().toISOString(),
      },
    };
    save(KEY_SCORES, scores);
    return { message: "Result saved", percentage };
  }

  async generateConceptMap(document_id: string): Promise<ConceptMapResponse> {
    const text = this.getLiveText(document_id);
    if (text) {
      try {
        const cached = localStorage.getItem(KEY_MAP + document_id);
        if (cached) return JSON.parse(cached) as ConceptMapResponse;
      } catch { /* regenerate */ }
      const r = await post<Pick<ConceptMapResponse, "nodes" | "edges">>("/api/concepts", { text });
      const map: ConceptMapResponse = { document_id, ...r };
      try { localStorage.setItem(KEY_MAP + document_id, JSON.stringify(map)); } catch { /* ignore */ }
      return map;
    }
    await wait(1100);
    const c = contentFor(document_id);
    return { document_id, nodes: c.nodes, edges: c.edges };
  }

  async getDocumentTracker(document_id: string): Promise<TopicMastery[]> {
    const doc = await this.getDocument(document_id);
    const c = contentFor(document_id);
    const live = liveDoc(document_id);
    const isSeed = c.id === document_id;
    const stored = load<ScoreMap>(KEY_SCORES, {})[document_id] ?? {};
    const lastSeed = new Date(now() - 1 * DAY).toISOString();

    const rows = new Map<string, { total: number; attempts: number; last: string | null; label: string }>();
    if (isSeed) {
      for (const t of c.topics) {
        rows.set(t.topic.toLowerCase(), {
          total: (t.score ?? 0) * t.attempts, attempts: t.attempts,
          last: t.attempts ? lastSeed : null, label: t.topic,
        });
      }
    } else {
      const labels = live ? (live.topics ?? []) : c.nodes.slice(0, 3).map((n) => n.label);
      for (const label of labels) {
        rows.set(label.toLowerCase(), { total: 0, attempts: 0, last: null, label });
      }
    }
    for (const [key, s] of Object.entries(stored)) {
      const row = rows.get(key);
      rows.set(key, {
        total: (row?.total ?? 0) + s.total,
        attempts: (row?.attempts ?? 0) + s.attempts,
        last: s.last,
        label: row?.label ?? key.replace(/^\w/, (m) => m.toUpperCase()),
      });
    }

    return [...rows.values()].map((r) => {
      const avg = r.attempts ? Math.round(r.total / r.attempts) : null;
      return {
        topic: r.label,
        document_id,
        document_title: doc.title,
        avg_score: avg,
        attempt_count: r.attempts,
        last_attempt: r.last,
        status: statusFor(avg),
      };
    });
  }

  async getTrackerSummary(): Promise<TrackerSummary> {
    const docs = allDocuments().filter((d) => d.status === "ready");
    const topics = (await Promise.all(docs.map((d) => this.getDocumentTracker(d.id)))).flat();
    const scored = topics.filter((t) => t.avg_score !== null);
    return {
      total_topics: topics.length,
      overall_mastery: scored.length ? Math.round(scored.reduce((s, t) => s + (t.avg_score ?? 0), 0) / scored.length) : 0,
      needs_review_count: topics.filter((t) => t.status === "needs_review").length,
      strong_count: topics.filter((t) => t.status === "strong").length,
      not_explored_count: topics.filter((t) => t.status === "not_explored").length,
    };
  }

  /** URL consumed by useStreamingChat; carries the request, never fetched. */
  getChatStreamUrl(document_id: string, message: string): string {
    return `http://demo.local/chat?document_id=${encodeURIComponent(document_id)}&message=${encodeURIComponent(message)}`;
  }

  /**
   * Pre-written answer for a chat message. Only answers from the document's
   * own content; anything else gets a polite refusal (guardrail).
   */
  chatAnswer(document_id: string, message: string): string {
    const c = contentFor(document_id);
    const m = message.toLowerCase();
    const topics = c.nodes.slice(0, 4).map((n) => `**${n.label}**`).join(", ");

    // 1. Prompt-injection / role-override attempts
    if (/(ignore|forget|disregard|override|bypass)\b.*\b(instruction|rule|prompt|guideline|previous|above|system)|system prompt|jailbreak|pretend (to be|you)|you are now|act as|developer mode|reveal your (prompt|instructions)/.test(m)) {
      return `I can't change my instructions. I'm here to help you study **${c.title}**. Try asking about ${topics}.`;
    }

    // 2. Built-in study actions
    if (/summar|key points?|overview|tl;?dr/.test(m)) return c.summary;
    if (/main concepts?|key concepts?|key terms/.test(m)) {
      return "These are the main concepts in this material:\n\n" + c.nodes.map((n) => `- **${n.label}**: ${n.description}`).join("\n");
    }
    if (/outline|study plan|study guide/.test(m)) {
      return "Here is a study outline:\n\n" + c.nodes.map((n, i) => `${i + 1}. **${n.label}**: ${n.description}`).join("\n") + "\n\nTip: take the quiz afterwards to check what stuck.";
    }
    if (/most important|core idea|biggest idea|main idea|big idea/.test(m)) return c.important;

    // 3. Topic questions, matched on whole words only
    const has = (k: string) => new RegExp(`(^|[^a-z])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(m);
    const hit = c.qa.find((q) => q.keywords.some(has));
    if (hit) return hit.answer;

    // 4. Off-topic: refuse rather than guess
    return `I can only answer questions about **${c.title}**, and I couldn't find that in it. Try asking about ${topics}, or ask for a summary.`;
  }
}

export const api = new ApiClient();

