# 🧪 Guía de Testing - AnimeThemes Integration

Sigue estos pasos para verificar que todo funciona correctamente.

---

## **PASO 1: Instalar dependencias**

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd client
npm install
```

---

## **PASO 2: Iniciar el servidor backend**

```bash
cd server
npm run dev
```

**Esperado:**
```
✓ Server running on port 5000
✓ Environment: development
✓ API Health: http://localhost:5000/api/health
```

Si ves esto ✅, el servidor está corriendo.

---

## **PASO 3: Probar endpoints del backend**

### Opción A: Con cURL (Linux/Mac/Windows PowerShell)

#### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-05-19T21:32:00Z"
}
```

---

#### Test 2: Buscar anime (Naruto)
```bash
curl "http://localhost:5000/api/anime/search?q=naruto"
```

**Respuesta esperada (~1-2 segundos):**
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
      "endingss": [...]
    }
  ],
  "query": "naruto",
  "count": 1,
  "message": "Búsqueda de openings completada"
}
```

✅ Si ves datos, **¡funciona!**

---

#### Test 3: Obtener anime específico
```bash
curl "http://localhost:5000/api/anime/naruto"
```

**Mismo formato que Test 2**

---

#### Test 4: Openings populares
```bash
curl "http://localhost:5000/api/anime/popular"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Silhouette",
      "type": "OP",
      "animeName": "Naruto",
      "animeSlug": "naruto",
      ...
    }
  ],
  "count": 48,
  "message": "Openings populares obtenidos exitosamente"
}
```

---

### Opción B: Con PowerShell (Windows)

```powershell
$BASE_URL = "http://localhost:5000/api"

# Health Check
Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get | ConvertTo-Json

# Búsqueda
Invoke-RestMethod -Uri "$BASE_URL/anime/search?q=naruto" -Method Get | ConvertTo-Json

# Detalle
Invoke-RestMethod -Uri "$BASE_URL/anime/naruto" -Method Get | ConvertTo-Json

# Populares
Invoke-RestMethod -Uri "$BASE_URL/anime/popular" -Method Get | ConvertTo-Json
```

---

### Opción C: Con Postman (GUI)

1. Abre [Postman](https://www.postman.com/downloads/)
2. Crea una **nueva Request**
3. Método: **GET**
4. URL: `http://localhost:5000/api/anime/search?q=naruto`
5. Click **Send**
6. Ver respuesta en la pestaña **Body**

---

## **PASO 4: Verificar que llega desde el frontend**

### Test con el navegador (JavaScript Console)

Abre la consola de desarrollador (`F12` o `Ctrl+Shift+I`) y ejecuta:

```javascript
// Test 1: Buscar anime
fetch('http://localhost:5000/api/anime/search?q=naruto')
  .then(res => res.json())
  .then(data => console.log('Búsqueda:', data))
  .catch(err => console.error('Error:', err))

// Test 2: Obtener detalle
fetch('http://localhost:5000/api/anime/naruto')
  .then(res => res.json())
  .then(data => console.log('Detalle:', data))
  .catch(err => console.error('Error:', err))

// Test 3: Populares
fetch('http://localhost:5000/api/anime/popular')
  .then(res => res.json())
  .then(data => console.log('Populares:', data))
  .catch(err => console.error('Error:', err))
```

**Esperado:**
- Ver objetos de anime en la consola
- Sin errores CORS
- Datos correctamente estructurados

---

## **PASO 5: Probar los hooks en un componente**

### Crea un archivo de prueba temporal

**`client/src/TestAnimeIntegration.jsx`**

