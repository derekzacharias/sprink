import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Schedules from './pages/Schedules.jsx'
import Alerts from './pages/Alerts.jsx'
import Settings from './pages/Settings.jsx'
import { useEffect, useState } from 'react'

function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const login = (t) => { localStorage.setItem('token', t); setToken(t) }
  const logout = () => { localStorage.removeItem('token'); setToken(null) }
  return { token, login, logout }
}

export default function App() {
  const auth = useAuth()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-green-50/80 backdrop-blur border-b border-green-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-leaf-700 font-bold">Sprink</Link>
          <nav className="flex gap-3 text-sm">
            <Link to="/" className="btn btn-ghost">Dashboard</Link>
            <Link to="/schedules" className="btn btn-ghost">Schedules</Link>
            <Link to="/alerts" className="btn btn-ghost">Alerts</Link>
            <Link to="/settings" className="btn btn-ghost">Settings</Link>
            {auth.token ? (
              <button onClick={auth.logout} className="btn btn-ghost">Logout</button>
            ) : (
              <Link to="/login" className="btn btn-primary">Login</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/login" element={<Login onLogin={auth.login} />} />
          <Route path="/register" element={<Register onLogin={auth.login} />} />
          <Route path="/" element={auth.token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/schedules" element={auth.token ? <Schedules /> : <Navigate to="/login" />} />
          <Route path="/alerts" element={auth.token ? <Alerts /> : <Navigate to="/login" />} />
          <Route path="/settings" element={auth.token ? <Settings /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  )
}
