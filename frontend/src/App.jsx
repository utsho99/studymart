// StudyMart v9 - final routing fix
import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import SellItem from './pages/SellItem'
import EditListing from './pages/EditListing'
import Notes from './pages/Notes'
import UploadNotes from './pages/UploadNotes'
import PYQBank from './pages/PYQBank'
import UploadPYQ from './pages/UploadPYQ'
import FindSenior from './pages/FindSenior'
import SeniorProfile from './pages/SeniorProfile'
import SellerProfile from './pages/SellerProfile'
import StudentVerification from './pages/StudentVerification'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import Admin from './pages/Admin'
import Notifications from './pages/Notifications'
import LostFound from './pages/LostFound'
import GPACalculator from './pages/GPACalculator'
import Tuition from './pages/Tuition'
import SavedListings from './pages/SavedListings'
import ReferralPage from './pages/ReferralPage'

function Layout() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'
  return (
    <>
      {!isAdmin && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id/edit" element={<EditListing />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/sell" element={<SellItem />} />
          <Route path="/notes/upload" element={<UploadNotes />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/pyq/upload" element={<UploadPYQ />} />
          <Route path="/pyq" element={<PYQBank />} />
          <Route path="/seniors/:id" element={<SeniorProfile />} />
          <Route path="/seniors" element={<FindSenior />} />
          <Route path="/users/:id" element={<SellerProfile />} />
          <Route path="/verify-student" element={<StudentVerification />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/gpa" element={<GPACalculator />} />
          <Route path="/tuition" element={<Tuition />} />
          <Route path="/saved" element={<SavedListings />} />
          <Route path="/referral" element={<ReferralPage />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
              <p className="text-gray-500 mb-6">The page you are looking for does not exist.</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          } />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Layout />
      </div>
    </AuthProvider>
  )
}
