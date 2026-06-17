import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DIVISIONS } from '../utils/helpers'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', college: '', location: '',
    referralCode: searchParams.get('ref') || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password || !form.phone || !form.college || !form.location) {
      setError('All fields are required'); return
    }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (!/^01[3-9]\d{8}$/.test(form.phone)) { setError('Please enter a valid Bangladeshi phone number'); return }

    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/studymart-icon.png" alt="StudyMart" className="w-14 h-14 rounded-2xl mx-auto mb-4 object-cover" />
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Bangladesh's student marketplace</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="input" required />
          </div>
          <div>
            <label className="label">Email <span className="text-red-500">*</span></label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className="input" required />
          </div>
          <div>
            <label className="label">Password <span className="text-red-500">*</span></label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" className="input" required />
          </div>
          <div>
            <label className="label">Phone Number <span className="text-red-500">*</span></label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="01XXXXXXXXX" className="input" required />
          </div>
          <div>
            <label className="label">College / University <span className="text-red-500">*</span></label>
            <input type="text" name="college" value={form.college} onChange={handleChange} placeholder="Your institution name" className="input" required />
          </div>
          <div>
            <label className="label">Division <span className="text-red-500">*</span></label>
            <select name="location" value={form.location} onChange={handleChange} className="input" required>
              <option value="">Select your division</option>
              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Referral Code (optional)</label>
            <input type="text" name="referralCode" value={form.referralCode} onChange={handleChange}
              placeholder="Enter 6-digit referral code" className="input" maxLength={6}
              style={{ textTransform: 'uppercase' }} />
            {form.referralCode && (
              <p className="text-xs text-green-600 mt-1">Referral code applied!</p>
            )}
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
