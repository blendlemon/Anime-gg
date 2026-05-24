import AnimeOpening from '../models/AnimeOpening.js'
import Tournament from '../models/Tournament.js'
import Room from '../models/Room.js'
import { syncAllAnime } from '../utils/animeThemesService.js'

/**
 * Busca openings en MongoDB (sin llamar a la API externa)
 */
export const searchOpeningsController = async (req, res) => {
  try {
    const { q, limit = 50, skip = 0 } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter q es requerido'
      })
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

    const query = {
      $or: [
        { anime_title: regex },
        { title: regex },
        { artist: regex }
      ]
    }

    const [openings, total] = await Promise.all([
      AnimeOpening.find(query)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ anime_title: 1, sequence: 1 }),
      AnimeOpening.countDocuments(query)
    ])

    res.json({
      success: true,
      data: openings,
      count: openings.length,
      total,
      message: 'Openings obtenidos de la base de datos'
    })
  } catch (error) {
    console.error('Error searching openings:', error)
    res.status(500).json({
      success: false,
      error: 'Error al buscar openings',
      details: error.message
    })
  }
}

/**
 * Obtiene todos los openings de un anime por slug (desde MongoDB)
 */
export const getAnimeOpeningsController = async (req, res) => {
  try {
    const { slug } = req.query

    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter slug es requerido'
      })
    }

    const openings = await AnimeOpening.find({ anime_slug: slug }).sort({ sequence: 1 })

    if (openings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron openings para este anime en la base de datos'
      })
    }

    res.json({
      success: true,
      data: openings,
      count: openings.length,
      message: 'Openings obtenidos exitosamente'
    })
  } catch (error) {
    console.error('Error getting anime openings:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener openings',
      details: error.message
    })
  }
}

/**
 * Obtiene todos los openings guardados en MongoDB
 */
export const getAllOpeningsController = async (req, res) => {
  try {
    const { limit = 50, skip = 0, type } = req.query

    const query = {}
    if (type && ['OP', 'ED'].includes(type.toUpperCase())) {
      query.type = type.toUpperCase()
    }

    const openings = await AnimeOpening.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ anime_title: 1, sequence: 1 })

    const total = await AnimeOpening.countDocuments(query)

    res.json({
      success: true,
      data: openings,
      count: openings.length,
      total,
      message: 'Openings obtenidos exitosamente'
    })
  } catch (error) {
    console.error('Error getting openings:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener openings',
      details: error.message
    })
  }
}

export const cleanupOrphanedTournaments = async (req, res) => {
  try {
    const rooms = await Room.find({}, 'tournament_id')
    const activeTournamentIds = rooms.map((room) => room.tournament_id)

    const result = await Tournament.deleteMany({
      _id: { $nin: activeTournamentIds }
    })

    res.json({
      success: true,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Error cleanup torneos huérfanos:', error)
    res.status(500).json({
      success: false,
      error: 'Error en cleanup',
      details: error.message
    })
  }
}

export const syncAnime = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Sincronización iniciada en segundo plano'
    })

    await syncAllAnime()
    const total = await AnimeOpening.countDocuments()
    console.log(`Sync manual completado. Total BD: ${total}`)
  } catch (error) {
    console.error('Error en sync manual:', error)
  }
}
