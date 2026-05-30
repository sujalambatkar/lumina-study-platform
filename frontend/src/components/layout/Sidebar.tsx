"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, BookOpen, Brain, LogOut, Menu, X, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useDocumentStore } from "@/store/documentStore";
import toast from "react-hot-toast";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/tracker", label: "Tracker", icon: Brain },
];

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { documents } = useDocumentStore();
  const readyCount = documents.filter((d) => d.status === "ready").length;

  const active = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    router.push("/");
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "#0a0a0f", borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/dashboard" onClick={onClose} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #e8a84c, #c87c28)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={13} color="white" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, color: "#ede9e0" }}>
            Lumina
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6560", padding: 4 }}>
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
                color: isActive ? "#ede9e0" : "#6b6560",
                background: isActive ? "rgba(232,168,76,0.08)" : "transparent",
                borderLeft: isActive ? "2px solid #e8a84c" : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <Icon size={15} style={{ opacity: isActive ? 1 : 0.6 }} />
              {label}
              {href === "/library" && readyCount > 0 && (
                <span style={{
                  marginLeft: "auto", fontSize: 10, padding: "1px 6px", borderRadius: 99,
                  background: "rgba(232,168,76,0.1)", color: "#e8a84c",
                }}>
                  {readyCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 10px", borderRadius: 8,
          background: "#0f0f18", marginBottom: 4,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #e8a84c, #c87c28)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: "white",
          }}>
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "#ede9e0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name}
            </p>
            <p style={{ fontSize: 10, color: "#4a4642", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "transparent", color: "#4a4642", fontSize: 13, transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#e85c5c"; (e.currentTarget as HTMLElement).style.background = "rgba(232,92,92,0.07)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#4a4642"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <LogOut size={14} /> Sign out
        </button>
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
          width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
          background: "#161622", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Menu size={16} color="#ede9e0" />
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
