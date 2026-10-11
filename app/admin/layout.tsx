import { AdminToastProvider } from "@/components/admin/AdminToastProvider";
export const metadata = { title: "Bantle admin", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminToastProvider><div className="min-h-screen bg-cream">{children}</div></AdminToastProvider>;
}
