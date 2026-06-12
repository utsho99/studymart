import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import ListingCard from '../components/common/ListingCard'
import { CATEGORIES, CONDITIONS, DIVISIONS } from '../utils/helpers'

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const currentPage = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const condition = searchParams.get('condition') || ''
  const location = searchParams.get('location') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const sort = searchParams.get('sort') || 'newest'

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (condition) params.set('condition', condition)
    if (location) params.set('location', location)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (sort) params.set('sort', sort)
    params.set('page', currentPage)
    params.set('limit', 20)

    api.get(`/listings?${params.toString()}`)
      .then(res => {
        setListings(res.data.listings)
        setTotal(res.data.total)
        setPages(res.data.pages)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [searchParams])

  const updateFilter = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const clearFilters = () => setSearchParams({})

  const activeFiltersCount = [category, condition, location, minPrice, maxPrice].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {search ? `Results for "${search}"` : category || 'All Listings'}
          </h1>
          {!loading && <p className="text-sm text-gray-500">{total} items found</p>}
        </div>
        <div className="flex items-center gap-2">
          <select value={sort} onChange={e => updateFilter('sort', e.target.value)} className="input text-sm py-1.5 w-auto">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary text-sm py-1.5 relative ${activeFiltersCount > 0 ? 'border-blue-400 text-blue-600' : ''}`}>
            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters {activeFiltersCount > 0 && <span className="ml-1 bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-xs">{activeFiltersCount}</span>}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="label">Category</label>
            <select value={category} onChange={e => updateFilter('category', e.target.value)} className="input text-sm">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Condition</label>
            <select value={condition} onChange={e => updateFilter('condition', e.target.value)} className="input text-sm">
              <option value="">Any Condition</option>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <select value={location} onChange={e => updateFilter('location', e.target.value)} className="input text-sm">
              <option value="">All Locations</option>
              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Min Price (৳)</label>
            <input type="number" value={minPrice} onChange={e => updateFilter('minPrice', e.target.value)} placeholder="0" className="input text-sm" />
          </div>
          <div>
            <label className="label">Max Price (৳)</label>
            <input type="number" value={maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} placeholder="Any" className="input text-sm" />
          </div>
          {activeFiltersCount > 0 && (
            <div className="col-span-full">
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 font-medium">✕ Clear all filters</button>
            </div>
          )}
        </div>
      )}

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {['', ...CATEGORIES].map(cat => (
          <button key={cat || 'all'} onClick={() => updateFilter('category', cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${category === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
            {cat || 'All'}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
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
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-500 text-sm mb-4">Try different keywords or clear the filters</p>
          <button onClick={clearFilters} className="btn-secondary text-sm">Clear filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map(l => <ListingCard key={l._id} listing={l} />)}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(pages)].map((_, i) => (
                <button key={i} onClick={() => updateFilter('page', i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
