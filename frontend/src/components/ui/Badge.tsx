interface BadgeProps {
  variant?: "default" | "success" | "danger" | "warning" | "info";
  children: React.ReactNode;
}

const STYLES: Record<string, { background: string; color: string }> = {
  default:  { background: "#161622", color: "#8a8278" },
  success:  { background: "rgba(76,175,125,0.12)", color: "#4caf7d" },
  danger:   { background: "rgba(232,92,92,0.12)", color: "#e85c5c" },
  warning:  { background: "rgba(232,168,76,0.12)", color: "#e8a84c" },
  info:     { background: "rgba(92,143,232,0.12)", color: "#5c8fe8" },
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
