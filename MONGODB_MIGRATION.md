# MongoDB Migration Guide

## Overview
Migración exitosa de MySQL a MongoDB usando Docker. El proyecto ahora usa:
- **MongoDB 7.0** en Docker
- **Mongoose** como ODM (Object Document Mapper)
- **Docker Compose** para orquestación
- **Mongo Express** para administración de base de datos

## Estructura

### Docker Setup
```bash
docker-compose up -d
```

Esto inicia:
- **MongoDB**: Puerto 27017
- **Mongo Express**: Puerto 8081 (admin: admin / password: admin123)

### Conexión
```
MONGODB_URI=mongodb://root:rootpassword@localhost:27017/anime_tournament?authSource=admin
```

## Modelos Mongoose

### User
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password_hash: String,
  createdAt: Date,
  updatedAt: Date
}
```

### AnimeOpening
```javascript
{
  _id: ObjectId,
  title: String (required),
  anime_title: String (required),
  anime_slug: String (indexed),
  year: Number,
  season: String,
  artist: String,
  thumbnail_url: String,
  youtube_url: String,
  video_url: String,
  video_resolution: Number,
  type: String (OP|ED),
  sequence: Number,
  source: String (animethemes|user),
  createdAt: Date,
  updatedAt: Date
}
```

### Tournament
```javascript
{
  _id: ObjectId,
  name: String (unique, required),
  description: String,
  status: String (planning|active|completed),
  created_by: ObjectId (ref: User),
  start_date: Date,
  end_date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### TournamentParticipant
```javascript
{
  _id: ObjectId,
  tournament_id: ObjectId (ref: Tournament, indexed),
  opening_id: ObjectId (ref: AnimeOpening, indexed),
  seed: Number,
  createdAt: Date
  // Índice único compuesto: (tournament_id, opening_id)
}
```

### Match
```javascript
{
  _id: ObjectId,
  tournament_id: ObjectId (ref: Tournament, indexed),
  round: Number (1-4),
  match_number: Number,
  participant1_id: ObjectId (ref: TournamentParticipant),
  participant2_id: ObjectId (ref: TournamentParticipant),
  winner_id: ObjectId (ref: TournamentParticipant),
  status: String (pending|in_progress|completed),
  createdAt: Date,
  updatedAt: Date
}
```

### Vote
```javascript
{
  _id: ObjectId,
  match_id: ObjectId (ref: Match, indexed),
  participant_id: ObjectId (ref: TournamentParticipant),
  user_id: ObjectId (ref: User),
  createdAt: Date
}
```

## Migraciones de Consultas SQL → Mongoose

### SELECT (GET)
```javascript
// SQL
SELECT * FROM tournaments WHERE id = ?

// Mongoose
const tournament = await Tournament.findById(id)
  .populate('created_by', 'username email')
```

### INSERT (CREATE)
```javascript
// SQL
INSERT INTO tournaments (name, description, created_by) VALUES (?, ?, ?)

// Mongoose
const tournament = new Tournament({
  name,
  description,
  created_by
})
await tournament.save()
```

### UPDATE
```javascript
// SQL
UPDATE tournaments SET name = ? WHERE id = ?

// Mongoose
await Tournament.findByIdAndUpdate(id, { name }, { new: true })
```

### DELETE
```javascript
// SQL
DELETE FROM tournaments WHERE id = ?

// Mongoose
await Tournament.findByIdAndDelete(id)
```

### JOINs
```javascript
// SQL
SELECT * FROM tournaments t
JOIN users u ON t.created_by = u.id

// Mongoose
const tournaments = await Tournament.find()
  .populate('created_by')
```

## Índices

Los índices están creados automáticamente por `init-mongo.js`:
- `users.username` (unique)
- `users.email` (unique)
- `anime_openings.anime_slug`
- `anime_openings.title`
- `tournaments.created_by`
- `tournaments.createdAt` (desc)
- `tournament_participants.tournament_id`
- `tournament_participants.opening_id`
- `tournament_participants.tournament_id + opening_id` (unique)
- `matches.tournament_id`
- `matches.tournament_id + round`
- `matches.winner_id`
- `votes.match_id`
- `votes.user_id`

## Cambios en las Rutas

### /api/torneos (GET)
```javascript
// Antes (MySQL)
const [tournaments] = await connection.execute('SELECT * FROM tournaments')

// Ahora (MongoDB)
const tournaments = await Tournament.find()
  .populate('created_by', 'username email')
  .sort({ created_at: -1 })
```

### /api/torneos/:id (GET)
- ObjectId validation: `/^[0-9a-fA-F]{24}$/`
- Poblado de referencias (created_by, opening_id)

### /api/torneos (POST)
- Validación de usuario: `User.findById(created_by)`
- Manejo de duplicados: `error.code === 11000`

## Validaciones

MongoDB Validation Schema está configurado en `init-mongo.js` con:
- Tipos de datos requeridos
- Campos obligatorios
- Enums para estados

Mongoose Schema validation:
- Unique constraints
- Regex para emails
- Min/Max lengths

## Migración de Datos (Si fuera necesario)

Para migrar datos de MySQL a MongoDB:

```javascript
import mysql from 'mysql2/promise'
import Tournament from './models/Tournament.js'

const sourcePool = mysql.createPool({...})

// Ejemplo: migrar tourneos
const connection = await sourcePool.getConnection()
const [rows] = await connection.execute('SELECT * FROM tournaments')

for (const row of rows) {
  await Tournament.create({
    _id: row.id, // ObjectId conversion si necesario
    name: row.name,
    description: row.description,
    status: row.status,
    created_by: row.created_by,
    start_date: row.start_date,
    end_date: row.end_date
  })
}
```

## Troubleshooting

### MongoDB no conecta
```bash
# Verificar que Docker está corriendo
docker ps

# Verificar logs
docker-compose logs mongodb

# Reiniciar
docker-compose restart mongodb
```

### Errores de autenticación
```
Error: authentication failed

# Solución: Usar authSource=admin en la URI
mongodb://root:rootpassword@localhost:27017/anime_tournament?authSource=admin
```

### Indices duplicados
```bash
# Conectarse a Mongo Express en http://localhost:8081
# O por terminal:
mongosh mongodb://root:rootpassword@localhost:27017/anime_tournament --authenticationDatabase admin
```

## Performance

MongoDB es generalmente más rápido para:
- Consultas con referencias pobladas (population ≈ JOIN)
- Documentos anidados (evita múltiples JOINs)
- Escalabilidad horizontal (sharding)

Más lento para:
- Consultas muy complejas multi-colección
- Transacciones distribuidas (usa replicas sets)

## Próximos Pasos

1. ✅ Docker + MongoDB setup
2. ✅ Modelos Mongoose creados
3. ✅ Rutas actualizadas
4. ⏳ Seeders para datos de prueba
5. ⏳ Tests de endpoints
6. ⏳ Documentación API actualizada

## Referencias

- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Docker Compose](https://docs.docker.com/compose/)
