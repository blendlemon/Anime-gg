/**
 * Anime Routes
 * Rutas para búsqueda y obtención de animes y openings
 */

import express from 'express'
import * as animeController from '../controllers/animeController.js'

const router = express.Router()

/**
 * GET /api/anime/search?q=naruto
 * Busca animes por nombre y obtiene sus openings
 */
router.get('/search', animeController.searchOpenings)

/**
 * GET /api/anime/popular
 * Obtiene openings populares (top animes)
 */
router.get('/popular', animeController.getPopularOpenings)

/**
 * GET /api/anime/:slug
 * Obtiene todos los openings de un anime específico por su slug
 */
router.get('/:slug', animeController.getAnimeBySlug)

export default router
