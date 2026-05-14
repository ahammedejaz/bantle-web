import { AdminToastProvider } from "@/components/admin/AdminToastProvider";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = {
  title: "Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminToastProvider>
      <div className="flex min-h-screen bg-cream">
        <AdminNav />
        <main className="flex-1">{children}</main>
      </div>
    </AdminToastProvider>
  );
}
