# Smart Sprinkler System

A scalable, web-based smart sprinkler manager with a React + Tailwind frontend, Node.js + Express + MongoDB backend, and MQTT-based hardware control for up to 16 zones.

## Quick Start

1) Prereqs: Docker, Node 18+, Yarn/NPM.

2) Configure env vars:
- Copy `server/.env.example` to `server/.env` and update values (JWT secret, Mongo URI, MQTT URL, optional Twilio/FCM/OpenWeather).

3) Start infra + backend via Docker:
- `docker compose up --build`
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3001
- Mosquitto MQTT: mqtt://localhost:1883
- MongoDB: mongodb://localhost:27017

4) Run frontend (dev):
- `cd client && npm install && npm run dev`
- Frontend: http://localhost:5173

5) ESP32 firmware:
- Update WiFi and broker settings in `esp32-firmware/sprinkler.ino`
- Flash to ESP32; verify MQTT connects and responds to `sprinkler/zone/{id}/control` topics

## Features
- 16-zone control with MQTT (ESP32)
- Schedules, weather-aware watering (OpenWeatherMap)
- JWT auth, in-app notifications, optional SMS (Twilio)
- Real-time updates via WebSockets

## Project Structure
```
smart-sprinkler/
├── client/                  # React frontend (Tailwind, React Router)
├── server/                  # Express backend (MongoDB, MQTT, WebSocket)
├── esp32-firmware/          # Arduino sketch for ESP32
├── docker-compose.yml
└── README.md
```

## Common Commands
- Frontend: `npm run dev|build|preview`
- Backend: `npm run dev|start`
- Docker: `docker compose up --build`

## Notes
- Replace placeholder keys in `.env` and `sprinkler.ino`.
- Topics: `sprinkler/zone/{1..16}/control` ("on"|"off"), status on `sprinkler/zone/{id}/status`.

- Scheduler runs every 30s; triggers minute-aligned schedules and skips when current weather indicates rain.

## Per-user Weather Location
- Each user can set their own weather location under Settings in the UI.
- Options:
- Provide OpenWeather City ID, or
- Provide latitude/longitude (preferred), or
- Click "Use my location" to autofill lat/lon via the browser.
- The scheduler checks weather per-user using these settings.

## API Overview
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Zones: `GET /api/zones`, `POST /api/zones`, `PUT /api/zones/:id`, `DELETE /api/zones/:id`
- Control: `POST /api/zones/:zoneNumber/on`, `POST /api/zones/:zoneNumber/off`
- Schedules: `GET/POST /api/schedules`, `PUT/DELETE /api/schedules/:id`
- Notifications: `GET /api/notifications`
- Weather: `GET /api/weather`

## Frontend Env
- Create `client/.env` with `VITE_API_URL=http://localhost:3001/api` and `VITE_WS_URL=http://localhost:3001`

## Security
- Use strong `JWT_SECRET`; never commit `.env`.
- Configure CORS if deploying across domains.
