import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { formatPrice, timeAgo, conditionColor } from '../utils/helpers'
import UserBadges from '../components/common/UserBadges'

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [contacting, setContacting] = useState(false)
  const [featuring, setFeaturing] = useState(false)
  const [featuredMsg, setFeaturedMsg] = useState('')

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => setListing(res.data))
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false))
  }, [id])

  const handleContact = async () => {
    if (!user) return navigate('/login')
    if (user._id === listing.seller._id) return
    setContacting(true)
    try {
      const { data } = await api.post('/chat/conversations', { recipientId: listing.seller._id, listingId: listing._id })
      navigate(`/chat/${data._id}`)
    } catch {
      setContacting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return
    await api.delete(`/listings/${id}`)
    navigate('/profile')
  }

  const handleMarkSold = async () => {
    if (!confirm('Mark this item as sold?')) return
    const { data } = await api.patch(`/listings/${id}/sold`)
    setListing(prev => ({ ...prev, ...data.listing }))
  }

  const handleFeature = async (method) => {
    setFeaturing(true)
    try {
      const { data } = await api.post(`/listings/${id}/feature`, { method })
      setFeaturedMsg(data.message)
      setListing(prev => ({ ...prev, isFeatured: true }))
    } catch (err) {
      setFeaturedMsg(err.response?.data?.message || 'Failed to feature listing')
    } finally { setFeaturing(false) }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="aspect-square bg-gray-200 rounded-xl" />
        <div className="space-y-4"><div className="h-6 bg-gray-200 rounded w-3/4" /><div className="h-8 bg-gray-200 rounded w-1/3" /></div>
      </div>
    </div>
  )

  if (!listing) return null

  const isMine = user && user._id === listing.seller._id

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-gray-900">Home</Link>
        <span>›</span>
        <Link to={`/listings?category=${listing.category}`} className="hover:text-gray-900">{listing.category}</Link>
        <span>›</span>
        <span className="text-gray-700 truncate max-w-xs">{listing.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
            {listing.images && listing.images.length > 0 ? (
              <img src={listing.images[selectedImg]} alt={listing.title} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">{categoryIcon(listing.category)}</div>
            )}
          </div>
          {listing.images && listing.images.length > 1 && (
            <div className="flex gap-2">
              {listing.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImg === i ? 'border-blue-500' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {listing.isSold && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-sm text-red-700 font-medium">
              This item has been sold
            </div>
          )}

          <h1 className="text-xl font-bold text-gray-900 mb-2">{listing.title}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-blue-600">{formatPrice(listing.price, listing.isFree)}</span>
            {listing.isNegotiable && <span className="badge bg-green-100 text-green-700">Negotiable</span>}
            <span className={`badge ${conditionColor(listing.condition)}`}>{listing.condition}</span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-24">Category</span>
              <span className="font-medium">{listing.category}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-24">Location</span>
              <span className="font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                {listing.location}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-24">Posted</span>
              <span className="font-medium">{timeAgo(listing.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-24">Views</span>
              <span className="font-medium">{listing.views}</span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Seller Card */}
          <div className="border border-gray-200 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Seller Information</h3>
            <Link to={`/users/${listing.seller._id}`} className="flex items-center gap-3 mb-3 hover:opacity-80">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                {listing.seller.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-900 text-sm">{listing.seller.name}</span>
                  <UserBadges user={listing.seller} size="sm" />
                  {listing.seller.isVerifiedSeller && (
                    <span className="badge bg-blue-50 text-blue-600 border border-blue-200">✓ Verified</span>
                  )}
                </div>
                {listing.seller.college && <p className="text-xs text-gray-500">{listing.seller.college}</p>}
              </div>
            </Link>

            {!isMine && !listing.isSold ? (
              <button onClick={handleContact} disabled={contacting}
                className="w-full btn-primary py-2.5 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                {contacting ? 'Opening chat...' : 'Contact Seller'}
              </button>
            ) : isMine ? (
              <>
                <div className="flex gap-2">
                  <Link to={`/listings/${id}/edit`} className="flex-1 btn-secondary text-center text-sm py-2">Edit</Link>
                  {!listing.isSold && <button onClick={handleMarkSold} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg transition-colors font-medium">Mark Sold</button>}
                  <button onClick={handleDelete} className="btn-danger text-sm py-2 px-3">Delete</button>
                </div>
                {!listing.isFeatured ? (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-xs font-semibold text-yellow-800 mb-2">Boost this listing</p>
                    {featuredMsg && <p className="text-xs text-green-600 mb-2">{featuredMsg}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => handleFeature('credits')} disabled={featuring}
                        className="flex-1 text-xs bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded-lg transition-colors font-medium">
                        Use Credit ({user?.credits || 0} left)
                      </button>
                      <button onClick={() => handleFeature('payment')} disabled={featuring}
                        className="flex-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white py-1.5 rounded-lg transition-colors font-medium">
                        Pay ৳49
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-center badge bg-yellow-100 text-yellow-700 w-full py-1.5">★ This listing is featured</div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
