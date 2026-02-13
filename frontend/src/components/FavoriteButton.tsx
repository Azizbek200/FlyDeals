"use client";

import { useState, useEffect, useCallback } from "react";

interface FavoriteButtonProps {
    dealId: number;
    className?: string;
}

function getFavorites(): number[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem("favorites") || "[]");
    } catch {
        return [];
    }
}

function setFavorites(ids: number[]) {
    localStorage.setItem("favorites", JSON.stringify(ids));
}

export default function FavoriteButton({ dealId, className = "" }: FavoriteButtonProps) {
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        setIsFav(getFavorites().includes(dealId));
    }, [dealId]);

    const toggle = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const favs = getFavorites();
        const next = isFav ? favs.filter((id) => id !== dealId) : [...favs, dealId];
        setFavorites(next);
        setIsFav(!isFav);
    }, [dealId, isFav]);

    return (
        <button
            onClick={toggle}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            className={`group/fav p-2 rounded-full transition-all hover:scale-110 ${isFav
                    ? "text-red-500 bg-red-50 dark:bg-red-900/30"
                    : "text-gray-400 hover:text-red-400 bg-white/80 dark:bg-gray-800/80 hover:bg-red-50 dark:hover:bg-red-900/30"
                } ${className}`}
        >
            <svg
                className="w-4 h-4"
                fill={isFav ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    );
}
