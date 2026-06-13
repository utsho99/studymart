import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { timeAgo, DIVISIONS } from '../utils/helpers'

const CLASS_OPTIONS = ['Class 1-5', 'Class 6-8', 'Class 9-10', 'SSC', 'Class 11-12', 'HSC', 'Admission', 'University', 'Others']

function TuitionCard({ item }) {
  const isOffer = item.type === 'offer'
  return (
    <div className={`card p-4 border-l-4 ${isOffer ? 'border-l-blue-400' : 'border-l-green-400'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`badge text-xs font-bold ${isOffer ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
              {isOffer ? 'TUTOR OFFER' : 'NEED TUTOR'}
            </span>
            <span className="badge bg-gray-100 text-gray-600 text-xs capitalize">{item.tuitionType === 'both' ? 'Online & Home' : item.tuitionType}</span>
            {item.poster?.isStudentVerified && <span className="badge bg-green-50 text-green-600 text-xs">✓ Verified</span>}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>

          {item.subjects?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.subjects.map(s => (
                <span key={s} className="badge bg-blue-50 text-blue-700 text-xs">{s}</span>
              ))}
            </div>
          )}

          {item.classes?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.classes.map(c => (
                <span key={c} className="badge bg-purple-50 text-purple-700 text-xs">{c}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500 mt-2">
            {item.location && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                {item.location}
              </span>
            )}
            {item.salary && (
              <span className="flex items-center gap-1 font-semibold text-blue-600">
                ৳{item.salary.toLocaleString()}/month{item.salaryNegotiable ? ' (Negotiable)' : ''}
              </span>
            )}
            <span>{timeAgo(item.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs overflow-hidden">
                {item.poster?.avatar
                  ? <img src={item.poster.avatar} alt="" className="w-full h-full object-cover" />
                  : item.poster?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-600">{item.poster?.name}</span>
              {item.poster?.college && <span className="text-xs text-gray-400">· {item.poster.college}</span>}
            </div>
            {item.contactPhone && (
              <a href={`tel:${item.contactPhone}`}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors">
                Contact
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Tuition() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [tuitionTypeFilter, setTuitionTypeFilter] = useState('')
  const [showPostModal, setShowPostModal] = useState(false)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    type: 'offer', title: '', subjects: '', classes: '',
    tuitionType: 'both', location: '', salary: '', salaryNegotiable: false,
    experience: '', description: '', contactPhone: '', gender: 'any',
  })

  const fetchItems = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (typeFilter) params.set('type', typeFilter)
    if (tuitionTypeFilter) params.set('tuitionType', tuitionTypeFilter)
    api.get(`/tuition?${params}`).then(res => setItems(res.data.items)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchItems() }, [typeFilter, tuitionTypeFilter])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setError('')
    setPosting(true)
    try {
      await api.post('/tuition', form)
      setShowPostModal(false)
      setForm({ type: 'offer', title: '', subjects: '', classes: '', tuitionType: 'both', location: '', salary: '', salaryNegotiable: false, experience: '', description: '', contactPhone: '', gender: 'any' })
      fetchItems()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post')
    } finally { setPosting(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Tuition Board</h1>
            <p className="text-blue-100 text-sm">Find tutors or post tuition requests. Connect with students and teachers.</p>
          </div>
          <button onClick={() => setShowPostModal(true)}
            className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-blue-50 transition-colors flex-shrink-0">
            + Post
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[{ val: '', label: 'All' }, { val: 'offer', label: 'Tutor Offers' }, { val: 'request', label: 'Need Tutor' }].map(t => (
          <button key={t.val} onClick={() => setTypeFilter(t.val)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${typeFilter === t.val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {[{ val: '', label: 'All Types' }, { val: 'online', label: 'Online' }, { val: 'home', label: 'Home' }].map(t => (
            <button key={t.val} onClick={() => setTuitionTypeFilter(t.val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${tuitionTypeFilter === t.val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-32" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 card">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
          </svg>
          <h3 className="font-semibold text-gray-900 mb-2">No tuition posts yet</h3>
          <button onClick={() => setShowPostModal(true)} className="btn-primary text-sm mt-2">Post First</button>
        </div>
      ) : (
        <div className="space-y-3">{items.map(item => <TuitionCard key={item._id} item={item} />)}</div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Post Tuition</h2>
              <button onClick={() => setShowPostModal(false)}>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handlePost} className="p-5 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}

              {/* Type toggle */}
              <div className="flex gap-2">
                {[{ val: 'offer', label: 'I am a Tutor' }, { val: 'request', label: 'I Need a Tutor' }].map(t => (
                  <button key={t.val} type="button" onClick={() => setForm(p => ({ ...p, type: t.val }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${form.type === t.val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="label">Title <span className="text-red-500">*</span></label>
                <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder={form.type === 'offer' ? 'e.g. Experienced Math & Physics Tutor' : 'e.g. Need HSC Chemistry Tutor'} required />
              </div>

              <div>
                <label className="label">Subjects (comma separated)</label>
                <input className="input" value={form.subjects} onChange={e => setForm(p => ({ ...p, subjects: e.target.value }))}
                  placeholder="e.g. Math, Physics, Chemistry" />
              </div>

              <div>
                <label className="label">Classes / Levels</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CLASS_OPTIONS.map(cls => (
                    <button key={cls} type="button"
                      onClick={() => {
                        const arr = form.classes ? form.classes.split(',').map(s => s.trim()).filter(Boolean) : []
                        const newArr = arr.includes(cls) ? arr.filter(c => c !== cls) : [...arr, cls]
                        setForm(p => ({ ...p, classes: newArr.join(', ') }))
                      }}
                      className={`px-2 py-1 rounded-lg text-xs border transition-colors ${form.classes?.includes(cls) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Tuition Type <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  {[{ val: 'online', label: 'Online' }, { val: 'home', label: 'Home' }, { val: 'both', label: 'Both' }].map(t => (
                    <button key={t.val} type="button" onClick={() => setForm(p => ({ ...p, tuitionType: t.val }))}
                      className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${form.tuitionType === t.val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Location / Area</label>
                  <select className="input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}>
                    <option value="">Select area</option>
                    {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Salary (৳/month)</label>
                  <input type="number" className="input" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} placeholder="e.g. 3000" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.salaryNegotiable} onChange={e => setForm(p => ({ ...p, salaryNegotiable: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-700">Salary is negotiable</span>
              </label>

              {form.type === 'offer' && (
                <div>
                  <label className="label">Experience</label>
                  <input className="input" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} placeholder="e.g. 2 years teaching HSC students" />
                </div>
              )}

              <div>
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Additional details..." />
              </div>

              <div>
                <label className="label">Contact Phone</label>
                <input className="input" value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))} placeholder="01XXXXXXXXX" />
              </div>

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
