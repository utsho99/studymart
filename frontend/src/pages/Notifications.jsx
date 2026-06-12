import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { timeAgo } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

const NotificationIcon = ({ type }) => {
  const icons = {
    message: { bg: 'bg-blue-100', color: 'text-blue-600', path: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    follow: { bg: 'bg-purple-100', color: 'text-purple-600', path: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
    rating: { bg: 'bg-yellow-100', color: 'text-yellow-600', path: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    like: { bg: 'bg-red-100', color: 'text-red-500', path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    listing_sold: { bg: 'bg-green-100', color: 'text-green-600', path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  }
  const icon = icons[type] || icons.message
  return (
    <div className={`w-10 h-10 ${icon.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
      <svg className={`w-5 h-5 ${icon.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon.path} />
      </svg>
    </div>
  )
}

export default function Notifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } finally { setLoading(false) }
  }

  const markAllRead = async () => {
    await api.patch('/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const clearAll = async () => {
    if (!confirm('Clear all notifications?')) return
    await api.delete('/notifications')
    setNotifications([])
    setUnreadCount(0)
  }

  const handleClick = (notification) => {
    if (!notification.isRead) markRead(notification._id)
    navigate(notification.link)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-blue-600 mt-0.5">{unreadCount} unread</p>}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary text-sm py-1.5">Mark all read</button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="btn-danger text-sm py-1.5">Clear all</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-20" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 card">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="font-semibold text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-sm text-gray-500">When someone messages, follows, or rates you — it will show here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <button key={n._id} onClick={() => handleClick(n)}
              className={`w-full card p-4 flex items-start gap-3 text-left hover:shadow-md transition-shadow ${!n.isRead ? 'bg-blue-50 border-blue-100' : ''}`}>
              {n.sender?.avatar ? (
                <img src={n.sender.avatar} alt={n.sender.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <NotificationIcon type={n.type} />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
