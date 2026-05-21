import Room from '../models/Room.js'
import Match from '../models/Match.js'
import Vote from '../models/Vote.js'
import Tournament from '../models/Tournament.js'
import TournamentParticipant from '../models/TournamentParticipant.js'

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
        }).populate('participant1_id').populate('participant2_id')

        if (firstMatch) {
          room.current_match_id = firstMatch._id
          await room.save()
        }

        console.log(`✓ Torneo iniciado: ${inviteCode}`)

        // Emitir evento a toda la sala
        io.to(inviteCode).emit('tournament_started', {
          tournament: tournament,
          currentMatch: firstMatch,
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

        // Guardar/actualizar el voto (upsert para evitar duplicados)
        await Vote.findOneAndUpdate(
          { match_id: matchId, user_id: userId },
          { participant_id: participantId },
          { upsert: true, new: true }
        )

        // Contar votos de cada participante en este match
        const voteStats = await Vote.aggregate([
          { $match: { match_id: matchId } },
          { $group: { _id: '$participant_id', count: { $sum: 1 } } }
        ])

        // Obtener IDs de los participantes del match
        const match = await Match.findById(matchId)

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
          .populate('participant1_id')
          .populate('participant2_id')

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
        }).populate('participant1_id').populate('participant2_id')

        if (nextMatch) {
          // Hay más matches en esta ronda
          room.current_match_id = nextMatch._id
          await room.save()

          // Limpiar votos del match anterior
          await Vote.deleteMany({ match_id: currentMatch._id })

          console.log(`✓ Avanzado a siguiente match: ${nextMatch._id}`)

          io.to(inviteCode).emit('match_changed', {
            currentMatch: nextMatch,
            status: 'voting'
          })
        } else {
          // Buscar siguiente ronda
          const nextRoundMatch = await Match.findOne({
            tournament_id: room.tournament_id._id,
            round: currentMatch.round + 1,
            status: 'pending'
          }).populate('participant1_id').populate('participant2_id')

          if (nextRoundMatch) {
            // Hay siguiente ronda
            room.current_match_id = nextRoundMatch._id
            await room.save()

            // Limpiar votos
            await Vote.deleteMany({ match_id: currentMatch._id })

            console.log(`✓ Pasada a siguiente ronda: ${nextRoundMatch._id}`)

            io.to(inviteCode).emit('match_changed', {
              currentMatch: nextRoundMatch,
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

        // Si era el host
        if (room.host_user_id.toString() === userId) {
          // Cambiar estado de la sala a 'closed'
          room.status = 'closed'

          // Cambiar estado del torneo a 'cancelled'
          const tournament = await Tournament.findByIdAndUpdate(
            room.tournament_id._id,
            { status: 'cancelled' },
            { new: true }
          )

          await room.save()

          console.log(`✓ Host abandonó la sala: ${inviteCode}`)

          // Emitir evento a toda la sala
          io.to(inviteCode).emit('room_closed', {
            message: 'El host ha abandonado la sala',
            reason: 'host_left'
          })

          // Eliminar la sala de la BD
          await Room.findByIdAndDelete(room._id)
        } else {
          // No era host, solo remover de la lista
          await room.save()

          console.log(`✓ Usuario abandonó la sala: ${inviteCode}`)

          // Emitir lista actualizada
          const updatedRoom = await Room.findById(room._id)
            .populate('connected_users', 'username email')

          io.to(inviteCode).emit('room_updated', {
            connected_users: updatedRoom.connected_users,
            users_count: updatedRoom.connected_users.length,
            status: updatedRoom.status
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
