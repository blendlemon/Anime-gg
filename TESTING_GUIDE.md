# Guía de Testing - Anime Openings Tournament

---

## PASO 1: Instalar dependencias

### Backend
```bash
cd server && pnpm install
```

### Frontend
```bash
cd client && pnpm install
```

---

## PASO 2: Iniciar servidores

### Backend (Terminal 1)
```bash
cd server
pnpm run dev
```

**Esperado:**
```
MongoDB connected successfully
Server running on port 5001
API Health: http://localhost:5001/api/health
```

### Frontend (Terminal 2)
```bash
cd client
pnpm run dev
```

---

## PASO 3: Probar endpoints

### Health Check
```bash
curl http://localhost:5001/api/health
```

### Buscar anime
```bash
curl "http://localhost:5001/api/anime/search?q=naruto"
```

### Auth - Registrar
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456"}'
```

### Auth - Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### Crear torneo
```bash
TOKEN="el_token_aqui"
curl -X POST http://localhost:5001/api/tournaments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Mi Torneo","size":8,"filterType":"OP"}'
```

---

## PASO 4: Probar flujo completo desde frontend

Abre `http://localhost:5173`.

**Flujo completo:**
1. Registrarse / Iniciar sesión
2. Crear torneo (8, 16 o 32 vídeos)
3. Unirse a la sala desde otra pestaña
4. Iniciar torneo (host)
5. Saltar P1 o esperar que termine
6. Votar durante P2
7. Ver avance automático al siguiente match
8. Al finalizar → ranking

---

## Troubleshooting

### Error: "Cannot find module"
Verifica que `pnpm install` se ejecutó correctamente.

### Error: "CORS policy"
El servidor no está corriendo o CLIENT_URL no coincide.

### Error: "Connection refused"
Asegúrate que el servidor esté en puerto 5001.

### Error de MongoDB
Revisa la URI de Atlas en `server/.env`.

---

**Listo para probar!**
