# API Documentation - Anime Openings Tournament

**Base URL:** `http://localhost:5001/api`

---

## Auth Endpoints

### POST /api/auth/register
Registrar nuevo usuario.

**Request:**
```json
{ "username": "string", "email": "string", "password": "string" }
```

**Response (201):**
```json
{
  "success": true,
  "data": { "token": "jwt...", "user": { "id": "...", "username": "...", "email": "..." } }
}
```

**Errors:** 400 (validation), 409 (duplicate email/username)

### POST /api/auth/login
Iniciar sesión.

**Request:**
```json
{ "email": "string", "password": "string" }
```

**Response (200):**
```json
{
  "success": true,
  "data": { "token": "jwt...", "user": { "id": "...", "username": "...", "email": "..." } }
}
```

**Errors:** 400, 401 (invalid credentials)

---

## Anime Endpoints

### GET /api/anime/search?q={query}
Busca openings en AnimeThemes y los guarda en MongoDB.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "title": "Guren no Yumiya",
      "anime_title": "Attack on Titan",
      "anime_slug": "shingeki-no-kyojin",
      "type": "OP",
      "sequence": 1,
      "artist": "Linked Horizon",
      "year": 2013,
      "season": "Spring",
      "video_url": "https://v.animethemes.moe/...",
      "thumbnail_url": "https://...",
      "source": "animethemes"
    }
  ],
  "count": 55
}
```

### GET /api/anime/anime?slug={slug}
Obtiene openings de un anime específico por slug.

### GET /api/anime?limit=50&skip=0&type=OP
Lista todos los openings guardados con paginación opcional.

---

## Tournament Endpoints

### POST /api/tournaments
Crea un nuevo torneo. **Requiere auth** (Bearer token). **Rate-limited: 10/min**.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Best Openings",
  "size": 8,
  "filterType": "OP"
}
```

- `size`: 8, 16 o 32
- `filterType`: "OP", "ED", o "both"

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "name": "Best Openings",
    "size": 8,
    "status": "active",
    "created_by": "ObjectId",
    "participants": [...],
    "matches": [...],
    "invite_code": "ABC12345"
  }
}
```

### GET /api/tournaments/:id
Obtiene detalle de torneo con participantes y matches.

### GET /api/tournaments/:id/ranking
Obtiene ranking de participantes por victorias.

---

## Room Endpoints

### GET /api/rooms/open/list
Lista todas las salas abiertas (status: waiting).

### GET /api/rooms/:inviteCode
Obtiene datos de una sala por su invite code.

---

## Health Check

### GET /api/health

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "database": "MongoDB Atlas",
  "sockets": "Socket.IO enabled",
  "timestamp": "ISO date"
}
```

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Rate Limited |
| 500 | Server Error |

---

## Socket.IO Events

### Client → Server
| Evento | Payload | Descripción |
|--------|---------|-------------|
| `join_room` | `{ inviteCode, userId, username }` | Unirse a sala |
| `start_tournament` | `{ inviteCode, userId }` | Host inicia torneo |
| `skip_p1` | `{ inviteCode, matchId, userId }` | Saltar primer opening |
| `video_ended` | `{ inviteCode, matchId, participant }` | Vídeo terminó (1=P1, 2=P2) |
| `p2_ready` | `{ inviteCode, matchId }` | P2 empezó a reproducirse |
| `submit_vote` | `{ inviteCode, matchId, participantId, userId }` | Votar |
| `leave_room` | `{ inviteCode, userId }` | Salir de sala |

### Server → Client
| Evento | Payload | Descripción |
|--------|---------|-------------|
| `room_updated` | `{ connected_users, status, host_user_id, videos_ready }` | Estado de sala |
| `tournament_started` | `{ tournament, currentMatch, phase, totalUsers }` | Primer match |
| `p1_skip_update` | `{ matchId, skippedCount, totalUsers }` | Progreso de skip |
| `p1_skipped` | `{ matchId }` | P1 saltado por todos |
| `p2_ended` | `{ matchId }` | P2 terminó (inicia votación 10s) |
| `vote_update` | `{ matchId, votes, totalVotes }` | Conteo en vivo |
| `match_changed` | `{ currentMatch, phase, totalUsers }` | Siguiente match |
| `tournament_ended` | `{ message, tournament, status }` | Resultados |
| `room_closed` | `{ message, reason }` | Sala cerrada |
| `error` | `{ message }` | Error |

---

## Flujo de Votación

1. **P1**: Se reproduce el primer opening. Usuarios pueden saltar (`skip_p1`). Skip unánime o fin del vídeo → avanza a P2.
2. **P2**: Se reproduce el segundo opening. Usuarios pueden votar por P1 o P2 en cualquier momento.
3. **Auto-avance**: Si todos los usuarios votan antes de que termine P2 → avance inmediato.
4. **Timeout**: Si P2 termina y no todos votaron → 10s de votación, luego `finalizeMatch`.
5. **Empate/Sin votos**: Ganador elegido aleatoriamente.

---

## Notas

- Puerto: **5001**
- Package manager: **pnpm** (no npm)
- Auth: JWT tokens via Bearer header
- DB: MongoDB Atlas (cloud)
- Sin proxy de vídeo — reproducción directa desde CDN de AnimeThemes
- Los vídeos son .webm servidos desde `v.animethemes.moe`
- El bracket completo se genera al crear el torneo (no on-the-fly)
