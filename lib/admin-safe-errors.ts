import { NextResponse } from "next/server";

type SafeContext = Record<
  string,
  string | number | boolean | null | undefined
>;

type SafeErrorCode =
  | "db_error"
  | "dispatcher_error"
  | "network_error"
  | "config_error"
  | "validation_error"
  | "unknown_error";

export function createAdminCorrelationId(prefix = "admin"): string {
  const safePrefix = safeToken(prefix) ?? "admin";
  if (globalThis.crypto?.randomUUID) {
    return `${safePrefix}_${globalThis.crypto.randomUUID().slice(0, 8)}`;
  }
  return `${safePrefix}_${Math.random().toString(16).slice(2, 10)}`;
}

export function adminErrorResponse(
  message: string,
  status: number,
  options: { correlationId?: string; headers?: HeadersInit } = {},
): NextResponse {
  const correlationId =
    options.correlationId ?? createAdminCorrelationId("admin_error");
  return NextResponse.json(
    { error: message, correlation_id: correlationId },
    { status, headers: options.headers },
  );
}

export function safeAdminErrorLog(
  label: string,
  error: unknown,
  context: SafeContext = {},
): string {
  const correlationId =
    typeof context.correlation_id === "string"
      ? context.correlation_id
      : createAdminCorrelationId("admin_error");
  const safeLabel = safeToken(label) ?? "admin_error";
  const safeContext = sanitizeContext({
    ...context,
    correlation_id: correlationId,
  });

  console.error(`[${safeLabel}]`, {
    ...safeContext,
    error_code: safeAdminErrorCode(error),
    error_name: safeAdminErrorName(error),
  });

  return correlationId;
}

export function safeAdminWarning(code: string): string {
  return safeToken(code) ?? "admin_warning";
}

export function safeAdminSummary(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) =>
      typeof entry === "string" ? safeAdminWarning(entry) : "admin_warning",
    );
  }
  if (typeof value === "string") return [safeAdminWarning(value)];
  return [];
}

export function safeAdminErrorCode(error: unknown): SafeErrorCode {
  if (!error) return "unknown_error";
  if (error instanceof SyntaxError) return "validation_error";
  if (error instanceof TypeError) return "network_error";

  const record = isRecord(error) ? error : null;
  const name = safeAdminErrorName(error).toLowerCase();
  if (name.includes("config") || name.includes("env")) return "config_error";
  if (name.includes("function") || name.includes("dispatcher")) {
    return "dispatcher_error";
  }

  const code = typeof record?.code === "string" ? record.code : null;
  if (code) {
    if (/^(ECONN|ENOTFOUND|ETIMEDOUT|EAI_|UND_ERR)/i.test(code)) {
      return "network_error";
    }
    return "db_error";
  }

  const status = record?.status;
  if (typeof status === "number" && status >= 500) return "network_error";

  return "unknown_error";
}

function safeAdminErrorName(error: unknown): string {
  let candidate: unknown;
  if (isRecord(error) && typeof error.name === "string") {
    candidate = error.name;
  } else if (typeof error === "object" && error !== null) {
    candidate = (error as { constructor?: { name?: unknown } }).constructor
      ?.name;
  }

  if (typeof candidate !== "string") return "UnknownError";
  const trimmed = candidate.trim();
  if (/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(trimmed)) return trimmed;
  return "UnknownError";
}

function sanitizeContext(context: SafeContext): SafeContext {
  const safe: SafeContext = {};
  for (const [key, value] of Object.entries(context)) {
    if (value === undefined) continue;
    safe[key] = typeof value === "string" ? (safeToken(value) ?? "redacted") : value;
  }
  return safe;
}

function safeToken(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^[A-Za-z0-9_.:_-]{1,100}$/.test(trimmed)) return trimmed;
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
