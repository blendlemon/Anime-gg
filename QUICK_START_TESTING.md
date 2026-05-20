# 🚀 Quick Start - Testing AnimeThemes Integration

## **3 pasos simples para probar:**

### **PASO 1: Instalar dependencias (una sola vez)**

```bash
cd server && npm install
cd ../client && npm install
```

---

### **PASO 2: Abrir 2 terminales y ejecutar servidores**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Espera ver:
```
✓ Server running on port 5000
✓ API Health: http://localhost:5000/api/health
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Espera ver:
```
  ➜  Local:   http://localhost:5173/
```

---

### **PASO 3: Elegir un método de testing**

## **OPCIÓN A: Prueba rápida en navegador (⭐ Recomendado)**

1. Abre `http://localhost:5173` en el navegador
2. Debería ver un componente de **testing**
3. Escribe "naruto" en el input
4. Click **Buscar**
5. ✅ Si ves resultados, **¡funciona!**

---

## **OPCIÓN B: Prueba con PowerShell (Windows)**

En una **tercera terminal**:

```powershell
.\quick-test.ps1 test
```

Verás todos los tests automáticos con respuestas ✅ o ❌

---

## **OPCIÓN C: Prueba con cURL (Cualquier OS)**

```bash
# Test 1: Health Check
curl http://localhost:5000/api/health

# Test 2: Buscar anime
curl "http://localhost:5000/api/anime/search?q=naruto"

# Test 3: Detalle
curl "http://localhost:5000/api/anime/naruto"

# Test 4: Populares
curl "http://localhost:5000/api/anime/popular"
```

---

## **¿Qué esperar en cada test?**

✅ **Health Check:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

✅ **Búsqueda:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Naruto",
      "openings": [
        {
          "title": "Silhouette",
          "artist": "Kana-Boon",
          "videoUrl": "https://..."
        }
      ]
    }
  ]
}
```

---

## **Troubleshooting rápido**

| Problema | Solución |
|----------|----------|
| `Cannot GET /api/health` | Backend no está corriendo → `cd server && npm run dev` |
| `CORS error` | Backend no está en puerto 5000 |
| Búsqueda vacía | Anime no existe o conexión fallida |
| Sin vídeos | AnimeThemes no tiene ese vídeo |

---

## **Próximos pasos después del testing**

Una vez confirmes que todo funciona ✅:

1. Modifica `client/src/App.jsx` para importar `TestComponent`
2. Crea componentes UI propios
3. Integra con `BracketView`
4. Añade funcionalidad de guardar favoritos

---

## **Archivos de Testing Disponibles**

- 📄 `TESTING_GUIDE.md` - Guía completa detallada
- 🧪 `client/src/components/TestComponent.jsx` - Componente UI para testing
- 📝 `quick-test.sh` - Script bash para testing
- 💻 `quick-test.ps1` - Script PowerShell para testing

---

**¡Listo! Elige una opción y empieza a probar.** 🎬
