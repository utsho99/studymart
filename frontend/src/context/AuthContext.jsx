import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const BASE_URL = 'https://studymart-api-ukaq.onrender.com/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sm_token')
    const savedUser = localStorage.getItem('sm_user')

    if (token && savedUser) {
      // Restore user from localStorage immediately (no flicker)
      try {
        setUser(JSON.parse(savedUser))
      } catch {}

      // Then verify with server in background
      axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setUser(res.data.user)
          localStorage.setItem('sm_user', JSON.stringify(res.data.user))
        })
        .catch(() => {
          localStorage.removeItem('sm_token')
          localStorage.removeItem('sm_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await axios.post(`${BASE_URL}/auth/login`, { email, password })
    localStorage.setItem('sm_token', data.token)
    localStorage.setItem('sm_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (formData) => {
    const { data } = await axios.post(`${BASE_URL}/auth/register`, formData)
    localStorage.setItem('sm_token', data.token)
    localStorage.setItem('sm_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('sm_token')
    localStorage.removeItem('sm_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
