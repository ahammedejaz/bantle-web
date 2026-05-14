"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flag, Users, Layers, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/platforms", label: "Platforms", icon: Layers },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-56 border-r border-line bg-cream-card min-h-screen">
      <div className="px-4 py-6">
        <p className="text-xs uppercase tracking-[0.14em] text-teal-600 font-medium">
          Bantle admin
        </p>
      </div>
      <ul className="px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-button",
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
    </nav>
  );
}
