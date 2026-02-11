"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 text-white transition-shadow duration-300 ${
        scrolled ? "glass shadow-lg" : "bg-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight hover:text-orange-400 transition-colors">
          FlyDeals
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-8">
          <Link href="/" className="nav-link text-gray-200 hover:text-white text-sm font-medium transition-colors">
            Deals
          </Link>
          <Link href="/admin/login" className="nav-link text-gray-200 hover:text-white text-sm font-medium transition-colors">
            Admin
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 text-gray-200 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 top-16 bg-black/40 sm:hidden z-40" onClick={() => setMenuOpen(false)} />
          <nav className="sm:hidden absolute left-0 right-0 top-16 glass border-t border-white/10 animate-slide-down z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="text-gray-200 hover:text-white text-sm font-medium py-2 px-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                Deals
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="text-gray-200 hover:text-white text-sm font-medium py-2 px-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                Admin
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
