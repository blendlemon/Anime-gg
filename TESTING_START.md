# 🎬 Anime Openings Tournament - Testing Guide

## **📋 ¿Qué se ha creado?**

Una **integración completa** con la API pública de AnimeThemes para buscar y obtener openings de anime.

### **Backend (Express + MySQL)**
- ✅ Servicio `animeThemesService.js` que consume AnimeThemes API
- ✅ Controlador `animeController.js` con la lógica
- ✅ Rutas `animeRoutes.js` con 3 endpoints
- ✅ Integración en `index.js`

### **Frontend (React + Vite)**
- ✅ Cliente HTTP `animeApi.js` que llama al backend
- ✅ 3 Custom Hooks en `useAnimeSearch.js`
- ✅ Componente de testing `TestComponent.jsx`
- ✅ Ejemplos de uso en `AnimeSearchExamples.jsx`

---

## **🚀 ¡EMPEZAR AHORA! (3 pasos)**

### **1️⃣ Instalar dependencias**
```bash
cd server && npm install
cd ../client && npm install
```

### **2️⃣ Ejecutar 2 servidores en terminales separadas**

**Terminal 1:**
```bash
cd server
npm run dev
```

**Terminal 2:**
```bash
cd client
npm run dev
```

### **3️⃣ Abrir `http://localhost:5173` en navegador**

Deberías ver un componente con:
- 🔍 Input para buscar anime
- 📺 Resultados de búsqueda
- ♪ Openings populares

**¡Eso es! ✅ Si funciona, la integración está OK**

---

## **🧪 Métodos de Testing**

### **Método 1: Navegador (Recomendado) ⭐**
- Abre `http://localhost:5173`
- Escribe "naruto"
- Click buscar
- Ver resultados con vídeos

### **Método 2: PowerShell (Windows)**
```powershell
.\quick-test.ps1 test
```

### **Método 3: cURL (Cualquier OS)**
```bash
curl "http://localhost:5000/api/anime/search?q=naruto"
```

---

## **📁 Estructura de Archivos Creados**

```
proyecto-con-ai/
├── server/src/
│   ├── utils/
│   │   └── animeThemesService.js          ← Servicio AnimeThemes
│   ├── controllers/
│   │   └── animeController.js             ← Controladores
│   ├── routes/
│   │   └── animeRoutes.js                 ← Rutas /api/anime/*
│   └── index.js                           ← (modificado)
│
├── client/src/
│   ├── utils/
│   │   └── animeApi.js                    ← Cliente HTTP
│   ├── hooks/
│   │   └── useAnimeSearch.js              ← 3 Custom Hooks
│   └── components/
│       ├── TestComponent.jsx              ← Testing UI
│       └── AnimeSearchExamples.jsx        ← 5 ejemplos
│
├── TESTING_GUIDE.md                       ← Guía detallada
├── QUICK_START_TESTING.md                 ← Start rápido
├── ANIMETHEMES_SETUP.md                   ← Resumen técnico
├── quick-test.sh                          ← Script bash
└── quick-test.ps1                         ← Script PowerShell
```

---

## **📡 Endpoints Disponibles**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/anime/search?q=naruto` | Buscar animes |
| GET | `/api/anime/naruto` | Detalle de anime |
| GET | `/api/anime/popular` | Top openings |

---

## **🎣 Hooks React Disponibles**

```javascript
// Hook para búsqueda
const { results, loading, error, search, handleSearchChange } = useAnimeSearch()

// Hook para detalle
const { anime, loading, error, loadAnime } = useAnimeDetail()

// Hook para populares
const { openings, loading, error, loadPopularOpenings } = usePopularOpenings()
```

---

## **✨ Datos que Obtienes**

Cada anime incluye:
- 📺 Nombre y año
- ♪ Lista de openings con:
  - Título
  - Artista
  - URL de vídeo WebM
  - Resolución
- 🎬 Lista de endings (igual formato)

---

## **❌ Si algo falla...**

### Error: "Cannot GET /api/health"
```bash
# Solución:
cd server && npm run dev
```

### Error: "CORS policy"
- Backend no está corriendo
- Puerto 5000 está ocupado

### Búsqueda devuelve vacío
- Anime no existe en AnimeThemes
- Sin conexión a internet
- Try: "naruto", "attack on titan", "jojo"

---

## **📚 Documentación Disponible**

| Archivo | Contenido |
|---------|-----------|
| `TESTING_GUIDE.md` | Testing detallado con ejemplos |
| `QUICK_START_TESTING.md` | Quick start (este archivo) |
| `ANIMETHEMES_SETUP.md` | Resumen técnico de la integración |
| `ANIMETHEMES_INTEGRATION.md` | Documentación API completa |

---

## **🎯 Próximos Pasos**

Después de confirmar que funciona ✅:

1. **Integrar con BracketView**
   ```javascript
   <BracketView openings={animeResults} />
   ```

2. **Crear UI personalizada**
   - Reemplaza TestComponent con tu diseño

3. **Guardar en base de datos**
   - Guarda openings seleccionados en MySQL

4. **Reproducción de vídeos**
   - Crea reproductor personalizado

---

## **💡 Tips**

- Los vídeos están en formato **WebM** (soportado en navegadores modernos)
- La búsqueda es **case-insensitive**
- Los datos se actualizan desde AnimeThemes en tiempo real
- **No requiere API key**

---

## **🔗 Referencias**

- [AnimeThemes API](https://api.animethemes.moe)
- [React Hooks Documentation](https://react.dev/reference/react/hooks)
- [Express.js Guide](https://expressjs.com)

---

## **✅ Checklist de Testing**

- [ ] Backend instala correctamente
- [ ] Backend inicia sin errores
- [ ] Frontend instala correctamente
- [ ] Frontend inicia correctamente
- [ ] Puedo escribir en el input de búsqueda
- [ ] Búsqueda retorna resultados
- [ ] Los openings populares se cargan
- [ ] Sin errores CORS en la consola
- [ ] Los vídeos están disponibles

---

**¡Listo para empezar! 🚀**

Elige un método de testing arriba y prueba. Cualquier pregunta, revisa `TESTING_GUIDE.md`.
