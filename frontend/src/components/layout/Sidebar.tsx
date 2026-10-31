"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, BookOpen, Brain, Menu, X, Sparkles } from "lucide-react";
import { useDocumentStore } from "@/store/documentStore";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/tracker", label: "Tracker", icon: Brain },
];

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { documents } = useDocumentStore();
  const readyCount = documents.filter((d) => d.status === "ready").length;

  const active = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "#ffffff", borderRight: "1px solid rgba(0,0,0,0.08)",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/dashboard" onClick={onClose} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #0a0a0a, #262626)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={13} color="white" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, color: "#0a0a0a" }}>
            Lumina
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#71717a", padding: 4 }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = active(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, textDecoration: "none",
                fontSize: 13, fontWeight: isActive ? 500 : 400,
                color: isActive ? "#0a0a0a" : "#71717a",
                background: isActive ? "rgba(0,0,0,0.05)" : "transparent",
                borderLeft: isActive ? "2px solid #0a0a0a" : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <Icon size={15} style={{ opacity: isActive ? 1 : 0.6 }} />
              {label}
              {href === "/library" && readyCount > 0 && (
                <span style={{
                  marginLeft: "auto", fontSize: 10, padding: "1px 6px", borderRadius: 99,
                  background: "rgba(0,0,0,0.06)", color: "#0a0a0a",
                }}>
                  {readyCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <p style={{ fontSize: 11, color: "#a1a1aa", lineHeight: 1.5 }}>
          Demo with sample data.<br />No account needed.
        </p>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside style={{ width: 220, flexShrink: 0, height: "100vh", position: "sticky", top: 0, display: "none" }}
        className="md-sidebar">
        <NavContent />
      </aside>

      {/* Simple CSS to show on md+ */}
      <style>{`
        @media (min-width: 768px) { .md-sidebar { display: block !important; } .mobile-trigger { display: none !important; } }
      `}</style>

      {/* Mobile trigger */}
      <button
        className="mobile-trigger"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 50,
          width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)",
          background: "#f4f4f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Menu size={16} color="#0a0a0a" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 220, zIndex: 50 }}
            >
              <NavContent onClose={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
