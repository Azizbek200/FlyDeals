"use client";

import { useState, useEffect } from "react";

interface HomeAirportSelectorProps {
    onSelect: (city: string) => void;
    cities: string[];
}

export default function HomeAirportSelector({ onSelect, cities }: HomeAirportSelectorProps) {
    const [selected, setSelected] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("home_airport");
        if (stored) {
            setSelected(stored);
            onSelect(stored);
        }
    }, [onSelect]);

    const handleSelect = (city: string) => {
        setSelected(city);
        setOpen(false);
        if (city) {
            localStorage.setItem("home_airport", city);
        } else {
            localStorage.removeItem("home_airport");
        }
        onSelect(city);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
                <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {selected || "Set home city"}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[180px] z-50 max-h-60 overflow-y-auto animate-fade-in-up">
                        <button
                            onClick={() => handleSelect("")}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!selected ? "text-orange-500 font-medium" : "text-gray-700 dark:text-gray-300"
                                }`}
                        >
                            All cities
                        </button>
                        {cities.map((city) => (
                            <button
                                key={city}
                                onClick={() => handleSelect(city)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selected === city ? "text-orange-500 font-medium" : "text-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
