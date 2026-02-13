import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlyDeals - Fly More for Less",
  description:
    "Discover amazing flight deals, cheap airfare, and error fares to destinations worldwide. Updated daily.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://flydeals.vercel.app"),
  openGraph: {
    title: "FlyDeals - Fly More for Less",
    description: "Discover amazing flight deals and cheap airfare to destinations worldwide.",
    type: "website",
    siteName: "FlyDeals",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlyDeals - Fly More for Less",
  },
};

// Inline script to prevent FOUC on dark mode
const themeScript = `
  (function() {
    try {
      const t = localStorage.getItem('theme');
      if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
