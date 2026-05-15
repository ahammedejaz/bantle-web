"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserListingsTab } from "./UserListingsTab";
import { UserDealsTab } from "./UserDealsTab";
import { UserReportsTab } from "./UserReportsTab";
import { UserAuditTab } from "./UserAuditTab";

type TabKey = "listings" | "deals" | "reports" | "audit";

interface UserDetailTabsProps {
  userId: string;
  counts: {
    listings_total: number;
    deals_as_host: number;
    deals_as_buyer: number;
    reports_filed: number;
    reports_received: number;
  };
}

export function UserDetailTabs({ userId, counts }: UserDetailTabsProps) {
  const [active, setActive] = useState<TabKey>("listings");

  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: "listings", label: "Listings", count: counts.listings_total },
    {
      key: "deals",
      label: "Deals",
      count: counts.deals_as_host + counts.deals_as_buyer,
    },
    {
      key: "reports",
      label: "Reports",
      count: counts.reports_filed + counts.reports_received,
    },
    { key: "audit", label: "Audit log", count: 0 },
  ];

  return (
    <div className="mt-8">
      <div className="border-b border-line">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-teal-900 text-teal-900"
                    : "border-transparent text-ink-muted hover:text-ink",
                )}
              >
                {tab.label}
                {tab.count > 0 ? (
                  <span
                    className={cn(
                      "ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-button",
                      isActive
                        ? "bg-teal-900 text-cream"
                        : "bg-cream-card border border-line text-ink-muted",
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {active === "listings" ? <UserListingsTab userId={userId} /> : null}
        {active === "deals" ? <UserDealsTab userId={userId} /> : null}
        {active === "reports" ? <UserReportsTab userId={userId} /> : null}
        {active === "audit" ? <UserAuditTab userId={userId} /> : null}
      </div>
    </div>
  );
}
