import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sm_token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get('/api/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => { localStorage.removeItem('sm_token'); delete axios.defaults.headers.common['Authorization'] })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password })
    localStorage.setItem('sm_token', data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
    return data
  }

  const register = async (formData) => {
    const { data } = await axios.post('/api/auth/register', formData)
    localStorage.setItem('sm_token', data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('sm_token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
