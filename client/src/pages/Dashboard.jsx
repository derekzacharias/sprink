import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import api from '../services/api'
import ZoneCard from '../components/ZoneCard'
import StatusRibbon from '../components/StatusRibbon'
import WeatherCard from '../components/WeatherCard'

const socketBase = (() => {
  const envUrl = import.meta.env.VITE_WS_URL
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'
  if (envUrl) {
    try {
      const u = new URL(envUrl)
      if (host !== 'localhost' && (u.hostname === 'localhost' || u.hostname.startsWith('127.'))) {
        u.hostname = host
        return u.toString()
      }
      return envUrl
    } catch {
      return envUrl
    }
  }
  return `${protocol}//${host}:3001`
})()
const socket = io(socketBase)

export default function Dashboard() {
  const [zones, setZones] = useState([])
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    async function load() {
      const { data } = await api.get('/zones')
      // Ensure 16 tiles (fill gaps for UI)
      const byNum = Object.fromEntries(data.map(z => [z.zoneNumber, z]))
      const full = Array.from({ length: 16 }, (_, i) => ({ ...(byNum[i+1] || { zoneNumber: i+1, name: `Zone ${i+1}`, status: 'off' }) }))
      // merge any active timers
      try {
        const { data: active } = await api.get('/zones/active')
        const withEnds = full.map(z => ({ ...z, endsAt: active.find(a => a.zoneNumber === z.zoneNumber)?.endsAt || null }))
        setZones(withEnds)
      } catch {
        setZones(full)
      }
    }
    load()
  }, [])

  useEffect(() => {
    socket.on('zone:update', (evt) => {
      setZones(zs => zs.map(z => z.zoneNumber === evt.zoneNumber ? { ...z, ...evt } : z))
    })
    return () => socket.off('zone:update')
  }, [])

  async function toggle(zoneNumber, toOn, minutes) {
    const z = zones.find(x => x.zoneNumber === zoneNumber)
    const duration = minutes || z?.defaultDurationMin || 10
    await api.post(`/zones/${zoneNumber}/${toOn ? 'on' : 'off'}`, toOn ? { durationMin: duration } : {})
  }

  return (
    <div className="flex flex-col gap-4">
      <StatusRibbon zones={zones} />
      <WeatherCard />
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {zones.map(z => (
          <ZoneCard key={z.zoneNumber} zone={z} onToggle={toggle} />
        ))}
      </section>
    </div>
  )
}
