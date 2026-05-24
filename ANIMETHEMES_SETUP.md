# Integración AnimeThemes

Integración completa de la API pública de AnimeThemes para búsqueda de openings de anime.

## Archivos

### Backend (Server)

#### `server/src/utils/animeThemesService.js`
**Servicio que consume AnimeThemes API**
- `searchOpenings(query)` - Busca animes y obtiene openings
- `getAnimeBySlug(slug)` - Obtiene detalle de anime específico
- `syncAllOpenings()` - Sincronización completa (programada cada 6h)
- `getOpeningVideoUrl(entry)` - Construye URL directa del CDN

**Endpoints reales:**
- Búsqueda: `https://api.animethemes.moe/search?q={query}&include[anime]=animethemes.animethemeentries.videos,images`
- Detalle: `https://api.animethemes.moe/anime/{slug}?include=animethemes.animethemeentries.videos`

**Video URL:** Se construye como `https://v.animethemes.moe/{basename}`, seleccionando la mayor resolución. **Sin proxy** — reproducción directa desde CDN.

---

#### `server/src/controllers/animeController.js`
- `searchOpeningsController` - GET `/api/anime/search?q=`
- `getAnimeOpeningsController` - GET `/api/anime/anime?slug=`
- `getAllOpeningsController` - GET `/api/anime` (paginado)

---

#### `server/src/routes/animeRoutes.js`
```
GET  /api/anime/search?q=     → Buscar openings, guarda en MongoDB
GET  /api/anime/anime?slug=   → Openings por slug de anime
GET  /api/anime               → Listar todos los openings cacheados
```

### Frontend (Client)

#### `client/src/utils/animeApi.js`
**Cliente HTTP para endpoints del backend**

#### `client/src/hooks/useAnimeSearch.js`
**3 Custom Hooks:** useAnimeSearch, useAnimeDetail, usePopularOpenings

---

## Flujo de Datos

```
Frontend (React)
    ↓ useAnimeSearch hook
    ↓ animeApi.js (fetch)
Backend (Express - puerto 5001)
    ↓ animeController.js
    ↓ animeThemesService.js
    ↓ AnimeThemes API (api.animethemes.moe)
    ↓ Transformación → MongoDB cache
    ↓ JSON Response → Frontend
```

---

## Uso Rápido

```bash
# Buscar openings
curl "http://localhost:5001/api/anime/search?q=naruto"

# Detalle por slug
curl "http://localhost:5001/api/anime/anime?slug=naruto"

# Todos los cacheados
curl "http://localhost:5001/api/anime"
```

---

## Features

- Búsqueda de animes por nombre
- Cacheo en MongoDB (evita llamadas repetidas)
- URLs de vídeo WebM con mejor calidad
- Reproducción directa desde CDN (sin proxy)
- Sincronización programada cada 6h
- **NO requiere API key**

---

**Integración lista!**
