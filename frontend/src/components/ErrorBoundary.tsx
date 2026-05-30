"use client";

import { Component, ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; message: string; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100dvh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#0a0a0f", color: "#ede9e0", textAlign: "center", padding: 24,
        }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>⚠</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 13, color: "#6b6560", marginBottom: 24, maxWidth: 360 }}>
            {this.state.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg,#e8a84c,#d4863e)",
              color: "#0a0a0f", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