```javascript
import { useAnimeSearch, usePopularOpenings } from '@/hooks/useAnimeSearch'
import { useEffect } from 'react'

export function TestAnimeIntegration() {
  const search = useAnimeSearch()
  const popular = usePopularOpenings()

  useEffect(() => {
    // Auto-cargar populares
    popular.loadPopularOpenings()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🧪 Test AnimeThemes Integration</h1>

      {/* Test de búsqueda */}
      <section>
        <h2>Test 1: Búsqueda</h2>
        <input
          value={search.query}
          onChange={(e) => search.handleSearchChange(e.target.value)}
          placeholder="Busca un anime..."
          style={{ padding: '8px', width: '300px' }}
        />
        <button onClick={search.executeSearch} disabled={search.loading}>
          {search.loading ? 'Buscando...' : 'Buscar'}
        </button>

        {search.error && <p style={{ color: 'red' }}>❌ {search.error}</p>}
        
        {search.results.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <h3>Resultados ({search.results.length})</h3>
            {search.results.map((anime) => (
              <div key={anime.slug} style={{ 
                border: '1px solid #ccc', 
                padding: '10px', 
                margin: '5px 0'
              }}>
                <p><strong>{anime.name}</strong> ({anime.year})</p>
                <p>📺 {anime.openings.length} openings</p>
                <p>First opening: {anime.openings[0]?.title || 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <hr />

      {/* Test de populares */}
      <section>
        <h2>Test 2: Openings Populares</h2>
        
        {popular.loading && <p>⏳ Cargando...</p>}
        {popular.error && <p style={{ color: 'red' }}>❌ {popular.error}</p>}

        {popular.openings.length > 0 && (
          <div>
            <p>✅ {popular.openings.length} openings cargados</p>
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {popular.openings.slice(0, 10).map((op) => (
                <div key={op.id} style={{ 
                  border: '1px solid #ddd', 
                  padding: '8px', 
                  margin: '5px 0'
                }}>
                  <p><strong>{op.title}</strong></p>
                  <p>Anime: {op.animeName}</p>
                  <p>Artista: {op.artist}</p>
                  {op.videoUrl && (
                    <p style={{ color: 'green' }}>✅ Tiene vídeo</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
```

### Usar en `App.jsx`

```javascript
import TestAnimeIntegration from '@/components/TestAnimeIntegration'

function App() {
  return <TestAnimeIntegration />
}

export default App
```

### Ejecutar frontend

```bash
cd client
npm run dev
```

Abre `http://localhost:5173` en el navegador

**Esperado:**
- Puedes escribir en el input de búsqueda
- El botón busca y muestra resultados
- Los openings populares se cargan automáticamente
- Sin errores CORS

---

## **Troubleshooting**

### ❌ Error: "Cannot find module 'animethemesService'"

**Solución:** Las rutas de import están mal. Verifica que existan los archivos en:
- `server/src/utils/animeThemesService.js`
- `server/src/controllers/animeController.js`

---

### ❌ Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Solución:** El servidor no está corriendo. Verifica:
```bash
cd server
npm run dev
```

Y que veas el mensaje: `✓ Server running on port 5000`

---

### ❌ Error: "animeThemesService is not a function"

**Solución:** Asegúrate de usar destructuring en el import:
```javascript
// ✅ Correcto
import * as animeThemesService from '../utils/animeThemesService.js'

// ❌ Incorrecto
import animeThemesService from '../utils/animeThemesService.js'
```

---

### ❌ Error: "Network request failed"

**Solución:** 
1. Backend no está corriendo
2. URL incorrecta
3. Sin conexión a internet (necesario para AnimeThemes API)

Verifica:
```bash
curl http://localhost:5000/api/health
```

---

### ❌ Búsqueda retorna array vacío `[]`

**Posibles causas:**
1. Nombre de anime está mal escrito
2. AnimeThemes no tiene ese anime
3. Problema de conexión a AnimeThemes API

**Prueba:** Busca algo común como "naruto", "attack", "jojo"

---

## **Checklist de Testing**

Marca ✅ mientras avanzas:

- [ ] Backend instala sin errores (`npm install`)
- [ ] Backend inicia correctamente (`npm run dev`)
- [ ] Health check funciona: `curl http://localhost:5000/api/health`
- [ ] Búsqueda devuelve datos: `curl "http://localhost:5000/api/anime/search?q=naruto"`
- [ ] Detalle funciona: `curl "http://localhost:5000/api/anime/naruto"`
- [ ] Populares funciona: `curl "http://localhost:5000/api/anime/popular"`
- [ ] Frontend instala sin errores (`npm install`)
- [ ] Frontend inicia: `npm run dev` 
- [ ] Puedes escribir en input de búsqueda
- [ ] Búsqueda devuelve resultados
- [ ] Populares se cargan al abrir
- [ ] Sin errores en consola del navegador (`F12`)
- [ ] Sin errores CORS

---

## **Próximos Pasos**

Una vez todo funcione ✅:

1. **Crear UI bonita** con Tailwind para búsqueda
2. **Integrar con BracketView** para seleccionar openings
3. **Guardar favoritos** en la base de datos
4. **Reproductor de vídeo** personalizado

---

## **Comandos Rápidos**

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev

# Terminal 3: Tests
curl "http://localhost:5000/api/anime/search?q=naruto" | jq .
```

¡**Listo para probar!** 🚀
