interface BadgeProps {
  variant?: "default" | "success" | "danger" | "warning" | "info";
  children: React.ReactNode;
}

const STYLES: Record<string, { background: string; color: string }> = {
  default:  { background: "#f4f4f5", color: "#52525b" },
  success:  { background: "rgba(21,128,61,0.12)", color: "#15803d" },
  danger:   { background: "rgba(185,28,28,0.12)", color: "#b91c1c" },
  warning:  { background: "rgba(0,0,0,0.07)", color: "#0a0a0a" },
  info:     { background: "rgba(0,0,0,0.07)", color: "#52525b" },
};

export default function Badge({ variant = "default", children }: BadgeProps) {
  const s = STYLES[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 99,
      fontSize: 10, fontWeight: 600,
      background: s.background, color: s.color,
      flexShrink: 0,
    }}>
      {children}
    </span>
  );
}
