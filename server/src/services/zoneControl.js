import Zone from '../models/Zone.js';
import Notification from '../models/Notification.js';

const timers = new Map(); // key: `${userId}:${zoneNumber}` -> timeout

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
  io.emit('zone:update', { zoneNumber, status: 'on' });
  await Notification.create({ userId, type: 'info', title: `Zone ${zoneNumber} on`, body: `Started watering for ${durationMin} min (${source})` });

  // clear previous timer then schedule off
  const k = key(userId, zoneNumber);
  if (timers.has(k)) clearTimeout(timers.get(k));
  const timeout = setTimeout(() => {
    turnZoneOff(app, userId, zoneNumber, 'auto');
  }, durationMin * 60 * 1000);
  timers.set(k, timeout);
}

export async function turnZoneOff(app, userId, zoneNumber, source = 'system') {
  const mqtt = app.get('mqtt');
  const io = app.get('io');
  mqtt.publish(`sprinkler/zone/${zoneNumber}/control`, 'off');
  await Zone.findOneAndUpdate({ userId, zoneNumber }, { status: 'off' });
  io.emit('zone:update', { zoneNumber, status: 'off' });
  await Notification.create({ userId, type: 'info', title: `Zone ${zoneNumber} off`, body: `Watering stopped (${source})` });

  const k = key(userId, zoneNumber);
  if (timers.has(k)) { clearTimeout(timers.get(k)); timers.delete(k); }
}

export function hasActiveTimer(userId, zoneNumber) {
  return timers.has(key(userId, zoneNumber));
}

