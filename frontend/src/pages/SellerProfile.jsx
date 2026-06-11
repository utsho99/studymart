import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import ListingCard from '../components/common/ListingCard'
import { timeAgo } from '../utils/helpers'

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'fake_listing', label: 'Fake listing' },
  { value: 'scam', label: 'Scam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
]

function StarRating({ value, onChange, readonly }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" onClick={() => !readonly && onChange && onChange(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}>
          <svg className={`w-6 h-6 ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function SellerProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRateModal, setShowRateModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [rateForm, setRateForm] = useState({ stars: 0, comment: '' })
  const [reportForm, setReportForm] = useState({ reason: '', description: '' })
  const [actionLoading, setActionLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    api.get(`/users/${id}`)
      .then(res => { setData(res.data); setIsBlocked(res.data.isBlocked) })
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false))
  }, [id])

  const handleRate = async (e) => {
    e.preventDefault()
    if (!rateForm.stars) return
    setActionLoading(true)
    try {
      await api.post(`/users/${id}/rate`, rateForm)
      setSuccessMsg('Rating submitted!')
      setShowRateModal(false)
      const res = await api.get(`/users/${id}`)
      setData(res.data)
    } finally { setActionLoading(false) }
  }

  const handleBlock = async () => {
    setActionLoading(true)
    try {
      const { data: res } = await api.post(`/users/${id}/block`)
      setIsBlocked(res.blocked)
      setShowBlockConfirm(false)
      setSuccessMsg(res.message)
    } finally { setActionLoading(false) }
  }

  const handleReport = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await api.post(`/users/${id}/report`, reportForm)
      setShowReportModal(false)
      setSuccessMsg('Report submitted. Thank you!')
    } finally { setActionLoading(false) }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-xl mb-4" />
      <div className="h-64 bg-gray-200 rounded-xl" />
    </div>
  )

  if (!data) return null
  const { user: seller, listings, ratings, avgRating } = data
  const isMine = user?._id === id

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4 flex items-center justify-between">
          {successMsg}
          <button onClick={() => setSuccessMsg('')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {isBlocked && !isMine && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          You have blocked this user.
          <button onClick={() => setShowBlockConfirm(true)} className="ml-2 underline font-medium">Unblock</button>
        </div>
      )}

      {/* Profile Card */}
      <div className="card p-5 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl flex-shrink-0 overflow-hidden">
            {seller.avatar ? <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" /> : seller.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-gray-900">{seller.name}</h1>
                  {seller.isVerifiedSeller && <span className="badge bg-blue-50 text-blue-600 border border-blue-200">Verified Seller</span>}
                  {seller.isStudentVerified && <span className="badge bg-green-50 text-green-600 border border-green-200">Student Verified</span>}
                  {seller.isSenior && <span className="badge bg-purple-50 text-purple-600 border border-purple-200">Senior</span>}
                </div>
                {seller.college && <p className="text-sm text-gray-500 mt-0.5">{seller.college}</p>}
                {seller.location && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    {seller.location}
                  </p>
                )}
              </div>

              {/* Actions menu */}
              {!isMine && user && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowRateModal(true)} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    Rate
                  </button>
                  <div className="relative group">
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10 hidden group-hover:block">
                      <button onClick={() => setShowBlockConfirm(true)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        {isBlocked ? 'Unblock' : 'Block'} User
                      </button>
                      <button onClick={() => setShowReportModal(true)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Report User
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <StarRating value={Math.round(avgRating)} readonly />
                <span className="text-sm font-semibold text-gray-900">{avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}</span>
                {seller.totalReviews > 0 && <span className="text-xs text-gray-400">({seller.totalReviews})</span>}
              </div>
              <span className="text-sm text-gray-500">Member since {timeAgo(seller.createdAt)}</span>
            </div>

            {seller.phone && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {seller.phone}
              </div>
            )}
            {seller.bio && <p className="text-sm text-gray-600 mt-2">{seller.bio}</p>}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Listings ({listings.length})</h2>
        {listings.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">
            <p className="text-sm">No active listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {listings.map(l => <ListingCard key={l._id} listing={l} />)}
          </div>
        )}
      </div>

      {/* Reviews */}
      {ratings.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Reviews ({ratings.length})</h2>
          <div className="space-y-3">
            {ratings.map(r => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
                    {r.reviewer?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.reviewer?.name}</p>
                    <StarRating value={r.stars} readonly />
                  </div>
                  <span className="ml-auto text-xs text-gray-400">{timeAgo(r.createdAt)}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rate Modal */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Rate {seller.name}</h2>
              <button onClick={() => setShowRateModal(false)}><svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleRate} className="p-5 space-y-4">
              <div>
                <label className="label">Your Rating</label>
                <StarRating value={rateForm.stars} onChange={s => setRateForm(p => ({ ...p, stars: s }))} />
              </div>
              <div>
                <label className="label">Comment (optional)</label>
                <textarea value={rateForm.comment} onChange={e => setRateForm(p => ({ ...p, comment: e.target.value }))} rows={3} className="input resize-none" placeholder="Share your experience..." maxLength={300} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowRateModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={!rateForm.stars || actionLoading} className="flex-1 btn-primary">{actionLoading ? 'Submitting...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Confirm */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            <h2 className="font-bold text-gray-900 mb-2">{isBlocked ? 'Unblock' : 'Block'} {seller.name}?</h2>
            <p className="text-sm text-gray-600 mb-4">
              {isBlocked ? 'This will allow them to interact with you again.' : 'They will not be able to message you or see your contact info.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowBlockConfirm(false)} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={handleBlock} disabled={actionLoading} className={`flex-1 ${isBlocked ? 'btn-primary' : 'btn-danger'}`}>
                {actionLoading ? 'Please wait...' : isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Report {seller.name}</h2>
              <button onClick={() => setShowReportModal(false)}><svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleReport} className="p-5 space-y-4">
              <div>
                <label className="label">Reason <span className="text-red-500">*</span></label>
                <select value={reportForm.reason} onChange={e => setReportForm(p => ({ ...p, reason: e.target.value }))} className="input" required>
                  <option value="">Select reason</option>
                  {REPORT_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Details (optional)</label>
                <textarea value={reportForm.description} onChange={e => setReportForm(p => ({ ...p, description: e.target.value }))} rows={3} className="input resize-none" placeholder="Provide more details..." maxLength={500} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={!reportForm.reason || actionLoading} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-60">
                  {actionLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
