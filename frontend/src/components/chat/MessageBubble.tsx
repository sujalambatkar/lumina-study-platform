"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/types";

interface Props { message: ChatMessage; }

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{
          maxWidth: "72%",
          padding: "10px 14px",
          borderRadius: 14,
          borderBottomRightRadius: 4,
          background: "linear-gradient(135deg, #e8a84c, #d4863e)",
          color: "#0a0a0f",
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: "var(--font-body)",
        }}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0, marginTop: 2,
        background: "linear-gradient(135deg, #e8a84c, #c87c28)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: "white",
      }}>
        L
      </div>
      <div style={{
        flex: 1, minWidth: 0,
        padding: "12px 16px",
        borderRadius: 14,
        borderBottomLeftRadius: 4,
        background: "#161622",
        border: "1px solid rgba(255,255,255,0.07)",
        fontSize: 14,
        lineHeight: 1.7,
        color: "#ede9e0",
        fontFamily: "var(--font-body)",
      }}>
        {message.content ? (
          <div className="prose-lumina">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : null}
        {message.isStreaming && !message.content && (
          <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
            {[0, 0.2, 0.4].map((d) => (
              <span key={d} style={{
                width: 6, height: 6, borderRadius: "50%", background: "#4a4642",
                animation: `bounce 1s ${d}s infinite`,
                display: "inline-block",
              }} />
            ))}
          </div>
        )}
        {message.isStreaming && message.content && (
          <span className="cursor-blink" />
        )}
      </div>
      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-4px);opacity:1} }
      `}</style>
    </div>
  );
}
