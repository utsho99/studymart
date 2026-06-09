import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import SellItem from './pages/SellItem'
import Notes from './pages/Notes'
import UploadNotes from './pages/UploadNotes'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Chat from './pages/Chat'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/sell" element={<SellItem />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/upload" element={<UploadNotes />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:conversationId" element={<Chat />} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <p className="text-6xl mb-4">🔍</p>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
