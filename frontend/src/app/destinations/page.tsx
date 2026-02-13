import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDestinations } from "@/lib/api";

export const metadata: Metadata = {
    title: "Destinations - FlyDeals",
    description: "Browse flight deals by destination. Find the cheapest flights to cities worldwide.",
};

export default async function DestinationsPage() {
    let destinations: { city: string; deal_count: number }[] = [];
    let error = "";

    try {
        const data = await getDestinations();
        destinations = data.destinations;
    } catch {
        error = "Unable to load destinations.";
    }

    // Generate placeholder color based on city name
    const getGradient = (city: string) => {
        const colors = [
            "from-blue-500 to-indigo-600",
            "from-emerald-500 to-teal-600",
            "from-orange-500 to-red-600",
            "from-violet-500 to-purple-600",
            "from-pink-500 to-rose-600",
            "from-cyan-500 to-blue-600",
            "from-amber-500 to-orange-600",
            "from-teal-500 to-emerald-600",
        ];
        const idx = city.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
        return colors[idx];
    };

    return (
        <>
            <Header />
            <main className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
                    <div className="mb-8 sm:mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Destinations</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-2">
                            Explore flight deals by destination city
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-4 rounded-lg text-sm mb-8 border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    {destinations.length === 0 && !error ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-400 dark:text-gray-500">No destinations available yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {destinations.map((dest) => (
                                <Link
                                    key={dest.city}
                                    href={`/destinations/${encodeURIComponent(dest.city)}`}
                                    className="group relative overflow-hidden rounded-2xl h-48 sm:h-56 border border-gray-200 dark:border-gray-700 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-xl"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(dest.city)} opacity-90 group-hover:opacity-100 transition-opacity`} />
                                    <div className="relative h-full flex flex-col justify-end p-5 sm:p-6 text-white">
                                        <div className="flex items-center gap-2 mb-1">
                                            <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-sm font-medium opacity-80">Destination</span>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{dest.city}</h2>
                                        <p className="text-sm font-medium opacity-80 mt-1">
                                            {dest.deal_count} {dest.deal_count === 1 ? "deal" : "deals"} available
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
