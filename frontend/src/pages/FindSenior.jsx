import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

function SeniorCard({ senior }) {
  return (
    <Link to={`/seniors/${senior._id}`} className="card p-4 flex items-start gap-4 hover:scale-[1.01] transition-transform">
      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0">
        {senior.avatar ? (
          <img src={senior.avatar} alt={senior.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          senior.name?.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-semibold text-gray-900 text-sm">{senior.name}</h3>
          <span className="badge bg-blue-50 text-blue-600 border border-blue-100">Senior</span>
        </div>
        <p className="text-xs text-gray-500 mb-1">{senior.college}</p>
        {senior.department && <p className="text-xs text-gray-500">{senior.department} {senior.year && `· ${senior.year}`}</p>}
        {senior.bio && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{senior.bio}</p>}
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {senior.followersCount || 0} followers
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {senior.notesCount || 0} notes
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {senior.pyqCount || 0} PYQs
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function FindSenior() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [seniors, setSeniors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showBecomeModal, setShowBecomeModal] = useState(false)
  const [becomeForm, setBecomeForm] = useState({ department: '', year: '', bio: '' })
  const [becoming, setBecoming] = useState(false)

  useEffect(() => {
    api.get('/seniors').then(res => setSeniors(res.data.seniors)).finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setLoading(true)
    api.get(`/seniors?search=${search}`).then(res => setSeniors(res.data.seniors)).finally(() => setLoading(false))
  }

  const handleBecomeSenior = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setBecoming(true)
    try {
      await api.post('/seniors/become', becomeForm)
      setShowBecomeModal(false)
      window.location.reload()
    } finally {
      setBecoming(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-1">Find My Senior</h1>
        <p className="text-blue-100 text-sm mb-4">Connect with senior students who share notes, PYQs and guidance</p>
        <button onClick={() => setShowBecomeModal(true)}
          className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
          Become a Senior Contributor
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or college..." className="input pl-9" />
        </div>
        <button type="submit" className="btn-secondary text-sm">Search</button>
      </form>

      {/* Seniors list */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-28" />)}</div>
      ) : seniors.length === 0 ? (
        <div className="text-center py-16 card">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <h3 className="font-semibold text-gray-900 mb-2">No seniors yet</h3>
          <p className="text-sm text-gray-500 mb-4">Be the first senior contributor!</p>
          <button onClick={() => setShowBecomeModal(true)} className="btn-primary text-sm">Become a Senior</button>
        </div>
      ) : (
        <div className="space-y-3">{seniors.map(s => <SeniorCard key={s._id} senior={s} />)}</div>
      )}

      {/* Become Senior Modal */}
      {showBecomeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Become a Senior Contributor</h2>
              <button onClick={() => setShowBecomeModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleBecomeSenior} className="p-5 space-y-4">
              <p className="text-sm text-gray-600">Share your knowledge with junior students by uploading notes and PYQs.</p>
              <div>
                <label className="label">Department / Field <span className="text-red-500">*</span></label>
                <input type="text" value={becomeForm.department} onChange={e => setBecomeForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. MBBS, CSE, BBA" className="input" required />
              </div>
              <div>
                <label className="label">Year / Semester</label>
                <input type="text" value={becomeForm.year} onChange={e => setBecomeForm(p => ({ ...p, year: e.target.value }))} placeholder="e.g. 3rd Year, 5th Semester" className="input" />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea value={becomeForm.bio} onChange={e => setBecomeForm(p => ({ ...p, bio: e.target.value }))} rows={3} className="input resize-none" placeholder="Tell juniors about yourself and how you can help..." maxLength={300} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBecomeModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={becoming} className="flex-1 btn-primary">{becoming ? 'Saving...' : 'Become Senior'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
