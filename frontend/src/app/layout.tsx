import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumina — Study Intelligence Platform",
  description: "Upload PDFs, YouTube videos, and web articles. Chat, quiz, and map your understanding.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      <body>
        <ErrorBoundary>
        {children}
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a24",
              color: "#f0ede6",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              borderRadius: "8px",
            },
            success: { iconTheme: { primary: "#4caf7d", secondary: "#0a0a0f" } },
            error: { iconTheme: { primary: "#e85c5c", secondary: "#0a0a0f" } },
          }}
        />
      </body>
    </html>
  );
}
