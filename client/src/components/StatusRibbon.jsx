import { useEffect, useState } from 'react'
import api from '../services/api'

export default function StatusRibbon({ zones, onToggleSmartMode }) {
  const [weather, setWeather] = useState(null)
  const [settings, setSettings] = useState({ smartMode: true })

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get('/me/settings'); setSettings(s => ({ ...s, ...data })); } catch {}
      try { const { data } = await api.get('/weather'); setWeather(data) } catch {}
    })()
  }, [])

  const on = zones.find(z => z.status === 'on')
  const status = on ? `Watering Zone ${on.zoneNumber}${on.endsAt ? ` until ${new Date(on.endsAt).toLocaleTimeString()}` : ''}` : 'Idle'
  // /weather returns {} (not null) when no location is configured yet, so a
  // truthy check here rendered "NaN°C". Only show real readings.
  const hasWeather = typeof weather?.tempC === 'number'

  async function toggleSmart() {
    const next = !settings.smartMode
    setSettings(s => ({ ...s, smartMode: next }))
    onToggleSmartMode?.(next)
    try { await api.put('/me/settings', { smartMode: next }) } catch {}
  }

  return (
    <div className="mb-3 bg-white/70 border border-green-100 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div className="text-sm">
        <div className="font-medium text-leaf-700">{status}</div>
        {hasWeather && (
          <div className="text-gray-600">{Math.round(weather.tempC)}°C • {weather.weather || '—'}</div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Smart Mode</span>
        <button className={`btn ${settings.smartMode ? 'btn-primary' : 'btn-ghost'}`} onClick={toggleSmart}>
          {settings.smartMode ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  )
}

