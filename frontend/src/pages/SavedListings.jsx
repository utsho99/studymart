import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import ListingCard from '../components/common/ListingCard'

export default function SavedListings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('bookmarks')
  const [bookmarks, setBookmarks] = useState([])
  const [liked, setLiked] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    Promise.all([
      api.get('/likes/bookmarks'),
      api.get('/likes/liked'),
    ]).then(([bRes, lRes]) => {
      setBookmarks(bRes.data)
      setLiked(lRes.data)
    }).finally(() => setLoading(false))
  }, [user])

  const items = tab === 'bookmarks' ? bookmarks : liked

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Listings</h1>

      <div className="flex bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button onClick={() => setTab('bookmarks')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${tab === 'bookmarks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          <svg className="w-4 h-4" fill={tab === 'bookmarks' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Bookmarked ({bookmarks.length})
        </button>
        <button onClick={() => setTab('liked')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${tab === 'liked' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          <svg className="w-4 h-4" fill={tab === 'liked' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Liked ({liked.length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-52" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 card">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={tab === 'bookmarks'
              ? 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
              : 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'} />
          </svg>
          <h3 className="font-semibold text-gray-900 mb-2">No {tab === 'bookmarks' ? 'bookmarked' : 'liked'} listings yet</h3>
          <p className="text-sm text-gray-500 mb-4">Browse listings and {tab === 'bookmarks' ? 'bookmark' : 'like'} items you are interested in</p>
          <Link to="/listings" className="btn-primary text-sm">Browse Listings</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map(l => l && <ListingCard key={l._id} listing={l}
            initialLiked={tab === 'liked'}
            initialBookmarked={tab === 'bookmarks'} />)}
        </div>
      )}
    </div>
  )
}
