// GET /admin/api/deals/[id] — deal detail for admin review.

import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

type ProfileSummary = {
  id: string;
  display_name: string | null;
  email: string | null;
  deleted_at: string | null;
  banned_until: string | null;
  permanently_banned: boolean | null;
  is_admin?: boolean | null;
};

type ListingSummary = {
  id: string;
  user_id: string | null;
  title: string | null;
  platform: string | null;
  category: string | null;
  listing_type?: string | null;
  monthly_price: number | null;
  status: string | null;
  archived_at: string | null;
  closed_at?: string | null;
};

type DealTermsSnapshot = {
  terms_type: string | null;
  price_amount: number | null;
  price_period: string | null;
  duration_months: number | null;
  access_duration_months: number | null;
  access_type: string | null;
  access_notes_snapshot: string | null;
};

type DealDetail = {
  id: string;
  listing_id: string;
  host_id: string | null;
  buyer_id: string | null;
  conversation_id: string | null;
  status: string | null;
  agreed_price: number;
  duration_months: number | null;
  started_at: string | null;
  ends_at: string | null;
  terminated_at: string | null;
  terminated_by: string | null;
  termination_reason: string | null;
  termination_source: string | null;
  created_at: string | null;
  listing: ListingSummary | ListingSummary[] | null;
  terms_snapshot: DealTermsSnapshot | DealTermsSnapshot[] | null;
  host: ProfileSummary | ProfileSummary[] | null;
  buyer: ProfileSummary | ProfileSummary[] | null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const { id } = await params;
  const dealId = id;

  const { data, error } = await supabase
    .from("deals")
    .select(
      `id,listing_id,host_id,buyer_id,conversation_id,status,agreed_price,duration_months,started_at,ends_at,terminated_at,terminated_by,termination_reason,termination_source,created_at,
       listing:listings!deals_listing_id_fkey(id,user_id,title,platform,category,listing_type,monthly_price,status,archived_at,closed_at),
       terms_snapshot:deal_terms_snapshots(terms_type,price_amount,price_period,duration_months,access_duration_months,access_type,access_notes_snapshot),
       host:profiles!deals_host_id_fkey(id,display_name,email,deleted_at,banned_until,permanently_banned,is_admin),
       buyer:profiles!deals_buyer_id_fkey(id,display_name,email,deleted_at,banned_until,permanently_banned,is_admin)`,
    )
    .eq("id", dealId)
    .maybeSingle();

  if (error) {
    console.error("[admin deal detail]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const deal = normalizeDeal(data as unknown as DealDetail);
  const [conversation, recentMessages, ratings, auditEntries, disclaimers] =
    await Promise.all([
      deal.conversation_id
        ? getConversation(supabase, deal.conversation_id)
        : null,
      deal.conversation_id
        ? getRecentMessages(supabase, deal.conversation_id)
        : [],
      getRatings(supabase, deal.id),
      getAuditEntries(supabase, deal.id),
      getDisclaimerAcceptances(supabase, deal.id),
    ]);

  return NextResponse.json({
    deal,
    listing: deal.listing,
    host: deal.host,
    buyer: deal.buyer,
    conversation,
    recent_messages: recentMessages,
    ratings,
    audit_entries: auditEntries,
    disclaimer_acceptances: disclaimers,
  });
}

async function getConversation(
  supabase: SupabaseClient,
  conversationId: string,
) {
  const { data, error } = await supabase
    .from("conversations")
    .select("id,listing_id,host_id,buyer_id,created_at,last_message_at")
    .eq("id", conversationId)
    .maybeSingle();
  if (error) {
    console.warn("[admin deal detail] conversation failed:", error.message);
    return null;
  }
  return data ?? null;
}

async function getRecentMessages(
  supabase: SupabaseClient,
  conversationId: string,
) {
  const { data, error } = await supabase
    .from("messages")
    .select("id,conversation_id,sender_id,kind,text,deal_id,read_at,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) {
    console.warn("[admin deal detail] messages failed:", error.message);
    return [];
  }
  return data ?? [];
}

async function getRatings(supabase: SupabaseClient, dealId: string) {
  const { data, error } = await supabase
    .from("ratings")
    .select("id,deal_id,rater_id,rated_id,stars,comment,milestone,created_at")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[admin deal detail] ratings failed:", error.message);
    return [];
  }
  return data ?? [];
}

async function getAuditEntries(supabase: SupabaseClient, dealId: string) {
  const { data, error } = await supabase
    .from("admin_actions")
    .select(
      "id,admin_id,action_type,target_user_id,target_resource_id,target_resource_type,reason,payload,created_at",
    )
    .eq("target_resource_id", dealId)
    .eq("target_resource_type", "deal")
    .order("created_at", { ascending: false })
    .limit(25);
  if (error) {
    console.warn("[admin deal detail] audit failed:", error.message);
    return [];
  }
  return data ?? [];
}

async function getDisclaimerAcceptances(
  supabase: SupabaseClient,
  dealId: string,
) {
  const { data, error } = await supabase
    .from("deal_disclaimer_acceptances")
    .select(
      "id,user_id,deal_id,listing_id,action,disclaimer_version,listing_type_snapshot,deal_type_snapshot,accepted_at",
    )
    .eq("deal_id", dealId)
    .order("accepted_at", { ascending: true });
  if (error) {
    console.warn(
      "[admin deal detail] disclaimer acceptances failed:",
      error.message,
    );
    return [];
  }
  return data ?? [];
}

function normalizeDeal(row: DealDetail) {
  return {
    ...row,
    listing: Array.isArray(row.listing)
      ? (row.listing[0] ?? null)
      : row.listing,
    terms_snapshot: Array.isArray(row.terms_snapshot)
      ? (row.terms_snapshot[0] ?? null)
      : row.terms_snapshot,
    host: Array.isArray(row.host) ? (row.host[0] ?? null) : row.host,
    buyer: Array.isArray(row.buyer) ? (row.buyer[0] ?? null) : row.buyer,
  };
}
