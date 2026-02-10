"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/deals", label: "All Deals" },
    { href: "/admin/new", label: "New Deal" },
  ];

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/deals" className="text-lg font-bold">
            FlyDeals Admin
          </Link>
          <div className="flex gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-3 py-1 rounded ${
                  pathname === link.href
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-white"
        >
          View Site
        </Link>
      </div>
    </nav>
  );
}
