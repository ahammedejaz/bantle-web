import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { hasAdminAssurance, isActiveAdmin } from "@/lib/admin-access";
import { MfaClient } from "./MfaClient";

export default async function MfaPage() {
  const cookieStore = await cookies();
  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect("/admin/login");
  const { data: profile } = await client.from("profiles")
    .select("is_admin,deleted_at,permanently_banned,banned_until").eq("id", user.id).maybeSingle();
  if (!isActiveAdmin(profile)) redirect("/");
  if (await hasAdminAssurance(client)) redirect("/admin");
  return <MfaClient />;
}
