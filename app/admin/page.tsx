import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createServiceRoleSupabase } from "@/lib/admin-supabase-server";
import {
  getDashboardMetrics,
  type DashboardData,
} from "@/lib/admin-dashboard-metrics";
import { DashboardClient } from "./DashboardClient";

export const metadata = {
  title: "Dashboard — Bantle admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
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

  // First paint carries the metrics; the client keeps its fetch path for the
  // Refresh button. If aggregation fails here, hand the client null and let
  // its own fetch/error/retry flow take over rather than failing the page.
  let initialData: DashboardData | null = null;
  try {
    initialData = await getDashboardMetrics(serviceClient);
  } catch (error) {
    console.error("[admin dashboard ssr]", error);
  }

  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-6xl mx-auto">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
        Dashboard
      </p>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1]">
        Welcome, {profile.display_name ?? "admin"}.
      </h1>
      <p className="mt-5 text-sm md:text-base text-ink-muted max-w-3xl">
        Use this dashboard to monitor Bantle operations across users, reports,
        listings, deals, platforms, audit logs, and incident broadcasts.
      </p>
      <div className="mt-8">
        <DashboardClient initialData={initialData} />
      </div>
    </div>
  );
}
