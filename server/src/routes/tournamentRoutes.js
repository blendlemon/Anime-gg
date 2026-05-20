import express from 'express'
import { auth } from '../middleware/auth.js'
import {
  createTournament,
  getTournament,
  getRanking,
  advanceWinner
} from '../controllers/tournamentController.js'

const router = express.Router()

// POST /api/tournaments - Crear torneo (requiere auth)
router.post('/', auth, createTournament)

// GET /api/tournaments/:id - Obtener torneo
router.get('/:id', getTournament)

// GET /api/tournaments/:id/ranking - Obtener ranking
router.get('/:id/ranking', getRanking)

// POST /api/matches/:id/advance - Avanzar match (requiere auth)
router.post('/matches/:id/advance', auth, advanceWinner)

export default router
