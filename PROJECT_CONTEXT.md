# 📋 PROJECT CONTEXT & KNOWLEDGE BASE
**Anime Openings Tournament - Bracket Eliminatorio**

---

## 🎯 PROJECT OVERVIEW

**Description:** Torneo eliminatorio de 16 openings de anime con bracket interactivo. Frontend en React + Vite + Tailwind, Backend en Express + MongoDB (Docker).

**Tech Stack:**
- Frontend: React 18, Vite, Tailwind CSS, Axios
- Backend: Express.js, MongoDB (Docker), Mongoose, Node.js
- Database: MongoDB 7.0 (Docker + Docker Compose)
- Package Manager: pnpm (NOT npm)
- API Externa: AnimeThemes (api.animethemes.moe) - Pública, sin API key

**Key URLs:**
- Frontend Dev: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Backend API: `http://localhost:5000/api`
- MongoDB: `mongodb://root:rootpassword@localhost:27017/anime_tournament?authSource=admin`
- Mongo Express (Admin): `http://localhost:8081` (admin/admin123)
- AnimeThemes API: `https://api.animethemes.moe`
- AnimeThemes Docs: `https://api-docs.animethemes.moe/`

---

## 🔧 CRITICAL CONFIGURATION

### Package Manager
**⚠️ USE PNPM - NOT NPM**
```bash
pnpm install   # Install dependencies
pnpm run dev   # Run dev server
pnpm add pkg   # Add package
```

### Backend Server Details
- **Port:** 5000
- **Entry:** `server/src/index.js`
- **Dev Command:** `pnpm run dev` (uses nodemon)
- **Environment:** `.env` file (see `.env.example`)

### Frontend Dev Server Details
- **Port:** 5173 (Vite default)
- **Entry:** `client/src/main.jsx`
- **Proxy:** `/api` routes to `http://localhost:5000`
- **Config:** `client/vite.config.js`

### Database (MongoDB)
- **Type:** MongoDB 7.0 (Docker)
- **Connection:** Docker Compose (`docker-compose.yml`)
- **URI:** `mongodb://root:rootpassword@localhost:27017/anime_tournament?authSource=admin`
- **ORM:** Mongoose 8.x
- **Models:** `server/src/models/*.js`
- **Admin UI:** Mongo Express (`http://localhost:8081`)
- **Tables:** users, anime_openings, tournaments, tournament_participants, matches, votes

---

## 🔴 CRITICAL ISSUES SOLVED

### Issue 1: AnimeThemes API Format
**Problem:** API returns JSON:API format, not simple JSON
**Solution:** 
- Added headers: `Accept: application/vnd.api+json`, `User-Agent: ...`
- Use `filter[slug][]` not `filter[slug]`
- Response structure: `{ anime: [...], links: {...}, meta: {...} }`
- Implemented in-memory search (paginate and filter locally)

**Fixed in:** `server/src/utils/animeThemesService.js`

### Issue 2: Error 403 from AnimeThemes
**Problem:** API blocking requests without User-Agent header
**Solution:** Added `User-Agent: AnimeOpeningsTournamentApp/1.0` to all requests

### Issue 3: Error 422 from AnimeThemes
**Problem:** Filter format was wrong (not array)
**Solution:** Changed to `filter[slug][]` format and implemented in-memory search

### Issue 4: jsonwebtoken Version
**Problem:** pnpm couldn't find `jsonwebtoken@^9.1.0`
**Solution:** Downgraded to `^9.0.0` in `package.json`

---

## 📦 CREATED FILES STRUCTURE

### Backend
```
server/
├── src/
│   ├── utils/animeThemesService.js      ✅ AnimeThemes API service (CORRECTED)
│   ├── controllers/animeController.js   ✅ Route handlers
│   ├── routes/animeRoutes.js           ✅ Anime endpoints
│   ├── routes/tournaments.js           ✅ Tournament endpoints
│   ├── config/database.js              ✅ MySQL pool config
│   ├── database/schema.sql             ✅ DB schema (6 tables)
│   └── index.js                        ✅ Main server (MODIFIED)
├── package.json                        ✅ (CORRECTED: jsonwebtoken version)
├── API_DOCUMENTATION.md                ✅ Endpoint docs
├── ANIMETHEMES_INTEGRATION.md         ✅ Integration guide
└── .env.example                        ✅ Environment template
```

