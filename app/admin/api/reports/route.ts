// GET /admin/api/reports — list user-filed reports with filters.
// Query params:
//   status: open | resolved | dismissed | all (default: open)
//   category: spam_scam | personal_info | ... | all (default: all)
//   page: 1-based page number (default: 1)
// Returns:
//   { reports: [...], total, page, page_size }

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { VALID_STATUS_FILTERS } from "@/components/admin/reportStatus";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const params = request.nextUrl.searchParams;
  const status = params.get("status") ?? "pending";
  const category = params.get("category") ?? "all";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));

  if (!VALID_STATUS_FILTERS.has(status)) {
    return NextResponse.json(
      { error: "Invalid status filter" },
      { status: 400 },
    );
  }

  let query = supabase
    .from("user_reports")
    .select(
      `id, category, details, conversation_id, message_id, created_at, status, resolved_at, resolution_action,
       reporter:profiles!user_reports_reporter_id_fkey(id, display_name, email),
       reported:profiles!user_reports_reported_id_fkey(id, display_name, email, banned_until, deleted_at)`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (status !== "all") {
    query = query.eq("status", status);
  }
  if (category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[admin reports list]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const reports = data ?? [];
  const reportIds = reports.map((report) => report.id);
  const evidenceCounts = new Map<string, number>();

  if (reportIds.length > 0) {
    const { data: attachments, error: attachmentsError } = await supabase
      .from("user_report_attachments")
      .select("report_id")
      .in("report_id", reportIds);

    if (attachmentsError) {
      console.error(
        "[admin reports list] evidence count failed:",
        attachmentsError.message,
      );
    } else {
      for (const attachment of attachments ?? []) {
        evidenceCounts.set(
          attachment.report_id,
          (evidenceCounts.get(attachment.report_id) ?? 0) + 1,
        );
      }
    }
  }

  return NextResponse.json({
    reports: reports.map((report) => ({
      ...report,
      evidence_count: evidenceCounts.get(report.id) ?? 0,
    })),
    total: count ?? 0,
    page,
    page_size: PAGE_SIZE,
  });
}
