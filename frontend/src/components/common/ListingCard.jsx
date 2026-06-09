import { Link } from 'react-router-dom'
import { formatPrice, timeAgo, conditionColor, categoryIcon } from '../../utils/helpers'

export default function ListingCard({ listing }) {
  const { _id, title, price, isFree, category, condition, location, images, seller, createdAt, isFeatured, isSold } = listing

  return (
    <Link to={`/listings/${_id}`} className="card block group hover:scale-[1.01] transition-transform duration-150">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden">
        {images && images.length > 0 ? (
          <img src={images[0]} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">{categoryIcon(category)}</span>
          </div>
        )}
        {isFeatured && (
          <span className="absolute top-2 left-2 badge bg-yellow-100 text-yellow-700 border border-yellow-200">⭐ Featured</span>
        )}
        {isSold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-semibold px-3 py-1 rounded-full text-sm">Sold</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">{title}</p>
        <p className="text-base font-bold text-blue-600 mb-2">{formatPrice(price, isFree)}</p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`badge ${conditionColor(condition)}`}>{condition}</span>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(createdAt)}</span>
        </div>

        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="text-xs text-gray-500 truncate">{location}</span>
          {seller?.isVerifiedSeller && (
            <span className="ml-auto flex-shrink-0 badge bg-blue-50 text-blue-600">✓ Verified</span>
          )}
        </div>
      </div>
    </Link>
  )
}