### Frontend
```
client/
├── src/
│   ├── utils/animeApi.js               ✅ HTTP client for backend
│   ├── hooks/useAnimeSearch.js         ✅ 3 custom hooks (search, detail, popular)
│   ├── components/
│   │   ├── BracketView.jsx             ✅ 4-round bracket component
│   │   ├── BracketDemo.jsx             ✅ Example with 16 openings
│   │   ├── TestComponent.jsx           ✅ Testing UI
│   │   ├── AnimeSearchExamples.jsx     ✅ 5 usage examples
│   │   ├── BracketView.css             ✅ Bracket styles
│   ├── App.jsx                         ✅ Main component
│   ├── main.jsx                        ✅ Entry point
│   └── styles/index.css                ✅ Global styles
├── vite.config.js                      ✅ Vite + proxy config
├── tailwind.config.js                  ✅ Tailwind config
├── postcss.config.js                   ✅ PostCSS config
├── index.html                          ✅ HTML entry
└── .env.example                        ✅ Environment template
```

### Documentation & Testing
```
project/
├── TESTING_START.md                    ✅ Quick start testing guide
├── TESTING_GUIDE.md                    ✅ Detailed testing (9900+ words)
├── QUICK_START_TESTING.md             ✅ Visual testing quick start
├── ANIMETHEMES_SETUP.md               ✅ Setup summary
├── README.md                           ✅ Project overview
├── quick-test.sh                       ✅ Bash testing script
└── quick-test.ps1                      ✅ PowerShell testing script
```

---

## 🎣 BACKEND ENDPOINTS

### Anime Endpoints
```
GET  /api/anime/search?q=naruto        → Search anime by name (in-memory)
GET  /api/anime/naruto                 → Get anime detail by slug
GET  /api/anime/popular                → Get top 20 anime with openings
```

### Tournament Endpoints
```
GET  /api/torneos                      → List all tournaments
GET  /api/torneos/:id                  → Get tournament detail with matches
POST /api/torneos                      → Create new tournament
```

---

## ⚙️ CUSTOM HOOKS (Frontend)

### useAnimeSearch()
```javascript
const { results, loading, error, query, handleSearchChange, executeSearch, clearResults } = useAnimeSearch()
// results: Array of anime
// loading: boolean
// error: error message or null
```

### useAnimeDetail()
```javascript
const { anime, loading, error, loadAnime, clear } = useAnimeDetail()
// anime: single anime object with all openings
```

### usePopularOpenings()
```javascript
const { openings, loading, error, loadPopularOpenings, refetch } = usePopularOpenings()
// openings: array of opening objects with animeName, animeSlug
```

---

## 🔑 ENVIRONMENT VARIABLES

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=anime_tournament
NODE_ENV=development
JWT_SECRET=your_secret_key
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📊 IMPORTANT DATA STRUCTURES

### Anime Object (from AnimeThemes)
```javascript
{
  id: number,
  slug: string,                    // unique identifier (e.g., "naruto")
  name: string,
  year: number,
  season: string,                  // "Fall", "Winter", etc.
  mediaFormat: string,             // "TV", "Movie", etc.
  synopsis: string,
  openings: [                       // Array of OP themes
    {
      id: number,
      title: string,               // Song title
      type: "OP",
      sequence: number,            // OP 1, OP 2, etc.
      artist: string,
      videoUrl: string | null,     // WebM format
      videoResolution: number,     // 1080, 720, etc.
      source: "animethemes"
    }
  ],
  endings: [...]                    // Similar structure for endings
}
```

### Tournament Object
```javascript
{
  id: number,
  name: string,
  description: string,
  status: "planning" | "active" | "completed",
  created_by: number,
  start_date: string | null,
  end_date: string | null,
  created_at: string,
  participants: [],
  matches: []
}
```

---

## 🧪 TESTING QUICK REFERENCE

### Option 1: Browser (Recommended)
1. Terminal 1: `cd server && pnpm run dev`
2. Terminal 2: `cd client && pnpm run dev`
3. Open `http://localhost:5173`
4. Type "naruto" and search

