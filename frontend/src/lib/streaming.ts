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
      const answer = api.chatAnswer(params.get("document_id") ?? "", params.get("message") ?? "");
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
