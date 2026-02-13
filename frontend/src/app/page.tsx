import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import DealsSection from "@/components/DealsSection";
import { getDealsServer, getFilterOptionsServer } from "@/lib/api";

// Revalidate every 5 minutes (ISR)
export const revalidate = 300;

export default async function HomePage() {
  const [dealsData, filterOptions] = await Promise.all([
    getDealsServer(1, 12),
    getFilterOptionsServer(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-900 text-white py-16 sm:py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(249,115,22,0.08),_transparent_60%)]" />

          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-4">
              Fly more for less
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-5 leading-[1.1] tracking-tight">
              Flight deals you won&apos;t
              <br className="hidden sm:block" /> find anywhere else
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              We scan hundreds of sources daily to find mistake fares, sales,
              and hidden deals — so you save hundreds on every trip.
            </p>

            <div className="mt-8 sm:mt-10 flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
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

            <NewsletterForm variant="hero" />
          </div>
        </section>

        {/* Deals - client component for interactivity */}
        <DealsSection
          initialDeals={dealsData.deals}
          initialTotal={dealsData.total}
          departureCities={filterOptions.departures}
          destinationCities={filterOptions.destinations}
          availableTags={filterOptions.tags}
        />
      </main>
      <Footer />
    </>
  );
}
