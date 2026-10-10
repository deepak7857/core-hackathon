# ARIS

**Advanced Road Inspection System** is a Next.js dashboard for monitoring road
anomalies reported by vehicle or roadside sensors. It stores telemetry in
PostgreSQL, classifies hazards by severity, displays them on Google Maps, and
helps drivers choose and simulate the safest route.

## Features

- Live anomaly dashboard with automatic refresh
- Google Maps markers for road cavities, submerged hazards, and repaired sites
- Route alternatives ranked by hazards and estimated depth penalty
- Browser alerts and spoken warnings when a simulated drive approaches a hazard
- Sensor ingestion API for ESP32 and other telemetry devices
- Automatic anomaly severity scoring from acceleration, speed, depth, and water
  data
- Anomaly lifecycle tracking: `OPEN`, `IN_REPAIR`, and `REPAIRED`

## Tech stack

- [Next.js](https://nextjs.org/) 16 with the App Router
- React 19
- [Prisma](https://www.prisma.io/) with PostgreSQL
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- Tailwind CSS 4

## Requirements

- Node.js 18.18 or later
- npm
- PostgreSQL
- A Google Maps API key with Maps JavaScript API and Directions API enabled

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
   THINGSPEAK_CHANNEL_ID=your id
   THINGSPEAK_WRITE_API_KEY=your key
   ```

   Keep API keys and database credentials out of source control. Environment
   files are ignored by this repository.

3. Generate the Prisma client and apply the database schema:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

   For a migration-based workflow, use `npx prisma migrate dev` instead of
   `npx prisma db push`.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npx prisma studio` | Open Prisma Studio for database inspection |
| `node scripts/seedAnomalies.js` | Send sample anomaly packets to the local API |

Run the seed script while the development server is running:

```bash
node scripts/seedAnomalies.js
```

The script posts sample data for road cavities, excavations, and waterlogged
areas to `http://localhost:3000/api/anomalies`.

## API

### `GET /api/anomalies`

Returns the 100 most recently created anomalies.

### `POST /api/anomalies`

Creates an anomaly from a telemetry packet. `lat` and `lng` are required.

Example request:

```bash
curl -X POST http://localhost:3000/api/anomalies \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "ESP32_NODE_01",
    "lat": 30.3375,
    "lng": 78.0125,
    "speed_kmh": 18.5,
    "z_peak_g": 4.8,
    "depth_cm": 15,
    "water_present": false
  }'
```

The API evaluates the packet and stores the resulting severity. A low-impact
packet near an open anomaly can mark that anomaly as repaired.

### `PATCH /api/anomalies`

Updates an anomaly status. Provide an anomaly `id` and one of
`OPEN`, `IN_REPAIR`, or `REPAIRED`:

```json
{
  "id": "anomaly-id",
  "status": "REPAIRED"
}
```

### `POST /api/sensor`

Accepts sensor data and forwards it to ThingSpeak. Configure
`THINGSPEAK_CHANNEL_ID` and `THINGSPEAK_WRITE_API_KEY` in the environment
before using this integration.

## Project structure

```text
src/
├── app/
│   ├── api/
│   │   ├── anomalies/       # Anomaly CRUD endpoints
│   │   └── sensor/          # ThingSpeak integration
│   ├── globals.css
│   ├── layout.js
│   └── page.js              # Main ARIS dashboard
├── components/
│   ├── dashboard/           # Statistics, alerts, and driver HUD
│   ├── map/                 # Google Maps rendering
│   └── RouteSearch.js       # Route lookup and simulation controls
├── lib/
│   ├── detector.js          # Hazard scoring and severity classification
│   ├── geoUtils.js          # Route proximity calculations
│   └── db.js                # Prisma client
└── types/
prisma/
└── schema.prisma
```

## Production

Build and start the application with:

```bash
npm run build
npm run start
```

Set `DATABASE_URL` and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in the production
environment before starting the server. Restrict the Google Maps key by
application and API where possible.
