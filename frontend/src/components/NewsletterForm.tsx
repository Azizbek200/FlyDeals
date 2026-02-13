"use client";

import { useState } from "react";
import { subscribe } from "@/lib/api";

export default function NewsletterForm({ variant = "default" }: { variant?: "default" | "hero" | "footer" }) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        try {
            await subscribe(email);
            setStatus("success");
            setMessage("You're in! We'll send you the best deals.");
            setEmail("");
        } catch {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    };

    if (variant === "hero") {
        return (
            <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto animate-fade-in-up-delay-2">
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email for deal alerts"
                        className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400 transition-all"
                        required
                    />
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-sm transition-all hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50"
                    >
                        {status === "loading" ? "..." : "Subscribe"}
                    </button>
                </div>
                {status !== "idle" && (
                    <p className={`text-xs mt-2 ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>
                        {message}
                    </p>
                )}
            </form>
        );
    }

    if (variant === "footer") {
        return (
            <form onSubmit={handleSubmit} className="mt-3">
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                        required
                    />
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                        {status === "loading" ? "..." : "Go"}
                    </button>
                </div>
                {status !== "idle" && (
                    <p className={`text-xs mt-1.5 ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>
                        {message}
                    </p>
                )}
            </form>
        );
    }

    // Default variant
    return (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 sm:p-8 text-white">
            <h3 className="text-lg sm:text-xl font-bold mb-2">Never miss a deal ✈️</h3>
            <p className="text-orange-100 text-sm mb-4">Get the best flight deals delivered to your inbox.</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-white/20 border border-white/30 text-white placeholder-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                />
                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-5 py-2.5 bg-white text-orange-600 font-semibold rounded-lg text-sm hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                    {status === "loading" ? "..." : "Subscribe"}
                </button>
            </form>
            {status !== "idle" && (
                <p className={`text-xs mt-2 ${status === "success" ? "text-emerald-200" : "text-red-200"}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
