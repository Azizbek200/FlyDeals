import { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButton from "@/components/ShareButton";
import FavoriteButton from "@/components/FavoriteButton";
import CountdownTimer from "@/components/CountdownTimer";
import { getDealBySlug } from "@/lib/api";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const deal = await getDealBySlug(slug);
    const description = `${deal.departure_city} to ${deal.destination_city} from ${deal.currency} ${deal.price}. ${deal.travel_dates}`;
    const imageUrl = deal.image_url || `https://source.unsplash.com/1200x630/?${encodeURIComponent(deal.destination_city)},travel`;
    return {
      title: `${deal.title} - FlyDeals`,
      description,
      openGraph: {
        title: deal.title,
        description,
        images: [{ url: imageUrl, width: 1200, height: 630 }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: deal.title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return { title: "Deal Not Found - FlyDeals" };
  }
}

export default async function DealPage({ params }: Props) {
  const { slug } = await params;
  let deal;

  try {
    deal = await getDealBySlug(slug);
  } catch {
    notFound();
  }

  const imageUrl = deal.image_url || `https://source.unsplash.com/1200x600/?${encodeURIComponent(deal.destination_city)},travel,destination`;

  const savings = deal.original_price && deal.original_price > deal.price
    ? Math.round(((deal.original_price - deal.price) / deal.original_price) * 100)
    : null;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: deal.title,
    description: deal.content?.substring(0, 200) || `${deal.departure_city} to ${deal.destination_city}`,
    image: imageUrl,
    offers: {
      "@type": "Offer",
      price: deal.price,
      priceCurrency: deal.currency,
      availability: "https://schema.org/InStock",
      url: deal.affiliate_url || undefined,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-5 sm:mb-6 animate-fade-in">
            <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Deals
            </Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px] sm:max-w-none">{deal.title}</span>
          </nav>

          <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-700 animate-fade-in-up">
            {/* Hero Image */}
            <div className="relative h-56 sm:h-80 md:h-[26rem] overflow-hidden">
              <img
                src={imageUrl}
                alt={deal.destination_city}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Favorite */}
              <div className="absolute top-4 right-4">
                <FavoriteButton dealId={deal.id} className="shadow-md" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xl sm:text-2xl font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-md">
                    {deal.currency} {deal.price}
                    {deal.original_price && deal.original_price > deal.price && (
                      <span className="text-sm text-gray-400 line-through ml-2 font-normal">
                        {deal.currency} {deal.original_price}
                      </span>
                    )}
                  </span>
                  {savings && (
                    <span className="bg-emerald-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-md">
                      Save {savings}%
                    </span>
                  )}
                  {deal.travel_dates && (
                    <span className="bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm">
                      {deal.travel_dates}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-8 md:p-10">
              {/* Route */}
              <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-2">
                <span className="font-medium">{deal.departure_city}</span>
                <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="font-medium">{deal.destination_city}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-4">
                {deal.title}
              </h1>

              {/* Tags */}
              {deal.tags && deal.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {deal.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Countdown */}
              {deal.expires_at && (
                <div className="mb-4">
                  <CountdownTimer expiresAt={deal.expires_at} />
                </div>
              )}

              {/* Action row */}
              <div className="flex items-center gap-3 flex-wrap mb-6 sm:mb-8">
                {deal.affiliate_url && (
                  <a
                    href={deal.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-orange-600 transition-all hover:shadow-lg hover:shadow-orange-500/25 text-sm"
                  >
                    Book This Deal
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                )}
                <ShareButton />
              </div>

              {deal.content && (
                <div className="prose prose-sm sm:prose-base prose-gray dark:prose-invert max-w-none border-t border-gray-100 dark:border-gray-700 pt-6 sm:pt-8">
                  <ReactMarkdown>{deal.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </article>

          {/* Back link */}
          <div className="mt-6 sm:mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to all deals
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
