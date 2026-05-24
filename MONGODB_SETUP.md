# MongoDB Setup

## Estado: MongoDB Atlas (cloud)

El proyecto usa MongoDB Atlas como base de datos. No requiere Docker ni instalación local.

## Configuración

### 1. Crear cluster en MongoDB Atlas
- Ve a https://www.mongodb.com/cloud/atlas
- Crea cuenta gratuita (M0 cluster)
- Crea un usuario de base de datos (Database Access)
- Configura Network Access (0.0.0.0/0 para desarrollo)

### 2. Obtener connection string
Desde Atlas → Clusters → Connect → Connect your application:
```
mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/anime_tournament?retryWrites=true&w=majority
```

### 3. Configurar en el proyecto
Editar `server/.env`:
```
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/anime_tournament?retryWrites=true&w=majority
```

### 4. Iniciar servidor
```bash
cd server && pnpm run dev
```

Deberías ver:
```
MongoDB connected successfully
Server running on port 5001
```

## Colecciones

```
anime_tournament/
├── users
├── anime_openings
├── tournaments
├── tournament_participants
├── matches
├── votes
└── rooms
```

## Troubleshooting

### Error de conexión
```bash
# Verificar que la URI en .env es correcta
# Verificar Network Access en Atlas (IP whitelist)
# Verificar usuario/contraseña
```

### Limpiar datos
```bash
# Conectarse a Atlas vía MongoDB Shell o Compass
# Eliminar colecciones manualmente si es necesario
```
