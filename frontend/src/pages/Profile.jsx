import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import ListingCard from '../components/common/ListingCard'
import { timeAgo, DIVISIONS } from '../utils/helpers'

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get(`/users/${user._id}`)
      .then(res => setListings(res.data.listings))
      .finally(() => setLoadingListings(false))
  }, [user])

  const startEdit = () => {
    setEditForm({ name: user.name, phone: user.phone || '', college: user.college || '', location: user.location || '', bio: user.bio || '' })
    setEditing(true)
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/users/profile', editForm)
      setUser(data)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {/* Profile Card */}
      <div className="card p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl flex-shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  {user.name}
                  {user.isVerifiedSeller && <span className="badge bg-blue-50 text-blue-600 border border-blue-200 text-xs">✓ Verified Seller</span>}
                </h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button onClick={startEdit} className="btn-secondary text-sm py-1.5 flex-shrink-0">Edit</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {user.phone && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {user.phone}
                </div>
              )}
              {user.college && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                  {user.college}
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  {user.location}
                </div>
              )}
            </div>

            {user.bio && <p className="text-sm text-gray-600 mt-2">{user.bio}</p>}

            <div className="flex items-center gap-2 mt-3">
              <span className={`badge ${user.subscription?.plan === 'premium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                {user.subscription?.plan === 'premium' ? '⭐ Premium' : 'Free Plan'}
              </span>
              <span className="text-xs text-gray-400">Member since {timeAgo(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Edit Profile</h2>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={saveProfile} className="p-5 space-y-4">
              <div><label className="label">Name</label><input className="input" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div><label className="label">Phone</label><input className="input" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="01XXXXXXXXX" /></div>
              <div><label className="label">College / School</label><input className="input" value={editForm.college} onChange={e => setEditForm(p => ({ ...p, college: e.target.value }))} /></div>
              <div><label className="label">Division</label>
                <select className="input" value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}>
                  <option value="">Select division</option>
                  {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div><label className="label">Bio</label><textarea className="input resize-none" rows={3} value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} maxLength={300} /></div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditing(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <Link to="/sell" className="card p-4 text-center hover:border-blue-300 group">
          <div className="text-2xl mb-1">➕</div>
          <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Post Listing</p>
        </Link>
        <Link to="/chat" className="card p-4 text-center hover:border-blue-300 group">
          <div className="text-2xl mb-1">💬</div>
          <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Messages</p>
        </Link>
        <Link to="/notes/upload" className="card p-4 text-center hover:border-blue-300 group">
          <div className="text-2xl mb-1">📝</div>
          <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Upload Notes</p>
        </Link>
        <Link to="/verify-student" className="card p-4 text-center hover:border-green-300 group">
          <div className="text-2xl mb-1">{user.isStudentVerified ? '✅' : '🪪'}</div>
          <p className="text-sm font-medium text-gray-700 group-hover:text-green-600">{user.isStudentVerified ? 'Verified' : 'Verify ID'}</p>
        </Link>
        <button onClick={logout} className="card p-4 text-center hover:border-red-300 group">
          <div className="text-2xl mb-1">🚪</div>
          <p className="text-sm font-medium text-gray-700 group-hover:text-red-600">Logout</p>
        </button>
      </div>

      {/* My Listings */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">My Listings ({listings.length})</h2>
        {loadingListings ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-52" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-gray-500 card">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium mb-3">No listings yet</p>
            <Link to="/sell" className="btn-primary text-sm">Post your first item</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {listings.map(l => <ListingCard key={l._id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  )
}
