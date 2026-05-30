"use client";

import { useRef, useState, useCallback } from "react";
import { getStoredToken } from "./auth";

interface StreamOptions {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export function useStreamingChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (url: string, options: StreamOptions) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      const token = getStoredToken();
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers,
          credentials: "include",
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ detail: "Stream failed" }));
          options.onError(err.detail || `HTTP ${response.status}`);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          options.onError("No response body");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.token) {
                  options.onToken(data.token);
                } else if (data.done) {
                  options.onDone();
                } else if (data.error) {
                  options.onError(data.error);
                }
              } catch {
                // ignore parse errors on individual lines
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          options.onError(err.message);
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    []
  );

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { startStream, stopStream, isStreaming };
}
