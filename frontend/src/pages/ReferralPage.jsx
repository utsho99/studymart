import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { timeAgo } from '../utils/helpers'

export default function ReferralPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/auth/referral-stats')
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [user])

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="max-w-lg mx-auto px-4 py-12 animate-pulse"><div className="h-64 bg-gray-200 rounded-xl" /></div>

  const isPremium = data?.user?.subscription?.plan === 'premium' && new Date(data?.user?.subscription?.expiresAt) > new Date()
  const progress = data ? (data.user.referralCount % 5) : 0

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-1">Referral Program</h1>
        <p className="text-purple-100 text-sm">Invite friends and earn Premium access + Featured listing credits</p>
      </div>

      {/* Premium Status */}
      {isPremium && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          </div>
          <div>
            <p className="font-semibold text-yellow-800">Premium Active!</p>
            <p className="text-xs text-yellow-600">Expires {new Date(data.user.subscription.expiresAt).toLocaleDateString('en-BD')}</p>
          </div>
        </div>
      )}

      {/* Your Referral Code */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Your Referral Code</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
            <p className="text-3xl font-black tracking-widest text-blue-600">{user?.referralCode || '------'}</p>
          </div>
          <button onClick={copyCode}
            className={`px-4 py-3 rounded-xl font-medium text-sm transition-colors ${copied ? 'bg-green-500 text-white' : 'btn-primary'}`}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">Share this code with friends. They enter it when registering.</p>
      </div>

      {/* Progress */}
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Progress to Next Reward</h2>
          <span className="text-sm font-bold text-purple-600">{progress}/5 referrals</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(progress / 5) * 100}%` }} />
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
          {data?.nextRewardAt === 0 ? (
            <p className="text-sm font-semibold text-purple-700">Reward unlocked! You get 15 days Premium + 1 Featured Credit</p>
          ) : (
            <p className="text-sm text-purple-600">
              Invite <strong>{data?.nextRewardAt} more</strong> friend{data?.nextRewardAt !== 1 ? 's' : ''} to unlock:
              <br /><span className="font-semibold">15 days Premium + 1 Featured Listing Credit</span>
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{data?.user?.referralCount || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Total Referrals</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-purple-600">{data?.user?.credits || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Credits</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-blue-600">{data?.user?.featuredListingsRemaining || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Featured Slots</p>
        </div>
      </div>

      {/* How it works */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">How It Works</h2>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Copy your referral code above', color: 'bg-blue-100 text-blue-600' },
            { step: '2', text: 'Share it with friends on WhatsApp, Facebook, etc.', color: 'bg-purple-100 text-purple-600' },
            { step: '3', text: 'They enter the code when registering on StudyMart', color: 'bg-pink-100 text-pink-600' },
            { step: '4', text: 'Every 5 referrals = 15 days Premium + 1 Featured Credit!', color: 'bg-green-100 text-green-600' },
          ].map(item => (
            <div key={item.step} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full ${item.color} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                {item.step}
              </div>
              <p className="text-sm text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral History */}
      {data?.referrals?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">People You Invited ({data.referrals.length})</h2>
          <div className="space-y-2">
            {data.referrals.map(r => (
              <div key={r._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm overflow-hidden flex-shrink-0">
                  {r.referee?.avatar
                    ? <img src={r.referee.avatar} alt="" className="w-full h-full object-cover" />
                    : r.referee?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{r.referee?.name}</p>
                  <p className="text-xs text-gray-400">Joined {timeAgo(r.createdAt)}</p>
                </div>
                <span className="badge bg-green-100 text-green-700 text-xs">+1 referral</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
