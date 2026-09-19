import axios from 'axios'

const defaultBase = (() => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'
  return `${protocol}//${host}:3001/api`
})()

function normalizeBase(envUrl) {
  if (!envUrl) return null
  try {
    const u = new URL(envUrl)
    const winHost = typeof window !== 'undefined' ? window.location.hostname : null
    if (winHost && winHost !== 'localhost' && (u.hostname === 'localhost' || u.hostname.startsWith('127.'))) {
      u.hostname = winHost
      return u.toString()
    }
    return envUrl
  } catch {
    return envUrl
  }
}

const base = normalizeBase(import.meta.env.VITE_API_URL) || defaultBase

const api = axios.create({
  baseURL: base
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
