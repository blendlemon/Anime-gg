# API Documentation - Torneos

## Endpoints

### 1. GET /api/torneos
**Descripción:** Lista todos los torneos disponibles

**Método:** `GET`

**URL:** `http://localhost:5000/api/torneos`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Anime Openings 2024",
      "description": "Torneo de apertura de anime más popular",
      "status": "planning",
      "created_by": 1,
      "start_date": "2024-06-01T10:00:00Z",
      "end_date": "2024-06-30T23:59:59Z",
      "created_at": "2024-05-19T21:00:00.000Z"
    }
  ],
  "count": 1,
  "message": "Torneos obtenidos exitosamente"
}
```

**Errores:**
- `500` - Error al obtener los torneos

---

### 2. GET /api/torneos/:id
**Descripción:** Obtiene el detalle de un torneo específico incluyendo participantes y matches

**Método:** `GET`

**URL:** `http://localhost:5000/api/torneos/1`

**Parámetros:**
- `id` (path) - ID del torneo (número entero)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Anime Openings 2024",
    "description": "Torneo de apertura de anime más popular",
    "status": "planning",
    "created_by": 1,
    "start_date": "2024-06-01T10:00:00Z",
    "end_date": "2024-06-30T23:59:59Z",
    "created_at": "2024-05-19T21:00:00.000Z",
    "participants_count": 16,
    "participants": [
      {
        "id": 1,
        "opening_id": 10,
        "seed": 1,
        "title": "Cruel Angel Thesis",
        "anime_title": "Neon Genesis Evangelion",
        "artist": "Yoko Takahashi",
        "thumbnail_url": "https://...",
        "youtube_url": "https://..."
      }
    ],
    "matches_count": 15,
    "matches": [
      {
        "id": 1,
        "round": 1,
        "match_number": 1,
        "participant1_id": 1,
        "participant2_id": 2,
        "winner_id": null,
        "status": "pending",
        "created_at": "2024-05-19T21:00:00.000Z",
        "participant1_title": "Cruel Angel Thesis",
        "participant1_anime": "Neon Genesis Evangelion",
        "participant2_title": "Unravel",
        "participant2_anime": "Tokyo Ghoul"
      }
    ]
  },
  "message": "Detalle del torneo obtenido exitosamente"
}
```

**Errores:**
- `400` - ID inválido (no es un número)
- `404` - Torneo no encontrado
- `500` - Error al obtener el detalle del torneo

---

### 3. POST /api/torneos
**Descripción:** Crea un nuevo torneo

**Método:** `POST`

**URL:** `http://localhost:5000/api/torneos`

**Content-Type:** `application/json`

**Body requerido:**
```json
{
  "name": "Nombre del torneo",
  "description": "Descripción del torneo (opcional)",
  "created_by": 1,
  "start_date": "2024-06-01T10:00:00Z",
  "end_date": "2024-06-30T23:59:59Z"
}
```

**Parámetros:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | ✓ | Nombre del torneo (no vacío) |
| `description` | string | ✗ | Descripción del torneo |
| `created_by` | number | ✓ | ID del usuario creador (debe existir) |
| `start_date` | string | ✗ | Fecha de inicio (ISO 8601) |
| `end_date` | string | ✗ | Fecha de fin (ISO 8601) |

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Anime Openings 2024",
    "description": "Torneo de apertura de anime más popular",
    "created_by": 1,
    "start_date": "2024-06-01T10:00:00Z",
    "end_date": "2024-06-30T23:59:59Z",
    "status": "planning",
    "created_at": "2024-05-19T21:00:00.000Z"
  },
  "message": "Torneo creado exitosamente"
}
```

**Errores:**
- `400` - Datos inválidos o requeridos faltantes
- `404` - El usuario especificado no existe
- `409` - Ya existe un torneo con ese nombre
- `500` - Error al crear el torneo

---

## Ejemplos de uso

### Con cURL

```bash
# Listar torneos
curl -X GET http://localhost:5000/api/torneos

# Obtener detalle de un torneo
curl -X GET http://localhost:5000/api/torneos/1

# Crear un nuevo torneo
curl -X POST http://localhost:5000/api/torneos \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Torneo de Openings",
    "description": "Un torneo increíble",
    "created_by": 1,
    "start_date": "2024-06-01T10:00:00Z",
    "end_date": "2024-06-30T23:59:59Z"
  }'
```

### Con JavaScript/Fetch

```javascript
// Listar torneos
const getTournaments = async () => {
  const response = await fetch('http://localhost:5000/api/torneos')
  const data = await response.json()
  return data
}

// Obtener detalle
const getTournamentById = async (id) => {
  const response = await fetch(`http://localhost:5000/api/torneos/${id}`)
  const data = await response.json()
  return data
}

// Crear torneo
const createTournament = async (tournament) => {
  const response = await fetch('http://localhost:5000/api/torneos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tournament)
  })
  const data = await response.json()
  return data
}
```

### Con Axios

```javascript
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

// Listar torneos
const getTournaments = () => axios.get(`${API_URL}/torneos`)

// Obtener detalle
const getTournamentById = (id) => axios.get(`${API_URL}/torneos/${id}`)

// Crear torneo
const createTournament = (tournament) => 
  axios.post(`${API_URL}/torneos`, tournament)
```

---

## Códigos de estado HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| `200` | OK | Solicitud exitosa |
| `201` | Created | Recurso creado exitosamente |
| `400` | Bad Request | Datos inválidos o incompletos |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | El recurso ya existe |
| `500` | Server Error | Error del servidor |

---

## Consideraciones

- **Validación:** Se valida que los campos requeridos estén presentes y sean válidos
- **Seguridad:** Se valida que el usuario especificado existe antes de crear el torneo
- **Timestamps:** Las fechas se manejan en formato ISO 8601
- **Conexiones:** Se usan promesas con try/catch para manejo robusto de errores
- **Pool de conexiones:** MySQL2 usa un pool de conexiones para mejor rendimiento
