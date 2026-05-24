# Integración AnimeThemes API

Integración con la API pública de **AnimeThemes** para buscar y obtener openings de anime.

## Descripción

Consume datos de `https://api.animethemes.moe` (sin API key) y expone endpoints del backend para buscar animes y obtener sus openings. Los resultados se cachean en MongoDB.

## Arquitectura

### Backend (Server)

```
server/src/
├── utils/animeThemesService.js    # Servicio que consume AnimeThemes API
├── controllers/animeController.js # Lógica de controladores (3 endpoints)
├── routes/animeRoutes.js          # Rutas API /api/anime/*
└── index.js                       # Registro de rutas
```

### Frontend (Client)

```
client/src/
├── utils/animeApi.js              # Cliente HTTP para endpoints
├── hooks/useAnimeSearch.js        # Custom hooks (search, detail, popular)
```

---

## Endpoints

### 1. GET `/api/anime/search?q={query}`
Busca animes y obtiene sus openings. Guarda en MongoDB (upsert).

```bash
curl "http://localhost:5001/api/anime/search?q=naruto"
```

### 2. GET `/api/anime/anime?slug={slug}`
Obtiene openings de un anime específico. Busca en BD primero, luego en AnimeThemes.

### 3. GET `/api/anime`
Lista todos los openings guardados en MongoDB (con paginación: limit, skip, type).

---

## Custom Hooks (Frontend)

### useAnimeSearch()
```javascript
const { results, loading, error, query, executeSearch, clearResults } = useAnimeSearch()
```

### useAnimeDetail()
```javascript
const { anime, loading, error, loadAnime } = useAnimeDetail()
```

### usePopularOpenings()
```javascript
const { openings, loading, loadPopularOpenings } = usePopularOpenings()
```

---

## Estructura de Datos (AnimeOpening en MongoDB)

```javascript
{
  _id: ObjectId,
  title: String,
  anime_title: String,
  anime_slug: String,
  year: Number,
  season: String,
  artist: String,
  video_url: String,       // URL directa del CDN (v.animethemes.moe)
  thumbnail_url: String,
  type: String,            // "OP" o "ED"
  sequence: Number,
  source: String,          // "animethemes"
  timestamps
}
```

## Notas Técnicas

- **AnimeThemes API** es pública, sin autenticación
- Los vídeos están en **WebM** servidos desde `v.animethemes.moe`
- **Sin proxy** — reproducción directa desde CDN
- La búsqueda es **case-insensitive**
- Los resultados se cachean en MongoDB (upsert)
- Sincronización automática cada 6h vía scheduler

## Referencias

- [AnimeThemes API](https://animethemes.moe)
- [AnimeThemes API Docs](https://api-docs.animethemes.moe/)
