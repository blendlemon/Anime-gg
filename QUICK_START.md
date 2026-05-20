# 🚀 QUICK START - MongoDB Edition

## 1️⃣ Inicia MongoDB con Docker

```bash
cd "d:\proyecto con ai"
docker-compose up -d
```

Verifica que estén corriendo:
```bash
docker ps
```

Deberías ver dos contenedores:
- `anime-tournament-mongo` ✅
- `anime-tournament-mongo-express` ✅

## 2️⃣ Instala Dependencias

### Backend
```bash
cd server
pnpm install
```

### Frontend (opcional por ahora)
```bash
cd client
pnpm install
```

## 3️⃣ Configura Variables de Entorno

### Backend (.env)
Copia o verifica `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://root:rootpassword@localhost:27017/anime_tournament?authSource=admin
NODE_ENV=development
JWT_SECRET=tu_super_secreto_aqui_cambiar_en_produccion
```

### Frontend (.env)
Copia `client/.env.example` → `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## 4️⃣ Puebla la Base de Datos (Opcional)

```bash
cd server
node seed.js
```

Esto crea:
- 1 usuario de prueba
- 4 openings de anime
- 1 torneo con esos openings

## 5️⃣ Inicia el Servidor

```bash
cd server
pnpm run dev
```

Deberías ver:
```
✓ MongoDB connected successfully
✓ Server running on port 5000
✓ Environment: development
✓ API Health: http://localhost:5000/api/health
```

## 6️⃣ Inicia el Cliente (en otra terminal)

```bash
cd client
pnpm run dev
```

Accede a: `http://localhost:5173`

## 🧪 Prueba Rápida

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Listar Torneos
```bash
curl http://localhost:5000/api/torneos
```

### Mongo Express (Admin)
Abre: `http://localhost:8081`
- Usuario: `admin`
- Contraseña: `admin123`

## 📦 Estructura de Carpetas

```
proyecto con ai/
├── docker-compose.yml      ← Configuración MongoDB
├── init-mongo.js           ← Script de inicialización
├── MONGODB_MIGRATION.md    ← Documentación de migración
├── MONGODB_SETUP.md        ← Guía detallada
│
├── client/                 ← Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
└── server/                 ← Backend Express
    ├── src/
    │   ├── config/
    │   │   └── mongodb.js  ← Conexión MongoDB
    │   ├── models/         ← Esquemas Mongoose
    │   ├── routes/
    │   ├── controllers/
    │   ├── utils/
    │   └── index.js
    ├── seed.js             ← Datos de prueba
    └── package.json
```

## 🛑 Detener Todo

### Detener Servidor
En la terminal del servidor: `Ctrl+C`

### Detener MongoDB
```bash
docker-compose down
```

### Limpiar Todo (incluyendo datos)
```bash
docker-compose down -v
```

## 🔄 Reiniciar desde Cero

```bash
# Detener y eliminar todo
docker-compose down -v

# Reiniciar MongoDB
docker-compose up -d

# Esperar a que esté listo
Start-Sleep -Seconds 3

# Puebla datos
cd server
node seed.js

# Inicia servidor
pnpm run dev
```

## ✅ Checklist

- [ ] Docker está instalado y corriendo
- [ ] `docker-compose up -d` ✓
- [ ] MongoDB containers visibles en `docker ps`
- [ ] `pnpm install` en server/ ✓
- [ ] `pnpm install` en client/ ✓
- [ ] `server/.env` existe
- [ ] `pnpm run dev` en server/ ✓
- [ ] API responde en `http://localhost:5000/api/health`
- [ ] `pnpm run dev` en client/ ✓
- [ ] Cliente carga en `http://localhost:5173`

## 📚 Documentación

- `PROJECT_CONTEXT.md` - Conocimiento completo del proyecto
- `MONGODB_MIGRATION.md` - Detalles de la migración
- `MONGODB_SETUP.md` - Guía de pruebas
- `TESTING_GUIDE.md` - Cómo probar endpoints

## 💡 Tips

- Mongoose warnings sobre `useNewUrlParser` son normales, ignóralos
- Mongo Express es útil para inspeccionar datos en tiempo real
- `node seed.js` limpia y repuebla la BD cada vez que se ejecuta
- Los IDs en MongoDB son ObjectId, no números como en MySQL

---

**¡Listo para desarrollar!** 🎉
