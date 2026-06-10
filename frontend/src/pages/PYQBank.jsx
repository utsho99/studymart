import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { timeAgo } from '../utils/helpers'

const EXAM_TYPES = ['SSC', 'HSC', 'Admission', 'University', 'Medical', 'Engineering', 'BBA', 'Law', 'Others']
const YEARS = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i)

function PYQCard({ pyq }) {
  const handleDownload = async () => {
    await api.patch(`/pyq/${pyq._id}/download`)
    window.open(pyq.fileUrl, '_blank')
  }

  return (
    <div className="card p-4 flex gap-4">
      <div className="w-12 h-14 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{pyq.title}</h3>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="badge bg-orange-50 text-orange-700 border border-orange-100">{pyq.examType}</span>
          <span className="badge bg-gray-100 text-gray-600">{pyq.year}</span>
          <span className="badge bg-blue-50 text-blue-600">{pyq.subject}</span>
        </div>
        {pyq.institution && <p className="text-xs text-gray-500 mb-1">{pyq.institution}</p>}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">by {pyq.uploader?.name} · {timeAgo(pyq.createdAt)}</p>
            <p className="text-xs text-gray-400">{pyq.downloads} downloads</p>
          </div>
          <button onClick={handleDownload}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PYQBank() {
  const [pyqs, setPyqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [examType, setExamType] = useState('')
  const [year, setYear] = useState('')

  const fetchPYQs = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (examType) params.set('examType', examType)
    if (year) params.set('year', year)
    api.get(`/pyq?${params}`).then(res => setPyqs(res.data.pyqs)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchPYQs() }, [examType, year])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PYQ Bank</h1>
          <p className="text-sm text-gray-500 mt-1">Previous Year Questions for all exams</p>
        </div>
        <Link to="/pyq/upload" className="btn-primary text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload PYQ
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={e => { e.preventDefault(); fetchPYQs() }} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by subject, title..." className="input pl-9" />
        </div>
        <button type="submit" className="btn-secondary text-sm">Search</button>
      </form>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select value={examType} onChange={e => setExamType(e.target.value)} className="input text-sm w-auto">
          <option value="">All Exams</option>
          {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)} className="input text-sm w-auto">
          <option value="">All Years</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Exam type pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {['', ...EXAM_TYPES].map(type => (
          <button key={type || 'all'} onClick={() => setExamType(type)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${examType === type ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'}`}>
            {type || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}</div>
      ) : pyqs.length === 0 ? (
        <div className="text-center py-16 card">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <h3 className="font-semibold text-gray-900 mb-2">No PYQs found</h3>
          <Link to="/pyq/upload" className="btn-primary text-sm">Upload First PYQ</Link>
        </div>
      ) : (
        <div className="space-y-3">{pyqs.map(pyq => <PYQCard key={pyq._id} pyq={pyq} />)}</div>
      )}
    </div>
  )
}
