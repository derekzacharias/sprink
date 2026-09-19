import Zone from '../models/Zone.js';
import Notification from '../models/Notification.js';

const timers = new Map(); // key: `${userId}:${zoneNumber}` -> { timeout, endsAt }

function key(userId, zoneNumber) { return `${userId}:${zoneNumber}`; }

export async function turnZoneOn(app, userId, zoneNumber, durationMin = 10, source = 'system') {
  const mqtt = app.get('mqtt');
  const io = app.get('io');
  mqtt.publish(`sprinkler/zone/${zoneNumber}/control`, 'on');
  await Zone.findOneAndUpdate(
    { userId, zoneNumber },
    { status: 'on', lastUsedAt: new Date(), lastDurationMin: durationMin },
    { upsert: true }
  );
  const endsAt = new Date(Date.now() + durationMin * 60 * 1000);
  io.emit('zone:update', { zoneNumber, status: 'on', endsAt });
  await Notification.create({ userId, type: 'info', title: `Zone ${zoneNumber} on`, body: `Started watering for ${durationMin} min (${source})` });

  // clear previous timer then schedule off
  const k = key(userId, zoneNumber);
  if (timers.has(k)) clearTimeout(timers.get(k).timeout);
  const timeout = setTimeout(() => {
    turnZoneOff(app, userId, zoneNumber, 'auto');
  }, durationMin * 60 * 1000);
  timers.set(k, { timeout, endsAt });
}

export async function turnZoneOff(app, userId, zoneNumber, source = 'system') {
  const mqtt = app.get('mqtt');
  const io = app.get('io');
  mqtt.publish(`sprinkler/zone/${zoneNumber}/control`, 'off');
  await Zone.findOneAndUpdate({ userId, zoneNumber }, { status: 'off' });
  io.emit('zone:update', { zoneNumber, status: 'off', endsAt: null });
  await Notification.create({ userId, type: 'info', title: `Zone ${zoneNumber} off`, body: `Watering stopped (${source})` });

  const k = key(userId, zoneNumber);
  if (timers.has(k)) { clearTimeout(timers.get(k).timeout); timers.delete(k); }
}

export function hasActiveTimer(userId, zoneNumber) {
  return timers.has(key(userId, zoneNumber));
}

export function getActiveEnds(userId) {
  const out = [];
  for (const [k, v] of timers.entries()) {
    if (k.startsWith(`${userId}:`)) {
      const zoneNumber = Number(k.split(':')[1]);
      out.push({ zoneNumber, endsAt: v.endsAt });
    }
  }
  return out;
}
