"use client";

import { useState, useCallback, useEffect } from "react";
import { DealFilters } from "@/lib/api";

interface SearchFilterBarProps {
    onFilterChange: (filters: DealFilters) => void;
    departureCities: string[];
    destinationCities: string[];
    availableTags: string[];
}

export default function SearchFilterBar({
    onFilterChange,
    departureCities,
    destinationCities,
    availableTags,
}: SearchFilterBarProps) {
    const [search, setSearch] = useState("");
    const [departure, setDeparture] = useState("");
    const [destination, setDestination] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [tag, setTag] = useState("");
    const [sort, setSort] = useState<DealFilters["sort"]>("newest");
    const [expanded, setExpanded] = useState(false);

    const applyFilters = useCallback(() => {
        onFilterChange({
            q: search || undefined,
            departure: departure || undefined,
            destination: destination || undefined,
            min_price: minPrice ? parseInt(minPrice) : undefined,
            max_price: maxPrice ? parseInt(maxPrice) : undefined,
            tag: tag || undefined,
            sort,
        });
    }, [search, departure, destination, minPrice, maxPrice, tag, sort, onFilterChange]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(applyFilters, 400);
        return () => clearTimeout(timer);
    }, [applyFilters]);

    const clearAll = () => {
        setSearch("");
        setDeparture("");
        setDestination("");
        setMinPrice("");
        setMaxPrice("");
        setTag("");
        setSort("newest");
    };

    const hasFilters = search || departure || destination || minPrice || maxPrice || tag || sort !== "newest";

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
            {/* Search + Sort row */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search deals, cities..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400 transition-all"
                    />
                </div>

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as DealFilters["sort"])}
                    className="px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                </select>

                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                    {hasFilters && (
                        <span className="w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                </button>
            </div>

            {/* Expanded filters */}
            {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">From</label>
                        <select
                            value={departure}
                            onChange={(e) => setDeparture(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        >
                            <option value="">All cities</option>
                            {departureCities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">To</label>
                        <select
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        >
                            <option value="">All destinations</option>
                            {destinationCities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Min Price</label>
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max Price</label>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="999"
                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        />
                    </div>

                    {availableTags.length > 0 && (
                        <div className="col-span-2 sm:col-span-4">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTag(tag === t ? "" : t)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${tag === t
                                                ? "bg-orange-500 text-white"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {hasFilters && (
                        <div className="col-span-2 sm:col-span-4">
                            <button
                                onClick={clearAll}
                                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
