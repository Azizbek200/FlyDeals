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
        <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-5 leading-tight animate-fade-in-up">
              Find Amazing Flight Deals
            </h1>
            <p className="text-gray-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-in-up-delay-1">
              Handpicked cheap flights and error fares to destinations around the world.
              Save hundreds on your next trip!
            </p>
            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-3 sm:gap-4 flex-wrap animate-fade-in-up-delay-2">
              <div className="flex items-center gap-2 bg-white/10 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-orange-400">🔥</span>
                <span className="text-xs sm:text-sm">Updated Daily</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-orange-400">💰</span>
                <span className="text-xs sm:text-sm">Best Prices</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-orange-400">🌍</span>
                <span className="text-xs sm:text-sm">Worldwide</span>
              </div>
            </div>
          </div>
        </section>

        {/* Deals Section */}
        <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Latest Flight Deals</h2>
            <p className="text-gray-600 text-sm sm:text-base">Check out our newest and hottest deals</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 sm:px-6 py-4 rounded-lg text-sm mb-8 border border-red-200">
              {error}
            </div>
          )}

          {deals.length === 0 && !error ? (
            <div className="text-center py-16 sm:py-20 bg-white rounded-xl shadow-sm">
              <div className="text-5xl sm:text-6xl mb-4">✈️</div>
              <p className="text-gray-500 text-base sm:text-lg">No deals available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-6">
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
