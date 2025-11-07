import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import authRoutes from './routes/auth.js';
import zoneRoutes from './routes/zones.js';
import scheduleRoutes from './routes/schedules.js';
import notificationRoutes from './routes/notifications.js';
import weatherRoutes from './routes/weather.js';
import meRoutes from './routes/me.js';
import { initMqtt } from './mqtt/client.js';
import { startScheduler } from './services/scheduler.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/me', meRoutes);

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sprinkler';

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[mongo] connected');
    initMqtt(app);
    startScheduler(app);
    server.listen(PORT, () => console.log(`[server] listening on :${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
