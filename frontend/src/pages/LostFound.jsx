import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { timeAgo } from '../utils/helpers'

const CATEGORIES = ['ID Card', 'Calculator', 'Wallet', 'Phone', 'Keys', 'Bag', 'Books', 'Stationery', 'Clothing', 'Others']

const CategorySVG = ({ cat }) => {
  const paths = {
    'ID Card': 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2',
    'Calculator': 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    'Wallet': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    'Phone': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
    'Keys': 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    'Bag': 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    'Books': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    'Stationery': 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    'Clothing': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    'Others': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  }
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={paths[cat] || paths['Others']} />
    </svg>
  )
}

function LostFoundCard({ item, onResolve }) {
  const { user } = useAuth()
  const isLost = item.type === 'lost'
  return (
    <div className={`card p-4 border-l-4 ${isLost ? 'border-l-red-400' : 'border-l-green-400'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLost ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
          <CategorySVG cat={item.category} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge text-xs font-bold ${isLost ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {isLost ? 'LOST' : 'FOUND'}
            </span>
            <span className="badge bg-gray-100 text-gray-600 text-xs">{item.category}</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              {item.location}
            </span>
            <span className="text-xs text-gray-400">{timeAgo(item.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                {item.poster?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-500">{item.poster?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.contactPhone && (
                <a href={`tel:${item.contactPhone}`} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100">
                  Call
                </a>
              )}
              {user?._id === item.poster?._id && !item.isResolved && (
                <button onClick={() => onResolve(item._id)} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100">
                  Resolved
                </button>
              )}
            </div>
          </div>
        </div>
        {item.images?.length > 0 && (
          <img src={item.images[0]} alt={item.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
        )}
      </div>
    </div>
  )
}

export default function LostFound() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showPostModal, setShowPostModal] = useState(false)
  const [form, setForm] = useState({ type: 'lost', title: '', description: '', category: '', location: '', campus: '', date: '', contactPhone: '' })
  const [images, setImages] = useState([])
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const fetchItems = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (typeFilter) params.set('type', typeFilter)
    if (categoryFilter) params.set('category', categoryFilter)
    api.get(`/lostfound?${params}`).then(res => setItems(res.data.items)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchItems() }, [typeFilter, categoryFilter])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setError('')
    setPosting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      images.forEach(img => fd.append('images', img))
      await api.post('/lostfound', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowPostModal(false)
      setForm({ type: 'lost', title: '', description: '', category: '', location: '', campus: '', date: '', contactPhone: '' })
      setImages([])
      fetchItems()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post')
    } finally { setPosting(false) }
  }

  const handleResolve = async (id) => {
    await api.patch(`/lostfound/${id}/resolve`)
    setItems(prev => prev.filter(i => i._id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Lost & Found</h1>
            <p className="text-orange-100 text-sm">Lost something on campus? Found something? Post it here.</p>
          </div>
          <button onClick={() => setShowPostModal(true)}
            className="bg-white text-orange-600 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-orange-50 transition-colors flex-shrink-0">
            + Post
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[{ val: '', label: 'All' }, { val: 'lost', label: 'Lost' }, { val: 'found', label: 'Found' }].map(t => (
          <button key={t.val} onClick={() => setTypeFilter(t.val)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${typeFilter === t.val
              ? t.val === 'lost' ? 'bg-red-500 text-white border-red-500'
              : t.val === 'found' ? 'bg-green-500 text-white border-green-500'
              : 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
            {t.label}
          </button>
        ))}
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input text-sm py-1.5 w-auto ml-auto">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Items */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-28" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 card">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="font-semibold text-gray-900 mb-2">Nothing here yet</h3>
          <button onClick={() => setShowPostModal(true)} className="btn-primary text-sm mt-2">Post Lost or Found Item</button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => <LostFoundCard key={item._id} item={item} onResolve={handleResolve} />)}
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Post Lost or Found Item</h2>
              <button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handlePost} className="p-5 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}

              {/* Lost or Found toggle */}
              <div className="flex gap-3">
                {['lost', 'found'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors border-2 ${form.type === t
                      ? t === 'lost' ? 'bg-red-500 text-white border-red-500' : 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                    {t === 'lost' ? '😟 I Lost Something' : '🙌 I Found Something'}
                  </button>
                ))}
              </div>

              <div><label className="label">Title <span className="text-red-500">*</span></label>
                <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Blue student ID card" required /></div>

              <div><label className="label">Category <span className="text-red-500">*</span></label>
                <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>

              <div><label className="label">Description <span className="text-red-500">*</span></label>
                <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the item in detail..." required /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Location <span className="text-red-500">*</span></label>
                  <input className="input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Where lost/found" required /></div>
                <div><label className="label">Campus / Institution</label>
                  <input className="input" value={form.campus} onChange={e => setForm(p => ({ ...p, campus: e.target.value }))} placeholder="Your campus" /></div>
              </div>

              <div><label className="label">Date <span className="text-red-500">*</span></label>
                <input type="date" className="input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required /></div>

              <div><label className="label">Contact Phone</label>
                <input className="input" value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))} placeholder="01XXXXXXXXX" /></div>

              <div><label className="label">Photos (optional)</label>
                <input type="file" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files))} className="input" /></div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowPostModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={posting} className="flex-1 btn-primary">{posting ? 'Posting...' : 'Post'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
