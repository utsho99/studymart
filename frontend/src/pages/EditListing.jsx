import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { CATEGORIES, CONDITIONS, DIVISIONS } from '../utils/helpers'

export default function EditListing() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: '', condition: '',
    location: '', isNegotiable: false, isFree: false,
  })

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get(`/listings/${id}`)
      .then(res => {
        const l = res.data
        if (l.seller._id !== user._id) { navigate('/'); return }
        setForm({
          title: l.title,
          description: l.description,
          price: l.price,
          category: l.category,
          condition: l.condition,
          location: l.location,
          isNegotiable: l.isNegotiable,
          isFree: l.isFree,
        })
      })
      .finally(() => setFetching(false))
  }, [id, user])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title || !form.description || !form.category || !form.condition || !form.location) {
      setError('Please fill all required fields'); return
    }
    if (!form.isFree && !form.price) { setError('Please enter a price or mark as free'); return }

    setLoading(true)
    try {
      await api.put(`/listings/${id}`, {
        title: form.title,
        description: form.description,
        price: form.isFree ? 0 : Number(form.price),
        category: form.category,
        condition: form.condition,
        location: form.location,
        isFree: form.isFree ? 'true' : 'false',
        isNegotiable: form.isNegotiable ? 'true' : 'false',
      })
      navigate(`/listings/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/listings/${id}`} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Item Details</h2>
          <div>
            <label className="label">Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={form.title} onChange={handleChange} className="input" maxLength={150} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category <span className="text-red-500">*</span></label>
              <select name="category" value={form.category} onChange={handleChange} className="input">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Condition <span className="text-red-500">*</span></label>
              <select name="condition" value={form.condition} onChange={handleChange} className="input">
                <option value="">Select condition</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description <span className="text-red-500">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="input resize-none" maxLength={2000} />
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isFree" checked={form.isFree} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-gray-700 font-medium">Give away for free</span>
          </label>
          {!form.isFree && (
            <div>
              <label className="label">Price (৳) <span className="text-red-500">*</span></label>
              <input type="number" name="price" value={form.price} onChange={handleChange} className="input" min={0} />
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isNegotiable" checked={form.isNegotiable} onChange={handleChange} disabled={form.isFree} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-gray-700">Price is negotiable</span>
          </label>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Location</h2>
          <div>
            <label className="label">Division <span className="text-red-500">*</span></label>
            <select name="location" value={form.location} onChange={handleChange} className="input">
              <option value="">Select division</option>
              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
