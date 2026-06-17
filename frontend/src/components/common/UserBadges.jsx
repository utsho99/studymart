export default function UserBadges({ user, size = 'sm' }) {
  if (!user) return null
  const isPremium = user.subscription?.plan === 'premium' && new Date(user.subscription?.expiresAt) > new Date()
  const s = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'

  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      {user.isEarlyUser && (
        <span className={`badge ${s} bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold`}>
          ⚡ Early User
        </span>
      )}
      {isPremium && (
        <span className={`badge ${s} bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold`}>
          ★ Premium
        </span>
      )}
      {user.isVerifiedSeller && (
        <span className={`badge ${s} bg-blue-50 text-blue-600 border border-blue-200`}>✓ Verified</span>
      )}
      {user.isStudentVerified && (
        <span className={`badge ${s} bg-green-50 text-green-600 border border-green-200`}>✓ Student</span>
      )}
      {user.isSenior && (
        <span className={`badge ${s} bg-purple-50 text-purple-600 border border-purple-200`}>Senior</span>
      )}
    </span>
  )
}
