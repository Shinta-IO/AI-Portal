// app/dashboard/layout.tsx
import DashboardLayout from "@/components/Layout";

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
