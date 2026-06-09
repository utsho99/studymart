import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { timeAgo, NOTE_CLASSES } from '../utils/helpers'

function NoteCard({ note }) {
  const handleDownload = async () => {
    await api.patch(`/notes/${note._id}/download`)
    window.open(note.fileUrl, '_blank')
  }

  return (
    <div className="card p-4 flex gap-4">
      <div className="w-12 h-14 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-lg">📄</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{note.title}</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="badge bg-blue-50 text-blue-600">{note.subject}</span>
          {note.class && <span className="badge bg-gray-100 text-gray-600">{note.class}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">by {note.uploader?.name} · {timeAgo(note.createdAt)}</p>
            <p className="text-xs text-gray-400">{note.downloads} downloads</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-blue-600">{note.isFree ? 'Free' : `৳${note.price}`}</span>
            <button onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [noteClass, setNoteClass] = useState('')

  const fetchNotes = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (noteClass) params.set('class', noteClass)
    api.get(`/notes?${params}`).then(res => setNotes(res.data.notes)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotes() }, [noteClass])

  const handleSearch = (e) => {
    e.preventDefault()
    setLoading(true)
    fetchNotes()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Notes</h1>
          <p className="text-sm text-gray-500 mt-1">Free and paid notes shared by students</p>
        </div>
        <Link to="/notes/upload" className="btn-primary text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by subject, topic..." className="input pl-9" />
        </div>
        <button type="submit" className="btn-secondary text-sm">Search</button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {['', ...NOTE_CLASSES].map(cls => (
          <button key={cls || 'all'} onClick={() => setNoteClass(cls)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${noteClass === cls ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
            {cls || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-5xl mb-3">📝</p>
          <h3 className="font-semibold text-gray-900 mb-2">No notes found</h3>
          <p className="text-sm text-gray-500 mb-4">Be the first to share notes!</p>
          <Link to="/notes/upload" className="btn-primary text-sm">Upload Notes</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(note => <NoteCard key={note._id} note={note} />)}
        </div>
      )}
    </div>
  )
}
