import Room from '../models/Room.js'
import Tournament from '../models/Tournament.js'
import Match from '../models/Match.js'

// Obtener sala por invite_code
export const getRoomByInviteCode = async (req, res) => {
  try {
    const { inviteCode } = req.params

    // Buscar la sala por invite_code
    const room = await Room.findOne({ invite_code: inviteCode }).populate('tournament_id')

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Sala no encontrada'
      })
    }

    // Obtener los datos del torneo
    const tournament = await Tournament.findById(room.tournament_id._id).populate('participants')

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: 'Torneo no encontrado'
      })
    }

    // Obtener el primer match pendiente (para la sala actual)
    const currentMatch = await Match.findOne({
      tournament_id: tournament._id,
      status: 'pending'
    }).sort({ round: 1, match_number: 1 })

    // Si no hay match pendiente, obtener el primer match (para demostración)
    let match = currentMatch
    if (!match) {
      match = await Match.findOne({ tournament_id: tournament._id }).sort({ round: 1, match_number: 1 })
    }

    // Mapear match con datos de participantes
    let currentMatchData = null
    if (match) {
      const participant1 = tournament.participants.find(
        p => p._id.toString() === match.participant1_id?.toString()
      )
      const participant2 = tournament.participants.find(
        p => p._id.toString() === match.participant2_id?.toString()
      )

      currentMatchData = {
        id: match._id,
        _id: match._id,
        round: match.round,
        match_number: match.match_number,
        participant1: participant1 || null,
        participant2: participant2 || null,
        winner_id: match.winner_id,
        status: match.status
      }
    }

    return res.status(200).json({
      success: true,
      room,
      tournament,
      currentMatch: currentMatchData
    })
  } catch (error) {
    console.error('Error en getRoomByInviteCode:', error)
    return res.status(500).json({
      success: false,
      error: 'Error al obtener sala',
      details: error.message
    })
  }
}

// Unirse a una sala (crear entrada de participante)
export const joinRoom = async (req, res) => {
  try {
    const { inviteCode } = req.params
    const { userId } = req.body

    // Buscar la sala
    const room = await Room.findOne({ invite_code: inviteCode })

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Sala no encontrada'
      })
    }

    // Añadir usuario a la lista de participantes si no está ya
    if (!room.participants.includes(userId)) {
      room.participants.push(userId)
      await room.save()
    }

    return res.status(200).json({
      success: true,
      room,
      message: 'Te has unido a la sala'
    })
  } catch (error) {
    console.error('Error en joinRoom:', error)
    return res.status(500).json({
      success: false,
      error: 'Error al unirse a la sala',
      details: error.message
    })
  }
}
