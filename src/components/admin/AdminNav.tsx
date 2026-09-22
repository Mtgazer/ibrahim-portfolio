"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "DASHBOARD", href: "/admin", exact: true },
    { label: "PROJECTS", href: "/admin/projects", exact: false },
    { label: "+ NEW PROJECT", href: "/admin/projects/new", exact: true },
  ];

  return (
    <nav className="flex items-center gap-1 sm:gap-2" aria-label="Admin Navigation">
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin/projects/new"
            ? pathname === "/admin/projects/new"
            : item.exact
            ? pathname === item.href
            : pathname === "/admin/projects" ||
              (pathname.startsWith("/admin/projects/") &&
                pathname !== "/admin/projects/new");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`font-mono text-xs px-3 py-1.5 uppercase tracking-wider transition-colors border ${
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
