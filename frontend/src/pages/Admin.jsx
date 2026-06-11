import { useState, useEffect } from 'react'
import axios from 'axios'

const BASE = 'https://studymart-api-ukaq.onrender.com/api/admin'

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color || 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [verifications, setVerifications] = useState([])
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const headers = { 'x-admin-token': token }

  const login = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(`${BASE}/login`, { password })
      localStorage.setItem('admin_token', data.token)
      setToken(data.token)
      setLoginError('')
    } catch {
      setLoginError('Wrong password')
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setToken('')
  }

  const fetchData = async (tab) => {
    setLoading(true)
    try {
      if (tab === 'dashboard') {
        const { data } = await axios.get(`${BASE}/stats`, { headers })
        setStats(data)
      } else if (tab === 'verifications') {
        const { data } = await axios.get(`${BASE}/verifications`, { headers })
        setVerifications(data)
      } else if (tab === 'reports') {
        const { data } = await axios.get(`${BASE}/reports`, { headers })
        setReports(data)
      } else if (tab === 'users') {
        const { data } = await axios.get(`${BASE}/users?search=${search}`, { headers })
        setUsers(data.users)
      } else if (tab === 'listings') {
        const { data } = await axios.get(`${BASE}/listings?search=${search}`, { headers })
        setListings(data.listings)
      }
    } catch (err) {
      if (err.response?.status === 401) { logout() }
    } finally { setLoading(false) }
  }

  useEffect(() => { if (token) fetchData(activeTab) }, [token, activeTab])

  const handleVerify = async (userId, approved) => {
    await axios.patch(`${BASE}/verify/${userId}`, { approved }, { headers })
    setMsg(approved ? 'User verified!' : 'Verification rejected')
    fetchData('verifications')
  }

  const handleReport = async (reportId, action) => {
    await axios.patch(`${BASE}/reports/${reportId}`, { action }, { headers })
    setMsg('Report resolved!')
    fetchData('reports')
  }

  const handleToggleBan = async (userId) => {
    const { data } = await axios.patch(`${BASE}/users/${userId}/toggle-ban`, {}, { headers })
    setMsg(data.message)
    fetchData('users')
  }

  const handleToggleVerifiedSeller = async (userId) => {
    const { data } = await axios.patch(`${BASE}/users/${userId}/toggle-verified-seller`, {}, { headers })
    setMsg(data.message)
    fetchData('users')
  }

  const handleRemoveListing = async (listingId) => {
    if (!confirm('Remove this listing?')) return
    await axios.delete(`${BASE}/listings/${listingId}`, { headers })
    setMsg('Listing removed!')
    fetchData('listings')
  }

  // Login screen
  if (!token) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/studymart-icon.png" alt="StudyMart" className="w-14 h-14 rounded-2xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">StudyMart Administration</p>
        </div>
        {loginError && <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm mb-4">{loginError}</div>}
        <form onSubmit={login} className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Admin Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password" required
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors">
            Login to Admin
          </button>
        </form>
      </div>
    </div>
  )

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'verifications', label: 'Verifications', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', badge: stats?.pendingVerifications },
    { id: 'reports', label: 'Reports', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', badge: stats?.pendingReports },
    { id: 'users', label: 'Users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'listings', label: 'Listings', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/studymart-icon.png" alt="StudyMart" className="w-7 h-7 rounded-lg" />
            <span className="font-bold text-gray-900">StudyMart Admin</span>
            <span className="badge bg-red-100 text-red-700">Admin</span>
          </div>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Success message */}
        {msg && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4 flex justify-between">
            {msg}
            <button onClick={() => setMsg('')}>✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 bg-white rounded-xl border border-gray-200 p-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap relative ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} /></svg>
              {tab.label}
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-12"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>}

        {/* Dashboard */}
        {!loading && activeTab === 'dashboard' && stats && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Users" value={stats.totalUsers} color="text-blue-600" />
              <StatCard label="Active Listings" value={stats.totalListings} color="text-green-600" />
              <StatCard label="Pending Verifications" value={stats.pendingVerifications} color="text-yellow-600" />
              <StatCard label="Pending Reports" value={stats.pendingReports} color="text-red-600" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <button onClick={() => setActiveTab('verifications')} className="card p-5 text-left hover:border-yellow-300 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Student Verifications</p>
                    <p className="text-sm text-gray-500">{stats.pendingVerifications} pending review</p>
                  </div>
                </div>
              </button>
              <button onClick={() => setActiveTab('reports')} className="card p-5 text-left hover:border-red-300 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Reports</p>
                    <p className="text-sm text-gray-500">{stats.pendingReports} pending review</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Verifications */}
        {!loading && activeTab === 'verifications' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Student Verifications ({verifications.length})</h2>
            {verifications.length === 0 ? (
              <div className="card text-center py-12 text-gray-400"><p>No pending verifications</p></div>
            ) : (
              <div className="space-y-4">
                {verifications.map(user => (
                  <div key={user._id} className="card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-sm text-gray-500">{user.college} · {user.location}</p>
                        <p className="text-xs text-gray-400 mt-1">Submitted {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <a href={user.studentIdUrl} target="_blank" rel="noreferrer"
                          className="btn-secondary text-sm py-1.5 px-3 text-center">View ID</a>
                        <button onClick={() => handleVerify(user._id, true)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">Approve</button>
                        <button onClick={() => handleVerify(user._id, false)}
                          className="btn-danger text-sm py-1.5 px-3">Reject</button>
                      </div>
                    </div>
                    {user.studentIdUrl && (
                      <img src={user.studentIdUrl} alt="Student ID" className="mt-3 max-h-48 rounded-lg object-contain border border-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports */}
        {!loading && activeTab === 'reports' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Reports ({reports.length})</h2>
            {reports.length === 0 ? (
              <div className="card text-center py-12 text-gray-400"><p>No pending reports</p></div>
            ) : (
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report._id} className="card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge bg-red-100 text-red-700">{report.reason.replace('_', ' ')}</span>
                          <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Reporter:</span> {report.reporter?.name} ({report.reporter?.email})
                        </p>
                        {report.reportedUser && (
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Reported user:</span> {report.reportedUser?.name} ({report.reportedUser?.email})
                          </p>
                        )}
                        {report.reportedListing && (
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Reported listing:</span> {report.reportedListing?.title}
                          </p>
                        )}
                        {report.description && <p className="text-sm text-gray-500 mt-1 italic">"{report.description}"</p>}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => handleReport(report._id, 'dismiss')}
                          className="btn-secondary text-sm py-1.5 px-3">Dismiss</button>
                        {report.reportedUser && (
                          <button onClick={() => handleReport(report._id, 'ban_user')}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">Ban User</button>
                        )}
                        {report.reportedListing && (
                          <button onClick={() => handleReport(report._id, 'remove_listing')}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">Remove Listing</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {!loading && activeTab === 'users' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900">Users</h2>
              <form onSubmit={e => { e.preventDefault(); fetchData('users') }} className="flex gap-2 ml-auto">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..." className="input text-sm py-1.5 w-48" />
                <button type="submit" className="btn-secondary text-sm py-1.5">Search</button>
              </form>
            </div>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">User</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 hidden sm:table-cell">College</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user._id} className={user.isBanned ? 'bg-red-50' : ''}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{user.college || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.isStudentVerified && <span className="badge bg-green-100 text-green-700">Verified</span>}
                          {user.isVerifiedSeller && <span className="badge bg-blue-100 text-blue-700">Seller</span>}
                          {user.isBanned && <span className="badge bg-red-100 text-red-700">Banned</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleToggleVerifiedSeller(user._id)}
                            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-lg transition-colors">
                            {user.isVerifiedSeller ? 'Unverify' : 'Verify Seller'}
                          </button>
                          <button onClick={() => handleToggleBan(user._id)}
                            className={`text-xs px-2 py-1 rounded-lg transition-colors ${user.isBanned ? 'bg-green-50 hover:bg-green-100 text-green-700' : 'bg-red-50 hover:bg-red-100 text-red-700'}`}>
                            {user.isBanned ? 'Unban' : 'Ban'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Listings */}
        {!loading && activeTab === 'listings' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900">Listings</h2>
              <form onSubmit={e => { e.preventDefault(); fetchData('listings') }} className="flex gap-2 ml-auto">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..." className="input text-sm py-1.5 w-48" />
                <button type="submit" className="btn-secondary text-sm py-1.5">Search</button>
              </form>
            </div>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Listing</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 hidden sm:table-cell">Seller</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Price</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listings.map(listing => (
                    <tr key={listing._id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-1">{listing.title}</p>
                        <p className="text-xs text-gray-500">{listing.category} · {listing.condition}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{listing.seller?.name}</td>
                      <td className="px-4 py-3 font-medium text-blue-600">
                        {listing.isFree ? 'Free' : `৳${listing.price}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <a href={`https://studymart-nine.vercel.app/listings/${listing._id}`} target="_blank" rel="noreferrer"
                            className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">View</a>
                          <button onClick={() => handleRemoveListing(listing._id)}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded-lg">Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
