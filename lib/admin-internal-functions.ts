const INTERNAL_FUNCTION_SECRET_ENV = "BANTLE_INTERNAL_FUNCTION_SECRET";
const INTERNAL_FUNCTION_SECRET_HEADER = "x-bantle-internal-secret";

export function getInternalFunctionHeaders(): Record<string, string> {
  const secret = process.env[INTERNAL_FUNCTION_SECRET_ENV]?.trim();
  if (!secret) {
    throw new Error(`${INTERNAL_FUNCTION_SECRET_ENV} is not configured.`);
  }

  return { [INTERNAL_FUNCTION_SECRET_HEADER]: secret };
}

export function internalFunctionConfigError(error: unknown): string {
  void error;
  return "Internal dispatcher is not configured.";
}
