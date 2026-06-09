import axios from 'axios'

// In development: uses Vite proxy → goes to localhost:5000
// In production: uses VITE_API_URL → goes to your Render backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sm_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
