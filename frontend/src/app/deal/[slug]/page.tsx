import { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButton from "@/components/ShareButton";
import { getDealBySlug } from "@/lib/api";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const deal = await getDealBySlug(slug);
    return {
      title: `${deal.title} - FlyDeals`,
      description: `${deal.departure_city} to ${deal.destination_city} from ${deal.currency} ${deal.price}. ${deal.travel_dates}`,
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

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-5 sm:mb-6 animate-fade-in">
            <Link href="/" className="hover:text-gray-600 transition-colors">
              Deals
            </Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-600 truncate max-w-[200px] sm:max-w-none">{deal.title}</span>
          </nav>

          <article className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 animate-fade-in-up">
            {/* Hero Image */}
            <div className="relative h-56 sm:h-80 md:h-[26rem] overflow-hidden">
              <img
                src={imageUrl}
                alt={deal.destination_city}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="bg-white text-gray-900 text-xl sm:text-2xl font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-md">
                    {deal.currency} {deal.price}
                  </span>
                  {deal.travel_dates && (
                    <span className="bg-white/90 text-gray-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm">
                      {deal.travel_dates}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-8 md:p-10">
              {/* Route */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <span className="font-medium">{deal.departure_city}</span>
                <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="font-medium">{deal.destination_city}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
                {deal.title}
              </h1>

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
                <div className="prose prose-sm sm:prose-base prose-gray max-w-none border-t border-gray-100 pt-6 sm:pt-8">
                  <ReactMarkdown>{deal.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </article>

          {/* Back link */}
          <div className="mt-6 sm:mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
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
