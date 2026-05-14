import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createServiceRoleSupabase } from "@/lib/admin-supabase-server";

export const metadata = {
  title: "Dashboard — Bantle admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const cookieStore = cookies();

  const userClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op: this is a Server Component, no response to mutate.
        },
      },
    },
  );

  const {
    data: { user },
  } = await userClient.auth.getUser();

  if (!user) redirect("/admin/login");

  const serviceClient = createServiceRoleSupabase();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("display_name, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) redirect("/");

  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
        Dashboard
      </p>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1]">
        Welcome, {profile.display_name ?? "admin"}.
      </h1>
      <p className="mt-5 text-lg text-ink-muted max-w-xl">
        Use the navigation on the left to manage reports, users, and
        platforms. Listings, deals, audit log, and broadcasts arrive
        in Phases 5&ndash;8.
      </p>
    </div>
  );
}
