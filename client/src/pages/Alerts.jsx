import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Alerts() {
  const [items, setItems] = useState([])

  async function load() {
    const { data } = await api.get('/notifications')
    setItems(data)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="card">
      <h2 className="font-semibold mb-2">Notifications</h2>
      <ul className="space-y-2">
        {items.map(n => (
          <li key={n._id} className="border rounded-xl px-3 py-2">
            <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
            <div className="font-medium">{n.title}</div>
            <div className="text-sm">{n.body}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

