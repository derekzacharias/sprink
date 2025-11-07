import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState({ cityId: '', lat: '', lon: '' })
  const [status, setStatus] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/me/settings')
        const w = data?.weather || {}
        setWeather({ cityId: w.cityId || '', lat: w.lat ?? '', lon: w.lon ?? '' })
      } finally { setLoading(false) }
    })()
  }, [])

  function useMyLocation() {
    if (!navigator.geolocation) { setStatus('Geolocation not supported'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setWeather(w => ({ ...w, lat: pos.coords.latitude, lon: pos.coords.longitude }))
        setStatus('Location captured')
      },
      (err) => setStatus('Location error: ' + err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function save(e) {
    e.preventDefault()
    setStatus('Saving...')
    try {
      const body = { weather: {
        cityId: weather.cityId || undefined,
        lat: weather.lat === '' ? undefined : Number(weather.lat),
        lon: weather.lon === '' ? undefined : Number(weather.lon)
      } }
      await api.put('/me/settings', body)
      setStatus('Saved')
    } catch {
      setStatus('Save failed')
    }
  }

  return (
    <div className="max-w-lg card mx-auto">
      <h2 className="text-xl font-semibold text-leaf-700 mb-2">Settings</h2>
      {loading ? 'Loading...' : (
        <form className="flex flex-col gap-3" onSubmit={save}>
          <div className="text-sm text-gray-600">Weather Location</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm">City ID
              <input className="border rounded-xl px-3 py-2 w-full" placeholder="OpenWeather City ID" value={weather.cityId}
                     onChange={e=>setWeather(w=>({...w, cityId: e.target.value}))} />
            </label>
            <div className="flex gap-3">
              <label className="text-sm flex-1">Lat
                <input className="border rounded-xl px-3 py-2 w-full" placeholder="e.g., 37.7749" value={weather.lat}
                       onChange={e=>setWeather(w=>({...w, lat: e.target.value}))} />
              </label>
              <label className="text-sm flex-1">Lon
                <input className="border rounded-xl px-3 py-2 w-full" placeholder="e.g., -122.4194" value={weather.lon}
                       onChange={e=>setWeather(w=>({...w, lon: e.target.value}))} />
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={useMyLocation}>Use my location</button>
            <button className="btn btn-primary" type="submit">Save</button>
          </div>
          {status && <div className="text-xs text-gray-600">{status}</div>}
        </form>
      )}
    </div>
  )
}

