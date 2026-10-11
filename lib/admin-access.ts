import type { SupabaseClient } from "@supabase/supabase-js";

type AdminProfile = {
  is_admin?: boolean | null;
  deleted_at?: string | null;
  permanently_banned?: boolean | null;
  banned_until?: string | null;
};

export function isActiveAdmin(profile: AdminProfile | null | undefined): boolean {
  return Boolean(profile?.is_admin && profile.deleted_at === null &&
    !profile.permanently_banned &&
    (!profile.banned_until || new Date(profile.banned_until).getTime() <= Date.now()));
}

/** getClaims verifies the JWT signature; never trust user_metadata or a decoded cookie. */
export async function hasAdminAssurance(client: SupabaseClient): Promise<boolean> {
  const { data, error } = await client.auth.getClaims();
  return !error && data?.claims.aal === "aal2";
}
