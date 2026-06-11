import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { timeAgo } from '../utils/helpers'

function StarRating({ value, onChange, readonly }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
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

export default function SeniorProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('notes')
  const [followers, setFollowers] = useState([])
  const [showFollowers, setShowFollowers] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ stars: 0, comment: '' })
  const [reviewLoading, setReviewLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchData = () => {
    api.get(`/seniors/${id}`)
      .then(res => { setData(res.data); setFollowing(res.data.isFollowing) })
      .catch(() => navigate('/seniors'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [id])

  const handleFollow = async () => {
    if (!user) { navigate('/login'); return }
    setFollowLoading(true)
    try {
      const { data: res } = await api.post(`/seniors/${id}/follow`)
      setFollowing(res.following)
      setData(prev => ({ ...prev, followersCount: res.following ? prev.followersCount + 1 : prev.followersCount - 1 }))
    } finally { setFollowLoading(false) }
  }

  const loadFollowers = async () => {
    const { data: res } = await api.get(`/seniors/${id}/followers`)
    setFollowers(res)
    setShowFollowers(true)
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!reviewForm.stars) return
    setReviewLoading(true)
    try {
      await api.post(`/seniors/${id}/review`, reviewForm)
      setSuccessMsg('Review submitted!')
      setShowReviewModal(false)
      fetchData()
    } finally { setReviewLoading(false) }
  }

  const handleDownload = async (type, item) => {
    await api.patch(`/${type}/${item._id}/download`)
    window.open(item.fileUrl, '_blank')
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-xl mb-4" />
      <div className="h-64 bg-gray-200 rounded-xl" />
    </div>
  )
  if (!data) return null

  const { senior, notes, pyqs, followersCount, followingCount, reviews, avgRating } = data
  const isMine = user?._id === id

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4 flex justify-between">
          {successMsg}
          <button onClick={() => setSuccessMsg('')}>✕</button>
        </div>
      )}

      {/* Profile Card */}
      <div className="card p-5 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl flex-shrink-0 overflow-hidden">
            {senior.avatar ? <img src={senior.avatar} alt={senior.name} className="w-full h-full object-cover" /> : senior.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h1 className="text-lg font-bold text-gray-900">{senior.name}</h1>
                  {senior.isSenior && <span className="badge bg-blue-50 text-blue-600 border border-blue-200">Senior</span>}
                  {senior.isStudentVerified && <span className="badge bg-green-50 text-green-600 border border-green-200">Verified</span>}
                </div>
                <p className="text-sm text-gray-500">{senior.college}</p>
                {senior.department && <p className="text-xs text-gray-500">{senior.department}{senior.year && ` · ${senior.year}`}</p>}
              </div>
              {!isMine && user && (
                <div className="flex gap-2">
                  <button onClick={() => setShowReviewModal(true)} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    Review
                  </button>
                  <button onClick={handleFollow} disabled={followLoading}
                    className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${following ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'btn-primary'}`}>
                    {following ? 'Following' : 'Follow'}
                  </button>
                </div>
              )}
            </div>

            {senior.bio && <p className="text-sm text-gray-600 mt-2">{senior.bio}</p>}

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <StarRating value={Math.round(avgRating)} readonly />
                <span className="text-sm font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-5 mt-3">
              <button onClick={loadFollowers} className="text-center hover:opacity-70 transition-opacity">
                <p className="text-lg font-bold text-gray-900">{followersCount}</p>
                <p className="text-xs text-gray-500 underline">Followers</p>
              </button>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{notes.length}</p>
                <p className="text-xs text-gray-500">Notes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{pyqs.length}</p>
                <p className="text-xs text-gray-500">PYQs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {['notes', 'pyqs', 'reviews'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab === 'notes' ? `Notes (${notes.length})` : tab === 'pyqs' ? `PYQs (${pyqs.length})` : `Reviews (${reviews.length})`}
          </button>
        ))}
      </div>

      {/* Notes tab */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          {notes.length === 0 ? <p className="text-center py-10 text-gray-400 text-sm">No notes uploaded yet</p>
          : notes.map(note => (
            <div key={note._id} className="card p-4 flex gap-4">
              <div className="w-10 h-12 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{note.title}</p>
                <p className="text-xs text-gray-500">{note.subject} · {timeAgo(note.createdAt)}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-semibold text-blue-600">{note.isFree ? 'Free' : `৳${note.price}`}</span>
                  <button onClick={() => handleDownload('notes', note)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg">Download</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PYQs tab */}
      {activeTab === 'pyqs' && (
        <div className="space-y-3">
          {pyqs.length === 0 ? <p className="text-center py-10 text-gray-400 text-sm">No PYQs uploaded yet</p>
          : pyqs.map(pyq => (
            <div key={pyq._id} className="card p-4 flex gap-4">
              <div className="w-10 h-12 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{pyq.title}</p>
                <p className="text-xs text-gray-500">{pyq.subject} · {pyq.year} · {timeAgo(pyq.createdAt)}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="badge bg-orange-50 text-orange-700">{pyq.examType}</span>
                  <button onClick={() => handleDownload('pyq', pyq)} className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg">Download</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {!isMine && user && (
            <button onClick={() => setShowReviewModal(true)} className="w-full card p-4 text-center text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors border-dashed border-2 border-blue-200">
              + Write a Review
            </button>
          )}
          {reviews.length === 0 ? <p className="text-center py-10 text-gray-400 text-sm">No reviews yet</p>
          : reviews.map(r => (
            <div key={r._id} className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
                  {r.reviewer?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{r.reviewer?.name}</p>
                  <StarRating value={r.stars} readonly />
                </div>
                <span className="text-xs text-gray-400">{timeAgo(r.createdAt)}</span>
              </div>
              {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Followers Modal */}
      {showFollowers && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Followers ({followersCount})</h2>
              <button onClick={() => setShowFollowers(false)}><svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {followers.length === 0 ? <p className="text-center text-gray-400 text-sm py-4">No followers yet</p>
              : followers.map(f => (
                <Link key={f._id} to={`/users/${f._id}`} onClick={() => setShowFollowers(false)} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                    {f.avatar ? <img src={f.avatar} alt={f.name} className="w-full h-full rounded-full object-cover" /> : f.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{f.name}</p>
                    {f.college && <p className="text-xs text-gray-500">{f.college}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Review {senior.name}</h2>
              <button onClick={() => setShowReviewModal(false)}><svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleReview} className="p-5 space-y-4">
              <div>
                <label className="label">Your Rating</label>
                <StarRating value={reviewForm.stars} onChange={s => setReviewForm(p => ({ ...p, stars: s }))} />
              </div>
              <div>
                <label className="label">Your Review</label>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} rows={3} className="input resize-none" placeholder="How helpful was this senior?" maxLength={300} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={!reviewForm.stars || reviewLoading} className="flex-1 btn-primary">{reviewLoading ? 'Submitting...' : 'Submit Review'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
