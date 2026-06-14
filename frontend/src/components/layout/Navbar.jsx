import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { timeAgo } from '../../utils/helpers'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const prevMsgRef = useRef(0)
  const prevNotifRef = useRef(0)
  const pollRef = useRef(null)
  const notifRef = useRef(null)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) navigate(`/listings?search=${encodeURIComponent(searchQ.trim())}`)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const showBrowserNotification = (title, body, link) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const n = new Notification(title, { body, icon: '/studymart-icon.png' })
      n.onclick = () => { window.focus(); navigate(link || '/notifications'); n.close() }
      setTimeout(() => n.close(), 5000)
    }
  }

  const fetchCounts = async () => {
    try {
      const [msgRes, notifRes] = await Promise.all([
        api.get('/chat/unread'),
        api.get('/notifications/unread-count'),
      ])

      const newMsgs = msgRes.data.count
      const newNotifs = notifRes.data.count

      // Show browser notification for new messages
      if (newMsgs > prevMsgRef.current && !window.location.pathname.includes('/chat')) {
        showBrowserNotification('New Message', `You have ${newMsgs - prevMsgRef.current} new message(s)`, '/chat')
      }

      // Show browser notification for new notifications
      if (newNotifs > prevNotifRef.current && !window.location.pathname.includes('/notifications')) {
        showBrowserNotification('New Notification', 'You have a new notification', '/notifications')
      }

      prevMsgRef.current = newMsgs
      prevNotifRef.current = newNotifs
      setUnreadMessages(newMsgs)
      setUnreadNotifs(newNotifs)
    } catch {}
  }

  const fetchNotifPreview = async () => {
    try {
      const { data } = await api.get('/notifications?limit=5')
      setNotifications(data.notifications)
    } catch {}
  }

  useEffect(() => {
    if (!user) return
    requestNotificationPermission()
    fetchCounts()
    pollRef.current = setInterval(fetchCounts, 10000)
    return () => clearInterval(pollRef.current)
  }, [user])

  useEffect(() => {
    if (location.pathname.includes('/chat')) { setUnreadMessages(0); prevMsgRef.current = 0 }
    if (location.pathname.includes('/notifications')) { setUnreadNotifs(0); prevNotifRef.current = 0 }
  }, [location.pathname])

  const handleNotifClick = async (notif) => {
    await api.patch(`/notifications/${notif._id}/read`).catch(() => {})
    setShowNotifDropdown(false)
    setUnreadNotifs(prev => Math.max(0, prev - 1))
    navigate(notif.link)
  }

  const markAllRead = async () => {
    await api.patch('/notifications/read-all').catch(() => {})
    setUnreadNotifs(0)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const navLinks = [
    { to: '/listings', label: 'Browse' },
    { to: '/notes', label: 'Notes' },
    { to: '/pyq', label: 'PYQ Bank' },
    { to: '/tuition', label: 'Tuition' },
    { to: '/seniors', label: 'Seniors' },
  ]

  const NotifBell = () => (
    <div className="relative" ref={notifRef}>
      <button onClick={() => { setShowNotifDropdown(!showNotifDropdown); if (!showNotifDropdown) fetchNotifPreview() }}
        className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadNotifs > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
            {unreadNotifs > 9 ? '9+' : unreadNotifs}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showNotifDropdown && (
        <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadNotifs > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
              )}
              <Link to="/notifications" onClick={() => setShowNotifDropdown(false)} className="text-xs text-gray-500 hover:text-gray-700">View all</Link>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : notifications.map(n => (
              <button key={n._id} onClick={() => handleNotifClick(n)}
                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-blue-50' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {n.sender?.avatar
                    ? <img src={n.sender.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    : <svg className={`w-4 h-4 ${!n.isRead ? 'text-blue-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'} line-clamp-2`}>{n.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
              </button>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-gray-100">
            <Link to="/notifications" onClick={() => setShowNotifDropdown(false)}
              className="block text-center text-xs text-blue-600 hover:underline font-medium">
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-3">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/studymart-icon.png" alt="StudyMart" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-gray-900 text-lg hidden sm:block">StudyMart</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search books, notes, PYQs..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white" />
            </div>
          </form>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${location.pathname === l.to ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 flex-shrink-0">
            {user ? (
              <>
                <Link to="/sell" className="btn-primary text-sm py-1.5 px-3 hidden sm:flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Sell
                </Link>

                {/* Chat icon */}
                <Link to="/chat" className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {unreadMessages > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Notification bell */}
                <NotifBell />

                {/* User menu */}
                <div className="relative">
                  <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs overflow-hidden">
                      {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" /> : user.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      {[
                        { to: '/profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                        { to: '/notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
                        { to: '/seniors', label: 'Find Senior', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                        { to: '/pyq', label: 'PYQ Bank', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                      { to: '/tuition', label: 'Tuition Board', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
                      { to: '/saved', label: 'Saved Listings', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
                      { to: '/lost-found', label: 'Lost & Found', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                          {item.label}
                        </Link>
                      ))}
                      <button onClick={() => { logout(); setMenuOpen(false); navigate('/') }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-1.5 px-3">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-3 hidden sm:block">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        {[
          { to: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Home' },
          { to: '/listings', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', label: 'Browse' },
          { to: '/sell', icon: 'M12 4v16m8-8H4', label: 'Sell', primary: true },
          { to: '/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', label: 'Notifs', badge: unreadNotifs },
          { to: user ? '/profile' : '/login', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile' },
        ].map(item => (
          <Link key={item.to} to={item.to}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors ${location.pathname === item.to ? 'text-blue-600' : 'text-gray-500'}`}>
            {item.primary ? (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-0.5">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              </div>
            ) : (
              <div className="relative">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center font-bold" style={{fontSize:'8px'}}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
            )}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  )
}
