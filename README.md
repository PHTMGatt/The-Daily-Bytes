# Daily Bytes

![Daily Bytes portfolio artwork](https://raw.githubusercontent.com/PHTMGatt/12-React-Portfolio/a2c43d8301679dbda14ad06dc225d61e5515e431/src/assets/project-images/Daily%20Bytes.png)

Daily Bytes is a gaming-first news dashboard built around the topics I actually follow: games, Witcher/CDPR, NVIDIA and RTX hardware, GPU pricing, RAM/DDR5/SSD pricing, and enthusiast PC hardware.

The app uses a dark navy / red dashboard UI, a server-side news proxy, MongoDB-backed reader accounts and saved articles, and a one-click demo session for portfolio visitors.

## Live App

**https://the-daily-bytes-o4jo.onrender.com**

## Highlights

- **Gaming-first home feed** with Witcher 3, NVIDIA/RTX, GPU prices, RAM/SSD, PC hardware, and game-release shortcuts.
- **One-request default feed expansion** so the homepage can surface gaming and priority PC-hardware stories without multiplying provider calls.
- **Server-side relevance ranking and deduplication** for stronger keyword matches, duplicate headlines, URL duplicates, and freshness tie-breaking.
- **Global search** with focused query routes and synchronized navigation state.
- **MongoDB authentication** with bcrypt password hashing and 12-hour JWT sessions.
- **Passwordless portfolio demo access** issued server-side without exposing the demo credential in React.
- **MongoDB saved articles** with per-user unique URL protection.
- **15-minute bounded news cache** to reduce repeat Mediastack requests.
- **Resilient article images** that fall back to branded card art instead of browser broken-image icons.
- **Trending Watch and category feeds** with real loading, error, empty, retry, and pagination states.
- **Daily Horoscope extra** using a server-side API proxy with validated zodiac input and honest provider-backed fields.
- **Responsive dark/light presentation** with a compact mobile navigation layout.

## Stack

### Client
- React 18
- TypeScript
- Vite
- React Router
- React Icons

### Server
- Node.js
- Express
- TypeScript
- MongoDB Atlas
- bcrypt
- JSON Web Tokens
- Axios

### External Services
- Mediastack for news data
- API Ninjas for horoscope data
- Render for deployment

## Project Structure

```text
The-Daily-Bytes/
├── client/                 React/Vite application
│   ├── src/api/            Browser API clients
│   ├── src/components/     Shared navigation/news UI
│   ├── src/pages/          Feed, auth, saved, horoscope, category pages
│   ├── src/utils/          Small testable client utilities
│   └── tests/              Native Node regression tests
├── server/                 Express API and production server
│   ├── src/config/         MongoDB connection and indexes
│   ├── src/lib/            Ranking, pagination, auth, cache helpers
│   ├── src/routes/         Auth/news/saved/horoscope endpoints
│   └── tests/              Native Node regression tests
└── docs/superpowers/       Design and implementation notes for major passes
```

## Local Setup

### 1. Clone

```bash
git clone https://github.com/PHTMGatt/The-Daily-Bytes.git
cd The-Daily-Bytes
```

### 2. Install

The root install script installs both server and client dependencies.

```bash
npm install
```

### 3. Configure environment variables

Create `server/.env` and provide your own values:

```env
MONGODB_URI=
MONGODB_DB=daily-bytes
JWT_SECRET_KEY=
DEMO_PASSWORD=
MEDIASTACK_API_KEY=
API_NINJAS_KEY=
```

Do not commit real credentials.

### 4. Development

```bash
npm run start:dev
```

The Express server defaults to port `3001` when `PORT` is not supplied. Vite runs the client development server separately.

### 5. Production build

```bash
npm run build
npm start
```

The production build runs the client regression suite, builds the React app, compiles the server, and runs the server regression suite before startup.

## API Overview

```text
POST /api/auth/login
POST /api/auth/register
POST /api/auth/demo
GET  /api/news/:category?
GET  /api/saved
POST /api/saved
DELETE /api/saved
GET  /api/horoscope
GET  /api/health
```

News provider credentials stay server-side; the React client never receives the Mediastack API key.

## Data

MongoDB uses the `daily-bytes` database with:

- `users` — normalized reader accounts and bcrypt password hashes
- `saved_articles` — authenticated reading-list items with a unique user + URL index

The demo account is seeded during server startup and receives the same ordinary reader session shape as normal accounts.

## Testing

```bash
npm test
```

The root test command runs both client and server native Node test suites. Render also runs these tests as part of the production build gate.

## Deployment

Daily Bytes is deployed as a Render web service. The Express server serves the built Vite assets and handles `/api/*` routes from the same service.

**Live:** https://the-daily-bytes-o4jo.onrender.com

## Repository

**GitHub:** https://github.com/PHTMGatt/The-Daily-Bytes
