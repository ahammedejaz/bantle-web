// GET /admin/api/reports/[id] — single report detail.
// Returns the report with reporter + reported profiles, the
// conversation messages (if conversation_id present), and other
// open/recent reports against the same reported user.

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

interface ReportRowWithRelations {
  id: string;
  reported?: { id: string } | null;
  conversation_id?: string | null;
  [key: string]: unknown;
}

interface MessageRow {
  id: string;
  text: string;
  kind: string;
  created_at: string;
  sender_id: string | null;
  sender: { display_name: string | null } | null;
}

interface OtherReportRow {
  id: string;
  category: string;
  status: string;
  resolution_action: string | null;
  created_at: string;
}

interface ReportAttachmentRow {
  id: string;
  storage_bucket: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(_request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const { id } = await params;
  const reportId = id;

  const { data: report, error: reportError } = await supabase
    .from("user_reports")
    .select(
      `*,
       reporter:profiles!user_reports_reporter_id_fkey(id, display_name, email, created_at),
       reported:profiles!user_reports_reported_id_fkey(id, display_name, email, banned_until, banned_reason, deleted_at, created_at)`,
    )
    .eq("id", reportId)
    .maybeSingle();

  if (reportError || !report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const typedReport = report as ReportRowWithRelations;

  let conversationMessages: MessageRow[] = [];
  if (typedReport.conversation_id) {
    const { data: messages } = await supabase
      .from("messages")
      .select(
        `id, text, kind, created_at, sender_id,
         sender:profiles!messages_sender_id_fkey(display_name)`,
      )
      .eq("conversation_id", typedReport.conversation_id)
      .order("created_at", { ascending: true })
      .limit(100);
    conversationMessages = (messages as unknown as MessageRow[]) ?? [];
  }

  const reportedId = typedReport.reported?.id ?? null;
  let otherReports: OtherReportRow[] = [];
  if (reportedId) {
    const { data: others } = await supabase
      .from("user_reports")
      .select("id, category, status, resolution_action, created_at")
      .eq("reported_id", reportedId)
      .neq("id", reportId)
      .order("created_at", { ascending: false })
      .limit(20);
    otherReports = (others as OtherReportRow[]) ?? [];
  }

  const { data: attachmentRows, error: attachmentError } = await supabase
    .from("user_report_attachments")
    .select(
      "id, storage_bucket, storage_path, mime_type, size_bytes, width, height, created_at",
    )
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });

  if (attachmentError) {
    console.error(
      "[admin report detail] evidence metadata failed:",
      attachmentError.message,
    );
  }

  const attachments = await Promise.all(
    ((attachmentRows as ReportAttachmentRow[] | null) ?? []).map(async (row) => {
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from(row.storage_bucket)
          .createSignedUrl(row.storage_path, 15 * 60);

      if (signedUrlError) {
        console.warn(
          "[admin report detail] evidence signed URL failed:",
          row.id,
        );
      }

      return {
        id: row.id,
        mime_type: row.mime_type,
        size_bytes: row.size_bytes,
        width: row.width,
        height: row.height,
        created_at: row.created_at,
        signed_url: signedUrlData?.signedUrl ?? null,
        signed_url_expires_in_seconds: signedUrlData?.signedUrl
          ? 15 * 60
          : null,
      };
    }),
  );

  return NextResponse.json({
    report,
    conversation_messages: conversationMessages,
    other_reports_against_reported: otherReports,
    attachments,
  });
}
