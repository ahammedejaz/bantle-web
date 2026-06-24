type NameChangeAdminError = {
  status: number;
  message: string;
};

const NAME_CHANGE_ADMIN_ERRORS: Record<string, NameChangeAdminError> = {
  NAME_CHANGE_NOT_FOUND: {
    status: 404,
    message: "Name-change request not found.",
  },
  NAME_CHANGE_ACTION_FORBIDDEN: {
    status: 403,
    message: "You can't perform this action on this name-change request.",
  },
  NAME_CHANGE_LIMIT_REACHED: {
    status: 409,
    message: "This user has reached the limit of 2 approved name changes in 365 days.",
  },
  NAME_CHANGE_INVALID_STATUS: {
    status: 409,
    message: "Name-change request is not pending.",
  },
  NAME_CHANGE_INVALID: {
    status: 400,
    message: "Requested display name is invalid.",
  },
  NAME_CHANGE_UNCHANGED: {
    status: 400,
    message: "Requested display name is unchanged.",
  },
};

function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    return [record.message, record.details, record.hint]
      .filter((value): value is string => typeof value === "string")
      .join(" ");
  }
  return "";
}

function markerPattern(marker: string): RegExp {
  return new RegExp(`(^|[^A-Z0-9_])${marker}([^A-Z0-9_]|$)`, "i");
}

export function getNameChangeAdminError(
  error: unknown,
): NameChangeAdminError | null {
  const text = errorText(error);
  for (const [marker, mapped] of Object.entries(NAME_CHANGE_ADMIN_ERRORS)) {
    if (markerPattern(marker).test(text)) return mapped;
  }
  return null;
}
