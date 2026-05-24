# QUICK START

## 1. Instala Dependencias

### Backend
```bash
cd server
pnpm install
```

### Frontend
```bash
cd client
pnpm install
```

## 2. Configura Variables de Entorno

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

## 3. Inicia el Servidor Backend

```bash
cd server
pnpm run dev
```

Deberías ver:
```
MongoDB connected successfully
Server running on port 5001
Socket.IO: ws://localhost:5001
```

## 4. Inicia el Cliente (otra terminal)

```bash
cd client
pnpm run dev
```

Accede a: `http://localhost:5173`

## Prueba Rápida

```bash
# Health check
curl http://localhost:5001/api/health

# Buscar openings
curl "http://localhost:5001/api/anime/search?q=naruto"

# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

## Estructura de Carpetas

```
proyecto-con-ai/
├── client/                 # Frontend React + Vite + Tailwind
│   └── src/
│       ├── pages/          # Login, Home, CreateTournament, Tournament, Room, Ranking
│       ├── components/     # Navbar, BracketView, VideoPlayer, VolumeSlider, etc.
│       ├── hooks/          # useAuth, useSocket, useAnimeSearch
│       ├── context/        # AuthContext
│       └── utils/          # api.js, animeApi.js
└── server/                 # Backend Express + MongoDB + Socket.IO
    └── src/
        ├── config/mongodb.js
        ├── models/         # 7 modelos Mongoose
        ├── routes/         # auth, anime, tournament, room
        ├── controllers/    # auth, anime, tournament, room
        ├── sockets/roomSocket.js
        ├── middleware/auth.js
        └── utils/animeThemesService.js, videoCache.js
```

## Documentación Relacionada

- `PROJECT_CONTEXT.md` - Conocimiento completo del proyecto
- `server/API_DOCUMENTATION.md` - Documentación de API
