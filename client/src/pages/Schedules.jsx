import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Schedules() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ zoneNumber: 1, daysOfWeek: [1,3,5], startTime: '06:00', durationMin: 10, enabled: true })

  async function load() {
    const { data } = await api.get('/schedules')
    setItems(data)
  }

  useEffect(() => { load() }, [])

  async function add(e) {
    e.preventDefault()
    await api.post('/schedules', form)
    setForm({ ...form, name: '', zoneNumber: 1 })
    load()
  }

  async function remove(id) {
    await api.delete(`/schedules/${id}`)
    load()
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="card">
        <h2 className="font-semibold mb-2">New Schedule</h2>
        <form className="flex flex-col gap-2" onSubmit={add}>
          <label className="text-sm">Zone
            <input className="border rounded-xl px-3 py-2 w-full" type="number" min="1" max="16" value={form.zoneNumber} onChange={e=>setForm(f=>({...f, zoneNumber: Number(e.target.value)}))} />
          </label>
          <label className="text-sm">Start time
            <input className="border rounded-xl px-3 py-2 w-full" type="time" value={form.startTime} onChange={e=>setForm(f=>({...f, startTime: e.target.value}))} />
          </label>
          <label className="text-sm">Duration (min)
            <input className="border rounded-xl px-3 py-2 w-full" type="number" value={form.durationMin} onChange={e=>setForm(f=>({...f, durationMin: Number(e.target.value)}))} />
          </label>
          <button className="btn btn-primary" type="submit">Add</button>
        </form>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-2">Schedules</h2>
        <ul className="space-y-2">
          {items.map(i => (
            <li key={i._id} className="flex items-center justify-between border rounded-xl px-3 py-2">
              <div className="text-sm">
                <div className="font-medium">Zone {i.zoneNumber} — {i.startTime} for {i.durationMin}m</div>
                <div className="text-gray-500">Days: {i.daysOfWeek?.join(', ') || '—'}</div>
              </div>
              <button className="btn btn-ghost" onClick={()=>remove(i._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

