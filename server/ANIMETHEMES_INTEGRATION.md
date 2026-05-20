# Integración AnimeThemes API

Integración completa con la API pública de **AnimeThemes** para buscar y obtener openings de anime.

## 📋 Descripción

La integración consume datos de `https://api.animethemes.moe` (sin API key requerida) y expone endpoints del backend para buscar animes y obtener sus openings y endings.

## 🏗️ Arquitectura

### Backend (Server)

```
server/src/
├── utils/
│   └── animeThemesService.js      # Servicio que consume AnimeThemes API
├── controllers/
│   └── animeController.js         # Lógica de controladores
├── routes/
│   └── animeRoutes.js             # Rutas API /api/anime/*
└── index.js                       # Registro de rutas
```

### Frontend (Client)

```
client/src/
├── utils/
│   └── animeApi.js                # Cliente HTTP para endpoints
├── hooks/
│   └── useAnimeSearch.js          # Custom hooks con estado
```

## 📡 Endpoints API del Backend

### 1. GET `/api/anime/search?q={query}`

**Busca animes y obtiene sus openings**

```bash
GET http://localhost:5000/api/anime/search?q=naruto
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "naruto",
      "name": "Naruto",
      "year": 2002,
      "season": "fall",
      "openings": [
        {
          "id": 123,
          "title": "Silhouette",
          "type": "OP",
          "sequence": 16,
          "artist": "Kana-Boon",
          "videoUrl": "https://animethemes.moe/...",
          "videoResolution": 1080,
          "source": "animethemes"
        }
      ],
      "endingss": [
        {
          "id": 124,
          "title": "Ending Title",
          "type": "ED",
          "sequence": 1,
          "artist": "Artist Name",
          "videoUrl": "https://...",
          "videoResolution": 1080,
          "source": "animethemes"
        }
      ]
    }
  ],
  "query": "naruto",
  "count": 1,
  "message": "Búsqueda de openings completada"
}
```

---

### 2. GET `/api/anime/:slug`

**Obtiene un anime específico con todos sus openings**

```bash
GET http://localhost:5000/api/anime/naruto
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "naruto",
    "name": "Naruto",
    "year": 2002,
    "season": "fall",
    "openings": [...],
    "endingss": [...]
  },
  "message": "Anime obtenido exitosamente"
}
```

---

### 3. GET `/api/anime/popular`

**Obtiene openings de los animes más populares**

```bash
GET http://localhost:5000/api/anime/popular
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Silhouette",
      "type": "OP",
      "sequence": 16,
      "artist": "Kana-Boon",
      "videoUrl": "https://animethemes.moe/...",
      "videoResolution": 1080,
      "source": "animethemes",
      "animeSlug": "naruto",
      "animeName": "Naruto"
    }
  ],
  "count": 48,
  "message": "Openings populares obtenidos exitosamente"
}
```

---

## 🎣 Custom Hooks (Frontend)

### useAnimeSearch()

**Hook para búsqueda de animes**

```javascript
import { useAnimeSearch } from '@/hooks/useAnimeSearch'

function SearchComponent() {
  const {
    results,
    loading,
    error,
    query,
    lastSearchQuery,
    search,
    handleSearchChange,
    executeSearch,
    clearResults,
  } = useAnimeSearch()

  return (
    <>
      <input
        value={query}
        onChange={(e) => handleSearchChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && executeSearch()}
        placeholder="Buscar anime..."
      />
      
      {loading && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}
      
      {results.map((anime) => (
        <div key={anime.slug}>
          <h3>{anime.name}</h3>
          <p>{anime.openings.length} openings disponibles</p>
        </div>
      ))}
    </>
  )
}
```

**Propiedades:**
- `results` - Array de animes encontrados
- `loading` - Booleano indicando si está cargando
- `error` - Mensaje de error (null si no hay error)
- `query` - Valor actual del input de búsqueda
- `lastSearchQuery` - Última búsqueda ejecutada

**Métodos:**
- `search(query)` - Ejecuta la búsqueda directamente
- `handleSearchChange(newQuery)` - Actualiza el valor del input
- `executeSearch()` - Ejecuta la búsqueda con el query actual
- `clearResults()` - Limpia resultados y errores

---

### useAnimeDetail()

**Hook para obtener detalles de un anime**

```javascript
import { useAnimeDetail } from '@/hooks/useAnimeSearch'

function AnimeDetailComponent({ slug }) {
  const { anime, loading, error, loadAnime, clear } = useAnimeDetail()

  useEffect(() => {
    if (slug) {
      loadAnime(slug)
    }
  }, [slug])

  if (loading) return <p>Cargando anime...</p>
  if (error) return <p className="error">{error}</p>
  if (!anime) return null

  return (
    <div>
      <h1>{anime.name}</h1>
      <h2>Openings ({anime.openings.length})</h2>
      {anime.openings.map((op) => (
        <div key={op.id}>
          <p>{op.title} - {op.artist}</p>
          {op.videoUrl && (
            <video src={op.videoUrl} controls />
          )}
        </div>
      ))}
    </div>
  )
}
```

