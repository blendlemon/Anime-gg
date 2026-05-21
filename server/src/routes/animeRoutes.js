import express from 'express'
import {
  searchOpeningsController,
  getAnimeOpeningsController,
  getAllOpeningsController,
  proxyVideo,
  cleanupOrphanedTournaments
} from '../controllers/animeController.js'

const router = express.Router()

/**
 * GET /api/anime/search?q=query
 * Busca openings en AnimeThemes y guarda en MongoDB
 */
router.get('/search', searchOpeningsController)

/**
 * GET /api/anime/anime?slug=slug
 * Obtiene openings de un anime específico
 */
router.get('/anime', getAnimeOpeningsController)

/**
 * GET /api/anime
 * Obtiene todos los openings (con paginación opcional)
 */
router.get('/', getAllOpeningsController)

/**
 * GET /api/proxy/video?url=<encoded_url>
 * Proxy para reproducir vídeos que requieren headers Referer
 */
router.get('/proxy/video', proxyVideo)

export default router
