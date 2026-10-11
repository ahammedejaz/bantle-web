import { Suspense } from "react";
import { UserDetailClient } from "./UserDetailClient";

export const metadata = {
  title: "User detail — Bantle admin",
  robots: { index: false, follow: false },
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
      <Suspense
        fallback={<div className="text-ink-muted">Loading user&hellip;</div>}
      >
        <UserDetailClient userId={id} />
      </Suspense>
    </div>
  );
}
