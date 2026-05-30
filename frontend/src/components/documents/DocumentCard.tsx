"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Video, Globe, MessageSquare, Network, HelpCircle, Trash2 } from "lucide-react";
import type { Document } from "@/types";
import { api } from "@/lib/api";
import { useDocumentStore } from "@/store/documentStore";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { formatRelativeTime } from "@/lib/utils";
import toast from "react-hot-toast";

const SOURCE_ICONS = { pdf: FileText, youtube: Video, web: Globe };
const SOURCE_LABELS = { pdf: "PDF", youtube: "YouTube", web: "Web" };

export default function DocumentCard({ doc }: { doc: Document }) {
  const { updateDocument, removeDocument } = useDocumentStore();
  const Icon = SOURCE_ICONS[doc.source_type];

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
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const ACTION_BTN = "flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius)] text-xs font-medium transition-all";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="group p-4 rounded-[var(--radius-xl)] flex flex-col gap-3 transition-all"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      whileHover={{ y: -1 }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--accent-dim)", border: "1px solid rgba(232,168,76,0.15)" }}
        >
          <Icon size={15} style={{ color: "var(--accent)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug truncate" style={{ color: "var(--text-primary)" }}>
            {doc.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {SOURCE_LABELS[doc.source_type]}
            </span>
            <span style={{ color: "var(--border-strong)" }}>·</span>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {formatRelativeTime(doc.created_at)}
            </span>
          </div>
        </div>
        <Badge variant={doc.status === "ready" ? "success" : doc.status === "failed" ? "danger" : "warning"}>
          {doc.status}
        </Badge>
      </div>

      {/* Processing progress */}
      {doc.status === "processing" && (
        <div className="space-y-1">
          <ProgressBar value={doc.progress} />
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Indexing... {doc.progress}%
          </p>
        </div>
      )}

      {/* Error */}
      {doc.status === "failed" && doc.error_message && (
        <p className="text-xs rounded-[var(--radius)] px-2.5 py-2" style={{ color: "var(--danger)", background: "rgba(232,92,92,0.07)" }}>
          {doc.error_message}
        </p>
      )}

      {/* Chunk count */}
      {doc.status === "ready" && (
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {doc.chunk_count} chunks indexed
        </p>
      )}

      {/* Actions */}
      {doc.status === "ready" && (
        <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href={`/chat/${doc.id}`}>
            <button
              className={ACTION_BTN}
              style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(232,168,76,0.2)" }}
            >
              <MessageSquare size={11} /> Chat
            </button>
          </Link>
          <Link href={`/quiz/${doc.id}`}>
            <button
              className={ACTION_BTN}
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              <HelpCircle size={11} /> Quiz
            </button>
          </Link>
          <Link href={`/concepts/${doc.id}`}>
            <button
              className={ACTION_BTN}
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              <Network size={11} /> Map
            </button>
          </Link>
          <button
            onClick={handleDelete}
            className="ml-auto p-1.5 rounded-[var(--radius)] transition-colors opacity-0 group-hover:opacity-100"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--danger)";
              (e.currentTarget as HTMLElement).style.background = "rgba(232,92,92,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
