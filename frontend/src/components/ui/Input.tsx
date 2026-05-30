"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-[var(--radius)] text-sm outline-none transition-all",
            "placeholder:text-[var(--text-muted)]",
            className
          )}
          style={{
            background: "var(--bg-elevated)",
            border: error ? "1px solid var(--danger)" : "1px solid var(--border-strong)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = error ? "var(--danger)" : "var(--accent)";
            (e.currentTarget as HTMLElement).style.boxShadow = error
              ? "0 0 0 3px rgba(232,92,92,0.1)"
              : "0 0 0 3px rgba(232,168,76,0.08)";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = error ? "var(--danger)" : "var(--border-strong)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
          {...props}
        />
        {error && (
          <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
