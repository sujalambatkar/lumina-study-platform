"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { api } from "./api";

interface StreamOptions {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

/** Simulates a streaming chat response from the demo API, word by word. */
export function useStreamingChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  const stopStream = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    setIsStreaming(false);
  }, []);

  useEffect(() => () => cancelRef.current?.(), []);

  const startStream = useCallback(
    async (url: string, options: StreamOptions) => {
      cancelRef.current?.();
      const params = new URL(url).searchParams;
      const docId = params.get("document_id") ?? "";
      const message = params.get("message") ?? "";
      const text = api.getLiveText(docId);

      if (text) {
        const controller = new AbortController();
        cancelRef.current = () => controller.abort();
        setIsStreaming(true);
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, message, title: api.getTitle(docId) }),
            signal: controller.signal,
          });
          if (!res.ok || !res.body) {
            const err = await res.json().catch(() => ({}));
            options.onError(err.detail || `Request failed (${res.status})`);
            return;
          }
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            options.onToken(decoder.decode(value, { stream: true }));
          }
          options.onDone();
        } catch (e) {
          if (!(e instanceof Error && e.name === "AbortError")) {
            options.onError("Couldn't reach the server. Please try again.");
          }
        } finally {
          setIsStreaming(false);
          cancelRef.current = null;
        }
        return;
      }

      const answer = api.chatAnswer(docId, message);
      const words = answer.match(/\S+\s*/g) ?? [answer];

      let cancelled = false;
      cancelRef.current = () => { cancelled = true; };
      setIsStreaming(true);

      await new Promise((r) => setTimeout(r, 500)); // "thinking"
      for (const w of words) {
        if (cancelled) return;
        options.onToken(w);
        await new Promise((r) => setTimeout(r, 22));
      }
      if (!cancelled) {
        options.onDone();
        setIsStreaming(false);
        cancelRef.current = null;
      }
    },
    []
  );

  return { startStream, stopStream, isStreaming };
}
