import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function WeatherCard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasLocation, setHasLocation] = useState(false)
  const [saving, setSaving] = useState(false)
  const [geoError, setGeoError] = useState('')
  // ZIP entry removed on dashboard for simplicity

  useEffect(() => {
    (async () => {
      try {
        const s = await api.get('/me/settings')
        const w = s?.data?.weather || {}
        setHasLocation(!!(w.cityId || w.zip || (w.lat != null && w.lon != null)))
      } catch { setHasLocation(false) }
      try { const { data } = await api.get('/weather'); setData(data && Object.keys(data).length ? data : null) } finally { setLoading(false) }
    })()
  }, [])

  async function useMyLocation() {
    if (!navigator.geolocation) return
    setSaving(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await api.put('/me/settings', { weather: { lat: pos.coords.latitude, lon: pos.coords.longitude } })
        const { data } = await api.get('/weather')
        setData(data && Object.keys(data).length ? data : null)
        setHasLocation(true)
        setGeoError('')
      } finally { setSaving(false) }
    }, (err) => {
      setSaving(false)
      const msg = String(err && err.message || '')
      if (/secure origins|https/i.test(msg)) {
        setGeoError('Browser blocked location on non-HTTPS. Open via localhost or enable HTTPS to use this feature.')
      } else {
        setGeoError('Location error: ' + msg)
      }
    }, { enableHighAccuracy: true, timeout: 10000 })
  }


  return (
    <div className="card flex items-center justify-between">
      <div className="flex items-center gap-3">
        <WeatherIcon condition={data?.weather} />
        <div>
          <div className="text-sm text-gray-500">Weather</div>
          {loading ? (
            <div className="text-gray-600">Loading…</div>
          ) : data ? (
            <div className="font-semibold">{Math.round(data.tempC)}°C • {data.weather || '—'}</div>
          ) : (
            <div className="text-gray-600 flex items-center gap-2">
              <button className="btn btn-primary" disabled={saving} onClick={useMyLocation}>{saving ? 'Saving…' : 'Use my location'}</button>
              <span>or set it in <Link to="/settings" className="underline text-leaf-700">Settings</Link></span>
            </div>
          )}
          {data && (
            <div className="text-xs text-gray-500 mt-1">Humidity {data.humidity ?? '—'}% • Rain (1h) {data.rain1h ?? 0}mm</div>
          )}
          {geoError && (
            <div className="text-xs text-amber-700 mt-2">{geoError}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function WeatherIcon({ condition }) {
  const c = String(condition || '').toLowerCase()
  const cls = 'h-10 w-10 text-leaf-700'
  if (c.includes('rain')) return (
    <svg viewBox="0 0 64 64" className={cls} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 30a12 12 0 1 1 23-6 10 10 0 1 1 3 19H18a10 10 0 0 1 0-13z" />
      <path d="M22 48l-2 6M32 48l-2 6M42 48l-2 6" />
    </svg>
  )
  if (c.includes('cloud')) return (
    <svg viewBox="0 0 64 64" className={cls} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 30a12 12 0 1 1 23-6 10 10 0 1 1 3 19H18a10 10 0 0 1 0-13z" />
    </svg>
  )
  // default: sun
  return (
    <svg viewBox="0 0 64 64" className={cls} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="32" cy="32" r="10" />
      <path d="M32 8v8M32 48v8M8 32h8M48 32h8M14 14l6 6M44 44l6 6M50 14l-6 6M14 50l6-6" />
    </svg>
  )
}
