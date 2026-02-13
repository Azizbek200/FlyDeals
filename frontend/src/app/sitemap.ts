import { MetadataRoute } from "next";
import { getPublicDeals, getDestinations } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://flydeals.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${BASE_URL}/destinations`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/price-alerts`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
    ];

    // Add deal pages
    try {
        const { deals } = await getPublicDeals(1, 100);
        for (const deal of deals) {
            entries.push({
                url: `${BASE_URL}/deal/${deal.slug}`,
                lastModified: new Date(deal.updated_at),
                changeFrequency: "weekly",
                priority: 0.7,
            });
        }
    } catch { /* skip if API unavailable */ }

    // Add destination pages
    try {
        const { destinations } = await getDestinations();
        for (const dest of destinations) {
            entries.push({
                url: `${BASE_URL}/destinations/${encodeURIComponent(dest.city)}`,
                lastModified: new Date(),
                changeFrequency: "weekly",
                priority: 0.6,
            });
        }
    } catch { /* skip if API unavailable */ }

    return entries;
}
