import Schedule from '../models/Schedule.js';
import Zone from '../models/Zone.js';
import User from '../models/User.js';
import { getWeatherSummary, shouldSkipForRain } from './weather.js';
import { turnZoneOn } from './zoneControl.js';

// Very simple scheduler: check every 30s whether any schedule matches current time.
export function startScheduler(app) {
  async function tick() {
    const now = new Date();
    const day = now.getDay(); // 0-6
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const current = `${hh}:${mm}`;

    // For simplicity, process all users' schedules
    const due = await Schedule.find({ enabled: true, startTime: current, $or: [ { daysOfWeek: { $size: 0 } }, { daysOfWeek: day } ] });
    if (!due.length) return;

    // Group schedules per user
    const byUser = new Map();
    for (const s of due) {
      if (!byUser.has(s.userId.toString())) byUser.set(s.userId.toString(), []);
      byUser.get(s.userId.toString()).push(s);
    }

    for (const [userId, items] of byUser.entries()) {
      const user = await User.findById(userId).lean();
      let summary = null;
      try { summary = await getWeatherSummary(user?.settings?.weather || {}); } catch {}
      const skip = shouldSkipForRain(summary);
      for (const s of items) {
        const z = await Zone.findOne({ userId: s.userId, zoneNumber: s.zoneNumber });
        const duration = s.durationMin || z?.defaultDurationMin || 10;
        if (skip) continue;
        await turnZoneOn(app, s.userId, s.zoneNumber, duration, 'schedule');
      }
    }
  }

  // Align interval to minute boundaries
  const initialDelay = 1000 * (60 - new Date().getSeconds());
  setTimeout(() => {
    tick();
    setInterval(tick, 30 * 1000);
  }, initialDelay);
}
