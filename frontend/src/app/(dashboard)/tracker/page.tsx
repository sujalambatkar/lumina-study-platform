"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { TopicMastery, TrackerSummary } from "@/types";
import { api } from "@/lib/api";
import { useDocumentStore } from "@/store/documentStore";
import { formatRelativeTime } from "@/lib/utils";

export default function TrackerPage() {
  const [topics, setTopics] = useState<TopicMastery[]>([]);
  const [summary, setSummary] = useState<TrackerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { documents, fetchDocuments } = useDocumentStore();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchDocuments(),
        api.getTrackerSummary().then(setSummary).catch(() => {}),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const ready = documents.filter((d) => d.status === "ready");
    if (!ready.length) { setLoading(false); return; }
    Promise.all(ready.map((d) => api.getDocumentTracker(d.id).catch(() => [] as TopicMastery[])))
      .then((r) => { setTopics(r.flat()); setLoading(false); })
      .catch((err) => { setError(err instanceof Error ? err.message : "Failed to load tracker"); setLoading(false); });
  }, [documents]);

  const cols = [
    { status: "needs_review" as const, label: "Needs Review", color: "#b91c1c", bg: "rgba(185,28,28,0.06)", border: "rgba(185,28,28,0.15)" },
    { status: "not_explored" as const, label: "In Progress", color: "#52525b", bg: "#fafafa", border: "rgba(0,0,0,0.09)" },
    { status: "strong" as const, label: "Strong", color: "#15803d", bg: "rgba(21,128,61,0.06)", border: "rgba(21,128,61,0.15)" },
  ];

  return (
    <div style={{ padding: "40px 40px", maxWidth: 1000, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, color: "#0a0a0a" }}>
            Tracker
          </h1>
        </div>

        {/* Stats */}
        {summary && summary.total_topics > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 36 }}>
            {[
              { label: "Topics", value: summary.total_topics },
              { label: "Mastery", value: `${summary.overall_mastery}%` },
              { label: "Need review", value: summary.needs_review_count },
              { label: "Strong", value: summary.strong_count },
            ].map(({ label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: "#fafafa",
                  border: "1px solid rgba(0,0,0,0.09)",
                  borderRadius: 12,
                  padding: "20px",
                }}
              >
                <p style={{ fontSize: 11, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  {label}
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 500, color: "#0a0a0a" }}>
                  {value}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div style={{
            background: "#fafafa", border: "1px solid rgba(185,28,28,0.2)",
            borderRadius: 14, padding: "40px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}>
            <p style={{ fontSize: 14, color: "#b91c1c" }}>{error}</p>
            <button
              onClick={loadData}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                background: "linear-gradient(135deg,#0a0a0a,#262626)",
                color: "#ffffff", fontWeight: 600, fontSize: 13, cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
            <div style={{ width: 26, height: 26, border: "2px solid rgba(0,0,0,0.1)", borderTopColor: "#0a0a0a", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            <p style={{ fontSize: 13, color: "#71717a" }}>Loading tracker data…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && topics.length === 0 && (
          <div style={{
            background: "#fafafa",
            border: "1px solid rgba(0,0,0,0.09)",
            borderRadius: 14,
            padding: "64px 24px",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <p style={{ fontSize: 14, color: "#71717a", marginBottom: 4 }}>No quiz data yet</p>
            <p style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 20 }}>
              Take a quiz on any document to track your mastery
            </p>
            <Link href="/library" style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: "transparent", color: "#0a0a0a", border: "1px solid rgba(0,0,0,0.18)",
              textDecoration: "none",
            }}>
              Go to library →
            </Link>
          </div>
        )}

        {/* Columns */}
        {topics.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {cols.map(({ status, label, color, bg, border }) => {
              const items = topics.filter((t) => t.status === status);
              return (
                <div key={status}>
                  {/* Column header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color }}>
                      {label}
                    </p>
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 99,
                      background: bg, color, border: `1px solid ${border}`,
                    }}>
                      {items.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {items.length === 0 && (
                      <div style={{
                        border: `1px dashed ${border}`,
                        borderRadius: 12, padding: "32px 16px",
                        textAlign: "center", fontSize: 12, color: "#a1a1aa",
                      }}>
                        None yet
                      </div>
                    )}
                    {items.map((t, i) => (
                      <motion.div
                        key={`${t.document_id}-${t.topic}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{
                          background: bg,
                          border: `1px solid ${border}`,
                          borderRadius: 12,
                          padding: 16,
                        }}
                      >
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#0a0a0a", marginBottom: 3 }}>
                          {t.topic}
                        </p>
                        <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 12 }}>
                          {t.document_title}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                          <span style={{ fontSize: 11, color: "#71717a" }}>
                            {t.attempt_count} attempt{t.attempt_count !== 1 ? "s" : ""}
                            {t.last_attempt ? ` · ${formatRelativeTime(t.last_attempt)}` : ""}
                          </span>
                          {t.avg_score !== null && (
                            <span style={{ fontSize: 15, fontWeight: 600, color }}>{t.avg_score}%</span>
                          )}
                        </div>
                        <Link href={`/quiz/${t.document_id}`} style={{ textDecoration: "none" }}>
                          <button style={{
                            width: "100%", padding: "7px", borderRadius: 8,
                            background: "transparent", color,
                            border: `1px solid ${border}`,
                            fontSize: 12, fontWeight: 500, cursor: "pointer",
                          }}>
                            Practice →
                          </button>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
