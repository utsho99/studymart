import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://studymart-api-ukaq.onrender.com/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/auth/forgot-password`, { email })
      setStep(2)
      setSuccess(data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send code. Please try again.')
    } finally { setLoading(false) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/auth/reset-password`, { email, code, newPassword })
      setSuccess(data.message)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed. Please check your code.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/studymart-icon.png" alt="StudyMart" className="w-14 h-14 rounded-2xl mx-auto mb-4 object-cover" />
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 1 ? 'Forgot Password' : 'Check Your Email'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1
              ? 'Enter your email and we\'ll send a reset code'
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {success && step === 2 && !error && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="card p-6 space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" className="input" required autoFocus />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-2.5">
              {loading ? 'Sending code...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="card p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-blue-700 font-medium">Check your inbox</p>
              <p className="text-xs text-blue-500 mt-1">Enter the 6-digit code we sent to <strong>{email}</strong></p>
              <p className="text-xs text-blue-400 mt-1">Also check your spam folder</p>
            </div>

            <div>
              <label className="label">6-Digit Reset Code</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000" className="input text-center text-2xl tracking-widest font-bold"
                maxLength={6} required autoFocus />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters" className="input" required />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password" className="input" required />
            </div>
            <button type="submit" disabled={loading || code.length !== 6} className="w-full btn-primary py-2.5">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => { setStep(1); setError(''); setSuccess('') }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-1">
              ← Back to email
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-4">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
