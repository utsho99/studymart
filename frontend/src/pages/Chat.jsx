import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { timeAgo } from '../utils/helpers'

let socket = null

export default function Chat() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeout = useRef(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    socket = io('https://studymart-api-ukaq.onrender.com', { query: { userId: user._id } })

    socket.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg])
    })
    socket.on('userTyping', () => setIsTyping(true))
    socket.on('userStoppedTyping', () => setIsTyping(false))

    api.get('/chat/conversations').then(res => {
      setConversations(res.data)
      if (conversationId) {
        const conv = res.data.find(c => c._id === conversationId)
        if (conv) openConversation(conv)
      } else if (res.data.length > 0) {
        openConversation(res.data[0])
      }
    })

    return () => socket?.disconnect()
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openConversation = async (conv) => {
    setActiveConv(conv)
    socket?.emit('joinConversation', conv._id)
    const { data } = await api.get(`/chat/conversations/${conv._id}/messages`)
    setMessages(data)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMsg.trim() || !activeConv || sending) return
    setSending(true)
    const text = newMsg.trim()
    setNewMsg('')
    socket?.emit('sendMessage', { conversationId: activeConv._id, senderId: user._id, text })
    socket?.emit('stopTyping', { conversationId: activeConv._id })
    setSending(false)
  }

  const handleTyping = (e) => {
    setNewMsg(e.target.value)
    if (activeConv) {
      socket?.emit('typing', { conversationId: activeConv._id, userId: user._id })
      clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => {
        socket?.emit('stopTyping', { conversationId: activeConv._id })
      }, 1500)
    }
  }

  const getOtherParticipant = (conv) => {
    return conv.participants?.find(p => p._id !== user?._id)
  }

  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>

      <div className="flex gap-4 h-[70vh] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Conversations List */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm font-medium text-gray-700 mb-1">No messages yet</p>
              <p className="text-xs text-gray-500">Contact a seller to start chatting</p>
            </div>
          ) : conversations.map(conv => {
            const other = getOtherParticipant(conv)
            return (
              <button key={conv._id} onClick={() => openConversation(conv)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${activeConv?._id === conv._id ? 'bg-blue-50' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold flex-shrink-0">
                  {other?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{other?.name || 'User'}</p>
                  {conv.listing && <p className="text-xs text-blue-600 truncate">{conv.listing.title}</p>}
                  <p className="text-xs text-gray-400 truncate">{conv.lastMessage || 'No messages yet'}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-3 border-b border-gray-200 flex items-center gap-3">
                {(() => {
                  const other = getOtherParticipant(activeConv)
                  return (
                    <>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                        {other?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{other?.name}</p>
                        {other?.college && <p className="text-xs text-gray-500">{other.college}</p>}
                      </div>
                    </>
                  )
                })()}
                {activeConv.listing && (
                  <Link to={`/listings/${activeConv.listing._id}`} className="ml-auto text-xs text-blue-600 hover:underline truncate max-w-32">
                    {activeConv.listing.title}
                  </Link>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => {
                  const isMe = msg.sender?._id === user._id || msg.sender === user._id
                  return (
                    <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-0.5 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>{timeAgo(msg.createdAt)}</p>
                      </div>
                    </div>
                  )
                })}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-3 py-2 text-sm text-gray-500">typing...</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 flex gap-2">
                <input type="text" value={newMsg} onChange={handleTyping} placeholder="Type a message..."
                  className="flex-1 input text-sm py-2" autoFocus />
                <button type="submit" disabled={!newMsg.trim()} className="btn-primary px-4 py-2 text-sm">Send</button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-5xl mb-3">💬</p>
                <p className="text-sm">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