### Option 2: PowerShell
```powershell
.\quick-test.ps1 test
```

### Option 3: cURL
```bash
curl "http://localhost:5000/api/anime/search?q=naruto"
curl "http://localhost:5000/api/anime/naruto"
curl "http://localhost:5000/api/anime/popular"
```

---

## 🚀 HOW TO START AFTER CHANGING COMPUTER

1. **Install pnpm** (if not installed)
   ```bash
   npm install -g pnpm
   ```

2. **Install dependencies**
   ```bash
   pnpm install  # from server/
   pnpm install  # from client/
   ```

3. **Setup environment files**
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env.local
   ```

4. **Create MySQL database** (if needed)
   ```bash
   mysql -u root < server/src/database/schema.sql
   ```

5. **Run servers** (in separate terminals)
   ```bash
   # Terminal 1
   cd server && pnpm run dev
   
   # Terminal 2
   cd client && pnpm run dev
   ```

6. **Test**
   - Open `http://localhost:5173`
   - Or run `.\quick-test.ps1 test`

---

## 🔄 DEVELOPMENT WORKFLOW

### Adding a Feature
1. Create React component in `client/src/components/`
2. Use hooks from `client/src/hooks/`
3. Call backend API via `client/src/utils/animeApi.js`
4. Backend handles in `server/src/controllers/`
5. Test with `pnpm run dev` in both terminals

### Debugging
- Frontend: `F12` → Console tab
- Backend: Check terminal output + `console.error()` calls
- API: Test directly with cURL or PowerShell before integration

### Database Changes
1. Update schema in `server/src/database/schema.sql`
2. Update models as needed
3. Recreate database: `mysql -u root < schema.sql`

---

## ⚠️ KNOWN LIMITATIONS

1. **AnimeThemes Search:** Uses in-memory filtering (slower on 1000+ items)
   - Mitigation: Limit to first 5 pages maximum

2. **WebM Videos:** Not supported in all browsers (IE, older Safari)
   - Solution: Transcoding or fallback to MP4

3. **Database:** Currently no authentication/authorization
   - Future: Implement JWT middleware

4. **Bracket:** Max 16 participants (hardcoded)
   - Future: Make dynamic

---

## 📝 COMPONENTS READY TO USE

### BracketView
```javascript
<BracketView openings={arrayOf16} />
```
- Shows 4-round bracket
- Click to select winners
- Auto-advances winners
- Fully styled with Tailwind

### TestComponent
- Ready-to-use testing UI
- Shows search + populars
- Dark theme
- No setup needed

### AnimeSearchExamples
- 5 complete usage examples
- Copy-paste ready
- Shows different patterns

---

## 🔗 NEXT STEPS

1. **Add Bracket to Search Results**
   - Create component that lets user select 16 openings from search
   - Pass to BracketView

2. **Save Tournament to Database**
   - Connect BracketView wins to tournament_participants/matches tables
   - Persist results

3. **User Authentication**
   - Add login/signup
   - JWT middleware
   - User-specific tournaments

4. **Video Player**
   - Custom player component
   - Pause during voting
   - Full-screen support

5. **Mobile Responsive**
   - Currently desktop-focused
   - Add mobile layout

---

## 📚 USEFUL REFERENCES

- AnimeThemes API: https://api-docs.animethemes.moe/
- React Hooks: https://react.dev/reference/react/hooks
- Express.js: https://expressjs.com/
- Tailwind: https://tailwindcss.com/docs
- Vite: https://vitejs.dev/guide/

---

## 💡 TIPS FOR FUTURE WORK

1. **pnpm is 3x faster than npm** - Always use it
2. **Test API directly first** before integrating to frontend
3. **Check browser console (F12)** for CORS/error details
4. **AnimeThemes responses are always `{ anime: [...], links: {...}, meta: {...} }` - Don't forget this structure**
5. **Use `filter[slug][]` format for filters** - Array notation required
6. **Add User-Agent header** to all AnimeThemes requests - Otherwise 403 error

---

**Last Updated:** 2026-05-19 21:50 UTC  
**Status:** ✅ All core systems working  
**Ready for:** Integration of components + Database persistence
