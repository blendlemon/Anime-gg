import Room from '../models/Room.js'
import Match from '../models/Match.js'
import Vote from '../models/Vote.js'
import Tournament from '../models/Tournament.js'
import AnimeOpening from '../models/AnimeOpening.js'
import mongoose from 'mongoose'

const normalizeId = (value) => {
  if (!value) return ''
  return value.toString()
}

const mapMatchForClient = async (match, tournament) => {
  if (!match || !tournament) return null

  const participants = tournament.participants || []
  const openingIds = participants
    .map((participant) => participant.opening_id)
    .filter(Boolean)

  const openings = await AnimeOpening.find({ _id: { $in: openingIds } }).select('_id video_url')
  const openingVideos = new Map(
    openings.map((opening) => [normalizeId(opening._id), opening.video_url])
  )

  const participant1 = participants.find(
    (participant) => normalizeId(participant._id) === normalizeId(match.participant1_id)
  )
  const participant2 = participants.find(
    (participant) => normalizeId(participant._id) === normalizeId(match.participant2_id)
  )

  const withVideo = (participant) => {
    if (!participant) return null
    const openingId = normalizeId(participant.opening_id)
    return {
      ...participant.toObject(),
      video_url: participant.video_url || openingVideos.get(openingId) || null
    }
  }

  return {
    _id: match._id,
    id: match._id,
    round: match.round,
    match_number: match.match_number,
    status: match.status,
    winner_id: match.winner_id,
    participant1: withVideo(participant1),
    participant2: withVideo(participant2)
  }
}

const cleanupRoomTournamentData = async (room) => {
  const tournamentId = room.tournament_id?._id || room.tournament_id
  const matches = await Match.find({ tournament_id: tournamentId }, '_id')
  const matchIds = matches.map((match) => match._id)

  if (matchIds.length > 0) {
    await Vote.deleteMany({ match_id: { $in: matchIds } })
  }

  await Match.deleteMany({ tournament_id: tournamentId })
  await Room.findByIdAndDelete(room._id)
  await Tournament.findByIdAndDelete(tournamentId)
}

/**
 * Configura los eventos de Socket.IO para las salas de votación con sistema de host
 */
