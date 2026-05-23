// GET /admin/api/broadcasts/preview — read-only broadcast audience count.

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getBroadcastPreview,
  parseAudienceType,
} from "@/lib/admin-broadcasts";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const audienceType = parseAudienceType(
    request.nextUrl.searchParams.get("audience_type"),
  );
  if (!audienceType) {
    return NextResponse.json(
      { error: "audience_type must be test_syed or all_eligible" },
      { status: 400 },
    );
  }

  try {
    const preview = await getBroadcastPreview(supabase, audienceType);
    return NextResponse.json(preview);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to preview audience.";
    console.error("[admin broadcasts preview]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
