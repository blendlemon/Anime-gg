import Tournament from '../models/Tournament.js'
import Match from '../models/Match.js'
import AnimeOpening from '../models/AnimeOpening.js'
import Room from '../models/Room.js'

// Función auxiliar para generar invite code aleatorio
const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Función auxiliar para seleccionar openings aleatorios
const getRandomOpenings = async (size, filterType) => {
  try {
    // Construir query según filterType
    let query = {}
    if (filterType !== 'both') {
      query.type = filterType
    }

    // Contar openings disponibles
    const count = await AnimeOpening.countDocuments(query)

    if (count < size) {
      throw new Error(
        `No hay suficientes openings. Disponibles: ${count}, Requeridos: ${size}`
      )
    }

    // Seleccionar openings aleatorios
    const openings = await AnimeOpening.aggregate([
      { $match: query },
      { $sample: { size } }
    ])

    return openings
  } catch (error) {
    throw error
  }
}

// Función auxiliar para crear matches de la ronda 1
const createRound1Matches = async (tournamentId, participants) => {
  try {
    const matches = []
    const numMatches = participants.length / 2

    // Emparejar: seed 1 vs seed N, seed 2 vs seed N-1, etc.
    for (let i = 0; i < numMatches; i++) {
      const match = new Match({
        tournament_id: tournamentId,
        round: 1,
        match_number: i + 1,
        participant1_id: participants[i]._id,
        participant2_id: participants[participants.length - 1 - i]._id,
        status: 'pending'
      })

      await match.save()
      matches.push(match)
    }

    return matches
  } catch (error) {
    throw error
  }
}

// Crear nuevo torneo
export const createTournament = async (req, res) => {
  try {
    const { name, description, size, filterType = 'OP' } = req.body
    const userId = req.user?.id || req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      })
    }

    // Validar campos requeridos
    if (!name || !size) {
      return res.status(400).json({
        success: false,
        error: 'name y size son requeridos'
      })
    }

    // Validar que size sea 16 o 32
    const validSizes = [16, 32]
    if (!validSizes.includes(size)) {
      return res.status(400).json({
        success: false,
        error: 'size debe ser 16 o 32'
      })
    }

    // Validar filterType
    const validFilterTypes = ['OP', 'ED', 'both']
    if (!validFilterTypes.includes(filterType)) {
      return res.status(400).json({
        success: false,
        error: 'filterType debe ser OP, ED o both'
      })
    }

    // Seleccionar openings aleatorios de la BD
    const selectedOpenings = await getRandomOpenings(size, filterType)

    // Crear participantes a partir de los openings
    const participants = selectedOpenings.map((opening) => ({
      opening_id: opening._id,
      title: opening.title,
      anime_title: opening.anime_title,
      artist: opening.artist,
      video_url: opening.video_url,
      thumbnail_url: opening.thumbnail_url,
      wins: 0
    }))

    // Crear nuevo torneo
    const newTournament = new Tournament({
      name,
      description,
      size,
      filterType,
      created_by: userId,
      participants,
      status: 'planning'
    })

    await newTournament.save()

    // Obtener los participantes guardados (ahora tienen _id)
    const savedParticipants = newTournament.participants

    // Crear matches de la primera ronda
    const matches = await createRound1Matches(newTournament._id, savedParticipants)

    // Agregar IDs de matches al torneo
    newTournament.matches = matches.map((m) => m._id)
    await newTournament.save()

    // Generar invite code único
    let inviteCode = generateInviteCode()
    let existingRoom = await Room.findOne({ invite_code: inviteCode })

    // Regenerar si el código ya existe
    while (existingRoom) {
      inviteCode = generateInviteCode()
      existingRoom = await Room.findOne({ invite_code: inviteCode })
    }

    // Crear Room para el torneo
    const room = new Room({
      tournament_id: newTournament._id,
      invite_code: inviteCode,
      current_match_id: matches[0]._id,
      status: 'waiting'
    })

    await room.save()

    return res.status(201).json({
      success: true,
      message: 'Torneo creado exitosamente',
      tournament: {
        ...newTournament.toObject(),
        invite_code: inviteCode,
        matches_count: matches.length
      },
      participants_count: savedParticipants.length,
      matches: matches.map((m) => ({
        id: m._id,
        round: m.round,
        match_number: m.match_number,
        participant1: savedParticipants.find((p) => p._id?.toString() === m.participant1_id?.toString()),
        participant2: savedParticipants.find((p) => p._id?.toString() === m.participant2_id?.toString()),
        status: m.status
      }))
    })
  } catch (error) {
    console.error('Error en createTournament:', error)
    return res.status(400).json({
      success: false,
      error: error.message || 'Error al crear torneo'
    })
  }
}

// Obtener detalles de un torneo
export const getTournament = async (req, res) => {
  try {
    const { id } = req.params

    // Obtener torneo con participantes y matches populados
    const tournament = await Tournament.findById(id)
      .populate('participants')
      .populate('matches')

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: 'Torneo no encontrado'
      })
    }

    // Obtener el invite_code de la sala asociada al torneo
    const Room = (await import('../models/Room.js')).default
    const room = await Room.findOne({ tournament_id: tournament._id })

    // Mapear matches con los datos de participantes embebidos
    const matches = tournament.matches.map(match => {
      // Encontrar participantes en el array embebido
      const participant1 = tournament.participants.find(
        p => p._id.toString() === match.participant1_id?.toString()
      )
      const participant2 = tournament.participants.find(
        p => p._id.toString() === match.participant2_id?.toString()
      )

      return {
        id: match._id,
        _id: match._id,
        round: match.round,
        match_number: match.match_number,
        participant1: participant1 || null,
        participant2: participant2 || null,
        winner_id: match.winner_id,
        status: match.status
      }
    })

    return res.status(200).json({
      success: true,
      tournament: {
        ...tournament._doc,
        invite_code: room?.invite_code || null
      },
      matches
    })
  } catch (error) {
    console.error('Error en getTournament:', error)
    return res.status(500).json({
      success: false,
      error: 'Error al obtener torneo',
      details: error.message
    })
  }
}

// Obtener ranking del torneo
export const getRanking = async (req, res) => {
  try {
    const { id } = req.params

    const tournament = await Tournament.findById(id)

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: 'Torneo no encontrado'
      })
    }

    // Ordenar participantes por wins (descendente)
    const ranking = tournament.participants.sort((a, b) => b.wins - a.wins)

    return res.status(200).json({
      success: true,
      ranking
    })
  } catch (error) {
    console.error('Error en getRanking:', error)
    return res.status(500).json({
      success: false,
      error: 'Error al obtener ranking',
      details: error.message
    })
  }
}

// Avanzar ganador al siguiente match
export const advanceWinner = async (req, res) => {
  try {
    const { id } = req.params
    const { winnerId } = req.body

    if (!winnerId) {
      return res.status(400).json({
        success: false,
        error: 'winnerId es requerido'
      })
    }

    const match = await Match.findByIdAndUpdate(
      id,
      { winner: winnerId, status: 'completed' },
      { new: true }
    )

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match no encontrado'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Ganador avanzado exitosamente',
      match
    })
  } catch (error) {
    console.error('Error en advanceWinner:', error)
    return res.status(500).json({
      success: false,
      error: 'Error al avanzar ganador',
      details: error.message
    })
  }
}
