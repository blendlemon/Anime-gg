# Anime Openings Tournament

Aplicación de torneo eliminatorio para openings de anime con votación en tiempo real.

## Stack Tecnológico

**Frontend:** React 18 + Vite + Tailwind CSS 3 + Socket.IO Client
**Backend:** Node.js + Express + MongoDB Atlas (Mongoose) + Socket.IO
**Base de Datos:** MongoDB Atlas (cloud)

## Inicio Rápido

```bash
# 1. Clonar e instalar dependencias
cd server && pnpm install
cd ../client && pnpm install

# 2. Configurar variables de entorno
cp server/.env.example server/.env   # Editar MONGODB_URI con tu cluster Atlas
cp client/.env.example client/.env.local

# 3. Iniciar backend (terminal 1)
cd server && pnpm run dev    # http://localhost:5001

# 4. Iniciar frontend (terminal 2)
cd client && pnpm run dev    # http://localhost:5173
```

## API Endpoints

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Registrar usuario |
| POST | `/api/auth/login` | No | Iniciar sesión |
| GET | `/api/anime/search?q=` | No | Buscar openings vía AnimeThemes |
| GET | `/api/anime/anime?slug=` | No | Openings por slug de anime |
| GET | `/api/anime` | No | Listar openings cacheados |
| POST | `/api/tournaments` | Sí | Crear torneo (8/16/32 vídeos) |
| GET | `/api/tournaments/:id` | No | Detalle de torneo |
| GET | `/api/tournaments/:id/ranking` | No | Ranking del torneo |
| GET | `/api/rooms/open/list` | No | Listar salas abiertas |
| GET | `/api/rooms/:inviteCode` | No | Obtener sala |

## Socket.IO Events

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `join_room` | Cliente → Servidor | Unirse a sala |
| `start_tournament` | Cliente → Servidor | Host inicia torneo |
| `skip_p1` | Cliente → Servidor | Saltar primer opening |
| `video_ended` | Cliente → Servidor | Vídeo terminó |
| `submit_vote` | Cliente → Servidor | Votar por un opening |
| `leave_room` | Cliente → Servidor | Salir de la sala |
| `room_updated` | Servidor → Cliente | Estado actual de la sala |
| `tournament_started` | Servidor → Cliente | Torneo iniciado |
| `p1_skip_update` | Servidor → Cliente | Progreso de saltos |
| `p1_skipped` | Servidor → Cliente | P1 saltado por todos |
| `p2_ended` | Servidor → Cliente | P2 terminó, votación 10s |
| `vote_update` | Servidor → Cliente | Conteo de votos en tiempo real |
| `match_changed` | Servidor → Cliente | Siguiente match |
| `tournament_ended` | Servidor → Cliente | Resultados finales |
| `room_closed` | Servidor → Cliente | Sala cerrada |

## Variables de Entorno

### Backend (`server/.env`)
```
PORT=5001
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/anime_tournament?retryWrites=true&w=majority
JWT_SECRET=tu_secreto
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env.local`)
```
VITE_API_URL=http://localhost:5001/api
```

## Documentación Relacionada

- `server/API_DOCUMENTATION.md` - Documentación de API detallada
- `PROJECT_CONTEXT.md` - Contexto completo del proyecto
