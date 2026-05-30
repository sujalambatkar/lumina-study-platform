"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { isInitialized, user, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only run initialize if not already done (e.g. fresh page load, not post-login)
    if (!isInitialized) {
      initialize();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
  }, [isInitialized, user, router]);

  if (!isInitialized) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "100dvh", background: "#0a0a0f", gap: 16,
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #e8a84c, #c87c28)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Sparkles size={18} color="white" />
        </motion.div>
        <div style={{ display: "flex", gap: 5 }}>
          {[0, 0.15, 0.3].map((d) => (
            <motion.span
              key={d}
              style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8a84c", display: "inline-block" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, delay: d, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
