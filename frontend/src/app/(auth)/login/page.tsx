"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Required";
    return e;
  };

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      toast.error(msg === "Failed to fetch" ? "Backend is offline — run uvicorn in your terminal" : msg);
    }
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 600,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(232,168,76,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
        style={{ width: "100%", maxWidth: 400, position: "relative" }}
      >
        {/* Card */}
        <div style={{
          background: "#0f0f18",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "40px 36px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #e8a84c, #c87c28)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(232,168,76,0.3)",
            }}>
              <Sparkles size={14} color="white" />
            </div>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 500,
              color: "#ede9e0",
            }}>
              Lumina
            </span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            fontWeight: 500,
            color: "#ede9e0",
            marginBottom: 6,
          }}>
            Welcome back
          </h1>
          <p style={{ color: "#6b6560", fontSize: 14, marginBottom: 28 }}>
            Sign in to continue
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#8a8278", marginBottom: 6, fontWeight: 500 }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  background: "#161622",
                  border: errors.email ? "1px solid #e85c5c" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  color: "#ede9e0",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "var(--font-body)",
                  transition: "border-color 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { if (!errors.email) e.target.style.borderColor = "rgba(232,168,76,0.5)"; }}
                onBlur={(e) => { if (!errors.email) e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
              />
              {errors.email && (
                <p style={{ color: "#e85c5c", fontSize: 12, marginTop: 4 }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#8a8278", marginBottom: 6, fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  background: "#161622",
                  border: errors.password ? "1px solid #e85c5c" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  color: "#ede9e0",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "var(--font-body)",
                  transition: "border-color 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { if (!errors.password) e.target.style.borderColor = "rgba(232,168,76,0.5)"; }}
                onBlur={(e) => { if (!errors.password) e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
              />
              {errors.password && (
                <p style={{ color: "#e85c5c", fontSize: 12, marginTop: 4 }}>{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: 4,
                background: isLoading ? "rgba(232,168,76,0.4)" : "linear-gradient(135deg, #e8a84c 0%, #d4863e 100%)",
                border: "none",
                borderRadius: 8,
                color: "#0a0a0f",
                fontWeight: 600,
                fontSize: 14,
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)",
                boxShadow: "0 4px 16px rgba(232,168,76,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isLoading ? (
                <>
                  <span style={{
                    width: 14, height: 14, border: "2px solid rgba(10,10,15,0.3)",
                    borderTopColor: "#0a0a0f", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite", display: "inline-block",
                  }} />
                  Signing in...
                </>
              ) : "Sign in"}
            </motion.button>
          </form>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#6b6560" }}>
          No account?{" "}
          <Link href="/register" style={{ color: "#e8a84c", textDecoration: "none" }}>
            Create one →
          </Link>
        </p>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #4a4642; }
      `}</style>
    </div>
  );
}
