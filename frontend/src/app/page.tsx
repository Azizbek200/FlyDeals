import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DealCard from "@/components/DealCard";
import ScrollReveal from "@/components/ScrollReveal";
import { Deal, getPublicDeals } from "@/lib/api";

export default async function HomePage() {
  let deals: Deal[] = [];
  let error = "";

  try {
    const data = await getPublicDeals(1, 30);
    deals = data.deals;
  } catch {
    error = "Unable to load deals. Please try again later.";
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-900 text-white py-16 sm:py-24">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(249,115,22,0.08),_transparent_60%)]" />

          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-4 animate-fade-in-up">
              Fly more for less
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-5 leading-[1.1] tracking-tight animate-fade-in-up">
              Flight deals you won&apos;t<br className="hidden sm:block" /> find anywhere else
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed animate-fade-in-up-delay-1">
              We scan hundreds of sources daily to find mistake fares, sales, and hidden deals — so you save hundreds on every trip.
            </p>

            <div className="mt-8 sm:mt-10 flex items-center justify-center gap-3 sm:gap-5 flex-wrap animate-fade-in-up-delay-2">
              {/* SVG icons instead of emojis */}
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm">Updated daily</span>
              </div>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-xs sm:text-sm">Best prices guaranteed</span>
              </div>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm">Worldwide destinations</span>
              </div>
            </div>

            <div className="mt-8 animate-fade-in-up-delay-2">
              <a
                href="#deals"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-orange-500/25 text-sm"
              >
                Browse Deals
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Deals Section */}
        <section id="deals" className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
          <div className="mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Latest Deals</h2>
            <p className="text-gray-500 text-sm sm:text-base mt-1">The freshest flight deals, hand-picked for you</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 sm:px-6 py-4 rounded-lg text-sm mb-8 border border-red-200">
              {error}
            </div>
          )}

          {deals.length === 0 && !error ? (
            <div className="text-center py-16 sm:py-24 bg-white rounded-2xl border border-gray-200">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              <p className="text-gray-400 text-base">No deals available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-5">
              {deals.map((deal, index) => (
                <ScrollReveal key={deal.id} delay={index * 80}>
                  <DealCard deal={deal} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
