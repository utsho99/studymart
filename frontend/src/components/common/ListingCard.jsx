import { Link } from 'react-router-dom'
import { useState } from 'react'
import { formatPrice, timeAgo, conditionColor } from '../../utils/helpers'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

const CategorySVG = ({ category }) => {
  const icons = {
    Books: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    Notes: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    Calculator: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    Stationery: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    Electronics: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    Uniform: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    Others: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  }
  return (
    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icons[category] || icons.Others} />
    </svg>
  )
}

export default function ListingCard({ listing, initialLiked = false, initialBookmarked = false }) {
  const { user } = useAuth()
  const { _id, title, price, isFree, category, condition, location, images, seller, createdAt, isFeatured, isSold } = listing
  const [liked, setLiked] = useState(initialLiked)
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [likeLoading, setLikeLoading] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    setLikeLoading(true)
    try {
      const { data } = await api.post(`/likes/${_id}/like`)
      setLiked(data.liked)
    } finally { setLikeLoading(false) }
  }

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    setBookmarkLoading(true)
    try {
      const { data } = await api.post(`/likes/${_id}/bookmark`)
      setBookmarked(data.bookmarked)
    } finally { setBookmarkLoading(false) }
  }

  return (
    <Link to={`/listings/${_id}`} className="card block group hover:scale-[1.01] transition-transform duration-150">
      <div className="relative aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden">
        {images && images.length > 0 ? (
          <img src={images[0]} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CategorySVG category={category} />
          </div>
        )}
        {isFeatured && <span className="absolute top-2 left-2 badge bg-yellow-100 text-yellow-700 border border-yellow-200">Featured</span>}
        {isSold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-semibold px-3 py-1 rounded-full text-sm">Sold</span>
          </div>
        )}

        {/* Like + Bookmark buttons */}
        {user && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <button onClick={handleLike} disabled={likeLoading}
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-colors ${liked ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}>
              <svg className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button onClick={handleBookmark} disabled={bookmarkLoading}
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-colors ${bookmarked ? 'bg-blue-500 text-white' : 'bg-white text-gray-400 hover:text-blue-500'}`}>
              <svg className="w-3.5 h-3.5" fill={bookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">{title}</p>
        <p className="text-base font-bold text-blue-600 mb-2">{formatPrice(price, isFree)}</p>
        <div className="flex items-center justify-between gap-2">
          <span className={`badge ${conditionColor(condition)}`}>{condition}</span>
          <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(createdAt)}</span>
        </div>
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="text-xs text-gray-500 truncate">{location}</span>
          {seller?.isVerifiedSeller && <span className="ml-auto flex-shrink-0 badge bg-blue-50 text-blue-600">✓</span>}
        </div>
      </div>
    </Link>
  )
}
