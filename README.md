# AnimeOpening.gg 🎌

Real-time anime openings tournament where users vote for their favorite openings in an elimination bracket.

Torneo de openings de anime en tiempo real donde los usuarios votan por sus openings favoritos en bracket eliminatorio.

---

## Tech Stack / Stack técnico

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite 5 + Tailwind CSS 3 |
| **Backend** | Node.js + Express 4 + Socket.IO 4 |
| **Database** | MongoDB Atlas (Mongoose 8) |
| **Auth** | JWT + bcryptjs |
| **External API** | [AnimeThemes](https://api.animethemes.moe) |
| **Package Manager** | pnpm |

---

## Features / Características

- **AnimeThemes search** — Search and browse openings from the AnimeThemes API
- **Bracket tournaments** — Create elimination tournaments with 16 or 32 participants
- **Real-time rooms** — Socket.IO rooms for synchronized voting
- **Live voting** — Users vote in real-time during matches
- **Ranking** — Openings ranked by votes received
- **JWT Auth** — User registration and login

---

## Local Setup / Instalación local

```bash
# 1. Install pnpm (if needed)
npm install -g pnpm

# 2. Install dependencies
cd server && pnpm install
cd ../client && pnpm install

# 3. Configure environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# 4. Start backend (terminal 1)
cd server && pnpm run dev

# 5. Start frontend (terminal 2)
cd client && pnpm run dev

# 6. Open http://localhost:5173
```

---

## Environment Variables / Variables de entorno

### Backend (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5001) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLIENT_URL` | Frontend URL for CORS |

### Frontend (`client/.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/anime/search?q=` | No | Search openings |
| GET | `/api/anime/anime?slug=` | No | Openings by anime slug |
| GET | `/api/anime` | No | List cached openings |
| POST | `/api/tournaments` | Yes | Create tournament |
| GET | `/api/tournaments/:id` | No | Tournament details |
| GET | `/api/tournaments/:id/ranking` | No | Tournament ranking |
| GET | `/api/rooms/open/list` | No | List open rooms |
| GET | `/api/rooms/:inviteCode` | No | Get room by invite code |

---

## Socket.IO Events

See `PROJECT_CONTEXT.md` (removed in public version) or check `server/src/sockets/roomSocket.js` for the full event reference.
