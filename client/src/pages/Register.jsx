import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Register({ onLogin }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    try {
      const { data } = await api.post('/auth/register', { email, password, name })
      onLogin(data.token)
      nav('/')
    } catch (e) {
      setError('Registration failed')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 card">
      <h1 className="text-2xl font-bold text-leaf-700 mb-2">Create account</h1>
      <p className="text-sm text-gray-600 mb-4">Set up your smart sprinkler.</p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className="border rounded-xl px-3 py-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border rounded-xl px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border rounded-xl px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn btn-primary" type="submit">Register</button>
      </form>
      <div className="text-sm text-gray-600 mt-3">Have an account? <Link to="/login" className="text-leaf-700 underline">Login</Link></div>
    </div>
  )
}

