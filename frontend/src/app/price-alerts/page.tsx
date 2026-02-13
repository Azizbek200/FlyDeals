"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PriceAlertForm from "@/components/PriceAlertForm";
import { getPriceAlerts, deletePriceAlert, PriceAlert } from "@/lib/api";

export default function PriceAlertsPage() {
    const [email, setEmail] = useState("");
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLookup = async () => {
        if (!email) return;
        setLoading(true);
        try {
            const data = await getPriceAlerts(email);
            setAlerts(data.alerts);
            setLoaded(true);
        } catch {
            setAlerts([]);
            setLoaded(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deletePriceAlert(id);
            setAlerts((prev) => prev.filter((a) => a.id !== id));
        } catch { /* ignore */ }
    };

    return (
        <>
            <Header />
            <main className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Price Alerts
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-2">
                            Get notified when flight prices drop to your target
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Create New Alert */}
                        <PriceAlertForm />

                        {/* Lookup Existing Alerts */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Alerts</h3>
                            <div className="flex gap-2 mb-5">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email to view alerts"
                                    className="flex-1 px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                                />
                                <button
                                    onClick={handleLookup}
                                    disabled={loading}
                                    className="px-5 py-2.5 bg-gray-900 dark:bg-gray-600 text-white font-medium rounded-xl text-sm hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                                >
                                    {loading ? "..." : "Look up"}
                                </button>
                            </div>

                            {loaded && alerts.length === 0 && (
                                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                                    No alerts found for this email.
                                </p>
                            )}

                            {alerts.length > 0 && (
                                <div className="space-y-3">
                                    {alerts.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {alert.departure_city ? `${alert.departure_city} → ` : ""}{alert.destination_city}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                    Target: {alert.currency} {alert.target_price}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(alert.id)}
                                                className="text-red-500 hover:text-red-600 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
