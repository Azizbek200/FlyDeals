import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:text-orange-400 transition-colors">
            ✈️ FlyDeals
          </Link>
          <nav className="flex items-center gap-8">
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
        </div>
      </div>
    </header>
  );
}
