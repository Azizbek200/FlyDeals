"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DealCard from "@/components/DealCard";
import ScrollReveal from "@/components/ScrollReveal";
import SearchFilterBar from "@/components/SearchFilterBar";
import NewsletterForm from "@/components/NewsletterForm";
import { Deal, DealFilters, getPublicDeals } from "@/lib/api";

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<DealFilters>({});
  const limit = 12;

  // Extract unique cities & tags from loaded deals for filter dropdowns
  const [allDepartures, setAllDepartures] = useState<string[]>([]);
  const [allDestinations, setAllDestinations] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchDeals = useCallback(async (p: number, currentFilters: DealFilters, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await getPublicDeals(p, limit, currentFilters);
      if (append) {
        setDeals(prev => [...prev, ...data.deals]);
      } else {
        setDeals(data.deals);
      }
      setTotal(data.total);
      setError("");
    } catch {
      setError("Unable to load deals. Please try again later.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load + load all deals to extract filter options
  useEffect(() => {
    fetchDeals(1, {});
    // Fetch a large batch just for filter options
    getPublicDeals(1, 200).then(data => {
      const deps = [...new Set(data.deals.map(d => d.departure_city))].sort();
      const dests = [...new Set(data.deals.map(d => d.destination_city))].sort();
      const tags = [...new Set(data.deals.flatMap(d => d.tags || []))].sort();
      setAllDepartures(deps);
      setAllDestinations(dests);
      setAllTags(tags);
    }).catch(() => { });
  }, [fetchDeals]);

  const handleFilterChange = useCallback((newFilters: DealFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchDeals(1, newFilters);
  }, [fetchDeals]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDeals(nextPage, filters, true);
  };

  const hasMore = deals.length < total;

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-900 text-white py-16 sm:py-24">
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

        {/* Deals Section */}
        <section id="deals" className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Latest Deals</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1">The freshest flight deals, hand-picked for you</p>
          </div>

          <SearchFilterBar
            onFilterChange={handleFilterChange}
            departureCities={allDepartures}
            destinationCities={allDestinations}
            availableTags={allTags}
          />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 sm:px-6 py-4 rounded-lg text-sm mb-8 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 sm:py-24">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Loading deals...</p>
            </div>
          ) : deals.length === 0 && !error ? (
            <div className="text-center py-16 sm:py-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              <p className="text-gray-400 dark:text-gray-500 text-base">No deals match your criteria. Try adjusting your filters!</p>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {deals.map((deal, index) => (
                  <ScrollReveal key={deal.id} delay={index < 12 ? index * 80 : 0}>
                    <DealCard deal={deal} />
                  </ScrollReveal>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Deals
                        <span className="text-gray-400 text-xs">({deals.length} of {total})</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Newsletter CTA */}
              <div className="mt-10 sm:mt-14">
                <NewsletterForm />
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
