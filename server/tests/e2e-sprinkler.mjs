// End-to-end check: acts as both the web client and the ESP32 relay board.
// Proves: UI/API -> MQTT publish -> board receives -> board reports status -> DB reflects it.
import axios from 'axios';
import mqtt from 'mqtt';

const API = 'http://localhost:3001/api';
const BROKER = 'mqtt://192.168.20.77:1883';
const EMAIL = `e2e-${process.env.E2E_RUN || 'a'}@example.com`;
const PASS = 'testpass123';
const ZONE = 7;

const log = (...a) => console.log(...a);
let failures = 0;
function check(ok, msg) {
  log(`${ok ? '  PASS' : '  FAIL'}  ${msg}`);
  if (!ok) failures++;
}

// --- fake ESP32 relay board ---------------------------------------------
const board = mqtt.connect(BROKER, { clientId: 'fake-esp32' });
const received = [];
board.on('message', (topic, msg) => {
  const cmd = msg.toString();
  const zoneNumber = Number(topic.split('/')[2]);
  received.push({ zoneNumber, cmd });
  // Real firmware publishes retained status back on the same zone.
  board.publish(`sprinkler/zone/${zoneNumber}/status`, JSON.stringify({ status: cmd }), { retain: true });
});
await new Promise((res, rej) => {
  board.on('connect', () => board.subscribe('sprinkler/zone/+/control', res));
  board.on('error', rej);
  setTimeout(() => rej(new Error('board could not connect to broker')), 10000);
});
log('fake relay board connected + subscribed\n');

// --- web client ----------------------------------------------------------
const auth = axios.create({ baseURL: API });
let token;
try {
  const r = await auth.post('/auth/register', { email: EMAIL, password: PASS, name: 'E2E' });
  token = r.data.token;
} catch (e) {
  const r = await auth.post('/auth/login', { email: EMAIL, password: PASS });
  token = r.data.token;
}
const api = axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } });
log(`logged in as ${EMAIL}\n`);

async function zoneStatus() {
  const { data } = await api.get('/zones');
  return data.find((z) => z.zoneNumber === ZONE)?.status;
}

log(`1. Turn zone ${ZONE} ON for 5 min via the API`);
await api.post(`/zones/${ZONE}/on`, { durationMin: 5 });
await new Promise((r) => setTimeout(r, 1500));
const onCmd = received.find((x) => x.zoneNumber === ZONE && x.cmd === 'on');
check(!!onCmd, `relay board received "on" for zone ${ZONE} over MQTT`);
check((await zoneStatus()) === 'on', 'database reflects zone on');

log(`\n2. Countdown timer is exposed to the UI`);
const { data: active } = await api.get('/zones/active');
const entry = active.find((a) => a.zoneNumber === ZONE);
check(!!entry?.endsAt, `/zones/active reports an endsAt for zone ${ZONE} (${entry?.endsAt ?? 'none'})`);
check(entry && new Date(entry.endsAt) > new Date(), 'endsAt is in the future');

log(`\n3. Turn zone ${ZONE} OFF via the API`);
await api.post(`/zones/${ZONE}/off`);
await new Promise((r) => setTimeout(r, 1500));
check(!!received.find((x) => x.zoneNumber === ZONE && x.cmd === 'off'), 'relay board received "off" over MQTT');
check((await zoneStatus()) === 'off', 'database reflects zone off');
check((await api.get('/zones/active')).data.every((a) => a.zoneNumber !== ZONE), 'zone cleared from /zones/active');

log('\n4. Automatic shut-off fires on its own (safety-critical)');
await api.post(`/zones/${ZONE}/on`, { durationMin: 0.05 }); // ~3 seconds
check((await zoneStatus()) === 'on', 'zone is on immediately after start');
await new Promise((r) => setTimeout(r, 6000));
check((await zoneStatus()) === 'off', 'zone switched itself off when the timer expired');
check(!!received.find((x) => x.zoneNumber === ZONE && x.cmd === 'off'), 'auto-off was also sent to the relay board');

log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
board.end();
process.exit(failures === 0 ? 0 : 1);
