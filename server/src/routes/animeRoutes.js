import express from 'express'
import {
  searchOpeningsController,
  getAnimeOpeningsController,
  getAllOpeningsController
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

export default router
