import axios from 'axios';

export async function getWeatherSummary(loc) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;
  let url = null;
  if (loc?.lat != null && loc?.lon != null) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&appid=${apiKey}&units=metric`;
  } else if (loc?.cityId) {
    url = `https://api.openweathermap.org/data/2.5/weather?id=${loc.cityId}&appid=${apiKey}&units=metric`;
  } else if (process.env.OPENWEATHER_CITY_ID) {
    // fallback global default if configured
    url = `https://api.openweathermap.org/data/2.5/weather?id=${process.env.OPENWEATHER_CITY_ID}&appid=${apiKey}&units=metric`;
  }
  if (!url) return null;
  const { data } = await axios.get(url);
  return {
    tempC: data.main?.temp,
    humidity: data.main?.humidity,
    rain1h: data.rain?.['1h'] || 0,
    weather: data.weather?.[0]?.main
  };
}

export function shouldSkipForRain(summary) {
  if (!summary) return false;
  const rainy = (summary.rain1h && summary.rain1h > 0) || String(summary.weather || '').toLowerCase().includes('rain');
  return !!rainy;
}
