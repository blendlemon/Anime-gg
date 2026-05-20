# Anime Openings Tournament

Aplicación de torneo eliminatorio para openings de anime construida con React + Vite + Tailwind en el frontend y Express + MySQL en el backend.

## 📁 Estructura del Proyecto

```
proyecto-con-ai/
├── client/                    # Frontend React + Vite + Tailwind
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/            # Páginas principales
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Funciones utilitarias
│   │   ├── styles/           # Estilos globales
│   │   ├── assets/           # Imágenes y recursos
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── public/               # Archivos estáticos
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
└── server/                    # Backend Express + MySQL
    ├── src/
    │   ├── routes/           # Rutas API
    │   ├── controllers/       # Lógica de controladores
    │   ├── models/           # Modelos de datos
    │   ├── middleware/       # Middlewares
    │   ├── utils/            # Funciones utilitarias
    │   ├── config/           # Configuración
    │   ├── database/         # Scripts SQL
    │   └── index.js
    ├── package.json
    └── .env.example
```

## 🚀 Inicio Rápido

### Backend (Express + MySQL)

1. Instala las dependencias:
```bash
cd server
npm install
```

2. Configura las variables de entorno:
```bash
cp .env.example .env
# Edita .env con tus credenciales de MySQL
```

3. Crea la base de datos:
```bash
mysql -u root < src/database/schema.sql
```

4. Inicia el servidor:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### Frontend (React + Vite + Tailwind)

1. Instala las dependencias:
```bash
cd client
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🗄️ Base de Datos

La estructura de la base de datos incluye:
- **users**: Usuarios registrados
- **anime_openings**: Openings de anime
- **tournaments**: Torneos
- **tournament_participants**: Participantes del torneo
- **matches**: Matches del bracket
- **votes**: Votos de usuarios

## 🛠️ Tecnologías

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Axios

**Backend:**
- Express.js
- MySQL 2
- JWT (autenticación)
- bcryptjs (hash de contraseñas)

## 📝 Notas

- El proxy en Vite redirige `/api` a `http://localhost:5000`
- Configura JWT_SECRET en tu archivo `.env` del servidor
- Los ejemplos de archivos de configuración usan puertos 5000 (backend) y 5173 (frontend)
