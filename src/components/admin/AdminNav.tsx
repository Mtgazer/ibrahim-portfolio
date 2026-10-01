"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "OVERVIEW", href: "/admin", exact: true },
    { label: "PROJECTS", href: "/admin/projects", exact: false },
    { label: "FIELD NOTES", href: "/admin/field-notes", exact: false },
    { label: "PROFILE / SETTINGS", href: "/admin/settings", exact: false },
  ];

  return (
    <nav className="flex items-center gap-1 sm:gap-2 flex-wrap" aria-label="Admin Navigation">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`font-mono text-xs px-2.5 sm:px-3 py-1.5 uppercase tracking-wider transition-colors border rounded-[6px] ${
              isActive
                ? "bg-[#E5B842] text-[#0C0C0C] border-[#E5B842] font-semibold"
                : "text-[#9E9E9E] hover:text-[#F3F3F3] border-[#222222] hover:border-[#E5B842]/40"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
