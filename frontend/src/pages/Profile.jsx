import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import ListingCard from '../components/common/ListingCard'
import UserBadges from '../components/common/UserBadges'
import { timeAgo, DIVISIONS } from '../utils/helpers'

// DiceBear avatar - free, no backend needed
const getAvatar = (name) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}&backgroundColor=2563eb&textColor=ffffff&fontSize=40`

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showChangePass, setShowChangePass] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passLoading, setPassLoading] = useState(false)
  const [passError, setPassError] = useState('')
  const [passSuccess, setPassSuccess] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('')

  const AVATAR_STYLES = ['initials', 'adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'micah', 'pixel-art']

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get(`/users/${user._id}`)
      .then(res => setListings(res.data.listings))
      .finally(() => setLoadingListings(false))
  }, [user])

  const startEdit = () => {
    setEditForm({ name: user.name, phone: user.phone || '', college: user.college || '', location: user.location || '', bio: user.bio || '' })
    setSelectedAvatar(user.avatar || '')
    setEditing(true)
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updates = { ...editForm }
      if (selectedAvatar) updates.avatar = selectedAvatar
      const { data } = await api.put('/users/profile', updates)
      setUser(prev => ({ ...prev, ...data }))
      localStorage.setItem('sm_user', JSON.stringify({ ...user, ...data }))
      setEditing(false)
    } finally { setSaving(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPassError('')
    setPassSuccess('')
    if (passForm.newPassword !== passForm.confirmPassword) { setPassError('Passwords do not match'); return }
    if (passForm.newPassword.length < 6) { setPassError('Password must be at least 6 characters'); return }
    setPassLoading(true)
    try {
      const { data } = await api.post('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      })
      setPassSuccess(data.message)
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to change password')
    } finally { setPassLoading(false) }
  }

  if (!user) return null

  const avatarUrl = user.avatar || getAvatar(user.name)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {/* Profile Card */}
      <div className="card p-5 mb-6">
        <div className="flex items-start gap-4">
          <img src={avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 bg-blue-100" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  {user.name}
                  <UserBadges user={user} size="sm" />
                </h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button onClick={startEdit} className="btn-secondary text-sm py-1.5 flex-shrink-0">Edit</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {user.phone && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {user.phone}
                </div>
              )}
              {user.college && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /></svg>
                  {user.college}
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
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
              {/* Avatar picker */}
              <div>
                <label className="label">Choose Avatar Style</label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_STYLES.map(style => {
                    const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(user.name || 'User')}&backgroundColor=2563eb&textColor=ffffff`
                    return (
                      <button key={style} type="button" onClick={() => setSelectedAvatar(url)}
                        className={`p-1 rounded-xl border-2 transition-colors ${selectedAvatar === url ? 'border-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                        <img src={url} alt={style} className="w-full aspect-square rounded-lg" />
                        <p className="text-xs text-gray-500 mt-1 text-center truncate">{style}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div><label className="label">Name</label><input className="input" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div><label className="label">Phone</label><input className="input" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="01XXXXXXXXX" /></div>
              <div><label className="label">College / University</label><input className="input" value={editForm.college} onChange={e => setEditForm(p => ({ ...p, college: e.target.value }))} /></div>
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

      {/* Change Password Modal */}
      {showChangePass && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Change Password</h2>
              <button onClick={() => { setShowChangePass(false); setPassError(''); setPassSuccess('') }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              {passError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{passError}</div>}
              {passSuccess && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 text-sm">{passSuccess}</div>}
              <div><label className="label">Current Password</label><input type="password" className="input" value={passForm.currentPassword} onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))} required /></div>
              <div><label className="label">New Password</label><input type="password" className="input" value={passForm.newPassword} onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min. 6 characters" required /></div>
              <div><label className="label">Confirm New Password</label><input type="password" className="input" value={passForm.confirmPassword} onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))} required /></div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowChangePass(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={passLoading} className="flex-1 btn-primary">{passLoading ? 'Changing...' : 'Change Password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 mb-6">
        <Link to="/sell" className="card p-4 text-center hover:border-blue-300 group">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Post Listing</p>
        </Link>
        <Link to="/chat" className="card p-4 text-center hover:border-blue-300 group">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Messages</p>
        </Link>
        <Link to="/notes/upload" className="card p-4 text-center hover:border-blue-300 group">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Upload Notes</p>
        </Link>
        <Link to="/verify-student" className="card p-4 text-center hover:border-green-300 group">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-green-600 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          <p className="text-sm font-medium text-gray-700 group-hover:text-green-600">{user.isStudentVerified ? 'Verified ✓' : 'Verify ID'}</p>
        </Link>
        <button onClick={() => setShowChangePass(true)} className="card p-4 text-center hover:border-yellow-300 group">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-yellow-600 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          <p className="text-sm font-medium text-gray-700 group-hover:text-yellow-600">Change Pass</p>
        </button>
        <Link to="/referral" className="card p-4 text-center hover:border-purple-300 group">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-600 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <p className="text-sm font-medium text-gray-700 group-hover:text-purple-600">Referrals</p>
        </Link>
        <Link to="/saved" className="card p-4 text-center hover:border-pink-300 group">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-pink-600 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
          <p className="text-sm font-medium text-gray-700 group-hover:text-pink-600">Saved</p>
        </Link>
      </div>

      {/* Logout */}
      <button onClick={() => { logout(); navigate('/') }} className="w-full btn-danger mb-6 flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        Logout
      </button>

      {/* My Listings */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">My Listings ({listings.length})</h2>
        {loadingListings ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-52" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-gray-500 card">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
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
