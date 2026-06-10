import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { CATEGORIES, CONDITIONS, DIVISIONS } from '../utils/helpers'

export default function SellItem() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previews, setPreviews] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: '', condition: '',
    location: '', isNegotiable: false, isFree: false,
  })

  if (!user) {
    navigate('/login')
    return null
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) { setError('Maximum 5 images allowed'); return }
    setPreviews(files.map(f => ({ file: f, url: URL.createObjectURL(f) })))
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
     const fd = new FormData()
fd.append('title', form.title)
fd.append('description', form.description)
fd.append('price', form.isFree ? 0 : Number(form.price))
fd.append('category', form.category)
fd.append('condition', form.condition)
fd.append('location', form.location)
fd.append('isFree', form.isFree ? 'true' : 'false')
fd.append('isNegotiable', form.isNegotiable ? 'true' : 'false')
previews.forEach(p => fd.append('images', p.file))

      const { data } = await api.post('/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      navigate(`/listings/${data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a Listing</h1>

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
            <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. HSC Physics 1st Paper - Hakim" className="input" maxLength={150} />
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
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the item — edition, any marks, why selling..." className="input resize-none" maxLength={2000} />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000</p>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing</h2>

          <div className="flex items-center gap-3 mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFree" checked={form.isFree} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700 font-medium">Give away for free</span>
            </label>
          </div>

          {!form.isFree && (
            <div>
              <label className="label">Price (৳) <span className="text-red-500">*</span></label>
              <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Enter price in BDT" className="input" min={0} />
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
            <label className="label">Division / Location <span className="text-red-500">*</span></label>
            <select name="location" value={form.location} onChange={handleChange} className="input">
              <option value="">Select division</option>
              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Photos (Optional)</h2>
          <p className="text-xs text-gray-500">Up to 5 photos. Listings with photos get 3x more responses.</p>

          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600">Click to add photos</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB each</p>
          </label>

          {previews.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {previews.map((p, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setPreviews(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base">
          {loading ? 'Posting...' : 'Post Listing'}
        </button>
      </form>
    </div>
  )
}
