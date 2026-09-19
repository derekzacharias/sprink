import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'

export default function ZoneCard({ zone, onToggle }) {
  const isOn = zone.status === 'on'
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(zone.name || `Zone ${zone.zoneNumber}`)
  const [duration, setDuration] = useState(zone.defaultDurationMin || 10)
  const [now, setNow] = useState(Date.now())

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const remaining = useMemo(() => {
    if (!zone.endsAt) return null
    const ms = new Date(zone.endsAt).getTime() - now
    if (ms <= 0) return null
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${m}:${String(s).padStart(2,'0')}`
  }, [zone.endsAt, now])

  async function save() {
    await api.put(`/zones/${zone._id}`, { name, defaultDurationMin: Number(duration) })
    setEditing(false)
  }

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Zone {zone.zoneNumber}</div>
          {!editing ? (
            <div className="font-semibold">{name}</div>
          ) : (
            <input className="border rounded-xl px-2 py-1 text-sm" value={name} onChange={e=>setName(e.target.value)} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs text-leaf-700 underline" onClick={()=>setEditing(!editing)}>{editing ? 'Cancel' : 'Edit'}</button>
          <span className={`text-xs px-2 py-1 rounded-full ${isOn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{isOn ? 'On' : 'Off'}</span>
        </div>
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Default min
            <input className="border rounded-xl px-2 py-1 w-16 ml-2" type="number" value={duration} onChange={e=>setDuration(e.target.value)} />
          </label>
          <button className="btn btn-primary" onClick={save}>Save</button>
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          {!isOn ? (
            <>
              <button className="btn btn-primary" onClick={() => onToggle(zone.zoneNumber, true, 5)}>5m</button>
              <button className="btn btn-primary" onClick={() => onToggle(zone.zoneNumber, true, 10)}>10m</button>
              <button className="btn btn-primary" onClick={() => onToggle(zone.zoneNumber, true, 15)}>15m</button>
            </>
          ) : (
            <button className="btn btn-ghost" onClick={() => onToggle(zone.zoneNumber, false)}>Stop</button>
          )}
          {remaining && <span className="text-xs text-gray-600">{remaining} left</span>}
        </div>
      )}

      {zone.lastUsedAt && (
        <div className="text-xs text-gray-500">Last: {new Date(zone.lastUsedAt).toLocaleString()} ({zone.lastDurationMin || '-'}m)</div>
      )}
    </div>
  )
}
