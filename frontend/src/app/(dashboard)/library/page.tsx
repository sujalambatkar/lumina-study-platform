"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Video, Globe, MessageSquare, Network, HelpCircle, Trash2 } from "lucide-react";
import { useDocumentStore } from "@/store/documentStore";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import type { Document } from "@/types";
import UploadZone from "@/components/documents/UploadZone";
import toast from "react-hot-toast";

const SOURCE_ICONS: Record<string, React.ElementType> = { pdf: FileText, youtube: Video, web: Globe };

function DocCard({ doc }: { doc: Document }) {
  const { updateDocument, removeDocument } = useDocumentStore();
  const Icon = SOURCE_ICONS[doc.source_type] ?? FileText;

  const poll = useCallback(async () => {
    try {
      const s = await api.getDocumentStatus(doc.id);
      updateDocument(doc.id, s);
    } catch {}
  }, [doc.id, updateDocument]);

  useEffect(() => {
    if (doc.status !== "processing") return;
    const t = setInterval(poll, 2000);
    return () => clearInterval(t);
  }, [doc.status, poll]);

  const handleDelete = async () => {
    try {
      await api.deleteDocument(doc.id);
      removeDocument(doc.id);
      toast.success("Removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
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
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.09)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={15} color="#0a0a0a" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#0a0a0a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {doc.title}
          </p>
          <p style={{ fontSize: 11, color: "#a1a1aa", marginTop: 3 }}>
            {doc.source_type.toUpperCase()} · {formatRelativeTime(doc.created_at)}
          </p>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 99, flexShrink: 0,
          background: doc.status === "ready" ? "rgba(21,128,61,0.12)" : doc.status === "failed" ? "rgba(185,28,28,0.12)" : "rgba(0,0,0,0.07)",
          color: doc.status === "ready" ? "#15803d" : doc.status === "failed" ? "#b91c1c" : "#0a0a0a",
        }}>
          {doc.status}
        </span>
      </div>

      {/* Progress bar */}
      {doc.status === "processing" && (
        <div>
          <div style={{ height: 3, background: "#f4f4f5", borderRadius: 99, overflow: "hidden" }}>
            <motion.div
              style={{ height: "100%", background: "#0a0a0a", borderRadius: 99 }}
              animate={{ width: `${doc.progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <p style={{ fontSize: 11, color: "#a1a1aa", marginTop: 4 }}>{doc.progress}% indexed</p>
        </div>
      )}

      {doc.status === "failed" && doc.error_message && (
        <p style={{ fontSize: 11, color: "#b91c1c", background: "rgba(185,28,28,0.08)", padding: "8px 10px", borderRadius: 6, lineHeight: 1.5 }}>
          {doc.error_message.includes("blocked") || doc.error_message.includes("cloud")
            ? "YouTube is blocked on cloud servers. Use a PDF or web URL instead."
            : doc.error_message}
        </p>
      )}

      {doc.status === "ready" && (
        <p style={{ fontSize: 11, color: "#a1a1aa" }}>{doc.chunk_count} chunks indexed</p>
      )}

      {/* Actions */}
      {(doc.status === "ready" || doc.status === "failed" || doc.status === "processing") && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 8, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          {doc.status === "ready" && (
            <>
              <Link href={`/chat/${doc.id}`} style={{ textDecoration: "none" }}>
                <button style={{
                  padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer",
                  background: "rgba(0,0,0,0.06)", color: "#0a0a0a", border: "1px solid rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <MessageSquare size={11} /> Chat
                </button>
              </Link>
              <Link href={`/quiz/${doc.id}`} style={{ textDecoration: "none" }}>
                <button style={{
                  padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer",
                  background: "#f4f4f5", color: "#52525b", border: "1px solid rgba(0,0,0,0.09)",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <HelpCircle size={11} /> Quiz
                </button>
              </Link>
              <Link href={`/concepts/${doc.id}`} style={{ textDecoration: "none" }}>
                <button style={{
                  padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer",
                  background: "#f4f4f5", color: "#52525b", border: "1px solid rgba(0,0,0,0.09)",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <Network size={11} /> Map
                </button>
              </Link>
            </>
          )}
          <button
            onClick={handleDelete}
            style={{
              marginLeft: "auto", padding: "6px 10px", borderRadius: 7, fontSize: 12, cursor: "pointer",
              background: "rgba(185,28,28,0.08)", color: "#b91c1c", border: "1px solid rgba(185,28,28,0.2)",
              display: "flex", alignItems: "center", gap: 5, fontWeight: 500,
            }}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function LibraryPage() {
  const { documents, isLoading, fetchDocuments } = useDocumentStore();

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const processing = documents.filter((d) => d.status === "processing").length;
  const ready = documents.filter((d) => d.status === "ready").length;

  return (
    <div style={{ padding: "40px 40px", maxWidth: 900, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, color: "#0a0a0a" }}>
            Library
          </h1>
        </div>

        {/* Upload zone */}
        <div style={{ marginBottom: 36 }}>
          <UploadZone />
        </div>

        {/* List header */}
        {documents.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "#0a0a0a", fontWeight: 500 }}>
              {documents.length} document{documents.length !== 1 ? "s" : ""}
            </p>
            {processing > 0 && (
              <span style={{ fontSize: 12, color: "#0a0a0a", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0a0a0a", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                {processing} processing
              </span>
            )}
            {ready > 0 && (
              <span style={{ fontSize: 12, color: "#15803d" }}>{ready} ready</span>
            )}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && documents.length === 0 && (
          <div style={{
            background: "#fafafa",
            border: "1px solid rgba(0,0,0,0.09)",
            borderRadius: 14,
            padding: "64px 24px",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "#f4f4f5", border: "1px solid rgba(0,0,0,0.09)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 14,
            }}>
              <Upload size={20} color="#a1a1aa" />
            </div>
            <p style={{ fontSize: 14, color: "#71717a", marginBottom: 4 }}>Library is empty</p>
            <p style={{ fontSize: 12, color: "#a1a1aa" }}>Upload something above to get started</p>
          </div>
        )}

        {/* Grid */}
        {documents.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            <AnimatePresence>
              {documents.map((doc) => <DocCard key={doc.id} doc={doc} />)}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
