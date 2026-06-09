export const formatPrice = (price, isFree) => {
  if (isFree) return 'Free'
  if (price === 0) return 'Free'
  return `৳${price.toLocaleString('en-BD')}`
}

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const conditionColor = (condition) => {
  const map = {
    'New': 'bg-green-100 text-green-700',
    'Like New': 'bg-blue-100 text-blue-700',
    'Used': 'bg-yellow-100 text-yellow-700',
    'Heavily Used': 'bg-red-100 text-red-700',
  }
  return map[condition] || 'bg-gray-100 text-gray-600'
}

export const categoryIcon = (category) => {
  const map = {
    'Books': '📚',
    'Notes': '📝',
    'Calculator': '🧮',
    'Stationery': '✏️',
    'Electronics': '💻',
    'Uniform': '👕',
    'Others': '📦',
  }
  return map[category] || '📦'
}

export const CATEGORIES = ['Books', 'Notes', 'Calculator', 'Stationery', 'Electronics', 'Uniform', 'Others']
export const CONDITIONS = ['New', 'Like New', 'Used', 'Heavily Used']
export const DIVISIONS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh']
export const NOTE_CLASSES = ['Class 9', 'Class 10', 'SSC', 'Class 11', 'Class 12', 'HSC', 'Admission', 'University', 'Others']
