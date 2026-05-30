"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Square, Sparkles } from "lucide-react";
import type { ChatMessage, Document } from "@/types";
import { api } from "@/lib/api";
import { useStreamingChat } from "@/lib/streaming";
import MessageBubble from "./MessageBubble";
import toast from "react-hot-toast";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const SUGGESTIONS = [
  "Summarize the key points",
  "What are the main concepts?",
  "Explain the most important idea",
  "Create a study outline",
];

export default function ChatWindow({ doc }: { doc: Document }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startStream, stopStream, isStreaming } = useStreamingChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userId = generateId();
    const aiId = generateId();

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: text.trim(), timestamp: new Date() },
      { id: aiId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
    ]);

    await startStream(api.getChatStreamUrl(doc.id, text.trim()), {
      onToken: (token) =>
        setMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, content: m.content + token } : m)),
      onDone: () =>
        setMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, isStreaming: false } : m)),
      onError: (err) => {
        setMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, content: `Error: ${err}`, isStreaming: false } : m));
        toast.error(err);
      },
    });
  }, [isStreaming, doc.id, startStream]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const canSend = !!input.trim() && !isStreaming;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "rgba(232,168,76,0.1)", border: "1px solid rgba(232,168,76,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
            }}>
              <Sparkles size={22} color="#e8a84c" />
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500, color: "#ede9e0", marginBottom: 8 }}>
              Ask Lumina anything
            </h3>
            <p style={{ fontSize: 13, color: "#6b6560", maxWidth: 300, lineHeight: 1.6, marginBottom: 28 }}>
              I&apos;ve read <strong style={{ color: "#ede9e0" }}>{doc.title}</strong> in full. Ask a question or try a suggestion.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 400 }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} style={{
                  padding: "7px 14px", borderRadius: 99,
                  background: "#161622", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#8a8278", fontSize: 12, cursor: "pointer", transition: "all 0.15s",
                  fontFamily: "var(--font-body)",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e8a84c"; (e.currentTarget as HTMLElement).style.color = "#e8a84c"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#8a8278"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <MessageBubble message={msg} />
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 20px 16px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "#0a0a0f",
      }}>
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 10,
          background: "#161622",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12, padding: "10px 12px",
        }}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this document…"
            style={{
              flex: 1, resize: "none", background: "transparent",
              border: "none", outline: "none",
              color: "#ede9e0", fontSize: 14,
              fontFamily: "var(--font-body)", lineHeight: 1.6,
              maxHeight: 140, padding: 0,
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
            }}
          />
          <button
            onClick={isStreaming ? stopStream : () => send(input)}
            disabled={!canSend && !isStreaming}
            style={{
              width: 34, height: 34, borderRadius: 8, border: "none", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              background: isStreaming ? "rgba(232,92,92,0.15)" : canSend ? "linear-gradient(135deg,#e8a84c,#d4863e)" : "#0f0f18",
              color: isStreaming ? "#e85c5c" : canSend ? "#0a0a0f" : "#4a4642",
              transition: "all 0.15s",
              boxShadow: canSend && !isStreaming ? "0 2px 8px rgba(232,168,76,0.3)" : "none",
            }}
          >
            {isStreaming ? <Square size={13} /> : <Send size={13} />}
          </button>
        </div>
        <p style={{ fontSize: 11, textAlign: "center", color: "#4a4642", marginTop: 8 }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
      <style>{`textarea::placeholder { color: #4a4642; }`}</style>
    </div>
  );
}
