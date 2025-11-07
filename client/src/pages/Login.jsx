import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      onLogin(data.token)
      nav('/')
    } catch (e) {
      setError('Login failed')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 card">
      <h1 className="text-2xl font-bold text-leaf-700 mb-2">Welcome back</h1>
      <p className="text-sm text-gray-600 mb-4">Log in to manage your sprinklers.</p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className="border rounded-xl px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border rounded-xl px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn btn-primary" type="submit">Login</button>
      </form>
      <div className="text-sm text-gray-600 mt-3">No account? <Link to="/register" className="text-leaf-700 underline">Register</Link></div>
    </div>
  )
}

