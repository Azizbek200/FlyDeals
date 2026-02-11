import Link from "next/link";
import { Deal } from "@/lib/api";

export default function DealCard({ deal }: { deal: Deal }) {
  const imageUrl = deal.image_url || `https://source.unsplash.com/800x600/?${encodeURIComponent(deal.destination_city)},travel,destination`;

  return (
    <Link
      href={`/deal/${deal.slug}`}
      className="group block bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="relative w-full sm:w-2/5 h-48 sm:h-auto min-h-[12rem] sm:min-h-[16rem] overflow-hidden">
          <img
            src={imageUrl}
            alt={deal.destination_city}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-orange-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg">
            <span className="text-lg sm:text-2xl font-bold">{deal.currency} {deal.price}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-orange-600 transition-colors">
              {deal.title}
            </h3>

            <div className="flex items-center gap-2 text-gray-600 mb-3 sm:mb-4">
              <span className="text-base sm:text-lg font-semibold">{deal.departure_city}</span>
              <span className="text-orange-500">→</span>
              <span className="text-base sm:text-lg font-semibold">{deal.destination_city}</span>
            </div>

            {deal.travel_dates && (
              <div className="flex items-center gap-2 text-gray-500 mb-3 sm:mb-4">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs sm:text-sm">{deal.travel_dates}</span>
              </div>
            )}

            {deal.content && (
              <p className="text-gray-600 line-clamp-2 text-xs sm:text-sm leading-relaxed hidden sm:block">
                {deal.content.substring(0, 150)}...
              </p>
            )}
          </div>

          <div className="mt-3 sm:mt-4 flex items-center justify-between">
            <span className="text-orange-600 font-semibold text-sm sm:text-base group-hover:text-orange-700 flex items-center gap-2">
              View Deal
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
