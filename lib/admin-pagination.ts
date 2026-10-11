/** Reject malformed or unbounded offsets before they reach PostgREST. */
export function adminPagination(params: URLSearchParams, defaultSize = 20, maxSize = 50) {
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("page_size") ?? String(defaultSize));
  if (!Number.isSafeInteger(page) || page < 1 || page > 100_000 ||
      !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > maxSize) return null;
  return { page, pageSize, offset: (page - 1) * pageSize };
}
