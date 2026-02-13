"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import DealCard from "@/components/DealCard";
import SearchFilterBar from "@/components/SearchFilterBar";
import { Deal, DealFilters, getPublicDeals } from "@/lib/api";

const NewsletterForm = dynamic(() => import("@/components/NewsletterForm"), {
  ssr: false,
});

interface DealsSectionProps {
  initialDeals: Deal[];
  initialTotal: number;
  departureCities: string[];
  destinationCities: string[];
  availableTags: string[];
}

export default function DealsSection({
  initialDeals,
  initialTotal,
  departureCities,
  destinationCities,
  availableTags,
}: DealsSectionProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<DealFilters>({});
  const [isFiltered, setIsFiltered] = useState(false);
  const limit = 12;

  const fetchDeals = useCallback(
    async (p: number, currentFilters: DealFilters, append = false) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      try {
        const data = await getPublicDeals(p, limit, currentFilters);
        if (append) {
          setDeals((prev) => [...prev, ...data.deals]);
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
    },
    []
  );

  const handleFilterChange = useCallback(
    (newFilters: DealFilters) => {
      setFilters(newFilters);
      setPage(1);
      setIsFiltered(true);
      fetchDeals(1, newFilters);
    },
    [fetchDeals]
  );

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDeals(nextPage, filters, true);
  };

  const hasMore = deals.length < total;
  const showLoading = loading && isFiltered;

  return (
    <section id="deals" className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Latest Deals
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1">
          The freshest flight deals, hand-picked for you
        </p>
      </div>

      <SearchFilterBar
        onFilterChange={handleFilterChange}
        departureCities={departureCities}
        destinationCities={destinationCities}
        availableTags={availableTags}
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 sm:px-6 py-4 rounded-lg text-sm mb-8 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {showLoading ? (
        <div className="text-center py-16 sm:py-24">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading deals...</p>
        </div>
      ) : deals.length === 0 && !error ? (
        <div className="text-center py-16 sm:py-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <svg
            className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
          <p className="text-gray-400 dark:text-gray-500 text-base">
            No deals match your criteria. Try adjusting your filters!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>

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
                    <span className="text-gray-400 text-xs">
                      ({deals.length} of {total})
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="mt-10 sm:mt-14">
            <NewsletterForm />
          </div>
        </>
      )}
    </section>
  );
}
