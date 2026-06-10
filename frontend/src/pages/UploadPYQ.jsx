import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const EXAM_TYPES = ['SSC', 'HSC', 'Admission', 'University', 'Medical', 'Engineering', 'BBA', 'Law', 'Others']
const YEARS = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i)

export default function UploadPYQ() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', subject: '', examType: '', year: '', institution: '' })

  if (!user) { navigate('/login'); return null }

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!file) { setError('Please select a PDF file'); return }
    if (!form.title || !form.subject || !form.examType || !form.year) { setError('Please fill all required fields'); return }

    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('file', file)
      await api.post('/pyq', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      navigate('/pyq')
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/pyq" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Upload PYQ</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Question Paper Details</h2>
          <div>
            <label className="label">Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. HSC Physics 1st Paper 2023 - Dhaka Board" className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Exam Type <span className="text-red-500">*</span></label>
              <select name="examType" value={form.examType} onChange={handleChange} className="input" required>
                <option value="">Select exam</option>
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year <span className="text-red-500">*</span></label>
              <select name="year" value={form.year} onChange={handleChange} className="input" required>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Subject <span className="text-red-500">*</span></label>
            <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Physics, Chemistry, Math" className="input" required />
          </div>
          <div>
            <label className="label">Institution / Board</label>
            <input type="text" name="institution" value={form.institution} onChange={handleChange} placeholder="e.g. Dhaka Board, BUET, DU" className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input resize-none" placeholder="Any additional info about this question paper..." />
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">PDF File <span className="text-red-500">*</span></h2>
          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="hidden" />
            <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            {file ? (
              <div><p className="text-sm font-medium text-gray-900">{file.name}</p><p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
            ) : (
              <div><p className="text-sm text-gray-600">Click to select PDF</p><p className="text-xs text-gray-400 mt-1">Maximum 20MB</p></div>
            )}
          </label>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-60">
          {loading ? 'Uploading...' : 'Upload PYQ'}
        </button>
      </form>
    </div>
  )
}
