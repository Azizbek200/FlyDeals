"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearToken } from "@/lib/api";

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/deals", label: "Deals" },
    { href: "/admin/new", label: "New Deal" },
    { href: "/admin/analytics", label: "Analytics" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/deals" className="text-lg font-bold text-gray-900">
            Admin
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${pathname === link.href
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← Site
          </Link>
          <button
            onClick={() => {
              clearToken();
              window.location.href = "/admin/login";
            }}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