export function setupRoomSocket(io) {
  io.on('connection', (socket) => {
    console.log(`✓ Usuario conectado: ${socket.id}`)

    /**
     * join_room: Un usuario se une a una sala por código de invitación
     * Recibe: { inviteCode, userId, username }
     */
    socket.on('join_room', async (data) => {
      try {
        const { inviteCode, userId, username } = data

        if (!inviteCode || !userId) {
          socket.emit('error', { message: 'Código e ID requeridos' })
          return
        }

        // Buscar la sala por invite_code
        let room = await Room.findOne({ invite_code: inviteCode.toUpperCase() })
          .populate('tournament_id')
          .populate('current_match_id')
          .populate('connected_users')

        if (!room) {
          socket.emit('error', { message: 'Sala no encontrada' })
          return
        }

        // Si es el primer usuario, lo marca como host
        if (room.connected_users.length === 0) {
          room.host_user_id = userId
        }

        // Añadir el usuario a la lista de conectados si no está ya
        if (!room.connected_users.some(u => u._id.toString() === userId)) {
          room.connected_users.push(userId)
          await room.save()
        }

        // Unir el socket al canal de la sala
        socket.join(inviteCode)
        socket.data.userId = userId
        socket.data.inviteCode = inviteCode
        console.log(`✓ Usuario ${userId} en sala ${inviteCode}`)

        // Emitir lista actualizada de usuarios a toda la sala
        const updatedRoom = await Room.findById(room._id)
          .populate('connected_users', 'username email')
          .populate('tournament_id')

        io.to(inviteCode).emit('room_updated', {
          room_id: room._id,
          connected_users: updatedRoom.connected_users,
          users_count: updatedRoom.connected_users.length,
          status: updatedRoom.status,
          host_user_id: updatedRoom.host_user_id,
          tournament: updatedRoom.tournament_id,
          current_match_id: updatedRoom.current_match_id
        })
      } catch (error) {
        console.error('Error en join_room:', error)
        socket.emit('error', { message: 'Error al unirse a la sala' })
      }
    })

    /**
     * start_tournament: El host inicia el torneo
     * Solo el host puede llamar esto
     * Recibe: { inviteCode, userId }
     */
    socket.on('start_tournament', async (data) => {
      try {
        const { inviteCode, userId } = data

        // Buscar la sala
        let room = await Room.findOne({ invite_code: inviteCode.toUpperCase() })
          .populate('tournament_id')

        if (!room) {
          socket.emit('error', { message: 'Sala no encontrada' })
          return
        }

        // Verificar que el usuario es el host
        if (room.host_user_id.toString() !== userId) {
          socket.emit('error', { message: 'Solo el host puede iniciar el torneo' })
          return
        }

        // Cambiar estado del torneo a 'active'
        const tournament = await Tournament.findByIdAndUpdate(
          room.tournament_id._id,
          { status: 'active' },
          { new: true }
        )

        // Cambiar estado de la sala a 'voting'
        room.status = 'voting'
        await room.save()

        // Obtener el primer match del torneo
        const firstMatch = await Match.findOne({
          tournament_id: tournament._id,
          round: 1,
          match_number: 1
        })

        if (firstMatch) {
          room.current_match_id = firstMatch._id
          await room.save()
        }

        const tournamentWithParticipants = await Tournament.findById(tournament._id)
        const currentMatch = await mapMatchForClient(firstMatch, tournamentWithParticipants)

        console.log(`✓ Torneo iniciado: ${inviteCode}`)

        // Emitir evento a toda la sala
        io.to(inviteCode).emit('tournament_started', {
          tournament: tournament,
          currentMatch,
          status: 'voting'
        })
      } catch (error) {
        console.error('Error en start_tournament:', error)
        socket.emit('error', { message: 'Error al iniciar el torneo' })
      }
    })

    /**
     * submit_vote: Un usuario vota por un participante
     * Recibe: { inviteCode, matchId, participantId, userId }
     */
    socket.on('submit_vote', async (data) => {
      try {
        const { inviteCode, matchId, participantId, userId } = data

        console.log('submit_vote recibido:', { inviteCode, matchId, participantId, userId })
        console.log('Tipos:', typeof matchId, typeof participantId, typeof userId)

        if (!inviteCode || !matchId || !participantId || !userId) {
          socket.emit('error', { message: 'Parametros incompletos para votar' })
          return
        }

        if (
          !mongoose.Types.ObjectId.isValid(matchId) ||
          !mongoose.Types.ObjectId.isValid(participantId) ||
          !mongoose.Types.ObjectId.isValid(userId)
        ) {
          socket.emit('error', { message: 'IDs inválidos para votar' })
          return
        }

        const matchObjectId = new mongoose.Types.ObjectId(matchId)
        const participantObjectId = new mongoose.Types.ObjectId(participantId)
        const userObjectId = new mongoose.Types.ObjectId(userId)

        // Guardar/actualizar el voto (upsert para evitar duplicados)
        await Vote.findOneAndUpdate(
          { match_id: matchObjectId, user_id: userObjectId },
          { participant_id: participantObjectId },
          { upsert: true, new: true }
        )

        // Contar votos de cada participante en este match
        const voteStats = await Vote.aggregate([
          { $match: { match_id: matchObjectId } },
          { $group: { _id: '$participant_id', count: { $sum: 1 } } }
        ])

        // Obtener IDs de los participantes del match
        const match = await Match.findById(matchObjectId)

        if (!match) {
          socket.emit('error', { message: 'Match no encontrado para voto' })
          return
        }

        let votes_p1 = 0
        let votes_p2 = 0

        voteStats.forEach(stat => {
          if (stat._id.toString() === match.participant1_id.toString()) {
            votes_p1 = stat.count
          }
          if (stat._id.toString() === match.participant2_id.toString()) {
            votes_p2 = stat.count
          }
        })

        console.log(`✓ Voto registrado en match ${matchId}: P1=${votes_p1}, P2=${votes_p2}`)

        // Emitir actualización a toda la sala
        io.to(inviteCode).emit('vote_update', {
          matchId: matchId,
          votes: {
            participant1: votes_p1,
            participant2: votes_p2
          },
          totalVoters: voteStats.length
        })
      } catch (error) {
        console.error('Error en submit_vote:', error)
        socket.emit('error', { message: 'Error al votar' })
      }
    })

    /**
     * next_match: El host avanza al siguiente match
     * Solo el host puede llamar esto
     * Recibe: { inviteCode, userId }
     */
    socket.on('next_match', async (data) => {
      try {
        const { inviteCode, userId } = data

        // Buscar la sala
        let room = await Room.findOne({ invite_code: inviteCode.toUpperCase() })
          .populate('tournament_id')

        if (!room) {
          socket.emit('error', { message: 'Sala no encontrada' })
          return
        }

        // Verificar que el usuario es el host
        if (room.host_user_id.toString() !== userId) {
          socket.emit('error', { message: 'Solo el host puede avanzar matches' })
          return
        }

        // Obtener el match actual
        const currentMatch = await Match.findById(room.current_match_id)

        if (!currentMatch) {
          socket.emit('error', { message: 'Match actual no encontrado' })
          return
        }

        // Determinar el ganador según votos
        const voteStats = await Vote.aggregate([
          { $match: { match_id: currentMatch._id } },
          { $group: { _id: '$participant_id', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])

        if (voteStats.length > 0) {
          currentMatch.winner_id = voteStats[0]._id
          currentMatch.status = 'completed'
          await currentMatch.save()
        }

        // Buscar el siguiente match
        const nextMatch = await Match.findOne({
          tournament_id: room.tournament_id._id,
          round: currentMatch.round,
          match_number: currentMatch.match_number + 1,
          status: 'pending'
        })

        const tournamentWithParticipants = await Tournament.findById(room.tournament_id._id)

        if (nextMatch) {
          // Hay más matches en esta ronda
          room.current_match_id = nextMatch._id
          await room.save()

          // Limpiar votos del match anterior
          await Vote.deleteMany({ match_id: currentMatch._id })

          console.log(`✓ Avanzado a siguiente match: ${nextMatch._id}`)

          io.to(inviteCode).emit('match_changed', {
            currentMatch: await mapMatchForClient(nextMatch, tournamentWithParticipants),
            status: 'voting'
          })
        } else {
          // Buscar siguiente ronda
            const nextRoundMatch = await Match.findOne({
              tournament_id: room.tournament_id._id,
              round: currentMatch.round + 1,
              status: 'pending'
            })

          if (nextRoundMatch) {
            // Hay siguiente ronda
            room.current_match_id = nextRoundMatch._id
            await room.save()

            // Limpiar votos
            await Vote.deleteMany({ match_id: currentMatch._id })

            console.log(`✓ Pasada a siguiente ronda: ${nextRoundMatch._id}`)

            io.to(inviteCode).emit('match_changed', {
              currentMatch: await mapMatchForClient(nextRoundMatch, tournamentWithParticipants),
              status: 'voting'
            })
          } else {
            // Torneo finalizado - obtener ranking
            const tournament = await Tournament.findById(room.tournament_id._id)
              .populate('participants')

            room.status = 'results'
            await room.save()

            // Limpiar votos
            await Vote.deleteMany({ match_id: currentMatch._id })

            console.log(`✓ Torneo finalizado`)

            io.to(inviteCode).emit('tournament_ended', {
              message: '¡Torneo finalizado!',
              tournament: tournament,
              status: 'results'
            })
          }
        }
      } catch (error) {
        console.error('Error en next_match:', error)
        socket.emit('error', { message: 'Error al avanzar al siguiente match' })
      }
    })

    /**
     * Desconexión: Maneja cuando un usuario se desconecta
     */
    socket.on('disconnect', async () => {
      try {
        console.log(`✓ Usuario desconectado: ${socket.id}`)

        const disconnectedUserId = socket.data.userId
        if (!disconnectedUserId) return

        const rooms = await Room.find({ connected_users: disconnectedUserId })

        for (const room of rooms) {
          room.connected_users = room.connected_users.filter(
            (connectedUserId) => normalizeId(connectedUserId) !== normalizeId(disconnectedUserId)
          )

          const hostLeft = normalizeId(room.host_user_id) === normalizeId(disconnectedUserId)

          if (room.connected_users.length === 0 || hostLeft) {
            await cleanupRoomTournamentData(room)
            io.to(room.invite_code).emit('room_closed', {
              message: 'La sala se cerró por inactividad o salida del host',
              reason: hostLeft ? 'host_left' : 'empty_room'
            })
            console.log('Torneo y sala eliminados:', room.invite_code)
            continue
          }

          await room.save()
          const updatedRoom = await Room.findById(room._id).populate('connected_users', 'username email')

          io.to(room.invite_code).emit('room_updated', {
            connected_users: updatedRoom?.connected_users || [],
            users_count: updatedRoom?.connected_users?.length || 0,
            status: updatedRoom?.status || 'waiting',
            host_user_id: updatedRoom?.host_user_id || null
          })
        }
      } catch (error) {
        console.error('Error en disconnect:', error)
      }
    })

    /**
     * leave_room: El usuario explícitamente abandona una sala
     * Recibe: { inviteCode, userId }
     */
    socket.on('leave_room', async (data) => {
      try {
        const { inviteCode, userId } = data

        // Buscar la sala
        let room = await Room.findOne({ invite_code: inviteCode.toUpperCase() })
          .populate('tournament_id')

        if (!room) {
          return
        }

        // Remover usuario de connected_users
        room.connected_users = room.connected_users.filter(
          u => u.toString() !== userId
        )

        const hostLeft = normalizeId(room.host_user_id) === normalizeId(userId)
        if (room.connected_users.length === 0 || hostLeft) {
          await cleanupRoomTournamentData(room)
          io.to(inviteCode).emit('room_closed', {
            message: 'La sala se cerró por inactividad o salida del host',
            reason: hostLeft ? 'host_left' : 'empty_room'
          })
          console.log('Torneo y sala eliminados:', room.invite_code)
        } else {
          await room.save()
          console.log(`✓ Usuario abandonó la sala: ${inviteCode}`)

          const updatedRoom = await Room.findById(room._id).populate('connected_users', 'username email')
          io.to(inviteCode).emit('room_updated', {
            connected_users: updatedRoom.connected_users,
            users_count: updatedRoom.connected_users.length,
            status: updatedRoom.status,
            host_user_id: updatedRoom.host_user_id
          })
        }

        // Desconectar el socket del canal
        socket.leave(inviteCode)
      } catch (error) {
        console.error('Error en leave_room:', error)
        socket.emit('error', { message: 'Error al abandonar la sala' })
      }
    })
  })
}

export default setupRoomSocket
