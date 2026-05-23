"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const SENSITIVE_KEY_RE = /token|secret|key|password|authorization|private/i;

export function AuditPayloadViewer({ payload }: { payload: unknown }) {
  const [open, setOpen] = useState(false);
  const displayValue = useMemo(() => stringifyPayload(payload), [payload]);
  const hasPayload = !isEmptyPayload(payload);

  if (!hasPayload) return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {open ? "Hide payload" : "Show payload"}
      </button>
      {open ? (
        <pre className="mt-2 max-h-72 overflow-auto rounded-button border border-line bg-cream p-3 text-[11px] leading-relaxed text-ink-muted">
          {displayValue}
        </pre>
      ) : null}
    </div>
  );
}

function stringifyPayload(payload: unknown): string {
  try {
    return JSON.stringify(redactForDisplay(payload), null, 2) ?? "null";
  } catch {
    return String(payload);
  }
}

function isEmptyPayload(payload: unknown): boolean {
  if (payload == null) return true;
  if (Array.isArray(payload)) return payload.length === 0;
  if (typeof payload === "object") return Object.keys(payload).length === 0;
  return false;
}

function redactForDisplay(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactForDisplay(item));
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
      key,
      SENSITIVE_KEY_RE.test(key) ? "[redacted]" : redactForDisplay(nested),
    ]),
  );
}
