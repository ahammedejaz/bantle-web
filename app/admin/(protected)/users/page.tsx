import { Suspense } from "react";
import { UsersListClient } from "./UsersListClient";

export const metadata = {
  title: "Users — Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
        Users
      </p>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1] mb-2">
        User management
      </h1>
      <p className="text-sm text-ink-muted mb-8">
        Search users by email, name, or UUID. View activity, apply bans, or
        restore accounts.
      </p>
      <Suspense
        fallback={<div className="text-ink-muted">Loading&hellip;</div>}
      >
        <UsersListClient />
      </Suspense>
    </div>
  );
}
