# PROJECT CONTEXT & KNOWLEDGE BASE
**Anime Openings Tournament - Bracket Eliminatorio**

---

## PROJECT OVERVIEW

**Description:** Torneo eliminatorio de openings de anime con bracket interactivo y votación en tiempo real. Frontend en React + Vite + Tailwind, Backend en Express + MongoDB Atlas, WebSockets con Socket.IO.

**Tech Stack:**
- Frontend: React 18, Vite 5, Tailwind CSS 3, Socket.IO Client, React Router 6
- Backend: Express 4, MongoDB Atlas (Mongoose 8), Socket.IO 4
- Auth: JWT (jsonwebtoken + bcryptjs)
- External API: AnimeThemes (api.animethemes.moe) - Pública, sin API key
- Package Manager: pnpm (NOT npm)

**Key URLs:**
- Frontend Dev: `http://localhost:5173`
- Backend API: `http://localhost:5001/api`
- MongoDB: Atlas (cloud)
- AnimeThemes API: `https://api.animethemes.moe`
- AnimeThemes Docs: `https://api-docs.animethemes.moe/`

---

## CRITICAL CONFIGURATION

### Package Manager
**USE PNPM - NOT NPM**
```bash
pnpm install   # Install dependencies
pnpm run dev   # Run dev server
pnpm add pkg   # Add package
```

### Backend Server
- **Port:** 5001
- **Entry:** `server/src/index.js`
- **Dev Command:** `pnpm run dev` (nodemon)
- **Environment:** `server/.env`

### Frontend Dev Server
- **Port:** 5173 (Vite default)
- **Entry:** `client/src/main.jsx`
- **Config:** `client/vite.config.js`

### Database (MongoDB Atlas)
- **Type:** MongoDB Atlas (cloud, free tier M0)
- **URI:** Configurable via `MONGODB_URI` en `.env`
- **ORM:** Mongoose 8.x
- **Models:** `server/src/models/` (7 modelos: User, AnimeOpening, Tournament, TournamentParticipant, Match, Vote, Room)
- **Sincronización:** AnimeThemes sync automático cada 6h vía `animeThemesService.js`

---

## API ENDPOINTS (Actuales)

### Auth
```
POST /api/auth/register    → { username, email, password }
POST /api/auth/login       → { email, password } → JWT token
```

### Anime (AnimeThemes)
```
GET  /api/anime/search?q=        → Buscar openings, guarda en MongoDB
GET  /api/anime/anime?slug=      → Openings por slug de anime
GET  /api/anime                  → Listar todos (paginado: ?limit=&skip=&type=)
```

### Tournaments
```
POST /api/tournaments            → Crear torneo (auth required, sizes: 8/16/32)
GET  /api/tournaments/:id        → Detalle con participantes y matches
GET  /api/tournaments/:id/ranking → Ranking por victorias
```

### Rooms (Salas de votación)
```
GET  /api/rooms/open/list        → Listar salas abiertas
GET  /api/rooms/:inviteCode      → Obtener sala
```

---

## SOCKET.IO EVENTS

### Client → Server
| Evento | Datos | Descripción |
|--------|-------|-------------|
| `join_room` | `{ inviteCode, userId, username }` | Unirse a sala |
| `start_tournament` | `{ inviteCode, userId }` | Host inicia torneo |
| `skip_p1` | `{ inviteCode, matchId, userId }` | Saltar P1 |
| `video_ended` | `{ inviteCode, matchId, participant }` | Vídeo terminó (1=P1, 2=P2) |
| `p2_ready` | `{ inviteCode, matchId }` | P2 empezó a reproducirse |
| `submit_vote` | `{ inviteCode, matchId, participantId, userId }` | Votar |
| `leave_room` | `{ inviteCode, userId }` | Salir de sala |

### Server → Client
| Evento | Datos | Descripción |
|--------|-------|-------------|
| `room_updated` | `{ room, connected_users }` | Estado de sala |
| `tournament_started` | `{ tournament, currentMatch, phase, totalUsers }` | Primer match |
| `p1_skip_update` | `{ matchId, skippedCount, totalUsers }` | Progreso de skip |
| `p1_skipped` | `{ matchId }` | P1 saltado/terminado |
| `p2_ended` | `{ matchId }` | P2 terminó (inicia votación 10s) |
| `vote_update` | `{ matchId, votes, totalVotes }` | Conteo en vivo |
| `match_changed` | `{ currentMatch, phase, totalUsers }` | Siguiente enfrentamiento |
| `tournament_ended` | `{ message, tournament, status }` | Resultados finales |
| `room_closed` | `{ message, reason }` | Sala cerrada |
| `error` | `{ message }` | Error |

---

## FLUJO DE VOTACIÓN

1. **Playing P1**: Se reproduce el primer opening. Cualquier usuario puede saltar (`skip_p1`). Si todos saltan → P2.
2. **Playing P2**: Se reproduce el segundo opening. Cuando termina → 10s de votación.
3. **Votación**: Usuarios votan por P1 o P2. Si todos votan antes de que termine P2 → avance inmediato.
4. **Finalize**: Se determina el ganador (o random en caso de empate/sin votos). Se coloca en el bracket.
5. **Siguiente match**: Se repite el ciclo hasta que no hay más matches → torneo termina.

---

## CUSTOM HOOKS (Frontend)

### useAuth()
```javascript
const { user, token, loading, login, register, logout } = useAuth()
```

### useSocket()
```javascript
const { socket, joinRoom, startTournament, submitVote, skipP1, videoEnded, p2Ready, leaveRoom } = useSocket()
```

### useAnimeSearch()
```javascript
const { results, loading, error, query, handleSearchChange, executeSearch, clearResults } = useAnimeSearch()
```

### useAnimeDetail()
```javascript
const { anime, loading, error, loadAnime, clear } = useAnimeDetail()
```

### usePopularOpenings()
```javascript
const { openings, loading, error, loadPopularOpenings, refetch } = usePopularOpenings()
```

---

## ENVIRONMENT VARIABLES

### Backend (`server/.env`)
```env
PORT=5001
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/anime_tournament?retryWrites=true&w=majority
NODE_ENV=development
JWT_SECRET=tu_secreto
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env.local`)
```env
VITE_API_URL=http://localhost:5001/api
```

---

## KNOWN LIMITATIONS

1. **WebM Videos:** Not supported in IE / older Safari
2. **Auth:** Basic JWT, no role-based access or email verification
3. **Tournament Size:** 8, 16, or 32 participants supported
4. **Video playback:** Solo control de volumen (sin pausa/buscar/retroceder)

---

## HOW TO START AFTER CLONING

```bash
# 1. Install pnpm if needed
npm install -g pnpm

# 2. Install dependencies
cd server && pnpm install
cd ../client && pnpm install

# 3. Setup environment files
cp server/.env.example server/.env   # Configurar MONGODB_URI con Atlas
cp client/.env.example client/.env.local

# 4. Run (two terminals)
cd server && pnpm run dev   # Terminal 1
cd client && pnpm run dev   # Terminal 2

# 5. Open http://localhost:5173
```

---

**Last Updated:** 2026-05-24
**Status:** All core systems working (Auth, AnimeThemes API, Tournament CRUD, Rooms, Socket.IO voting with skip/vote/timeout flow)
