"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Video, Globe, Network, HelpCircle } from "lucide-react";
import type { Document } from "@/types";
import { api } from "@/lib/api";
import ChatWindow from "@/components/chat/ChatWindow";

const SOURCE_ICONS: Record<string, React.ElementType> = { pdf: FileText, youtube: Video, web: Globe };

export default function ChatPage() {
  const { docId } = useParams<{ docId: string }>();
  const [doc, setDoc] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDocument(docId).then(setDoc).catch((e) => setError(e.message));
  }, [docId]);

  if (error) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
      <p style={{ fontSize: 14, color: "#e85c5c" }}>{error}</p>
      <Link href="/library" style={{ fontSize: 13, color: "#e8a84c", textDecoration: "none" }}>← Back to library</Link>
    </div>
  );

  if (!doc) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div style={{ width: 24, height: 24, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#e8a84c", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const Icon = SOURCE_ICONS[doc.source_type] ?? FileText;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* Left sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: 240, flexShrink: 0, display: "flex", flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          background: "#0a0a0f",
        }}
      >
        {/* Back + doc info */}
        <div style={{ padding: "16px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/library" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 500, textDecoration: "none",
            color: "#e8a84c", marginBottom: 16,
            padding: "5px 10px", borderRadius: 6,
            background: "rgba(232,168,76,0.08)",
            border: "1px solid rgba(232,168,76,0.2)",
          }}>
            <ArrowLeft size={12} /> Back to Library
          </Link>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: "rgba(232,168,76,0.1)", border: "1px solid rgba(232,168,76,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={14} color="#e8a84c" />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#ede9e0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                {doc.title}
              </p>
              <p style={{ fontSize: 11, color: "#4a4642", marginTop: 2 }}>{doc.chunk_count} chunks</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "12px 8px" }}>
          <p style={{ fontSize: 10, color: "#4a4642", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 8px", marginBottom: 6 }}>Actions</p>
          {[
            { href: `/concepts/${doc.id}`, icon: Network, label: "Concept map" },
            { href: `/quiz/${doc.id}`, icon: HelpCircle, label: "Take a quiz" },
          ].map(({ href, icon: NavIcon, label }) => (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: "transparent", color: "#6b6560", fontSize: 13, textAlign: "left",
                transition: "all 0.15s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0f0f18"; (e.currentTarget as HTMLElement).style.color = "#ede9e0"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#6b6560"; }}
              >
                <NavIcon size={14} /> {label}
              </button>
            </Link>
          ))}
        </div>
      </motion.aside>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {doc.status !== "ready" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ width: 24, height: 24, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#e8a84c", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            <p style={{ fontSize: 14, color: "#6b6560" }}>Document is still processing ({doc.progress}%)…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <ChatWindow doc={doc} />
        )}
      </div>
    </div>
  );
}
