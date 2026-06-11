import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function StudentVerification() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!user) { navigate('/login'); return null }

  if (user.isStudentVerified) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Verified!</h1>
      <p className="text-gray-500 mb-6">Your student ID has been verified. You have the verified badge on your profile.</p>
      <Link to="/profile" className="btn-primary">Back to Profile</Link>
    </div>
  )

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setError('File must be under 5MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { setError('Please upload your student ID'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('studentId', file)
      await api.post('/users/verify-student', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">ID Submitted!</h1>
      <p className="text-gray-500 mb-6">Your student ID has been submitted for review. We'll verify it within 24 hours.</p>
      <Link to="/profile" className="btn-primary">Back to Profile</Link>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/profile" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Student Verification</h1>
      </div>

      <div className="card p-5 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Why verify?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Get a verified student badge on your profile</li>
              <li className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Build trust with buyers and sellers</li>
              <li className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Required to become a Senior Contributor</li>
            </ul>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Upload Student ID</h2>
          <p className="text-sm text-gray-500">Upload a clear photo of your student ID card. Your ID will be kept private and only used for verification.</p>

          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {preview ? (
              <div>
                <img src={preview} alt="Student ID preview" className="max-h-48 mx-auto rounded-lg object-contain mb-2" />
                <p className="text-xs text-blue-600 font-medium">Click to change</p>
              </div>
            ) : (
              <div>
                <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <p className="text-sm text-gray-600 font-medium">Click to upload student ID</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
              </div>
            )}
          </label>
        </div>

        <button type="submit" disabled={loading || !file} className="w-full btn-primary py-3">
          {loading ? 'Uploading...' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  )
}
