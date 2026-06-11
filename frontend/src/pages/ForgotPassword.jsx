import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://studymart-api-ukaq.onrender.com/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1=email, 2=code+newpass
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetCode, setResetCode] = useState('') // shown to user (no email service yet)

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/auth/forgot-password`, { email })
      setResetCode(data.code) // show code directly since no email service
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send code')
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
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/studymart-icon.png" alt="StudyMart" className="w-14 h-14 rounded-2xl mx-auto mb-4 object-cover" />
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 ? 'Enter your email to get a reset code' : 'Enter the reset code and new password'}
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">{success} Redirecting...</div>}

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="card p-6 space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" className="input" required />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-2.5">
              {loading ? 'Sending...' : 'Get Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="card p-6 space-y-4">
            {resetCode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-600 mb-1">Your reset code is:</p>
                <p className="text-2xl font-bold text-blue-700 tracking-widest">{resetCode}</p>
                <p className="text-xs text-blue-500 mt-1">Valid for 15 minutes</p>
              </div>
            )}
            <div>
              <label className="label">Reset Code</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value)}
                placeholder="Enter 6-digit code" className="input" maxLength={6} required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters" className="input" required />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password" className="input" required />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-2.5">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-700">
              Back to email
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
