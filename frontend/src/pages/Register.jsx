import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DIVISIONS } from '../utils/helpers'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', college: '', location: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Bangladesh's student marketplace</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name" className="input" required />
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
            <label className="label">Phone (optional)</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="01XXXXXXXXX" className="input" />
          </div>
          <div>
            <label className="label">College / School (optional)</label>
            <input type="text" name="college" value={form.college} onChange={handleChange} placeholder="Your institution" className="input" />
          </div>
          <div>
            <label className="label">Division (optional)</label>
            <select name="location" value={form.location} onChange={handleChange} className="input">
              <option value="">Select your division</option>
              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
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
