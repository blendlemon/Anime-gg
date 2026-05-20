# Anime Openings Tournament - Project Context (ACTUALIZADO 20/05/2026)

## 📋 Descripción General
App full-stack para gestionar un torneo eliminatorio de openings de anime con votación en tiempo real usando WebSockets.

### Stack Tecnológico
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB + Socket.IO
- **Base de Datos**: MongoDB (Docker)
- **API Externa**: AnimeThemes API (https://api.animethemes.moe) ✅ **INTEGRADA Y FUNCIONANDO**

---

## 📁 Estructura del Proyecto

### /server
`
server/
├── src/
│   ├── index.js (punto de entrada con Socket.IO + Express)
│   ├── config/
│   │   └── mongodb.js (conexión a MongoDB)
│   ├── models/
│   │   ├── User.js
│   │   ├── AnimeOpening.js
│   │   ├── Tournament.js
│   │   ├── TournamentParticipant.js
│   │   ├── Match.js
│   │   ├── Vote.js
│   │   └── Room.js ✅
│   ├── controllers/
│   │   ├── tournamentController.js
│   │   ├── matchController.js
│   │   ├── voteController.js
│   │   └── animeController.js ✅
│   ├── routes/
│   │   ├── index.js
│   │   ├── tournamentRoutes.js
│   │   ├── matchRoutes.js
│   │   ├── voteRoutes.js
│   │   └── animeRoutes.js ✅
│   ├── utils/
│   │   └── animeThemesService.js ✅ COMPLETAMENTE REPARADO
│   ├── sockets/
│   │   └── roomSocket.js ✅
│   ├── middleware/
│   │   └── errorHandler.js
│   └── database/
│       └── seed.js (datos de prueba)
├── docker-compose.yml ✅
├── init-mongo.js ✅
└── package.json ✅
`

---

## 🔗 API Endpoints - **TODOS FUNCIONALES ✅**

### Anime Endpoints (TESTEADOS)
\\\
✅ GET /api/anime/search?q={query}
   Busca en AnimeThemes y guarda nuevos openings en MongoDB
   Ejemplo: GET /api/anime/search?q=Demon%20Slayer → 55 openings encontrados

✅ GET /api/anime?slug={slug}
   Obtiene todos los openings de un anime específico
   Ejemplo: GET /api/anime?slug=kimetsu-no-yaiba → 50 openings

✅ GET /api/anime
   Lista todos los openings guardados en MongoDB
\\\

### Respuesta Ejemplo
\\\json
{
  "success": true,
  "data": [
    {
      "_id": "6a0da9c67d0699a601081a10",
      "title": "Guren no Yumiya",
      "anime_title": "Kimetsu no Yaiba",
      "anime_slug": "kimetsu-no-yaiba",
      "type": "OP",
      "sequence": 1,
      "artist": "Aimer",
      "year": 2019,
      "season": "Spring",
      "video_url": "https://v.animethemes.moe/KimetsuNoYaiba-OP1.webm",
      "thumbnail_url": "https://pub-92474f77857...",
      "source": "animethemes",
      "createdAt": "2026-05-20T12:32:06.329Z"
    }
  ]
}
\\\

---

## 🔌 Socket.IO Events - **IMPLEMENTADOS ✅**

### Client → Server
\\\
• join_room: Unirse a una sala con invite_code
• start_vote: Host inicia la votación del match actual
• submit_vote: Usuario vota por participant_id
• next_match: Avanzar al siguiente enfrentamiento
\\\

### Server → Client
\\\
• vote_update: Actualización de votos en tiempo real
• tournament_end: Torneo finalizado con ranking final
• user_connected: Usuario se conectó a la sala
• disconnect: Usuario desconectado
\\\

---

## 📝 Notas Técnicas Críticas

### AnimeThemes API ✅ REPARADO Y FUNCIONANDO

**Problema Identificado:** El servicio estaba parseando JSON:API (con \data.data\ e \data.included\) pero AnimeThemes devuelve estructura simple.

**Solución Implementada en animeThemesService.js:**

1. **Response Structure:**
   - \/search\: \{ search: { anime: [...] } }\
   - \/anime/{slug}\: \{ anime: {...} }\

2. **Video URL Construction:**
   - URL NO viene en un campo \link\
   - Se construye: \https://v.animethemes.moe/{basename}\
   - Basename: \	heme.animethemeentries[0].videos[0].basename\

3. **Video Selection:**
   - Se selecciona video con **mayor resolución**
   - Función: \selectBestVideo(videos)\ ordena descendente

4. **Field Extraction:**
   - Título: \	heme.song.title\
   - Artista: \	heme.song.artists[0].name\ (o "" si no existe)
   - Thumbnail: \nime.images[0].link\ (puede ser null)
   - Tipo: \	heme.type\ (OP/ED)
   - Secuencia: \	heme.sequence\

---

## ✅ Estado Actual - 20/05/2026 14:30 UTC+2

### COMPLETADO ✅
- ✅ Estructura carpetas (React + Vite + Tailwind)
- ✅ Estructura carpetas (Express + MongoDB)
- ✅ BracketView component (React)
- ✅ Express routes /api/torneos básicas
- ✅ MongoDB migration (MySQL → MongoDB con Docker)
- ✅ Room model (Mongoose)
- ✅ AnimeThemes API service - **COMPLETAMENTE REPARADO**
- ✅ Anime controllers (3 métodos)
- ✅ Anime routes (3 endpoints)
- ✅ Socket.IO integration (6 eventos)
- ✅ **TESTING: Todos endpoints funcionando 100%**

### PRÓXIMOS PASOS
- [ ] Frontend Socket.IO client
- [ ] UI salas (join con invite code)
- [ ] Componente votación (2 openings)
- [ ] Real-time votos (barra progreso)
- [ ] Bracket visual (16→8→4→2→1)
- [ ] Página resultados

---

**Última actualización:** 20 de mayo de 2026 - 14:53 UTC+2
