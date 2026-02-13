"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import useAuth from "@/lib/useAuth";
import { getAnalytics, AnalyticsData } from "@/lib/api";

export default function AdminAnalyticsPage() {
    const router = useRouter();
    const authenticated = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authenticated) return;
        getAnalytics()
            .then(setData)
            .catch((err) => {
                if (err?.status === 401) router.push("/admin/login");
            })
            .finally(() => setLoading(false));
    }, [authenticated, router]);

    if (!authenticated) return null;

    return (
        <>
            <AdminNav />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>

                {loading ? (
                    <div className="text-center text-gray-400 py-12">Loading analytics...</div>
                ) : data ? (
                    <div className="space-y-8">
                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="Total Deals" value={data.total_deals} icon="📋" />
                            <StatCard label="Published" value={data.published_deals} icon="✅" />
                            <StatCard label="Total Clicks" value={data.total_clicks} icon="🖱️" />
                            <StatCard label="Subscribers" value={data.subscribers} icon="📧" />
                        </div>

                        {/* Top Deals */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Top Deals by Clicks</h2>
                            {data.top_deals.length === 0 ? (
                                <p className="text-sm text-gray-400">No click data yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {data.top_deals.map((deal, idx) => (
                                        <div key={deal.id} className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-gray-400 w-6">#{idx + 1}</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-orange-500">
                                                {deal.click_count} clicks
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-red-500 py-12">Failed to load analytics.</div>
                )}
            </div>
        </>
    );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-medium text-gray-500">{label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
    );
}
