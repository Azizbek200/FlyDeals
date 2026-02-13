"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  expiresAt: string;
}

function getTimeLeft(expiresAt: string): { text: string; expired: boolean; interval: number } {
  const diff = new Date(expiresAt).getTime() - Date.now();

  if (diff <= 0) {
    return { text: "Expired", expired: true, interval: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return { text: `${days}d ${hours}h`, expired: false, interval: 3600000 };
  }
  if (hours > 0) {
    return { text: `${hours}h ${minutes}m`, expired: false, interval: 60000 };
  }
  return { text: `${minutes}m`, expired: false, interval: 60000 };
}

export default function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const initial = getTimeLeft(expiresAt);
  const [timeLeft, setTimeLeft] = useState(initial.text);
  const [expired, setExpired] = useState(initial.expired);

  useEffect(() => {
    const result = getTimeLeft(expiresAt);
    if (result.expired) {
      setExpired(true);
      setTimeLeft("Expired");
      return;
    }

    setTimeLeft(result.text);

    const interval = setInterval(() => {
      const r = getTimeLeft(expiresAt);
      setTimeLeft(r.text);
      if (r.expired) {
        setExpired(true);
        clearInterval(interval);
      }
    }, result.interval);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Expired
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {timeLeft}
    </span>
  );
}
