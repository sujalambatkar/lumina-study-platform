interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const SIZES = { sm: 16, md: 24, lg: 32 };

export default function Spinner({ size = "md" }: SpinnerProps) {
  const px = SIZES[size];
  return (
    <div style={{
      width: px, height: px,
      border: "2px solid rgba(255,255,255,0.08)",
      borderTopColor: "#e8a84c",
      borderRadius: "50%",
      animation: "lumina-spin 0.7s linear infinite",
      display: "inline-block",
      flexShrink: 0,
    }}>
      <style>{`@keyframes lumina-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
