"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "accent" | "success" | "danger";
}

const COLORS = { accent: "#e8a84c", success: "#4caf7d", danger: "#e85c5c" };

export default function ProgressBar({ value, max = 100, color = "accent" }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ height: 3, background: "#161622", borderRadius: 99, overflow: "hidden" }}>
      <motion.div
        style={{ height: "100%", background: COLORS[color], borderRadius: 99 }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}
