# Anime Openings Tournament - Project Context

## Descripción General
App full-stack para torneo eliminatorio de openings de anime con votación en tiempo real vía WebSockets.

### Stack Tecnológico
- **Frontend:** React 18 + Vite 5 + Tailwind CSS 3 + Socket.IO Client
- **Backend:** Node.js + Express 4 + MongoDB (Mongoose 8) + Socket.IO 4
- **Base de Datos:** MongoDB Atlas (cloud)
- **API Externa:** AnimeThemes API (https://api.animethemes.moe)
- **Package Manager:** pnpm

---

## Estructura del Proyecto

```
proyecto-con-ai/
├── client/                    # Frontend React + Vite + Tailwind
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # Router (Login, Home, CreateTournament, Tournament, Room, Ranking)
│       ├── context/AuthContext.jsx
│       ├── hooks/useAuth.js, useAnimeSearch.js
│       ├── utils/api.js, animeApi.js
│       ├── pages/             # 6 pages
│       ├── components/        # Navbar, ProtectedRoute, OpeningCard, BracketView, etc.
│       └── styles/index.css
└── server/                    # Backend Express + MongoDB + Socket.IO
    └── src/
        ├── index.js           # Entry point
        ├── config/mongodb.js  # Conexión Mongoose
        ├── models/            # 7 modelos
        ├── controllers/       # anime, auth, tournament, room
        ├── routes/            # anime, auth, tournament, room
        ├── sockets/roomSocket.js  # Eventos Socket.IO
        ├── middleware/auth.js     # JWT middleware
        └── utils/animeThemesService.js, videoCache.js
```

---

## API Endpoints

### Auth
```
POST /api/auth/register  → { username, email, password }
POST /api/auth/login     → { email, password } → { token, user }
```

### Anime (AnimeThemes)
```
GET  /api/anime/search?q={query}   → Buscar y guardar en MongoDB
GET  /api/anime/anime?slug={slug}  → Openings por slug
GET  /api/anime                    → Listar todos (paginación)
```

### Tournaments
```
POST /api/tournaments              → Crear torneo (Auth, sizes: 8/16/32)
GET  /api/tournaments/:id          → Detalle con participantes y matches
GET  /api/tournaments/:id/ranking  → Ranking por victorias
```

### Rooms
```
GET  /api/rooms/open/list          → Salas abiertas
GET  /api/rooms/:inviteCode        → Obtener sala
```

---

## Socket.IO Events

### Client → Server
- `join_room`: Unirse a sala
- `start_tournament`: Host inicia torneo
- `skip_p1`: Saltar primer opening
- `video_ended`: Vídeo terminó (participant: 1|2)
- `p2_ready`: P2 empezó a reproducirse
- `submit_vote`: Votar por un participant_id
- `leave_room`: Salir de la sala

### Server → Client
- `room_updated`: Estado de sala
- `tournament_started`: Torneo iniciado
- `p1_skip_update`: Progreso de skip
- `p1_skipped`: P1 saltado
- `p2_ended`: P2 terminó (votación 10s)
- `vote_update`: Conteo de votos
- `match_changed`: Siguiente match
- `tournament_ended`: Resultados finales
- `room_closed`: Sala cerrada
- `error`: Error

---

## Notas Técnicas

### AnimeThemes API
- `/search`: `{ search: { anime: [...] } }`
- `/anime/{slug}`: `{ anime: {...} }`
- Video URL: `https://v.animethemes.moe/{basename}`
- Sin proxy de vídeo (reproducción directa desde CDN)
- Sincronización programada cada 6h

### Flujo de Votación
1. **P1** → skip unánime o fin de vídeo → P2
2. **P2** → votación durante reproducción + 10s tras terminar
3. Si todos votan antes → avance inmediato
4. Empate o sin votos → ganador aleatorio

---

**Última actualización:** 24 de mayo de 2026
**Puerto Backend:** 5001 | **Puerto Frontend:** 5173
