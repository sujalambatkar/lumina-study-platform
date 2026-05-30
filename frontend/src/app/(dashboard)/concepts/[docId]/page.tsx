"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Network, RefreshCw, X } from "lucide-react";
import type { ConceptMapResponse, Document } from "@/types";
import { api } from "@/lib/api";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const ConceptMapCanvas = dynamic(
  () => import("@/components/concepts/ConceptMapCanvas"),
  { ssr: false, loading: () => (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "#e8a84c", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )}
);

export default function ConceptsPage() {
  const { docId } = useParams<{ docId: string }>();
  const [doc, setDoc] = useState<Document | null>(null);
  const [mapData, setMapData] = useState<ConceptMapResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selected, setSelected] = useState<{ label: string; description: string } | null>(null);

  useEffect(() => {
    api.getDocument(docId).then(setDoc).catch(() => {});
  }, [docId]);

  const generate = async () => {
    setIsGenerating(true);
    setMapData(null);
    setSelected(null);
    try {
      const data = await api.generateConceptMap(docId);
      setMapData(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate map");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* Sidebar */}
      <div style={{
        width: 230, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "#0a0a0f", borderRight: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Header */}
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href={`/chat/${docId}`} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 500, textDecoration: "none",
            color: "#e8a84c", marginBottom: 16,
            padding: "5px 10px", borderRadius: 6,
            background: "rgba(232,168,76,0.08)",
            border: "1px solid rgba(232,168,76,0.2)",
          }}>
            <ArrowLeft size={12} /> Back to Chat
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Network size={15} color="#e8a84c" />
            <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 500, color: "#ede9e0" }}>
              Concept Map
            </p>
          </div>
          {doc && (
            <p style={{ fontSize: 11, color: "#4a4642", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {doc.title}
            </p>
          )}
        </div>

        {/* Generate button */}
        <div style={{ padding: 16 }}>
          <button
            onClick={generate}
            disabled={isGenerating}
            style={{
              width: "100%", padding: "10px", borderRadius: 8, border: "none",
              background: isGenerating ? "rgba(232,168,76,0.3)" : "linear-gradient(135deg,#e8a84c,#d4863e)",
              color: "#0a0a0f", fontWeight: 600, fontSize: 13, cursor: isGenerating ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {isGenerating ? (
              <>
                <span style={{ width: 12, height: 12, border: "2px solid rgba(10,10,15,0.3)", borderTopColor: "#0a0a0f", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                Generating…
              </>
            ) : (
              <>
                {mapData ? <RefreshCw size={12} /> : <Network size={12} />}
                {mapData ? "Regenerate" : "Generate map"}
              </>
            )}
          </button>

          {mapData && (
            <div style={{ marginTop: 14, padding: "10px 12px", background: "#0f0f18", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: 11, color: "#6b6560", marginBottom: 4 }}>
                {mapData.nodes.length} concepts
              </p>
              <p style={{ fontSize: 11, color: "#6b6560" }}>
                {mapData.edges.length} connections
              </p>
            </div>
          )}
        </div>

        {/* How to read */}
        {mapData && (
          <div style={{ padding: "0 16px" }}>
            <div style={{ padding: "10px 12px", background: "rgba(232,168,76,0.05)", borderRadius: 8, border: "1px solid rgba(232,168,76,0.12)" }}>
              <p style={{ fontSize: 10, color: "#e8a84c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                How to read
              </p>
              <p style={{ fontSize: 11, color: "#6b6560", lineHeight: 1.6 }}>
                The <span style={{ color: "#e8a84c" }}>amber node</span> is the central concept. Arrows show relationships. Click any node to see its definition.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* Empty state */}
        {!mapData && !isGenerating && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: "#0f0f18", border: "1px solid rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Network size={28} color="#4a4642" />
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#ede9e0" }}>No map yet</p>
            <p style={{ fontSize: 13, color: "#4a4642" }}>Click &ldquo;Generate map&rdquo; to extract concepts</p>
            <button
              onClick={generate}
              style={{
                marginTop: 8, padding: "11px 24px", borderRadius: 8, border: "none",
                background: "linear-gradient(135deg,#e8a84c,#d4863e)", color: "#0a0a0f",
                fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-body)",
              }}
            >
              Generate map
            </button>
          </div>
        )}

        {/* Loading */}
        {isGenerating && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>
            <div style={{ width: 32, height: 32, border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "#e8a84c", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            <p style={{ fontSize: 14, color: "#6b6560" }}>Extracting concepts and relationships…</p>
          </div>
        )}

        {/* Map */}
        {mapData && (
          <ConceptMapCanvas data={mapData} onNodeClick={(n) => setSelected(n)} />
        )}

        {/* Node detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute", top: 16, right: 16, width: 260,
                background: "#0f0f18", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, padding: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 500, color: "#ede9e0", lineHeight: 1.3, flex: 1 }}>
                  {selected.label}
                </p>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#4a4642", padding: "2px", flexShrink: 0, marginLeft: 8 }}
                >
                  <X size={14} />
                </button>
              </div>
              <p style={{ fontSize: 13, color: "#8a8278", lineHeight: 1.6 }}>
                {selected.description || "No description available."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
