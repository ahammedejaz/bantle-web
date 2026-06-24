export type ManualVerificationStatus =
  | "none"
  | "approved"
  | "revoked"
  | "expired";

type ManualVerificationState = {
  manual_verification_status: ManualVerificationStatus;
  manual_verification_expires_at: string | null;
};

export function isManualVerificationActive(
  state: ManualVerificationState,
  nowMs: number = Date.now(),
): boolean {
  if (state.manual_verification_status !== "approved") return false;
  if (!state.manual_verification_expires_at) return true;

  const expiresAtMs = Date.parse(state.manual_verification_expires_at);
  return Number.isFinite(expiresAtMs) && expiresAtMs > nowMs;
}

export function getEffectiveManualVerificationStatus(
  state: ManualVerificationState,
  nowMs: number = Date.now(),
): ManualVerificationStatus {
  if (
    state.manual_verification_status === "approved" &&
    !isManualVerificationActive(state, nowMs)
  ) {
    return "expired";
  }
  return state.manual_verification_status;
}
