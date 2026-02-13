import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DealCard from "@/components/DealCard";
import ScrollReveal from "@/components/ScrollReveal";
import { getPublicDeals } from "@/lib/api";

interface Props {
    params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { city } = await params;
    const decodedCity = decodeURIComponent(city);
    return {
        title: `Flights to ${decodedCity} - FlyDeals`,
        description: `Find the cheapest flight deals to ${decodedCity}. Error fares, sales, and hidden deals.`,
    };
}

export default async function DestinationCityPage({ params }: Props) {
    const { city } = await params;
    const decodedCity = decodeURIComponent(city);
    let deals: { id: number; title: string; slug: string; departure_city: string; destination_city: string; price: number; currency: string; travel_dates: string; affiliate_url: string; content: string; image_url?: string; published: boolean; original_price?: number; expires_at?: string; scheduled_at?: string; click_count: number; tags: string[]; created_at: string; updated_at: string }[] = [];
    let error = "";

    try {
        const data = await getPublicDeals(1, 50, { destination: decodedCity });
        deals = data.deals;
    } catch {
        error = "Unable to load deals for this destination.";
    }

    return (
        <>
            <Header />
            <main className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-5 animate-fade-in">
                        <Link href="/destinations" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            Destinations
                        </Link>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">{decodedCity}</span>
                    </nav>

                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Flights to {decodedCity}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-2">
                            {deals.length} {deals.length === 1 ? "deal" : "deals"} found
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-4 rounded-lg text-sm mb-8">
                            {error}
                        </div>
                    )}

                    {deals.length === 0 && !error ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-400 dark:text-gray-500">No deals available for {decodedCity} right now.</p>
                            <Link href="/price-alerts" className="text-orange-500 hover:text-orange-600 text-sm font-medium mt-3 inline-block">
                                Set a price alert →
                            </Link>
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
                </div>
            </main>
            <Footer />
        </>
    );
}
