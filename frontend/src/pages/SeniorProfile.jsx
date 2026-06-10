import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { timeAgo } from '../utils/helpers'

export default function SeniorProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('notes')

  useEffect(() => {
    api.get(`/seniors/${id}`)
      .then(res => { setData(res.data); setFollowing(res.data.isFollowing) })
      .finally(() => setLoading(false))
  }, [id])

  const handleFollow = async () => {
    if (!user) return
    setFollowLoading(true)
    try {
      const { data: res } = await api.post(`/seniors/${id}/follow`)
      setFollowing(res.following)
      setData(prev => ({ ...prev, followersCount: res.following ? prev.followersCount + 1 : prev.followersCount - 1 }))
    } finally { setFollowLoading(false) }
  }

  const handleDownload = async (type, item) => {
    await api.patch(`/${type}/${item._id}/download`)
    window.open(item.fileUrl, '_blank')
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse"><div className="h-32 bg-gray-200 rounded-xl mb-4" /><div className="h-64 bg-gray-200 rounded-xl" /></div>
  if (!data) return null

  const { senior, notes, pyqs, followersCount } = data
  const isMine = user?._id === id

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="card p-5 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl flex-shrink-0">
            {senior.avatar ? <img src={senior.avatar} alt={senior.name} className="w-full h-full rounded-full object-cover" /> : senior.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-gray-900">{senior.name}</h1>
                  {senior.isSenior && <span className="badge bg-blue-50 text-blue-600 border border-blue-200">Senior</span>}
                  {senior.isStudentVerified && <span className="badge bg-green-50 text-green-600 border border-green-200">Verified</span>}
                </div>
                <p className="text-sm text-gray-500">{senior.college}</p>
                {senior.department && <p className="text-xs text-gray-500">{senior.department} {senior.year && `· ${senior.year}`}</p>}
              </div>
              {!isMine && user && (
                <button onClick={handleFollow} disabled={followLoading}
                  className={`flex-shrink-0 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${following ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'btn-primary'}`}>
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            {senior.bio && <p className="text-sm text-gray-600 mt-2">{senior.bio}</p>}
            <div className="flex items-center gap-5 mt-3">
              <div className="text-center"><p className="text-lg font-bold text-gray-900">{followersCount}</p><p className="text-xs text-gray-500">Followers</p></div>
              <div className="text-center"><p className="text-lg font-bold text-gray-900">{notes.length}</p><p className="text-xs text-gray-500">Notes</p></div>
              <div className="text-center"><p className="text-lg font-bold text-gray-900">{pyqs.length}</p><p className="text-xs text-gray-500">PYQs</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-4">
        {['notes', 'pyqs'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab === 'notes' ? `Notes (${notes.length})` : `PYQs (${pyqs.length})`}
          </button>
        ))}
      </div>

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
    </div>
  )
}
