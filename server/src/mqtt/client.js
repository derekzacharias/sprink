import mqtt from 'mqtt';

export function initMqtt(app) {
  const url = process.env.MQTT_URL || 'mqtt://localhost:1883';
  const client = mqtt.connect(url);
  const io = app.get('io');

  client.on('connect', () => {
    console.log('[mqtt] connected');
    client.subscribe('sprinkler/zone/+/status');
  });

  client.on('message', async (topic, message) => {
    try {
      const m = message.toString();
      const parts = topic.split('/');
      const zoneNumber = Number(parts[2]);
      let payload;
      try { payload = JSON.parse(m); } catch { payload = { status: m }; }
      io.emit('zone:update', { zoneNumber, ...payload });
      // Best-effort DB reflection across all users' zones with same number
      const status = payload.status || payload.state || undefined;
      if (status === 'on' || status === 'off') {
        const { default: Zone } = await import('../models/Zone.js');
        await Zone.updateMany({ zoneNumber }, { status });
      }
    } catch (e) {
      console.warn('mqtt message handling error', e);
    }
  });

  client.on('error', (e) => console.error('[mqtt] error', e));

  app.set('mqtt', client);
  return client;
}
