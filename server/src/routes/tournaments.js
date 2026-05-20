import express from 'express'
import pool from '../config/database.js'

const router = express.Router()

/**
 * GET /api/torneos
 * Lista todos los torneos con información básica
 */
router.get('/', async (req, res) => {
  const connection = await pool.getConnection()
  
  try {
    const [tournaments] = await connection.execute(
      `SELECT 
        id,
        name,
        description,
        status,
        created_by,
        start_date,
        end_date,
        created_at
      FROM tournaments
      ORDER BY created_at DESC`
    )

    res.status(200).json({
      success: true,
      data: tournaments,
      count: tournaments.length,
      message: 'Torneos obtenidos exitosamente'
    })
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener los torneos',
      details: error.message
    })
  } finally {
    connection.release()
  }
})

/**
 * GET /api/torneos/:id
 * Obtiene los detalles de un torneo específico con sus participantes y matches
 */
router.get('/:id', async (req, res) => {
  const connection = await pool.getConnection()
  const { id } = req.params

  // Validar que el ID sea un número
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'El ID debe ser un número válido'
    })
  }

  try {
    // Obtener información del torneo
    const [tournaments] = await connection.execute(
      `SELECT 
        id,
        name,
        description,
        status,
        created_by,
        start_date,
        end_date,
        created_at
      FROM tournaments
      WHERE id = ?`,
      [id]
    )

    if (tournaments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Torneo no encontrado'
      })
    }

    const tournament = tournaments[0]

    // Obtener participantes del torneo
    const [participants] = await connection.execute(
      `SELECT 
        tp.id,
        tp.opening_id,
        tp.seed,
        ao.title,
        ao.anime_title,
        ao.artist,
        ao.thumbnail_url,
        ao.youtube_url
      FROM tournament_participants tp
      JOIN anime_openings ao ON tp.opening_id = ao.id
      WHERE tp.tournament_id = ?
      ORDER BY tp.seed ASC`,
      [id]
    )

    // Obtener matches del torneo
    const [matches] = await connection.execute(
      `SELECT 
        m.id,
        m.round,
        m.match_number,
        m.participant1_id,
        m.participant2_id,
        m.winner_id,
        m.status,
        m.created_at,
        p1.seed as participant1_seed,
        p1.opening_id as participant1_opening_id,
        ao1.title as participant1_title,
        ao1.anime_title as participant1_anime,
        p2.seed as participant2_seed,
        p2.opening_id as participant2_opening_id,
        ao2.title as participant2_title,
        ao2.anime_title as participant2_anime
      FROM matches m
      LEFT JOIN tournament_participants p1 ON m.participant1_id = p1.id
      LEFT JOIN anime_openings ao1 ON p1.opening_id = ao1.id
      LEFT JOIN tournament_participants p2 ON m.participant2_id = p2.id
      LEFT JOIN anime_openings ao2 ON p2.opening_id = ao2.id
      WHERE m.tournament_id = ?
      ORDER BY m.round ASC, m.match_number ASC`,
      [id]
    )

    res.status(200).json({
      success: true,
      data: {
        ...tournament,
        participants_count: participants.length,
        participants,
        matches_count: matches.length,
        matches
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
  } finally {
    connection.release()
  }
})

/**
 * POST /api/torneos
 * Crea un nuevo torneo
 * Body requerido: { name, description, created_by }
 * Body opcional: { start_date, end_date }
 */
router.post('/', async (req, res) => {
  const connection = await pool.getConnection()
  const { name, description, created_by, start_date, end_date } = req.body

  // Validar datos requeridos
  if (!name || !created_by) {
    return res.status(400).json({
      success: false,
      error: 'El nombre y created_by son requeridos'
    })
  }

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'El nombre debe ser una cadena de texto válida'
    })
  }

  if (isNaN(created_by)) {
    return res.status(400).json({
      success: false,
      error: 'El created_by debe ser un ID de usuario válido'
    })
  }

  try {
    // Verificar que el usuario existe
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [created_by]
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'El usuario especificado no existe'
      })
    }

    // Insertar nuevo torneo
    const [result] = await connection.execute(
      `INSERT INTO tournaments 
       (name, description, created_by, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, 'planning')`,
      [
        name.trim(),
        description || null,
        created_by,
        start_date || null,
        end_date || null
      ]
    )

    const newTournament = {
      id: result.insertId,
      name: name.trim(),
      description: description || null,
      created_by,
      start_date: start_date || null,
      end_date: end_date || null,
      status: 'planning',
      created_at: new Date().toISOString()
    }

    res.status(201).json({
      success: true,
      data: newTournament,
      message: 'Torneo creado exitosamente'
    })
  } catch (error) {
    console.error('Error creating tournament:', error)
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Ya existe un torneo con ese nombre'
      })
    }

    res.status(500).json({
      success: false,
      error: 'Error al crear el torneo',
      details: error.message
    })
  } finally {
    connection.release()
  }
})

export default router
