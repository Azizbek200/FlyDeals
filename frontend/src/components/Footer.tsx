import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-white text-xl font-bold tracking-tight">
              FlyDeals
            </Link>
            <p className="mt-3 text-sm leading-relaxed max-w-xs">
              Handpicked flight deals and error fares delivered to you. We scan hundreds of sources so you don&apos;t have to.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors">
                  Latest Deals
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-sm hover:text-white transition-colors">
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:azizbekmj@yahoo.com" className="text-sm hover:text-white transition-colors">
                  azizbekmj@yahoo.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Follow</h3>
            <div className="flex gap-3">
              <a
                href="https://x.com/Just_Azizbek"
                aria-label="Twitter"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/just_az1zbek/"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center sm:text-left">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} FlyDeals. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
