# Anime Openings Tournament - Testing Guide

## Stack

- **Backend:** Express + MongoDB Atlas + Socket.IO
- **Frontend:** React + Vite + Tailwind + Socket.IO Client
- **Package Manager:** pnpm

---

## EMPEZAR AHORA (3 pasos)

### 1. Instalar dependencias
```bash
cd server && pnpm install
cd ../client && pnpm install
```

### 2. Ejecutar servidores

**Terminal 1:**
```bash
cd server
pnpm run dev
```

**Terminal 2:**
```bash
cd client
pnpm run dev
```

### 3. Abrir `http://localhost:5173`

Regístrate, inicia sesión, busca animes, crea torneos y vota en tiempo real.

---

## Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/anime/search?q=` | Buscar openings |
| GET | `/api/anime/anime?slug=` | Openings por slug |
| GET | `/api/anime` | Listar openings cacheados |
| POST | `/api/tournaments` | Crear torneo (auth) |
| GET | `/api/tournaments/:id` | Detalle torneo |
| GET | `/api/tournaments/:id/ranking` | Ranking |
| GET | `/api/rooms/open/list` | Salas abiertas |
| GET | `/api/rooms/:inviteCode` | Obtener sala |

---

## Documentación Disponible

| Archivo | Contenido |
|---------|-----------|
| `TESTING_GUIDE.md` | Testing detallado con ejemplos |
| `QUICK_START.md` | Guía de inicio |
| `PROJECT_CONTEXT.md` | Contexto completo del proyecto |
| `server/API_DOCUMENTATION.md` | Documentación de API |

---

**Listo para empezar!**
