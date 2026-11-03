import type { Metadata } from "next";
import "@fontsource-variable/inter";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina — AI Study Companion",
  description: "Chat with your study material, map concepts and quiz yourself. Interactive demo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" >
      <body>
        <ErrorBoundary>
        {children}
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#0a0a0a",
              border: "1px solid rgba(0,0,0,0.14)",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              borderRadius: "8px",
            },
            success: { iconTheme: { primary: "#15803d", secondary: "#ffffff" } },
            error: { iconTheme: { primary: "#b91c1c", secondary: "#ffffff" } },
          }}
        />
      </body>
    </html>
  );
}
