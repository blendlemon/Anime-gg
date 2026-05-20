# MongoDB Migration - Quick Test Guide

## ✅ Status: Migración Completada

La migración de MySQL a MongoDB está **100% funcional**.

## 🚀 Quick Start

### 1. Inicia los contenedores
```bash
cd "d:\proyecto con ai"
docker-compose up -d
```

Verificar que estén corriendo:
```bash
docker ps
```

Deberías ver:
- `anime-tournament-mongo` (Puerto 27017)
- `anime-tournament-mongo-express` (Puerto 8081 - Admin UI)

### 2. Instala dependencias del servidor
```bash
cd server
pnpm install
```

### 3. Seed de datos (opcional)
```bash
node seed.js
```

Esto crea:
- 1 usuario de prueba
- 1 torneo con 4 participantes

### 4. Inicia el servidor
```bash
pnpm run dev
```

Deberías ver:
```
✓ MongoDB connected successfully
✓ Server running on port 5000
✓ API Health: http://localhost:5000/api/health
```

## 🧪 Prueba los Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "Server is running",
  "database": "MongoDB",
  "timestamp": "2026-05-20T10:13:51.731Z"
}
```

### GET /api/torneos (Listar)
```bash
curl http://localhost:5000/api/torneos
```

### GET /api/torneos/:id (Detalle)
```bash
curl http://localhost:5000/api/torneos/6a0d8a351d69a6d6a0edf4c6
```

Reemplaza el ID con uno real de tu base de datos.

### POST /api/torneos (Crear)
```bash
curl -X POST http://localhost:5000/api/torneos \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Nuevo Torneo",
    "description": "Descripción del torneo",
    "created_by": "6a0d8a351d69a6d6a0edf4be"
  }'
```

## 📊 Admin MongoDB

Accede a **Mongo Express** en http://localhost:8081
- Usuario: `admin`
- Contraseña: `admin123`

Desde aquí puedes:
- Ver todas las colecciones
- Inspeccionar documentos
- Ejecutar queries
- Crear/editar documentos manualmente

## 🗄️ Colecciones Creadas

```
anime_tournament/
├── users (1 documento)
├── anime_openings (4 documentos)
├── tournaments (1-2 documentos)
├── tournament_participants (4 documentos)
├── matches (0 documentos)
└── votes (0 documentos)
```

## 🔄 Diferencias MySQL vs MongoDB

| Aspecto | MySQL | MongoDB |
|---------|-------|---------|
| Conexión | mysql2 pool | Mongoose connection |
| Queries | SQL strings | Mongoose methods |
| Joins | SQL JOIN | populate() |
| IDs | AUTO_INCREMENT | ObjectId |
| Validación | Constraints | Schema validators |
| Transactions | Nativas | Multi-doc (Replica Set) |

## 📝 Cambios en el Código

### Antes (MySQL):
```javascript
const [rows] = await connection.execute(
  'SELECT * FROM tournaments WHERE id = ?',
  [id]
)
```

### Ahora (MongoDB):
```javascript
const tournament = await Tournament.findById(id)
  .populate('created_by', 'username email')
```

## ⚠️ Importante

### Mongoose Warnings (Safe to Ignore)
```
[MONGODB DRIVER] Warning: useNewUrlParser is deprecated
[MONGODB DRIVER] Warning: useUnifiedTopology is deprecated
```

Estos son warnings normales de Mongoose 8.x. No afectan la funcionalidad.

### Ports
- MongoDB: `27017`
- Mongo Express: `8081`
- API Server: `5000`
- Cliente Vite: `5173`

## 🐛 Troubleshooting

### MongoDB no conecta
```bash
# Verificar contenedores
docker-compose logs mongodb

# Reiniciar
docker-compose restart mongodb
```

### Puerto ya está en uso
```bash
# Liberar puerto 5000
Get-NetTCPConnection -LocalPort 5000 | Stop-Process -Force
```

### Limpiar todo y empezar de nuevo
```bash
# Eliminar todo incluyendo volúmenes
docker-compose down -v

# Reiniciar limpio
docker-compose up -d
node seed.js
pnpm run dev
```

## 📚 Próximos Pasos

- [ ] Integrar búsqueda de AnimeThemes
- [ ] Crear endpoints de matches
- [ ] Crear endpoints de votos
- [ ] Tests e2e
- [ ] Documentación OpenAPI/Swagger

## 📞 Soporte

Para más detalles, consulta `MONGODB_MIGRATION.md`
