"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flag,
  Handshake,
  Home,
  Inbox,
  Layers,
  ListChecks,
  LogOut,
  Megaphone,
  ScrollText,
  ShieldCheck,
  UserRoundPen,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/users", label: "Users", icon: Users },
  {
    href: "/admin/identity-verifications",
    label: "Identity Verification",
    icon: ShieldCheck,
  },
  {
    href: "/admin/settings/deal-reputation",
    label: "Deal Reputation",
    icon: ListChecks,
  },
  { href: "/admin/name-change-requests", label: "Name Changes", icon: UserRoundPen },
  { href: "/admin/listings", label: "Listings", icon: ListChecks },
  { href: "/admin/deals", label: "Deals", icon: Handshake },
  { href: "/admin/audit", label: "Audit", icon: ScrollText },
  { href: "/admin/broadcasts", label: "Broadcasts", icon: Megaphone },
  { href: "/admin/platforms", label: "Platforms", icon: Layers },
  {
    href: "/admin/platform-requests",
    label: "Platform Requests",
    icon: Inbox,
  },
];

interface AdminNavProps {
  adminName: string;
  adminEmail: string;
  // Optional close handler invoked when a nav item is tapped while
  // inside the mobile drawer — lets the parent close the drawer.
  onItemClick?: () => void;
}

export function AdminNav({ adminName, adminEmail, onItemClick }: AdminNavProps) {
  const pathname = usePathname();
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <>
      <nav className="w-full md:w-56 md:border-r md:border-line bg-cream-card flex flex-col h-full">
        <div className="px-4 py-6 border-b border-line">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 font-medium">
            Bantle admin
          </p>
        </div>
        <ul className="px-2 py-3 space-y-1 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-button",
                    "text-sm font-medium transition-colors",
                    active
                      ? "bg-teal-900 text-cream"
                      : "text-ink hover:bg-teal-50",
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-line p-3">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-ink truncate">
              {adminName}
            </p>
            <p className="text-xs text-ink-muted truncate">{adminEmail}</p>
          </div>
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-button",
              "text-sm font-medium text-ink",
              "hover:bg-red-50 hover:text-red-900",
              "transition-colors",
            )}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </nav>
      <LogoutConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
      />
    </>
  );
}
