import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import ListingCard from '../components/common/ListingCard'
import { CATEGORIES, categoryIcon } from '../utils/helpers'

export default function Home() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/listings?limit=12&sort=newest')
      .then(res => setListings(res.data.listings))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) navigate(`/listings?search=${encodeURIComponent(searchQ.trim())}`)
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Bangladesh's Student Marketplace</h1>
            <p className="text-blue-100 text-sm sm:text-base mb-6">Buy & sell books, notes, calculators and more. Connect with students near you.</p>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search for books, notes, calculator..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <button type="submit" className="bg-white text-blue-600 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                Search
              </button>
            </form>

            <div className="flex items-center gap-4 mt-4 text-sm text-blue-100">
              <span>📚 1,200+ listings</span>
              <span>🎓 500+ students</span>
              <span>📍 All divisions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Categories */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/listings?category=${cat}`}
                className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                <span className="text-2xl">{categoryIcon(cat)}</span>
                <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 text-center leading-tight">{cat}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Listings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Listings</h2>
            <Link to="/listings" className="text-sm text-blue-600 hover:underline font-medium">View all →</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-t-xl" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-medium">No listings yet</p>
              <Link to="/sell" className="btn-primary mt-4 inline-block">Post the first listing</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map(l => <ListingCard key={l._id} listing={l} />)}
            </div>
          )}
        </section>

        {/* CTA Banner */}
        <div className="mt-10 bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-3xl">📝</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Share Your Study Notes</h3>
            <p className="text-sm text-gray-600">Help fellow students by uploading your class notes — free or paid. Every upload earns you community points.</p>
          </div>
          <Link to="/notes/upload" className="btn-primary flex-shrink-0">Upload Notes</Link>
        </div>
      </div>
    </div>
  )
}
