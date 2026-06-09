import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { NOTE_CLASSES } from '../utils/helpers'

export default function UploadNotes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', subject: '', class: '', isFree: 'true', price: '' })

  if (!user) { navigate('/login'); return null }

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!file) { setError('Please select a PDF file'); return }
    if (!form.title || !form.subject) { setError('Title and subject are required'); return }

    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('file', file)
      await api.post('/notes', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      navigate('/notes')
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/notes" className="text-gray-400 hover:text-gray-600">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-900">Upload Notes</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Note Details</h2>
          <div><label className="label">Title <span className="text-red-500">*</span></label><input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. HSC Physics Chapter 1-5 Notes" className="input" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Subject <span className="text-red-500">*</span></label><input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Physics" className="input" required /></div>
            <div><label className="label">Class / Level</label>
              <select name="class" value={form.class} onChange={handleChange} className="input">
                <option value="">Select level</option>
                {NOTE_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input resize-none" placeholder="What's covered in these notes?" /></div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing</h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="isFree" value="true" checked={form.isFree === 'true'} onChange={handleChange} className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Share for Free</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="isFree" value="false" checked={form.isFree === 'false'} onChange={handleChange} className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Paid</span>
            </label>
          </div>
          {form.isFree === 'false' && (
            <div><label className="label">Price (৳)</label><input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Enter price" className="input" min={1} /></div>
          )}
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">PDF File <span className="text-red-500">*</span></h2>
          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="hidden" />
            <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            {file ? (
              <div><p className="text-sm font-medium text-gray-900">{file.name}</p><p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
            ) : (
              <div><p className="text-sm text-gray-600">Click to select PDF</p><p className="text-xs text-gray-400 mt-1">Maximum 20MB</p></div>
            )}
          </label>
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base">
          {loading ? 'Uploading...' : 'Upload Notes'}
        </button>
      </form>
    </div>
  )
}
