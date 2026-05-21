import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { auth } from '../middleware/auth.js'
import {
  createTournament,
  getTournament,
  getRanking,
  advanceWinner
} from '../controllers/tournamentController.js'

const router = express.Router()
const createTournamentRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
})

// POST /api/tournaments - Crear torneo (requiere auth)
router.post('/', createTournamentRateLimit, auth, createTournament)

// GET /api/tournaments/:id - Obtener torneo
router.get('/:id', getTournament)

// GET /api/tournaments/:id/ranking - Obtener ranking
router.get('/:id/ranking', getRanking)

// POST /api/matches/:id/advance - Avanzar match (requiere auth)
router.post('/matches/:id/advance', auth, advanceWinner)

export default router
