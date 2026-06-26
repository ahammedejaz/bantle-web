import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { AdminToastProvider } from "@/components/admin/AdminToastProvider";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminMobileHeader } from "@/components/admin/AdminMobileHeader";
import { AdminIdleTimeout } from "@/components/admin/AdminIdleTimeout";
import { createServiceRoleSupabase } from "@/lib/admin-supabase-server";

export const metadata = {
  title: "Bantle admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Identity fetch happens at the layout level so every admin page
  // gets the name + email in nav without re-fetching. Middleware
  // already gated admin status — this is just to populate the UI.
  //
  // Exception: /admin/login renders this layout too, but the user
  // may not be authenticated yet. Handle that gracefully.
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
  } = await userClient.auth.getUser();

  // If no user, render bare layout (the login page will show through
  // children). This handles the /admin/login render path.
  if (!user) {
    return (
      <AdminToastProvider>
        <div className="min-h-screen bg-cream">{children}</div>
      </AdminToastProvider>
    );
  }

  // Fetch the admin's profile via service role (bypasses RLS).
  const serviceClient = createServiceRoleSupabase();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("display_name, email, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  // If somehow not admin, middleware should have caught it.
  // Defensive redirect in case middleware was bypassed.
  if (!profile?.is_admin) {
    redirect("/");
  }

  const adminName = profile.display_name ?? "Admin";
  const adminEmail = profile.email ?? user.email ?? "";

  return (
    <AdminToastProvider>
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
    </AdminToastProvider>
  );
}
