# Quick Start - Testing AnimeThemes Integration

## 3 pasos simples

### PASO 1: Instalar dependencias

```bash
cd server && pnpm install
cd ../client && pnpm install
```

### PASO 2: Abrir 2 terminales

**Terminal 1 - Backend:**
```bash
cd server
pnpm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
pnpm run dev
```

### PASO 3: Probar

1. Abre `http://localhost:5173`
2. Regístrate o inicia sesión
3. Busca "naruto" en el home

## Prueba con cURL

```bash
# Health Check
curl http://localhost:5001/api/health

# Buscar anime
curl "http://localhost:5001/api/anime/search?q=naruto"

# Detalle por slug
curl "http://localhost:5001/api/anime/anime?slug=naruto"

# Todos los openings
curl "http://localhost:5001/api/anime"
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| `Cannot GET /api/health` | Backend no está corriendo |
| `CORS error` | Verifica CLIENT_URL en .env |
| Conexión rehusada | Puerto 5001 no es el correcto |
