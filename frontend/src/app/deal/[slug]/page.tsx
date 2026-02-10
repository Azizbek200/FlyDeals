import { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-orange-600 mb-6 inline-flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all deals
          </Link>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Hero Image */}
            <div className="relative h-80 md:h-96 overflow-hidden">
              <img
                src={imageUrl}
                alt={deal.destination_city}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-orange-500 text-white text-3xl font-bold px-6 py-3 rounded-full shadow-xl">
                    {deal.currency} {deal.price}
                  </span>
                  {deal.travel_dates && (
                    <span className="bg-white/90 text-gray-800 text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm">
                      📅 {deal.travel_dates}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {deal.title}
              </h1>

              <div className="flex items-center gap-3 text-xl text-gray-600 mb-8">
                <span className="font-semibold">{deal.departure_city}</span>
                <span className="text-orange-500 text-2xl">✈️</span>
                <span className="font-semibold">{deal.destination_city}</span>
              </div>

              {deal.affiliate_url && (
                <a
                  href={deal.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-8 py-4 rounded-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 mb-8"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Check This Deal
                </a>
              )}

              {deal.content && (
                <div className="prose prose-lg prose-gray max-w-none mt-8 border-t pt-8">
                  <ReactMarkdown>{deal.content}</ReactMarkdown>
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
