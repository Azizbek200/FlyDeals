import Link from "next/link";
import { Deal } from "@/lib/api";

export default function DealCard({ deal }: { deal: Deal }) {
  const imageUrl = deal.image_url || `https://source.unsplash.com/800x600/?${encodeURIComponent(deal.destination_city)},travel,destination`;

  // Show "NEW" badge if created within the last 3 days
  const isNew = Date.now() - new Date(deal.created_at).getTime() < 3 * 24 * 60 * 60 * 1000;

  return (
    <Link
      href={`/deal/${deal.slug}`}
      className="group block bg-white rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/80 hover:-translate-y-0.5"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-2/5 h-48 sm:h-auto min-h-[12rem] sm:min-h-[16rem] overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={deal.destination_city}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Gradient for mobile readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent sm:hidden" />

          {/* Price badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            <div className="bg-white text-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-md font-bold text-base sm:text-xl">
              {deal.currency} {deal.price}
            </div>
          </div>

          {/* NEW badge */}
          {isNew && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                New
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-between">
          <div>
            {/* Route pill */}
            <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
              <span className="font-medium">{deal.departure_city}</span>
              <svg className="w-3.5 h-3.5 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="font-medium">{deal.destination_city}</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors leading-snug">
              {deal.title}
            </h3>

            {deal.travel_dates && (
              <div className="flex items-center gap-1.5 text-gray-400 mb-3">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs sm:text-sm">{deal.travel_dates}</span>
              </div>
            )}

            {deal.content && (
              <p className="text-gray-500 line-clamp-2 text-sm leading-relaxed hidden sm:block">
                {deal.content.substring(0, 150)}...
              </p>
            )}
          </div>

          <div className="mt-3 sm:mt-5 flex items-center justify-between">
            <span className="text-orange-500 font-semibold text-sm flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
              View Deal
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
