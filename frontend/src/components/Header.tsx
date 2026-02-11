"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:text-orange-400 transition-colors">
            FlyDeals
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-200 hover:text-white text-sm font-medium transition-colors"
            >
              Latest Deals
            </Link>
            <Link
              href="/admin/login"
              className="text-gray-200 hover:text-white text-sm font-medium transition-colors"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 text-gray-200 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="sm:hidden mt-3 pt-3 border-t border-white/10 animate-slide-down">
            <div className="flex flex-col gap-3 pb-1">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="text-gray-200 hover:text-white text-sm font-medium transition-colors py-1"
              >
                Latest Deals
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="text-gray-200 hover:text-white text-sm font-medium transition-colors py-1"
              >
                Admin
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
