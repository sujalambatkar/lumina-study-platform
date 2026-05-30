"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Video, Globe, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { useDocumentStore } from "@/store/documentStore";
import toast from "react-hot-toast";

type Tab = "pdf" | "youtube" | "web";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "pdf", label: "PDF", icon: FileText },
  { id: "youtube", label: "YouTube", icon: Video },
  { id: "web", label: "Web URL", icon: Globe },
];

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  background: "#161622",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  color: "#ede9e0",
  fontSize: 13,
  outline: "none",
  fontFamily: "var(--font-body)",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "#8a8278",
  marginBottom: 6,
  fontWeight: 500,
};

export default function UploadZone() {
  const [tab, setTab] = useState<Tab>("pdf");
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState("");
  const [urlTitle, setUrlTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addDocument } = useDocumentStore();

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are supported");
      return;
    }
    setUploading(true);
    try {
      const doc = await api.uploadDocument(file);
      addDocument(doc);
      toast.success(`"${doc.title}" is being processed`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [addDocument]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    setUploading(true);
    try {
      const doc = await api.ingestUrl({
        url: url.trim(),
        type: tab as "youtube" | "web",
        title: urlTitle.trim() || undefined,
      });
      addDocument(doc);
      toast.success("Processing started");
      setUrl(""); setUrlTitle("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process URL");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      background: "#0f0f18",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: 6,
        padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 7,
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              border: tab === id ? "1px solid rgba(232,168,76,0.25)" : "1px solid transparent",
              background: tab === id ? "rgba(232,168,76,0.1)" : "transparent",
              color: tab === id ? "#e8a84c" : "#6b6560",
              transition: "all 0.15s",
            }}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        <AnimatePresence mode="wait">
          {tab === "youtube" ? (
            <motion.div key="youtube-notice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              <div style={{
                padding: "14px 16px", borderRadius: 10, marginBottom: 16,
                background: "rgba(232,92,92,0.06)", border: "1px solid rgba(232,92,92,0.2)",
              }}>
                <p style={{ fontSize: 13, color: "#e85c5c", fontWeight: 500, marginBottom: 4 }}>
                  YouTube is not available on the deployed version
                </p>
                <p style={{ fontSize: 12, color: "#8a8278", lineHeight: 1.6 }}>
                  Render (the cloud server hosting this app) is blocked by YouTube. YouTube ingestion works fine when running the app locally. This is a Render IP restriction, not a bug.
                </p>
              </div>
            </motion.div>
          ) : tab === "pdf" ? (
            <motion.div key="pdf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? "#e8a84c" : "rgba(255,255,255,0.1)"}`,
                  background: isDragging ? "rgba(232,168,76,0.04)" : "transparent",
                  borderRadius: 10,
                  padding: "40px 24px",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: isDragging ? "rgba(232,168,76,0.12)" : "#161622",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 14, transition: "all 0.15s",
                }}>
                  <Upload size={18} color={isDragging ? "#e8a84c" : "#4a4642"} />
                </div>
                <p style={{ fontSize: 13, color: "#8a8278", marginBottom: 4 }}>
                  Drop PDF here or <span style={{ color: "#e8a84c" }}>browse</span>
                </p>
                <p style={{ fontSize: 11, color: "#4a4642" }}>Up to 50 MB</p>
                {uploading && <p style={{ fontSize: 11, color: "#e8a84c", marginTop: 10 }}>Uploading...</p>}
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
              </div>
            </motion.div>
          ) : (
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>
                  Web URL
                </label>
                <input
                  style={inputStyle}
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(232,168,76,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Title (optional)</label>
                <input
                  style={inputStyle}
                  placeholder="Give it a name"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(232,168,76,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                />
              </div>
              <button
                onClick={handleUrlSubmit}
                disabled={!url.trim() || uploading}
                style={{
                  padding: "11px",
                  borderRadius: 8,
                  border: "none",
                  background: !url.trim() || uploading ? "rgba(232,168,76,0.3)" : "linear-gradient(135deg, #e8a84c, #d4863e)",
                  color: "#0a0a0f",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: !url.trim() || uploading ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-body)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {uploading ? (
                  <>
                    <span style={{
                      width: 13, height: 13, border: "2px solid rgba(10,10,15,0.3)",
                      borderTopColor: "#0a0a0f", borderRadius: "50%",
                      animation: "spin 0.7s linear infinite", display: "inline-block",
                    }} />
                    Processing...
                  </>
                ) : "Process page"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: #4a4642; }`}</style>
    </div>
  );
}
