"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, MessageSquare, HelpCircle, FileText, Video, Globe, ArrowRight } from "lucide-react";
import { useDocumentStore } from "@/store/documentStore";
import { api } from "@/lib/api";
import type { TrackerSummary } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

const SOURCE_ICONS: Record<string, React.ElementType> = { pdf: FileText, youtube: Video, web: Globe };

export default function DashboardPage() {
  const { documents, fetchDocuments } = useDocumentStore();
  const [summary, setSummary] = useState<TrackerSummary | null>(null);

  useEffect(() => {
    fetchDocuments();
    api.getTrackerSummary().then(setSummary).catch(() => {});
  }, [fetchDocuments]);

  const ready = documents.filter((d) => d.status === "ready").length;
  const recent = documents.slice(0, 6);

  const stats = [
    { label: "Documents", value: documents.length },
    { label: "Ready", value: ready },
    { label: "Topics", value: summary?.total_topics ?? "—" },
    { label: "Mastery", value: summary ? `${summary.overall_mastery}%` : "—" },
  ];

  return (
    <div style={{ padding: "40px 40px", maxWidth: 900, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, color: "#0a0a0a", marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "#71717a" }}>
            Here is where your study material stands.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40 }}>
          {stats.map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                background: "#fafafa",
                border: "1px solid rgba(0,0,0,0.09)",
                borderRadius: 12,
                padding: "20px 20px",
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

        {/* Recent docs header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#0a0a0a" }}>Recent documents</p>
          <Link href="/library" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#71717a", textDecoration: "none" }}>
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {/* Empty state */}
        {documents.length === 0 ? (
          <Link href="/library" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#fafafa",
              border: "2px dashed rgba(0,0,0,0.1)",
              borderRadius: 14,
              padding: "56px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "rgba(0,0,0,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <Upload size={20} color="#0a0a0a" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#52525b", marginBottom: 4 }}>Upload your first document</p>
              <p style={{ fontSize: 12, color: "#a1a1aa" }}>PDF, YouTube video, or web article</p>
            </div>
          </Link>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {recent.map((doc, i) => {
              const Icon = SOURCE_ICONS[doc.source_type] ?? FileText;
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  style={{
                    background: "#fafafa",
                    border: "1px solid rgba(0,0,0,0.09)",
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {/* Doc header */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: "rgba(0,0,0,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={14} color="#0a0a0a" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#0a0a0a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {doc.title}
                      </p>
                      <p style={{ fontSize: 11, color: "#a1a1aa", marginTop: 2 }}>
                        {formatRelativeTime(doc.created_at)}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                      background: doc.status === "ready" ? "rgba(21,128,61,0.12)" : doc.status === "failed" ? "rgba(185,28,28,0.12)" : "rgba(0,0,0,0.07)",
                      color: doc.status === "ready" ? "#15803d" : doc.status === "failed" ? "#b91c1c" : "#0a0a0a",
                    }}>
                      {doc.status}
                    </span>
                  </div>

                  {/* Actions */}
                  {doc.status === "ready" && (
                    <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                      <Link href={`/chat/${doc.id}`} style={{ flex: 1, textDecoration: "none" }}>
                        <button style={{
                          width: "100%", padding: "7px 0", borderRadius: 7,
                          background: "rgba(0,0,0,0.06)", color: "#0a0a0a",
                          border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                        }}>
                          <MessageSquare size={11} /> Chat
                        </button>
                      </Link>
                      <Link href={`/quiz/${doc.id}`} style={{ flex: 1, textDecoration: "none" }}>
                        <button style={{
                          width: "100%", padding: "7px 0", borderRadius: 7,
                          background: "#f4f4f5", color: "#52525b",
                          border: "1px solid rgba(0,0,0,0.09)", fontSize: 12, fontWeight: 500, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                        }}>
                          <HelpCircle size={11} /> Quiz
                        </button>
                      </Link>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
