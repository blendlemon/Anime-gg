import express from 'express'
import Tournament from '../models/Tournament.js'
import TournamentParticipant from '../models/TournamentParticipant.js'
import User from '../models/User.js'
import AnimeOpening from '../models/AnimeOpening.js'

const router = express.Router()

// GET /api/torneos - Listar todos los torneos
router.get('/', async (req, res) => {
  try {
    const torneos = await Tournament.find()
      .populate('created_by', 'username email')
      .sort({ created_at: -1 })

    res.status(200).json({
      success: true,
      data: torneos,
      count: torneos.length,
      message: 'Torneos obtenidos exitosamente'
    })
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener los torneos',
      details: error.message
    })
  }
})

// GET /api/torneos/:id - Obtener detalle de un torneo
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Validar que sea un ObjectId válido
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'ID de torneo inválido'
      })
    }

    const tournament = await Tournament.findById(id)
      .populate('created_by', 'username email')

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: 'Torneo no encontrado'
      })
    }

    // Obtener participantes del torneo con información de los openings
    const participants = await TournamentParticipant.find({ tournament_id: id })
      .populate('opening_id')
      .sort({ seed: 1 })

    res.status(200).json({
      success: true,
      data: {
        ...tournament.toObject(),
        participants_count: participants.length,
        participants,
        matches_count: 0
      },
      message: 'Detalle del torneo obtenido exitosamente'
    })
  } catch (error) {
    console.error('Error fetching tournament details:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener el detalle del torneo',
      details: error.message
    })
  }
})

// POST /api/torneos - Crear nuevo torneo
router.post('/', async (req, res) => {
  try {
    const { name, description, created_by, start_date, end_date } = req.body

    // Validaciones básicas
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El nombre del torneo es requerido'
      })
    }

    if (!created_by) {
      return res.status(400).json({
        success: false,
        error: 'El ID del creador es requerido'
      })
    }

    // Validar que el usuario existe
    const userExists = await User.findById(created_by)
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: 'El usuario especificado no existe'
      })
    }

    // Crear el torneo
    const nuevoTorneo = new Tournament({
      name: name.trim(),
      description: description?.trim() || '',
      created_by,
      start_date: start_date || null,
      end_date: end_date || null,
      status: 'planning'
    })

    const torneoGuardado = await nuevoTorneo.save()

    res.status(201).json({
      success: true,
      data: torneoGuardado,
      message: 'Torneo creado exitosamente'
    })
  } catch (error) {
    console.error('Error creating tournament:', error)

    // Validar error de nombre duplicado
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Ya existe un torneo con ese nombre'
      })
    }

    res.status(500).json({
      success: false,
      error: 'Error al crear torneo',
      details: error.message
    })
  }
})

export default router
