import Sidebar from "@/components/layout/Sidebar";
import AuthInitializer from "@/components/layout/AuthInitializer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthInitializer>
      <div className="flex min-h-screen" style={{ background: "var(--bg-base)" }}>
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      </div>
    </AuthInitializer>
  );
}
