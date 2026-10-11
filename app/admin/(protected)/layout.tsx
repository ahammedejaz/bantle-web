import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isActiveAdmin, hasAdminAssurance } from "@/lib/admin-access";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminMobileHeader } from "@/components/admin/AdminMobileHeader";
import { AdminIdleTimeout } from "@/components/admin/AdminIdleTimeout";


export const metadata = {
  title: "Bantle admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect page rendering independently of the proxy.
  const cookieStore = await cookies();
  const userClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op: Server Component, cannot mutate cookies here.
        },
      },
    },
  );

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) redirect("/admin/login");
  const { data: profile } = await userClient
    .from("profiles")
    .select("display_name,email,is_admin,deleted_at,permanently_banned,banned_until")
    .eq("id", user.id)
    .maybeSingle();
  if (!isActiveAdmin(profile)) redirect("/");
  if (!(await hasAdminAssurance(userClient))) redirect("/admin/mfa");

  const adminName = profile!.display_name ?? "Admin";
  const adminEmail = profile!.email ?? user.email ?? "";

  return (
    <>
      <AdminIdleTimeout />
      <div className="min-h-screen bg-cream md:flex">
        {/* Desktop sidebar — hidden on mobile, visible on md+ */}
        <aside className="hidden md:block md:w-56 md:shrink-0">
          <div className="sticky top-0 h-screen">
            <AdminNav adminName={adminName} adminEmail={adminEmail} />
          </div>
        </aside>
        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminMobileHeader
            adminName={adminName}
            adminEmail={adminEmail}
          />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </>
  );
}
