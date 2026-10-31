"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius)] transition-all select-none disabled:opacity-40 disabled:cursor-not-allowed";

    const variants: Record<string, string> = {
      primary: "text-[#ffffff]",
      ghost: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
      danger: "text-[var(--danger)] border border-[rgba(185,28,28,0.3)] hover:bg-[rgba(185,28,28,0.08)]",
      outline: "text-[var(--text-primary)] border border-[var(--border-strong)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)]",
    };

    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-3 text-sm",
    };

    const primaryStyle =
      variant === "primary"
        ? {
            background: "linear-gradient(135deg, #0a0a0a 0%, #262626 100%)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          }
        : {};

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        className={cn(base, variants[variant], sizes[size], className)}
        style={primaryStyle}
        disabled={disabled || loading}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {loading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