**Propiedades:**
- `anime` - Objeto con datos del anime
- `loading` - Booleano indicando si está cargando
- `error` - Mensaje de error

**Métodos:**
- `loadAnime(slug)` - Carga los detalles del anime
- `clear()` - Limpia el estado

---

### usePopularOpenings()

**Hook para obtener openings populares**

```javascript
import { usePopularOpenings } from '@/hooks/useAnimeSearch'

function PopularComponent() {
  const { openings, loading, error, loadPopularOpenings, refetch } = 
    usePopularOpenings()

  useEffect(() => {
    loadPopularOpenings()
  }, [])

  return (
    <>
      <button onClick={refetch}>Recargar</button>
      
      {loading && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}
      
      {openings.map((op) => (
        <div key={op.id}>
          <p>{op.title} - {op.animeName}</p>
        </div>
      ))}
    </>
  )
}
```

---

## 📦 Estructura de Datos

### Anime Object
```javascript
{
  id: number,
  slug: string,              // Identificador único
  name: string,              // Nombre del anime
  year: number,              // Año de lanzamiento
  season: string,            // Temporada (fall, winter, spring, summer)
  openings: Opening[],       // Array de openings
  endingss: Ending[],        // Array de endings
}
```

### Opening/Ending Object
```javascript
{
  id: number,
  title: string,             // Título del opening
  type: 'OP' | 'ED',
  sequence: number,          // Número de secuencia
  artist: string,            // Artista/Cantante
  videoUrl: string | null,   // URL del vídeo WebM
  videoResolution: number,   // Resolución del vídeo (1080, 720, etc)
  source: 'animethemes',
  animeSlug?: string,        // (solo en popular openings)
  animeName?: string,        // (solo en popular openings)
}
```

---

## 🔧 Configuración

### Variables de Entorno

**Client (.env.local)**
```env
VITE_API_URL=http://localhost:5000/api
```

Si no está definida, por defecto usa `http://localhost:5000/api`

### Requisitos
- Node.js 16+
- No requiere API key (AnimeThemes es API pública)
- Conexión a internet

---

## 💡 Ejemplos de Uso

### Búsqueda Básica
```javascript
import { useAnimeSearch } from '@/hooks/useAnimeSearch'

function App() {
  const { results, loading, search } = useAnimeSearch()

  const handleSearch = async () => {
    await search('Attack on Titan')
  }

  return (
    <div>
      <button onClick={handleSearch}>Buscar</button>
      {loading && <p>Cargando...</p>}
      {results.map((anime) => (
        <div key={anime.slug}>{anime.name}</div>
      ))}
    </div>
  )
}
```

### Con Búsqueda en Tiempo Real (Debounce recomendado)
```javascript
import { useAnimeSearch } from '@/hooks/useAnimeSearch'
import { useState, useEffect } from 'react'

function SearchBar() {
  const { results, loading, error, query, handleSearchChange, search } = 
    useAnimeSearch()
  const [debounceTimer, setDebounceTimer] = useState(null)

  const handleChange = (e) => {
    handleSearchChange(e.target.value)
    
    // Debounce
    clearTimeout(debounceTimer)
    const timer = setTimeout(() => {
      search(e.target.value)
    }, 500)
    setDebounceTimer(timer)
  }

  return (
    <>
      <input
        value={query}
        onChange={handleChange}
        placeholder="Buscar anime..."
      />
      {results.map((anime) => (
        <div key={anime.slug}>{anime.name}</div>
      ))}
    </>
  )
}
```

---

## 🚀 Testing de APIs

### Con cURL
```bash
# Buscar
curl "http://localhost:5000/api/anime/search?q=naruto"

# Obtener detalle
curl "http://localhost:5000/api/anime/naruto"

# Populares
curl "http://localhost:5000/api/anime/popular"
```

### Con PowerShell
```powershell
$BASE_URL = "http://localhost:5000/api"

# Buscar
Invoke-RestMethod -Uri "$BASE_URL/anime/search?q=naruto" -Method Get

# Detalle
Invoke-RestMethod -Uri "$BASE_URL/anime/naruto" -Method Get

# Populares
Invoke-RestMethod -Uri "$BASE_URL/anime/popular" -Method Get
```

---

## ⚠️ Manejo de Errores

Todos los hooks y funciones incluyen manejo de errores:

```javascript
const { results, error, loading } = useAnimeSearch()

if (loading) return <Spinner />
if (error) return <ErrorMessage message={error} />
if (results.length === 0) return <EmptyState />

return <ResultsList items={results} />
```

---

## 📝 Notas Importantes

- **AnimeThemes API** es pública y no requiere autenticación
- Los vídeos están en formato **WebM** (compatible con navegadores modernos)
- La búsqueda es **case-insensitive**
- Algunos animes pueden no tener openings disponibles
- Los slugs son identificadores únicos y URL-safe

---

## 🔗 Referencias

- [AnimeThemes API](https://animethemes.moe)
- [AnimeThemes API Documentation](https://api.animethemes.moe)
